import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryBanner, {
  type CategoryBannerItem,
} from "@/components/catalog/CategoryBanner";
import { homeCategories } from "@/content/categories";
import { IMAGES } from "@/content/images";
import ProductGrid from "@/components/catalog/ProductGrid";
import { Section } from "@/components/ui";
import { getCategories, type Category } from "@/lib/categories";
import { getProducts, type Product as ApiProduct } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

/** The banner shows four cards; the backend decides WHICH four via sort_order. */
const BANNER_LIMIT = 4;

/**
 * The hand-authored banner cards, kept only as the fallback. Every entry gets an
 * `id` so the React keys can never come out undefined — the slug serves, being
 * unique and stable and not an array index.
 */
const STATIC_BANNER: CategoryBannerItem[] = homeCategories.map((category) => ({
  id: category.slug,
  title: category.title,
  image: category.image,
  slug: category.slug,
}));

type CatalogPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

export async function generateMetadata({
  params,
}: CatalogPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = await getDictionary(locale);
  return { title: `${dictionary.nav.products} — DEYA` };
}

export default async function CatalogPage({
  params,
  searchParams,
}: CatalogPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { category } = await searchParams;

  // Fetched here rather than inside ProductGrid: that component is "use client"
  // (useState/useRouter/useTranslation), and `next: { revalidate: 300 }` is
  // server-fetch semantics only. An empty array hands ProductGrid its fallback.
  //
  // Both requests go out together — the products list does not depend on the
  // categories list, so awaiting them in sequence would just add a round trip.
  // allSettled, not all: one endpoint failing must not blank the other.
  const [categoriesResult, productsResult] = await Promise.allSettled([
    getCategories(),
    getProducts(),
  ]);

  function reason(error: unknown): [string, string, unknown] {
    return [
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    ];
  }

  let categories: Category[] = [];
  if (categoriesResult.status === "fulfilled") {
    categories = categoriesResult.value;
  } else {
    console.error(
      "[CatalogPage] GET categories failed, the filter row will show only the catch-all tab —",
      ...reason(categoriesResult.reason),
    );
  }

  let products: ApiProduct[] = [];
  if (productsResult.status === "fulfilled") {
    products = productsResult.value;
  } else {
    console.error(
      "[CatalogPage] GET products failed, ProductGrid will fall back to static content —",
      ...reason(productsResult.reason),
    );
  }

  const usingCategories = categories.length > 0;

  // Memoised by Next against the same call in the locale layout — still one
  // network request per render.
  const settings = await getSettings(locale);
  const catalogFile = settings?.catalog_file ?? "";

  // Derived from the SAME fetch above — the banner adds no second request.
  // getCategories() already sorts by sort_order ascending, so the first four
  // are the four the backend chose; no selection logic lives here. A short list
  // renders short: no padding, and no fall back to the mock just for being
  // under four.
  const bannerCategories: CategoryBannerItem[] = usingCategories
    ? categories.slice(0, BANNER_LIMIT).map((category) => ({
        id: category.id,
        title: category.name,
        image: category.image || STATIC_BANNER[0]?.image || IMAGES.placeholder,
        slug: category.slug,
      }))
    : STATIC_BANNER.slice(0, BANNER_LIMIT);

  if (!usingCategories) {
    console.error(
      "[CatalogPage] CategoryBanner falling back to static content — the categories request produced no usable rows (the underlying error and its cause are logged above)",
    );
  }

  return (
    <>
      <CategoryBanner
        locale={locale as Locale}
        categories={bannerCategories}
      />
      <div className=" py-24">
        <Section bg="white" containerWidth="home">
          <ProductGrid
            locale={locale as Locale}
            initialCategory={category}
            categories={categories}
            products={products}
            catalogFile={catalogFile}
          />
        </Section>
      </div>
    </>
  );
}
