import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CertificatesSection from "@/components/partners/CertificatesSection";
import PartnersHero from "@/components/partners/PartnersHero";
import PartnersLogos from "@/components/partners/PartnersLogos";
import { Section } from "@/components/ui";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type PartnersPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PartnersPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = await getDictionary(locale);
  return { title: `${dictionary.nav.partners} — DEYA` };
}

export default async function PartnersPage({ params }: PartnersPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <PartnersHero />
      <Section bg="white" containerWidth="home">
        <PartnersLogos />
        <CertificatesSection />
      </Section>
    </>
  );
}
