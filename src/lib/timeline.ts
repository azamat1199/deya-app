import { apiOrigin, mediaImageUrl } from "@/lib/api";

/**
 * GET /api/v1/timeline/
 *
 * Answers with a BARE ARRAY, not the `{ count, next, results }` envelope DRF
 * list views usually return — nothing here unwraps `.results`.
 *
 * `title` and `description` are plain STRINGS on this public endpoint, not
 * `{ uz, ru, en }` objects: the backend is supposed to resolve the language
 * itself from Accept-Language. Nothing here does client-side translation.
 */
export interface TimelineEntry {
  id: number;
  /** A NUMBER in the payload, e.g. 1994 — not a string. */
  year: number;
  title: string;
  description: string;
  image: string;
}

/**
 * Trailing slash is load-bearing: Django's APPEND_SLASH answers the slashless
 * form with a 301. The `/api/v1` prefix lives here, never in the base.
 */
const TIMELINE_PATH = "/api/v1/timeline/";

function isTimelineEntry(value: unknown): value is TimelineEntry {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.year === "number" &&
    typeof candidate.title === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.image === "string"
  );
}

/**
 * Sorted by `year` ASCENDING — this endpoint has no sort_order, and the static
 * timeline it replaces runs oldest-first (1994 → 2026), so ascending is what
 * the component already displays. `id` breaks ties so equal years keep a
 * stable order rather than depending on the payload's arrival order.
 *
 * The response VARIES BY LANGUAGE, so the locale has to reach the cache key.
 * Accept-Language is the mechanism the backend documents, but a header is not a
 * reliable part of Next's Data Cache key — one cached response would then be
 * replayed for every locale and serve Russian copy on the English page. The
 * locale therefore also rides in the query string, which the backend ignores
 * and which makes the URL (and so the cache entry) distinct per locale.
 */
export async function getTimeline(locale: string): Promise<TimelineEntry[]> {
  const origin = apiOrigin();
  const url = `${origin}${TIMELINE_PATH}?lang=${encodeURIComponent(locale)}`;

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

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new Error(`GET ${url} did not return an array`);
  }

  // A row without a usable id would produce an undefined React key downstream,
  // so it is reported loudly rather than dropped in silence. Logged once with
  // the first offender, not once per row.
  const rejected = body.filter((row) => !isTimelineEntry(row));
  if (rejected.length) {
    console.error(
      `[getTimeline] dropped ${rejected.length} unusable row(s) — first offender:`,
      JSON.stringify(rejected[0]),
    );
  }

  return body
    .filter(isTimelineEntry)
    .map((entry) => ({
      ...entry,
      // Shared helper, never a local copy: these arrive over http:// and a
      // component must never see one.
      image: mediaImageUrl(entry.image, origin),
    }))
    .sort((a, b) => a.year - b.year || a.id - b.id);
}
