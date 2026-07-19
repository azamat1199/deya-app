import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryBanner from "@/components/catalog/CategoryBanner";
import ProductGrid from "@/components/catalog/ProductGrid";
import { Section } from "@/components/ui";
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

  return (
    <>
      <CategoryBanner locale={locale as Locale} />
      <div className=" py-24">
        <Section bg="white" containerWidth="home">
          <ProductGrid locale={locale as Locale} initialCategory={category} />
        </Section>
      </div>
    </>
  );
}
