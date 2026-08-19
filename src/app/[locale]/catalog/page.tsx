import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryBanner from "@/components/catalog/CategoryBanner";
import ProductGrid from "@/components/catalog/ProductGrid";
import { Section } from "@/components/ui";
import { getCategories, type Category } from "@/lib/categories";
import { getProducts, type Product as ApiProduct } from "@/lib/products";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

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

  return (
    <>
      <CategoryBanner locale={locale as Locale} />
      <div className=" py-24">
        <Section bg="white" containerWidth="home">
          <ProductGrid
            locale={locale as Locale}
            initialCategory={category}
            categories={categories}
            products={products}
          />
        </Section>
      </div>
    </>
  );
}
