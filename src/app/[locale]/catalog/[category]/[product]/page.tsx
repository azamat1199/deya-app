import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import ContactSalesButton from "@/components/catalog/ContactSalesButton";
import ProductGallery from "@/components/catalog/ProductGallery";
import RecommendedProducts, {
  type RecommendedItem,
} from "@/components/catalog/RecommendedProducts";
import {
  VariantNavigationProvider,
  VariantPendingRegion,
} from "@/components/catalog/VariantNavigation";
import VariantSwitcher, {
  type VariantRow,
} from "@/components/catalog/VariantSwitcher";
import Section from "@/components/ui/Section";
import { IMAGES } from "@/content/images";
import type { Product } from "@/content/types";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { getSettings } from "@/lib/settings";
import { badgeLabel } from "@/lib/badges";
import { formatBoxQuantity } from "@/lib/boxQuantity";
import { SITE_URL, pageMetadata } from "@/lib/seo";
import {
  getProduct,
  getProducts,
  getRelatedProducts,
  productImageUrl,
  type Product as ApiProduct,
  type ProductDetail,
  type ProductWeight,
} from "@/lib/products";
import {
  buildOptions,
  formatWeight,
  variantPool,
  type VariantItem,
} from "@/lib/variants";

type ProductPageProps = {
  params: Promise<{ locale: string; category: string; product: string }>;
};

/**
 * Every product is prerendered at build time, per locale, and then revalidated
 * (ISR) on the fetches' 300s window. A product added in the CMS after the
 * build is rendered on its first visit and cached from then on
 * (dynamicParams defaults to true). If the list request fails at build time
 * the build still succeeds — every product then renders on first visit.
 */
export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}): Promise<{ category: string; product: string }[]> {
  try {
    const products = await getProducts(params.locale);
    return products.map((item) => ({
      category: item.category.slug,
      product: item.slug,
    }));
  } catch (error) {
    console.error(
      `[ProductPage] generateStaticParams(${params.locale}) failed, products will render on first visit —`,
      error instanceof Error ? error.message : String(error),
    );
    return [];
  }
}

/** The product's one true URL path (without the locale): the category
 *  segment comes from the product itself, never from the request. */
function productPath(detail: ProductDetail): string {
  return `/catalog/${detail.category.slug}/${detail.slug}`;
}

/**
 * schema.org Product + BreadcrumbList. No `offers`: the site is B2B and shows
 * no prices — inventing one would be worse than the rich-result Google then
 * declines to show. weight uses UN/CEFACT codes (GRM = gram, KGM = kilogram).
 */
function productJsonLd(
  detail: ProductDetail,
  locale: Locale,
  dictionary: Dictionary,
) {
  const url = `${SITE_URL}/${locale}${productPath(detail)}`;
  const unitCode: Record<string, string> = { g: "GRM", kg: "KGM" };
  const weightValue = detail.weight ? Number(detail.weight.value) : Number.NaN;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: detail.name,
        url,
        ...(detail.description ? { description: detail.description } : {}),
        ...(detail.code ? { sku: detail.code, mpn: detail.code } : {}),
        ...(detail.images.length > 0
          ? { image: detail.images.map((image) => image.image) }
          : {}),
        brand: { "@type": "Brand", name: "Deya" },
        category: detail.category.name,
        ...(detail.weight && Number.isFinite(weightValue)
          ? {
              weight: {
                "@type": "QuantitativeValue",
                value: weightValue,
                unitCode: unitCode[detail.weight.unit.toLowerCase()],
              },
            }
          : {}),
        ...(detail.flavor
          ? {
              additionalProperty: {
                "@type": "PropertyValue",
                name: dictionary.product.flavorHeading,
                value: detail.flavor.name,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: dictionary.nav.products,
            item: `${SITE_URL}/${locale}/catalog`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: detail.category.name,
            item: `${SITE_URL}/${locale}/catalog?category=${detail.category.slug}`,
          },
          { "@type": "ListItem", position: 3, name: detail.name, item: url },
        ],
      },
    ],
  };
}

/** The design shows four recommendations; a longer list is cut to that. */
const RECOMMENDED_LIMIT = 4;

/**
 * A related product as the recommendation row renders it. The title is the
 * PRODUCT name, never category.name, and the href reuses the card's existing
 * two-segment pattern with the API's own slugs.
 */
function toRecommendedItem(
  related: ApiProduct,
  locale: string,
  badges: Dictionary["catalog"]["badges"],
): RecommendedItem {
  return {
    key: related.id,
    title: related.name,
    image: productImageUrl(related),
    href: `/${locale}/catalog/${related.category.slug}/${related.slug}`,
    badge: badgeLabel(related.badge, badges),
  };
}

/** "1.500" -> "1,5" on /ru, "1.5" on /en. The payload sends decimal strings
 *  with trailing zeros. */
function formatDecimal(value: string, locale: Locale): string {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return value;
  return parsed.toLocaleString(locale, { maximumFractionDigits: 3 });
}

function weightLabel(
  weight: ProductWeight,
  locale: Locale,
  product: Dictionary["product"],
): string {
  return formatWeight(weight, locale, { g: product.unitG, kg: product.unitKg });
}

/**
 * Shelf life, pluralised by the language's own rules.
 *
 * Intl.PluralRules is what decides the CLDR category (one/few/many/other);
 * nothing here does modulo arithmetic. The hand-rolled Russian version this
 * replaces was correct for /ru but printed the same three Russian forms on
 * /uz and /en. Verified against it for every n in 0..200 — /ru is unchanged.
 *
 * `other` is the fallback for any category a locale does not list, which is
 * what makes the single-form Uzbek and the two-form English work off the
 * same four keys.
 */
function monthsLabel(
  count: number,
  locale: Locale,
  forms: Dictionary["product"]["months"],
): string {
  const category = new Intl.PluralRules(locale).select(count);
  return forms[category as keyof typeof forms] ?? forms.other;
}

/**
 * The flavour and weight chip rows. Each option's target slug is resolved here,
 * at render time, so every chip is a plain link to a real product URL. Empty
 * rows (fewer than two values, or no family) are dropped by the switcher.
 */
function toVariantRows(
  detail: ProductDetail,
  product: Dictionary["product"],
  locale: Locale,
): VariantRow[] {
  const pool = variantPool<VariantItem>(detail, detail.variants);
  const options = buildOptions(pool, detail, (weight) =>
    weightLabel(weight, locale, product),
  );
  return [
    { id: "flavor", heading: product.flavorHeading, options: options.flavor },
    { id: "weight", heading: product.weightHeading, options: options.weight },
  ];
}

/** Row labels come from the dictionary; only the values are live. A field the
 *  payload omits drops its row rather than showing blank. */
function toCharacteristics(
  detail: ProductDetail,
  product: Dictionary["product"],
  locale: Locale,
) {
  const rows: { label: string; value: string }[] = [];
  if (detail.weight) {
    rows.push({
      label: product.weightHeading,
      value: weightLabel(detail.weight, locale, product),
    });
  }
  if (detail.flavor) {
    rows.push({ label: product.flavorHeading, value: detail.flavor.name });
  }
  if (detail.box_weight) {
    rows.push({
      label: product.boxWeight,
      value: `${formatDecimal(detail.box_weight, locale)} ${product.unitKg}`,
    });
  }
  // Directly below "Вес ящика". Optional: shown only when the payload carries
  // a quantity per box — the backend has already resolved variant → family →
  // null, so there is no fallback here. "24.000" pcs → "24 шт",
  // "5.500" kg → "5,5 кг". Comes from THIS product's payload, so switching
  // flavour/weight (a different slug) shows that variant's value.
  const boxQuantity = formatBoxQuantity(
    detail.box_quantity,
    detail.box_quantity_unit,
    locale,
    { kg: product.unitKg, pcs: product.unitPcs },
  );
  if (boxQuantity) {
    rows.push({ label: product.boxQuantity, value: boxQuantity });
  }
  if (detail.shelf_life_months !== null) {
    rows.push({
      label: product.shelfLife,
      value: `${detail.shelf_life_months} ${monthsLabel(
        detail.shelf_life_months,
        locale,
        product.months,
      )}`,
    });
  }
  if (detail.code) {
    rows.push({ label: product.code, value: detail.code });
  }
  return rows;
}

/**
 * Maps the detail payload onto the shape the existing markup already reads, so
 * not a line of the layout below has to change. Optional fields stay `undefined`
 * when the API has nothing for them, which is exactly what the conditional
 * blocks already test — no invented values, no deleted markup.
 */
function toDisplayProduct(
  detail: ProductDetail,
  badges: Dictionary["catalog"]["badges"],
  product: Dictionary["product"],
  locale: Locale,
): Product {
  // filter(Boolean) drops any empty URL here, in the DATA LAYER, so an empty
  // string can never reach next/image. When the payload carries no usable
  // image at all — /products/glazer/ returns `images: []` — the existing
  // static placeholder stands in, so the gallery still renders rather than
  // being handed src="".
  // getProduct already orders images is_main first, then by sort_order.
  const gallery = detail.images.map((image) => image.image).filter(Boolean);
  const primary = gallery[0] ?? IMAGES.placeholder;
  const characteristics = toCharacteristics(detail, product, locale);

  return {
    slug: detail.slug,
    categorySlug: detail.category.slug,
    title: detail.name,
    image: primary,
    badge: badgeLabel(detail.badge, badges),
    description: detail.description || undefined,
    gallery: gallery.length > 0 ? gallery : undefined,
    characteristics: characteristics.length > 0 ? characteristics : undefined,
  };
}

/** Cuts at the last word boundary before `max` and adds an ellipsis. */
function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, product } = await params;
  if (!isLocale(locale)) return {};

  // Never throws: metadata generation must not be able to fail the response.
  // The fetch is deduped against the one in the page body for this request.
  let detail: ProductDetail | null = null;
  try {
    detail = await getProduct(product, locale);
  } catch {
    detail = null;
  }

  if (!detail) {
    const dictionary = await getDictionary(locale);
    return { title: dictionary.meta.productNotFound };
  }

  // ~160 characters is what search results show; cut on a word boundary.
  const description = detail.description
    ? truncate(detail.description, 160)
    : undefined;
  // images[0] is the main image — getProduct orders is_main first.
  const image = detail.images[0];
  // canonical + hreflang from the product's OWN category slug, so the same
  // product under a stale/mistyped category URL never competes with itself.
  const shared = pageMetadata(locale, productPath(detail));

  return {
    title: `${detail.name} — DEYA`,
    description,
    alternates: shared.alternates,
    openGraph: {
      ...shared.openGraph,
      title: detail.name,
      description,
      ...(image ? { images: [{ url: image.image, alt: image.alt || detail.name }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, category, product } = await params;
  if (!isLocale(locale)) notFound();

  // A missing product is a real 404, never a stand-in: a fake product living at
  // a real URL is worse than no page. Deliberately NOT wrapped in a fallback —
  // this is the one integration on the site where falling back would be wrong.
  const detail = await getProduct(product, locale);
  if (!detail) notFound();

  // Nothing else validates the category segment, so /catalog/anything/<slug>
  // used to render the product too — duplicate content at unlimited URLs.
  // 308 to the one true URL instead.
  if (category !== detail.category.slug) {
    permanentRedirect(`/${locale}${productPath(detail)}`);
  }

  const dictionary = await getDictionary(locale as Locale);
  const found = toDisplayProduct(
    detail,
    dictionary.catalog.badges,
    dictionary.product,
    locale,
  );
  const variantRows = toVariantRows(detail, dictionary.product, locale);
  // Same rule ProductGallery uses to decide whether it shows a thumbnail strip.
  const hasThumbnails = (found.gallery?.length ?? 0) > 1;

  // Related products, keyed off THIS page's route param — never derived from
  // anything else. Fetched here because RecommendedProducts is "use client" and
  // `next: { revalidate: 300 }` is server-fetch semantics only.
  //
  // A failure is NOT filled in with mock products: showing unrelated items as
  // "recommended" is worse than showing none, so the section is hidden either
  // way and the reason is logged.
  let related: ApiProduct[] = [];
  try {
    related = await getRelatedProducts(product, locale);
  } catch (error) {
    console.error(
      `[ProductPage] related products for "${product}" failed, hiding the recommendation section —`,
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
  }

  const recommended = related
    .slice(0, RECOMMENDED_LIMIT)
    .map((item) => toRecommendedItem(item, locale, dictionary.catalog.badges));
  const categoryLabel = detail.category.name;

  // Memoised by Next against the same call in the locale layout, so this is
  // still one network request per render.
  const settings = await getSettings(locale);
  const catalogFile = settings?.catalog_file ?? "";

  return (
    // The logo block hangs below the header bar, and this page's first row is
    // the breadcrumb — so the page starts below the block's lowest edge, not the
    // bar's. --logo-overhang is derived from the logo's own size, so this can
    // never drift; the 1.5rem is the breathing room on top of it.
    // containerWidth="page" is the header's own container, so the content
    // starts on the logo's left edge and ends on the phone button's right edge.
    <Section
      bg="white"
      containerWidth="page"
      className="pt-[calc(var(--logo-overhang)_+_1.5rem)]"
    >
      {/* Switching flavour/weight navigates to the sibling product's own URL.
          The provider runs that navigation as a transition so the blocks
          below dim in place, instead of blanking, until the next product's
          data has arrived. */}
      {/* `<` is escaped so a product text containing "</script>" cannot end
          the tag early (the pattern the Next JSON-LD guide recommends). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            productJsonLd(detail, locale, dictionary),
          ).replace(/</g, "\\u003c"),
        }}
      />
      <VariantNavigationProvider>
      <VariantPendingRegion>
      <nav className="mb-8 text-sm text-ink-500">
        <Link href={`/${locale}/catalog`} className="hover:text-ink-900">
          {dictionary.nav.products}
        </Link>
        <span className="mx-2">/</span>
        {/* The catalog LISTING filtered by category, not the nested
            /catalog/[category]/[product] route — that pattern is only valid
            with a product slug after it, which is what this crumb linked to
            before (a 404). Built from detail.category.slug, the fetched
            product's own resolved category, rather than the URL's `category`
            param: nothing on this route validates that segment against the
            product it names, so a stale or mistyped one must not leak into
            the link. Same ?category= pattern CategoryBanner and ProductGrid's
            own tabs already use — one filtering mechanism, not a second. */}
        <Link
          href={`/${locale}/catalog?category=${detail.category.slug}`}
          className="hover:text-ink-900"
        >
          {categoryLabel}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-900">{found.title}</span>
      </nav>

      {/* With thumbnails, 738 : 574 — the gallery column is the 100px strip +
          16px gap + the 622px main frame at the 1440 design width (1360
          content − 48 gap = 738 + 574). As fr units it scales down
          proportionally instead of starving the text column. A single-photo
          product has no strip, so it is a plain 50/50: photo half, info half. */}
      <div
        className={
          hasThumbnails
            ? "grid gap-12 lg:grid-cols-[minmax(0,738fr)_minmax(0,574fr)]"
            : "grid gap-12 lg:grid-cols-2"
        }
      >
        <ProductGallery product={found} />

        <div>
          <h1 className="text-3xl font-normal text-ink-900 lg:text-4xl">
            {found.title}
          </h1>

          {found.description && (
            <p className="mt-6 leading-relaxed text-ink-700">
              {found.description}
            </p>
          )}

          <VariantSwitcher locale={locale} rows={variantRows} />

          {found.characteristics && found.characteristics.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-ink-500 uppercase">
                {dictionary.product.characteristicsHeading}
              </h3>
              <dl className="divide-y divide-line-200 text-sm">
                {found.characteristics.map((item) => (
                  <div key={item.label} className="flex justify-between py-3">
                    <dt className="text-ink-500">{item.label}:</dt>
                    <dd className="text-ink-900">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
      </VariantPendingRegion>

      {/* Already a sibling of the two-column grid rather than a child of either
          column, so it spans the full block width — it was only left-aligned.
          justify-center is inert on the mobile column (auto height) and centres
          the pair on the block's midpoint from md up. */}
      <div className="mt-12 flex flex-col gap-4 md:flex-row md:justify-center">
        <ContactSalesButton className="w-full md:w-auto" productId={detail.id} />
        {/* Hidden when no catalog is uploaded — never href="" or "#". */}
        {catalogFile && (
        <a
          href={catalogFile}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-md border border-brand-600 px-8 py-4 text-sm font-semibold tracking-wide text-brand-600 uppercase transition-colors hover:bg-brand-50 md:w-auto"
        >
          {dictionary.buttons.downloadCatalog}
        </a>
        )}
      </div>

      {/* Hidden entirely when there is nothing related: a heading with an
          empty row under it reads as broken. */}
      {recommended.length > 0 && (
        <VariantPendingRegion>
          <RecommendedProducts
            locale={locale as Locale}
            heading={dictionary.product.recommendedHeading}
            allCatalogLabel={dictionary.buttons.allCatalog}
            items={recommended}
          />
        </VariantPendingRegion>
      )}
      </VariantNavigationProvider>
    </Section>
  );
}
