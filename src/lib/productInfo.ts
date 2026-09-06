import { apiOrigin, mediaUrl, readJson } from "@/lib/api";

/**
 * GET /api/v1/product-info/
 *
 * A BARE ARRAY, not the { count, next, results } envelope DRF list views
 * usually return — the body is used directly and nothing unwraps .results.
 *
 * Drives the two CareersCulture blocks that sandwich the CareersBrands strip
 * on /careers. The row COUNT is the contract, not any field on the rows: row 1
 * (lowest id) is the block above brands, row 2 is the block below. Sorted by id
 * here rather than trusted from the wire, same as every other unsorted list in
 * this project.
 */
export interface ProductInfoItem {
  id: number;
  title: string;
  /** Unlike /api/v1/career-values/, which calls this field `text`. */
  description: string;
  /** Absolute https URL, or "" when no file is uploaded. */
  image: string;
}

/** Trailing slash is load-bearing: Django's APPEND_SLASH answers the slashless
 *  form with a 301. Do not trim it. */
const PRODUCT_INFO_PATH = "/api/v1/product-info/";

function isProductInfoItem(value: unknown): value is ProductInfoItem {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.title === "string" &&
    candidate.title.trim() !== "" &&
    typeof candidate.description === "string" &&
    typeof candidate.image === "string"
  );
}

/**
 * Malformed rows are dropped rather than failing the list. A non-array body, a
 * non-2xx status or a missing base URL throw — the caller decides whether to
 * fall back, the same contract getCareerValues and getPartners use. Do not add
 * a second fetching style here.
 *
 * The locale reaches the cache key the way every other module in this project
 * does it: Accept-Language is the mechanism the backend documents, but a header
 * is not a reliable part of Next's Data Cache key, so the locale also rides in
 * the query string, which the backend ignores.
 */
export async function getProductInfo(locale: string): Promise<ProductInfoItem[]> {
  const origin = apiOrigin();
  const url = `${origin}${PRODUCT_INFO_PATH}?lang=${encodeURIComponent(locale)}`;

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
  const rejected = body.filter((row) => !isProductInfoItem(row));
  if (rejected.length) {
    const missingId = rejected.filter(
      (row) =>
        typeof row !== "object" ||
        row === null ||
        typeof (row as Record<string, unknown>).id !== "number",
    );
    console.error(
      `[getProductInfo] dropped ${rejected.length} unusable row(s), ${missingId.length} of them lacking a numeric id — first offender:`,
      JSON.stringify(rejected[0]),
    );
  }

  return body
    .filter(isProductInfoItem)
    .map((item) => ({
      ...item,
      // Shared helper, never a local copy: these arrive over http:// and a
      // component must never see one. Empty stays empty so the caller can
      // decide the fallback rather than hand next/image an empty src.
      image: mediaUrl(item.image, origin),
    }))
    .sort((a, b) => a.id - b.id);
}
