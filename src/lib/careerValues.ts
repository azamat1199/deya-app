import { apiOrigin, mediaUrl, readJson } from "@/lib/api";

/**
 * GET /api/v1/career-values/
 *
 * A BARE ARRAY, not the { count, next, results } envelope DRF list views
 * usually return — the body is used directly and nothing unwraps .results.
 *
 * This lived in a useEffect inside CareersAbout until now, which could never
 * work: the endpoint sends no Access-Control-Allow-Origin, so a browser fetch
 * to it is CORS-blocked for every visitor and the section always fell back.
 * Server-side there is no CORS at all, Accept-Language finally reaches the
 * backend, and the response is cached instead of refetched on every mount.
 */
export interface CareerValue {
  id: number;
  title: string;
  /** The tile's body copy. The API calls it `text`, not `description`. */
  text: string;
  /** Absolute https URL, or "" when no file is uploaded. */
  image: string;
}

/** Trailing slash is load-bearing: Django's APPEND_SLASH answers the slashless
 *  form with a 301, confirmed against the live host. Do not trim it. */
const CAREER_VALUES_PATH = "/api/v1/career-values/";

function isCareerValue(value: unknown): value is CareerValue {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.title === "string" &&
    candidate.title.trim() !== "" &&
    typeof candidate.text === "string" &&
    typeof candidate.image === "string"
  );
}

/**
 * Returned in the order the backend sent them: this endpoint carries no
 * sort_order, so nothing here sorts.
 *
 * Malformed rows are dropped rather than failing the list. A non-array body, a
 * non-2xx status or a missing base URL throw — the caller decides whether to
 * fall back, which is the same contract getPartners and getTimeline use.
 *
 * The locale reaches the cache key the way getSettings, getHome and getFactory
 * do it: Accept-Language is the mechanism the backend documents, but a header is
 * not a reliable part of Next's Data Cache key, and one cached response replayed
 * across locales would serve Russian copy on the English page. The locale
 * therefore also rides in the query string, which the backend ignores.
 */
export async function getCareerValues(locale: string): Promise<CareerValue[]> {
  const origin = apiOrigin();
  const url = `${origin}${CAREER_VALUES_PATH}?lang=${encodeURIComponent(locale)}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
    },
    // EXPLICIT, never the default: leaving it unset freezes the build-time
    // result into static HTML, so CMS edits would never appear.
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`);
  }

  const body: unknown = await readJson(response, url);
  if (!Array.isArray(body)) {
    throw new Error(`GET ${url} did not return an array`);
  }

  // A row without a usable id would produce a duplicate React key downstream,
  // so it is reported loudly rather than silently dropped. Logged once with the
  // first offender, not once per row.
  const rejected = body.filter((row) => !isCareerValue(row));
  if (rejected.length) {
    const missingId = rejected.filter(
      (row) =>
        typeof row !== "object" ||
        row === null ||
        typeof (row as Record<string, unknown>).id !== "number",
    );
    console.error(
      `[getCareerValues] dropped ${rejected.length} unusable row(s), ${missingId.length} of them lacking a numeric id — first offender:`,
      JSON.stringify(rejected[0]),
    );
  }

  return body.filter(isCareerValue).map((value) => ({
    ...value,
    // Shared helper, never a local copy: these arrive over http:// and a
    // component must never see one. Empty stays empty so the caller can borrow
    // the static artwork at the same position rather than hand next/image an
    // empty src.
    image: mediaUrl(value.image, origin),
  }));
}
