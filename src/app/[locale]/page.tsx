import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AboutPreview from "@/components/home/AboutPreview";
import CategoryGrid from "@/components/home/CategoryGrid";
import ExportMap from "@/components/home/ExportMap";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HeroSlider from "@/components/home/HeroSlider";
import NewsTeaser from "@/components/home/NewsTeaser";
import { Section, ScrollReveal } from "@/components/ui";
import { newsPosts } from "@/content/news";
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

      {/* overflow-x-clip absorbs the scrollbar-width overshoot from the
          full-bleed 100vw children inside ExportMap (clip, not hidden, so it
          doesn't create a scroll container and break sticky/reveal). */}
      <Section
        containerWidth="page"
        className="overflow-x-clip"
        style={{ backgroundColor: "var(--color-cream-50)" }}
      >
        <ExportMap />
      </Section>

      <Section bg="cream50" containerWidth="page">
        <NewsTeaser
          items={newsPosts.map((post) => ({
            id: post.slug,
            date: post.date,
            title: post.title,
            excerpt: post.excerpt,
            href: `/${locale}/blog/${post.slug}`,
          }))}
          locale={locale as Locale}
          heading={dictionary.home.newsTeaser.heading}
          allNewsHref={`/${locale}/blog`}
          allNewsLabel={dictionary.buttons.allNews}
          readMoreLabel={dictionary.buttons.readMore}
          emptyLabel={dictionary.home.newsTeaser.empty}
        />
      </Section>
    </>
  );
}
