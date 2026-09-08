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
import { IMAGES } from "@/content/images";
import { getBanners, pickBanner } from "@/lib/banners";
import { getCareerValues, type CareerValue } from "@/lib/careerValues";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getProductInfo, type ProductInfoItem } from "@/lib/productInfo";

/**
 * A CMS cta_url may point off-site — the live carrier banner points at an
 * hh.uz vacancies page — and next/link would try to client-navigate to an
 * absolute URL it does not own. Protocol-relative ("//host/path") counts as
 * external too.
 *
 * Same test as HeroSlider's own isExternalHref. Duplicated rather than shared
 * because that one is a local function in a "use client" module and this task
 * is not the place to refactor it; consolidating the two is a separate call.
 */
function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//i.test(href);
}

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

  // Above the fold, so server-side only: a useEffect would flash an empty hero
  // on every load, and this API sends no Access-Control-Allow-Origin, so a
  // browser fetch could not succeed anyway. getBanners never rejects — it logs
  // its own failure with `cause` and answers [] — so there is nothing to catch.
  const carrierBanner = pickBanner(await getBanners(locale), "carrier");

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

  // The two CareersCulture blocks that sandwich CareersBrands. Row count is
  // the contract — see productInfo.ts — so unlike career values, THERE IS NO
  // STATIC FALLBACK here: the API has no equivalent for headingHighlight/
  // closingNote-style content, and content/careers.ts's culture object is not
  // shaped as two rows. Fewer than 2 usable rows means the corresponding
  // block(s) render nothing rather than stale copy, per this project's rule
  // against masking an outage — brands keeps rendering regardless, since it is
  // fetched and rendered independently.
  let productInfo: ProductInfoItem[] = [];
  let productInfoError: unknown = null;
  try {
    productInfo = await getProductInfo(locale);
  } catch (error) {
    productInfoError = error;
  }

  if (productInfoError) {
    console.error(
      "[CareersPage] product info request failed, omitting both CareersCulture blocks —",
      productInfoError instanceof Error
        ? productInfoError.message
        : String(productInfoError),
      "| cause:",
      productInfoError instanceof Error
        ? (productInfoError.cause ?? "(none)")
        : "(none)",
    );
  } else if (productInfo.length < 2) {
    console.error(
      `[CareersPage] product info returned ${productInfo.length} usable row(s), need 2 — the corresponding CareersCulture block(s) are omitted`,
    );
  }

  const cultureBlockA = productInfo[0] ?? null;
  const cultureBlockB = productInfo[1] ?? null;

  return (
    <>
      {/* No carrier banner => no hero, deliberately: there is no mock copy to
          fall back to any more, and a hero with a photo but no words reads as
          broken. Same shape as the home page's own `heroSlides.length > 0`
          guard. PROVISIONAL — see the report; this is the one line to change
          if you'd rather keep a minimal static fallback. */}
      {carrierBanner && (
        <CareersHero
          vacanciesLabel={dictionary.buttons.vacancies}
          title={carrierBanner.title}
          subtitle={carrierBanner.subtitle}
          // Local artwork substituted HERE, never in the component: an empty
          // src makes the browser re-request the page as the image, which has
          // already broken ProductGallery and ProductCard.
          image={carrierBanner.image || IMAGES.placeholder}
          // null and "" both collapse to undefined, so Button renders a plain
          // <button> instead of href="" or href="null".
          ctaHref={carrierBanner.cta_url ?? undefined}
          ctaExternal={
            carrierBanner.cta_url
              ? isExternalHref(carrierBanner.cta_url)
              : undefined
          }
        />
      )}
      {cultureBlockA && (
        <Section bg="white" containerWidth="home">
          <CareersCulture item={cultureBlockA} />
        </Section>
      )}
      <Section bg="white" containerWidth="home">
        <CareersBrands />
      </Section>
      {cultureBlockB && (
        <Section bg="white" containerWidth="home">
          <CareersCulture item={cultureBlockB} />
        </Section>
      )}

      <CareersAbout tiles={aboutTiles} />
      <Section bg="white" containerWidth="home">
        <CareersJoinCta />
      </Section>
    </>
  );
}
