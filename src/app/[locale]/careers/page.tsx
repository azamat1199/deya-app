import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CareersAbout from "@/components/careers/CareersAbout";
import CareersBrands from "@/components/careers/CareersBrands";
import CareersCulture from "@/components/careers/CareersCulture";
import CareersGrowth from "@/components/careers/CareersGrowth";
import CareersHero from "@/components/careers/CareersHero";
import CareersJoinCta from "@/components/careers/CareersJoinCta";
import { Section } from "@/components/ui";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type CareersPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: CareersPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = await getDictionary(locale);
  return { title: `${dictionary.nav.careers} — DEYA` };
}

export default async function CareersPage({ params }: CareersPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  return (
    <>
      <CareersHero vacanciesLabel={dictionary.buttons.vacancies} />
      <Section bg="white" containerWidth="home">
        <CareersCulture />
      </Section>
      <Section bg="white" containerWidth="home">
        <CareersBrands />
      </Section>
      <Section bg="white" containerWidth="home">
        <CareersGrowth />
      </Section>
      <CareersAbout />
      <Section bg="white" containerWidth="home">
        <CareersJoinCta />
      </Section>
    </>
  );
}
