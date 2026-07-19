import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AboutPreview from "@/components/home/AboutPreview";
import CategoryGrid from "@/components/home/CategoryGrid";
import ExportMap from "@/components/home/ExportMap";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HeroSlider from "@/components/home/HeroSlider";
import NewsTeaser from "@/components/home/NewsTeaser";
import { Section, ScrollReveal } from "@/components/ui";
import { slides } from "@/content/slides";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = await getDictionary(locale);
  return { title: dictionary.home.placeholderTitle };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale as Locale);

  return (
    <>
      <ScrollReveal direction="fade">
        <HeroSlider slides={slides} />
      </ScrollReveal>

      <Section bg="white" containerWidth="home">
        <AboutPreview locale={locale as Locale} />
      </Section>

      <Section bg="white" containerWidth="home">
        <ScrollReveal direction="fade">
          <CategoryGrid
            locale={locale as Locale}
            toCatalogLabel={dictionary.buttons.toCatalog}
          />
        </ScrollReveal>
      </Section>

      {/* <Section bg="white" containerWidth="home">
        <ScrollReveal> */}
      <FeaturedProducts
        locale={locale as Locale}
        allCatalogLabel={dictionary.buttons.allCatalog}
      />
      {/* </ScrollReveal>
      </Section> */}

      <Section bg="cream" containerWidth="home">
        <ExportMap />
      </Section>

      <Section bg="cream" containerWidth="home">
        <ScrollReveal>
          <NewsTeaser
            locale={locale as Locale}
            allNewsLabel={dictionary.buttons.allNews}
            readMoreLabel={dictionary.buttons.readMore}
          />
        </ScrollReveal>
      </Section>
    </>
  );
}
