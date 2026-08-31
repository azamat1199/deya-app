import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ContactSalesButton from "@/components/catalog/ContactSalesButton";
import ProductGallery from "@/components/catalog/ProductGallery";
import RecommendedProducts, {
  type RecommendedItem,
} from "@/components/catalog/RecommendedProducts";
import { Section } from "@/components/ui";
import { IMAGES } from "@/content/images";
import type { Product, ProductVariantOption } from "@/content/types";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getSettings } from "@/lib/settings";
import {
  badgeLabel,
  getProduct,
  getRelatedProducts,
  productImageUrl,
  type Product as ApiProduct,
  type ProductDetail,
  type ProductWeight,
} from "@/lib/products";

type ProductPageProps = {
  params: Promise<{ locale: string; category: string; product: string }>;
};

const UNIT_LABELS: Record<string, string> = { kg: "кг", g: "г" };

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
): RecommendedItem {
  return {
    key: related.id,
    title: related.name,
    image: productImageUrl(related),
    href: `/${locale}/catalog/${related.category.slug}/${related.slug}`,
    badge: badgeLabel(related.badge),
  };
}

/** "1.500" -> "1,5". The payload sends decimal strings with trailing zeros. */
function formatDecimal(value: string): string {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return value;
  return parsed.toLocaleString("ru-RU", { maximumFractionDigits: 3 });
}

function formatWeight(weight: ProductWeight): string {
  const unit = UNIT_LABELS[weight.unit.toLowerCase()] ?? weight.unit;
  return `${formatDecimal(weight.value)} ${unit}`;
}

function pluralMonths(count: number): string {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return "месяцев";
  if (mod10 === 1) return "месяц";
  if (mod10 >= 2 && mod10 <= 4) return "месяца";
  return "месяцев";
}

/**
 * The product's own flavour first, then each sibling variant. The existing
 * markup marks the option whose slug equals the product's as active, so the
 * first entry reads as selected without any extra state.
 */
function toFlavorOptions(detail: ProductDetail): ProductVariantOption[] {
  const options: ProductVariantOption[] = [];
  if (detail.flavor) {
    options.push({ label: detail.flavor.name, slug: detail.slug });
  }
  for (const variant of detail.variants) {
    options.push({
      label: variant.flavor?.name ?? variant.name,
      slug: variant.slug,
    });
  }
  return options;
}

/**
 * `weights` carries values but no per-weight product to navigate to, so every
 * option points back at this same product and therefore renders as the active
 * chip. The values are real; only the link target is absent from the payload.
 */
function toWeightOptions(detail: ProductDetail): ProductVariantOption[] {
  return detail.weights.map((weight) => ({
    label: formatWeight(weight),
    slug: detail.slug,
  }));
}

/** Row labels stay the Russian copy the page already shipped; only the values
 *  are live. A field the payload omits drops its row rather than showing blank. */
function toCharacteristics(detail: ProductDetail) {
  const rows: { label: string; value: string }[] = [];
  if (detail.box_weight) {
    rows.push({
      label: "Вес ящика",
      value: `${formatDecimal(detail.box_weight)} кг`,
    });
  }
  if (detail.shelf_life_months !== null) {
    rows.push({
      label: "Срок хранения",
      value: `${detail.shelf_life_months} ${pluralMonths(detail.shelf_life_months)}`,
    });
  }
  if (detail.code) {
    rows.push({ label: "Код товара", value: detail.code });
  }
  return rows;
}

/**
 * Maps the detail payload onto the shape the existing markup already reads, so
 * not a line of the layout below has to change. Optional fields stay `undefined`
 * when the API has nothing for them, which is exactly what the conditional
 * blocks already test — no invented values, no deleted markup.
 */
function toDisplayProduct(detail: ProductDetail): Product {
  // filter(Boolean) drops any empty URL here, in the DATA LAYER, so an empty
  // string can never reach next/image. When the payload carries no usable
  // image at all — /products/glazer/ returns `images: []` — the existing
  // static placeholder stands in, so the gallery still renders rather than
  // being handed src="".
  const gallery = detail.images.map((image) => image.image).filter(Boolean);
  const primary = gallery[0] ?? IMAGES.placeholder;
  const flavorOptions = toFlavorOptions(detail);
  const weightOptions = toWeightOptions(detail);
  const characteristics = toCharacteristics(detail);

  return {
    slug: detail.slug,
    categorySlug: detail.category.slug,
    title: detail.name,
    image: primary,
    badge: badgeLabel(detail.badge),
    description: detail.description || undefined,
    gallery: gallery.length > 0 ? gallery : undefined,
    flavorOptions: flavorOptions.length > 0 ? flavorOptions : undefined,
    weightOptions: weightOptions.length > 0 ? weightOptions : undefined,
    characteristics: characteristics.length > 0 ? characteristics : undefined,
  };
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
    detail = await getProduct(product);
  } catch {
    detail = null;
  }

  if (!detail) return { title: "Товар не найден — DEYA" };

  return {
    title: `${detail.name} — DEYA`,
    ...(detail.description
      ? { description: detail.description.slice(0, 300) }
      : {}),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, category, product } = await params;
  if (!isLocale(locale)) notFound();

  // A missing product is a real 404, never a stand-in: a fake product living at
  // a real URL is worse than no page. Deliberately NOT wrapped in a fallback —
  // this is the one integration on the site where falling back would be wrong.
  const detail = await getProduct(product);
  if (!detail) notFound();

  const found = toDisplayProduct(detail);

  // Related products, keyed off THIS page's route param — never derived from
  // anything else. Fetched here because RecommendedProducts is "use client" and
  // `next: { revalidate: 300 }` is server-fetch semantics only.
  //
  // A failure is NOT filled in with mock products: showing unrelated items as
  // "recommended" is worse than showing none, so the section is hidden either
  // way and the reason is logged.
  let related: ApiProduct[] = [];
  try {
    related = await getRelatedProducts(product);
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
    .map((item) => toRecommendedItem(item, locale));

  const dictionary = await getDictionary(locale as Locale);
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
    <Section
      bg="white"
      containerWidth="home"
      className="pt-[calc(var(--logo-overhang)_+_1.5rem)]"
    >
      <nav className="mb-8 text-sm text-ink-500">
        <Link href={`/${locale}/catalog`} className="hover:text-ink-900">
          {dictionary.nav.products}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/${locale}/catalog/${category}`}
          className="hover:text-ink-900"
        >
          {categoryLabel}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-900">{found.title}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
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

          {found.flavorOptions && found.flavorOptions.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-ink-500 uppercase">
                Вкус
              </h3>
              <div className="flex flex-wrap gap-2">
                {found.flavorOptions.map((option) => {
                  const isActive = option.slug === found.slug;
                  return (
                    <Link
                      key={option.slug}
                      href={`/${locale}/catalog/${category}/${option.slug}`}
                      className={
                        isActive
                          ? "rounded-md border border-brand-600 bg-brand-600 px-4 py-2 text-xs font-medium tracking-wide text-white uppercase"
                          : "rounded-md border border-brand-600 px-4 py-2 text-xs font-medium tracking-wide text-brand-600 uppercase transition-colors hover:bg-brand-50"
                      }
                    >
                      {option.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {found.weightOptions && found.weightOptions.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-ink-500 uppercase">
                Вес товара
              </h3>
              <div className="flex flex-wrap gap-2">
                {found.weightOptions.map((option) => {
                  const isActive = option.slug === found.slug;
                  return (
                    <Link
                      // Every weight points at this same product, so the slug
                      // alone is not unique across the list — the label is.
                      key={`${option.slug}-${option.label}`}
                      href={`/${locale}/catalog/${category}/${option.slug}`}
                      className={
                        isActive
                          ? "rounded-md border border-brand-600 bg-brand-600 px-4 py-2 text-xs font-medium tracking-wide text-white uppercase"
                          : "rounded-md border border-brand-600 px-4 py-2 text-xs font-medium tracking-wide text-brand-600 uppercase transition-colors hover:bg-brand-50"
                      }
                    >
                      {option.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {found.characteristics && found.characteristics.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-ink-500 uppercase">
                Характеристики продукта
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
        <RecommendedProducts
          locale={locale as Locale}
          allCatalogLabel={dictionary.buttons.allCatalog}
          items={recommended}
        />
      )}
    </Section>
  );
}
