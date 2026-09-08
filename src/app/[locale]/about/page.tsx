import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FounderStory from "@/components/about/FounderStory";
import HistoryHero, {
  type HistorySlideItem,
} from "@/components/about/HistoryHero";
import { historySlides } from "@/content/history";
import { IMAGES } from "@/content/images";
import { getFactory, type Factory } from "@/lib/factory";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getTimeline, type TimelineEntry } from "@/lib/timeline";

/**
 * The hand-authored timeline, kept only as the fallback — never in the live
 * render path. Every entry carries an `id` so the React keys can never come out
 * undefined, which is what flooded the terminal on the partners marquee.
 * The year doubles as that id: unique, stable, and not an array index.
 *
 * `paragraphKey` is preserved rather than flattened, so the fallback stays
 * translated per locale by the client component's t().
 */
const STATIC_SLIDES: HistorySlideItem[] = historySlides.map((slide) => ({
  key: slide.year,
  year: slide.year,
  image: slide.image,
  paragraphKey: slide.paragraphKey,
}));

/**
 * `title` is per-slide, like `paragraph` and `image` — it swaps with the
 * active year, not a fixed section heading. An earlier pass resolved a
 * single title once (the earliest entry's, standing in for the whole
 * section) and froze it there regardless of which year was selected; this
 * carries every entry's own title straight through instead.
 */
function toSlide(entry: TimelineEntry): HistorySlideItem {
  return {
    key: entry.id,
    // The markup builds DOM ids from this, so the number becomes a string.
    year: String(entry.year),
    // Empty image => the static artwork at the same position rather than
    // handing next/image an empty src.
    image: entry.image || STATIC_SLIDES[0]?.image || IMAGES.placeholder,
    title: entry.title,
    paragraph: entry.description,
  };
}

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = await getDictionary(locale);
  return { title: `${dictionary.nav.about} — DEYA` };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Fetched here rather than inside HistoryHero: that component is "use client"
  // (framer-motion, scroll listeners, refs), and `next: { revalidate: 300 }` is
  // server-fetch semantics only. The locale is passed through so the backend can
  // resolve the language and so each locale gets its own cache entry.
  // Both fetched here, in parallel: neither depends on the other, and awaiting
  // them in sequence would just add a round trip.
  //
  // allSettled, not all: with Promise.all a timeline rejection discarded the
  // factory result that had already been fetched alongside it and the catch
  // re-requested it. getFactory passes an AbortSignal, and Next skips
  // per-render fetch memoization for any call carrying a signal, so that
  // second call was a genuine second request, not a cache hit.
  const [timelineResult, factoryResult] = await Promise.allSettled([
    getTimeline(locale),
    getFactory(locale),
  ]);

  const fetched: TimelineEntry[] =
    timelineResult.status === "fulfilled" ? timelineResult.value : [];
  const fetchError: unknown =
    timelineResult.status === "rejected" ? timelineResult.reason : null;
  // getFactory logs its own failure and answers null rather than rejecting, so
  // the rejected arm here is only reachable if that contract ever changes.
  const factory: Factory | null =
    factoryResult.status === "fulfilled" ? factoryResult.value : null;

  const usingApi = fetched.length > 0;
  const slides = usingApi ? fetched.map(toSlide) : STATIC_SLIDES;

  // Never silent: whenever the static content stands in, say why. `cause` is a
  // separate argument because Node reports network-level failures as the bare
  // string "fetch failed" and hides the reason there.
  if (!usingApi) {
    console.error(
      "[AboutPage] timeline falling back to static content —",
      fetchError instanceof Error
        ? fetchError.message
        : "request returned an empty or wholly malformed array",
      "| cause:",
      fetchError instanceof Error ? (fetchError.cause ?? "(none)") : "(none)",
    );
  }

  return (
    <>
      <HistoryHero slides={slides} />
      <FounderStory factory={factory} />
    </>
  );
}
