import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CareersAbout, {
  STATIC_TILES,
  type AboutTile,
} from "@/components/careers/CareersAbout";
import CareersBrands from "@/components/careers/CareersBrands";
import CareersCulture from "@/components/careers/CareersCulture";
import CareersGrowth from "@/components/careers/CareersGrowth";
import CareersHero from "@/components/careers/CareersHero";
import CareersJoinCta from "@/components/careers/CareersJoinCta";
import { Section } from "@/components/ui";
import { getCareerValues, type CareerValue } from "@/lib/careerValues";
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

  // Fetched HERE rather than inside CareersAbout. That component is
  // "use client" (Slider's renderSlide is a function prop), and a browser fetch
  // to this endpoint is CORS-blocked outright — it sends no
  // Access-Control-Allow-Origin — so it could never succeed from there. Server
  // side there is no CORS, Accept-Language reaches the backend, and the response
  // is cached per locale.
  let values: CareerValue[] = [];
  let fetchError: unknown = null;
  try {
    values = await getCareerValues(locale);
  } catch (error) {
    fetchError = error;
  }

  // An empty array counts as no answer: stale copy beats an empty grid on a
  // public marketing page, and the section has no other content to stand on.
  const usingApi = values.length > 0;
  const aboutTiles: AboutTile[] = usingApi
    ? values.map((value, index) => ({
        id: value.id,
        title: value.title,
        description: value.text,
        // An empty image borrows the static artwork at the same position, and
        // past the static count TileBackground falls through to its brand
        // gradient rather than being handed an empty src.
        image: value.image || STATIC_TILES[index]?.image || null,
      }))
    : STATIC_TILES;

  // Never silent: whenever the static content stands in, say why. `cause` is a
  // separate argument because Node reports network-level failures as the bare
  // string "fetch failed" and hides the reason there — and unlike the old
  // browser fetch, server side that cause is actually populated.
  if (!usingApi) {
    console.error(
      "[CareersPage] career values falling back to static content —",
      fetchError instanceof Error
        ? fetchError.message
        : "request returned an empty or wholly malformed array",
      "| cause:",
      fetchError instanceof Error ? (fetchError.cause ?? "(none)") : "(none)",
    );
  }

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
      <CareersAbout tiles={aboutTiles} />
      <Section bg="white" containerWidth="home">
        <CareersJoinCta />
      </Section>
    </>
  );
}
