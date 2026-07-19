import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogGrid from "@/components/blog/BlogGrid";
import { Section } from "@/components/ui";
import { blogContent } from "@/content/blog";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = await getDictionary(locale);
  return { title: `${dictionary.nav.news} — DEYA` };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <Section bg="white" containerWidth="home">
      <h1 className="text-center text-3xl font-normal text-ink-900 lg:text-4xl">
        {blogContent.heading}
      </h1>
      <div className="mt-10 lg:mt-14">
        <BlogGrid locale={locale} />
      </div>
    </Section>
  );
}
