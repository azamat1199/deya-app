import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ContactSalesButton from "@/components/catalog/ContactSalesButton";
import ProductGallery from "@/components/catalog/ProductGallery";
import RecommendedProducts from "@/components/catalog/RecommendedProducts";
import { Section } from "@/components/ui";
import { catalogProducts } from "@/content/catalog";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { PRODUCT_CATEGORY_LINKS } from "@/lib/nav";

type ProductPageProps = {
  params: Promise<{ locale: string; category: string; product: string }>;
};

function findProduct(category: string, product: string) {
  return catalogProducts.find(
    (p) => p.categorySlug === category && p.slug === product,
  );
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, category, product } = await params;
  if (!isLocale(locale)) return {};
  const found = findProduct(category, product);
  if (!found) return {};
  return { title: `${found.title} — DEYA` };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, category, product } = await params;
  if (!isLocale(locale)) notFound();

  const found = findProduct(category, product);
  if (!found) notFound();

  const dictionary = await getDictionary(locale as Locale);
  const categoryLink = PRODUCT_CATEGORY_LINKS.find(
    (link) => link.slug === category,
  );
  // labelKey is always "categories.<slug>" — pull the leaf key back out to index the dictionary.
  const categoryKey = categoryLink?.labelKey.replace("categories.", "") as
    keyof typeof dictionary.categories | undefined;
  const categoryLabel = categoryKey
    ? dictionary.categories[categoryKey]
    : category;

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
        <ContactSalesButton className="w-full md:w-auto" />
        <a
          href="#"
          className="inline-flex w-full items-center justify-center rounded-md border border-brand-600 px-8 py-4 text-sm font-semibold tracking-wide text-brand-600 uppercase transition-colors hover:bg-brand-50 md:w-auto"
        >
          {dictionary.buttons.downloadCatalog}
        </a>
      </div>

      <RecommendedProducts
        locale={locale as Locale}
        allCatalogLabel={dictionary.buttons.allCatalog}
      />
    </Section>
  );
}
