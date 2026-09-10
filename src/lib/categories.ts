import { apiOrigin, mediaImageUrl, readJson } from "@/lib/api";

/**
 * GET /api/v1/categories/
 *
 * Answers with a BARE ARRAY, not the `{ count, next, results }` envelope DRF
 * list views usually return — nothing here unwraps `.results`.
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  sort_order: number;
}

/**
 * Trailing slash is load-bearing: Django's APPEND_SLASH answers the slashless
 * form with a 301, confirmed against the live host. Do not trim it. The
 * `/api/v1` prefix lives here in the path, never in the base.
 */
const CATEGORIES_PATH = "/api/v1/categories/";

/** Exported so products.ts can validate its nested `category` object with the
 *  same rules instead of keeping a second copy that could drift. */
export function isCategory(value: unknown): value is Category {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    candidate.name.trim() !== "" &&
    typeof candidate.slug === "string" &&
    candidate.slug.trim() !== "" &&
    typeof candidate.image === "string" &&
    typeof candidate.sort_order === "number"
  );
}

/**
 * Sorted by `sort_order` ascending here rather than at the call site: the
 * response order is not the display order, and that field exists precisely
 * because the backend owns the sequence. `id` breaks ties so equal sort_order
 * values keep a stable, reproducible order instead of depending on the
 * payload's arrival order.
 *
 * Malformed entries are dropped rather than failing the whole list, so one bad
 * row in the CMS cannot blank the grid. A non-array body, a non-2xx status or a
 * missing base URL all throw — the caller decides whether to fall back.
 */
export async function getCategories(locale?: string): Promise<Category[]> {
  const origin = apiOrigin();

  // `locale` is OPTIONAL so the existing catalog call site keeps its exact
  // current behaviour — omitting it sends the byte-identical request this
  // module always sent, no new query string and no new header.
  //
  // When it IS passed, both `?lang=` and `Accept-Language` go out: the pair
  // getSettings and getHome already send. Probing the live endpoint showed
  // only the header actually moves the names here (`?lang=` alone is a no-op),
  // but both are sent so this module matches its siblings rather than baking
  // in one endpoint's current quirk. `?lang=` also keeps the fetch cache key
  // distinct per locale instead of relying on the header being part of it.
  const query = locale ? `?lang=${encodeURIComponent(locale)}` : "";
  const url = `${origin}${CATEGORIES_PATH}${query}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (locale) headers["Accept-Language"] = locale;

  const response = await fetch(url, {
    headers,
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

  return body
    .filter(isCategory)
    .map((category) => ({
      ...category,
      // Shared helper, not a local copy: the payload's absolute URLs arrive
      // over http:// and the component must never see one.
      image: mediaImageUrl(category.image, origin),
    }))
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}
