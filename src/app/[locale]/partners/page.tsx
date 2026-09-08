import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CertificatesSection from "@/components/partners/CertificatesSection";
import PartnersHero from "@/components/partners/PartnersHero";
import PartnersLogos from "@/components/partners/PartnersLogos";
import { Section } from "@/components/ui";
import { IMAGES } from "@/content/images";
import { getBanners, pickBanner } from "@/lib/banners";
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

  // Above the fold, so server-side only: PartnersHero is "use client" for its
  // modal state and could not carry `next: { revalidate }` anyway, and a
  // browser fetch to this API is CORS-blocked. getBanners never rejects — it
  // logs its own failure with `cause` and answers [] — so nothing to catch.
  const banner = pickBanner(await getBanners(locale), "partner");

  return (
    <>
      {/* No partner banner => no hero, deliberately: there is no static copy
          to fall back to any more, and a hero with a photo but no words reads
          as broken. PROVISIONAL — see the report; this is the one line to
          change if you'd rather keep a minimal static fallback. */}
      {banner && (
        <PartnersHero
          title={banner.title}
          subtitle={banner.subtitle}
          // Local artwork substituted HERE, never in the component, so an
          // empty src can never reach next/image.
          image={banner.image || IMAGES.placeholder}
        />
      )}
      <Section bg="white" containerWidth="home">
        <PartnersLogos />
        <CertificatesSection locale={locale} />
      </Section>
    </>
  );
}
