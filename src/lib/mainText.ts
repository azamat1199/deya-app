import type { Banner } from "@/lib/banners";
import type { Locale } from "@/lib/i18n/config";

/**
 * The four CMS-editable texts on the home page, read out of
 * GET /api/v1/banners/.
 *
 * The rows are NOT fetched here: src/app/[locale]/page.tsx already calls
 * getBanners(locale) once for HeroSlider, and this module reads that same
 * array. A second request to the same endpoint would be pure waste.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * WHY THE UZBEK TEXT LIVES IN `subtitle` — DO NOT "FIX" THIS
 * ───────────────────────────────────────────────────────────────────────────
 * It looks like a bug. It is not. For these four rows the CMS does not store
 * one translatable field per text; it stores the THREE LANGUAGES OF ONE TEXT
 * IN THREE DIFFERENT FIELDS, and fills exactly one key in each:
 *
 *     Russian  → title
 *     Uzbek    → subtitle      ← not a mix-up, this is where uz is authored
 *     English  → cta_label
 *
 * So `subtitle` on a `sub_main_map` row is not the subtitle of anything — it
 * is the Uzbek version of the heading. Reading `subtitle` as a subtitle, or
 * running these fields through the ordinary translation resolver, produces
 * Russian text on /uz and /en with no error anywhere.
 *
 * The suffixes " ru" / " en" you will see at the end of the live values are
 * the CMS editor's own markers. They are rendered verbatim on purpose: the
 * content owner is cleaning them up in the CMS, and trimming them here would
 * hide the next malformed value instead of surfacing it.
 * ───────────────────────────────────────────────────────────────────────────
 */

/** The four rows this module knows how to read, by their CMS `type`. */
export type MainTextType =
  | "about_title"
  | "about"
  | "sub_main"
  | "sub_main_map";

/**
 * Which FIELD carries which LANGUAGE. See the block comment above — this map
 * is the whole trick, and it is deliberately the only place that encodes it.
 */
const FIELD_BY_LOCALE: Record<Locale, "title" | "subtitle" | "cta_label"> = {
  ru: "title",
  uz: "subtitle",
  en: "cta_label",
};

/**
 * Reads one field, tolerating BOTH shapes the endpoint has been observed to
 * return.
 *
 * Today the public serializer answers with a flat string: `openapi.yaml`
 * declares `title`/`subtitle`/`cta_label` as `type: string, readOnly: true`,
 * and a live response confirms it. The backend has been asked to expose them
 * as `{ uz, ru, en }` objects instead. Accepting either shape means the switch
 * is a backend deploy rather than a frontend change, and nothing breaks in the
 * window where only one environment has flipped.
 *
 * Anything that is neither a string nor an object with a string under the
 * active locale reads as empty, which sends the caller to its static text.
 */
function readLocaleField(value: unknown, locale: Locale): string {
  if (typeof value === "string") return value.trim();

  if (value !== null && typeof value === "object") {
    const nested = (value as Record<string, unknown>)[locale];
    if (typeof nested === "string") return nested.trim();
  }

  return "";
}

/**
 * The text for one `type` in one locale, or "" when the CMS has nothing
 * usable — no row of that type, or an empty value for this language. The
 * caller decides what to show instead; this never invents copy.
 *
 * Duplicate rows are NOT removed here. The content owner is deleting them in
 * the CMS; the code takes the first (getBanners sorts by id ascending, so the
 * first is the lowest id) and names the extras in one warning, so a duplicate
 * that outlives the cleanup stays visible to us.
 */
export function pickMainText(
  banners: Banner[],
  type: MainTextType,
  locale: Locale,
): string {
  const matches = banners.filter((banner) => banner.type === type);
  if (matches.length === 0) return "";

  if (matches.length > 1) {
    const [kept, ...extra] = matches;
    console.warn(
      `[mainText] ${matches.length} rows of type "${type}" — using id=${kept.id}. ` +
        `Extra id(s): ${extra.map((row) => row.id).join(", ")}. ` +
        `Delete the duplicates in the CMS.`,
    );
  }

  return readLocaleField(matches[0][FIELD_BY_LOCALE[locale]], locale);
}

/** Every home-page CMS text, resolved once for the active locale. */
export interface MainTexts {
  aboutTitle: string;
  about: string;
  subMain: string;
  subMainMap: string;
}

/**
 * Resolves all four in one pass over the array the page already has.
 *
 * NOTE the mapping between `type` and what the text actually is: the names do
 * not describe the content. `about` is the LEFT paragraph, not the heading;
 * `about_title` is the heading; `sub_main` is the RIGHT paragraph. That is how
 * the rows were authored in the CMS, and renaming them is a CMS migration, not
 * a frontend change.
 */
export function getMainTexts(banners: Banner[], locale: Locale): MainTexts {
  return {
    aboutTitle: pickMainText(banners, "about_title", locale),
    about: pickMainText(banners, "about", locale),
    subMain: pickMainText(banners, "sub_main", locale),
    subMainMap: pickMainText(banners, "sub_main_map", locale),
  };
}
