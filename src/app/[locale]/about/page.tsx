import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FounderStory from "@/components/about/FounderStory";
import HistoryHero from "@/components/about/HistoryHero";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = await getDictionary(locale);
  return { title: `${dictionary.nav.about} — DEYA` };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <HistoryHero />
      <FounderStory />
    </>
  );
}
