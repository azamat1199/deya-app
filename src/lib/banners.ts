import { apiOrigin, mediaUrl, readJson } from "@/lib/api";

/**
 * GET /api/v1/banners/
 *
 * Answers with a BARE ARRAY, not DRF's `{ count, next, results }` envelope —
 * nothing here unwraps `.results`. The whole list is fetched once and filtered
 * in memory by pickBanner, rather than issuing one `?type=` request per page:
 * all three hero pages then share a single Data Cache entry per locale, since
 * that cache keys on the request URL and headers.
 *
 * Translatable fields arrive as PLAIN STRINGS already resolved by the backend
 * from Accept-Language — NOT the { en, ru, uz } dicts /api/v1/factory/ and
 * /api/v1/privacy-policy/ turned out to send. Verified against the live host.
 */
export interface Banner {
  id: number;
  /** Which hero slot this row belongs to. See BannerType. */
  type: string;
  title: string;
  subtitle: string;
  /**
   * Absolute URL to the artwork, normalised to https in this layer so no
   * component ever sees the http:// the backend stamps. MAY BE EMPTY, which
   * callers must treat as "no image" rather than passing it to next/image.
   */
  image: string;
  /**
   * Empty on every live row today. The hero slots deliberately do not use it —
   * CareersHero keeps its own translated vacancies label.
   */
  cta_label: string;
  /**
   * NULLABLE, and null on live rows (banners id=3 and id=5). Modelled as
   * `string | null` because a guard requiring a string silently DROPS those
   * rows — a bug this file shipped with until the full list was inspected.
   * Empty string also occurs, so callers must treat "" and null alike.
   */
  cta_url: string | null;
}

/** The three hero slots that consume this endpoint. */
export type BannerType = "main" | "partner" | "carrier";

/**
 * Trailing slash is load-bearing: Django's APPEND_SLASH answers the slashless
 * form with a 301. The `/api/v1` prefix lives here, never in the base.
 */
const BANNERS_PATH = "/api/v1/banners/";

function isBanner(value: unknown): value is Banner {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.type === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.subtitle === "string" &&
    typeof candidate.image === "string" &&
    typeof candidate.cta_label === "string" &&
    // null is a real, live value here — see the field's doc.
    (typeof candidate.cta_url === "string" || candidate.cta_url === null)
  );
}

/**
 * Every banner, in id order.
 *
 * NEVER THROWS. Answers `[]` on any failure — unreachable host, timeout,
 * non-2xx, unparseable body, non-array body — after one console.error carrying
 * `cause`, because Node reports network-level failures as the bare string
 * "fetch failed" and hides the reason there. Callers above the fold need a
 * decision, not an exception: an empty list and a list with no matching type
 * are the same case to them.
 *
 * revalidate: 300, the convention for CMS-authored page content in this
 * project (home, timeline, companies, product-info). EXPLICIT, never the
 * default: `next: { revalidate }` is documented as the cache lifetime in
 * seconds, and leaving it unset in this version re-requests on every render.
 *
 * The locale rides in BOTH the Accept-Language header (the mechanism the
 * backend resolves translations from) and the query string, so /uz cannot be
 * served Russian out of a shared cache entry.
 */
export async function getBanners(locale: string): Promise<Banner[]> {
  const origin = apiOrigin();
  const url = `${origin}${BANNERS_PATH}?lang=${encodeURIComponent(locale)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 300 },
    });
  } catch (error) {
    console.error(
      "[getBanners] request did not reach the server —",
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
    return [];
  }

  if (!response.ok) {
    console.error(
      `[getBanners] GET ${url} failed with ${response.status} | cause: (none)`,
    );
    return [];
  }

  let body: unknown;
  try {
    body = await readJson(response, url);
  } catch (error) {
    console.error(
      "[getBanners] unparseable body —",
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
    return [];
  }

  if (!Array.isArray(body)) {
    console.error(
      `[getBanners] GET ${url} did not return an array — got ${typeof body} | cause: (none)`,
    );
    return [];
  }

  const rows = body.filter(isBanner);
  if (rows.length !== body.length) {
    console.error(
      `[getBanners] dropped ${body.length - rows.length} unusable row(s) — first offender:`,
      JSON.stringify(body.find((row) => !isBanner(row))),
      "| cause: (none)",
    );
  }

  return rows
    .map((banner) => ({
      ...banner,
      title: banner.title.trim(),
      subtitle: banner.subtitle.trim(),
      // Shared helper, never a local copy: these arrive over http:// and a
      // component must never see one. Empty stays empty — see the field's doc.
      image: mediaUrl(banner.image, origin),
      cta_url: banner.cta_url?.trim() || null,
    }))
    .sort((a, b) => a.id - b.id);
}

/**
 * The banner for one hero slot, or null when the CMS has none.
 *
 * Takes the FIRST match by ascending id. CareersHero and PartnersHero are
 * single-banner slots, so a second row of the same type is not a carousel —
 * it is almost certainly a duplicate to delete in the admin, and it is warned
 * about rather than rendered. Sorted by id in getBanners rather than trusting
 * arrival order, since this endpoint carries no sort_order.
 *
 * `main` legitimately has three rows today and is NOT a single slot, so this
 * helper is the wrong tool for HeroSlider — use the filtered list there.
 */
export function pickBanner(
  banners: Banner[],
  type: BannerType,
): Banner | null {
  const matches = banners.filter((banner) => banner.type === type);
  if (matches.length === 0) return null;

  if (matches.length > 1) {
    console.warn(
      `[pickBanner] ${matches.length} banners of type "${type}" (ids ${matches
        .map((banner) => banner.id)
        .join(", ")}) — using id=${matches[0].id}. This slot renders ONE banner; the extra row(s) are probably duplicates to delete in the admin.`,
    );
  }

  return matches[0];
}
