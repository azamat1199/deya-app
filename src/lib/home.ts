import { IMAGES } from "@/content/images";
import { apiOrigin, mediaImageUrl, mediaUrl } from "@/lib/api";

/**
 * GET /api/v1/home/
 *
 * ONE object carrying SIX arrays, one per home-page section. This is the whole
 * point of the endpoint: the home page fetches it exactly once and passes each
 * array down as a prop. Nothing on that page may call /api/v1/categories/ or
 * /api/v1/posts/ — those arrays are already in this body.
 *
 * A SINGLETON OBJECT, not paginated: there is no { count, next, results }
 * envelope here, unlike /api/v1/products/.
 *
 * Every array may be empty. An empty array is a normal, successful answer and
 * means "this section has no rows" — the caller hides that section rather than
 * substituting mock content. Only a failed REQUEST falls back to mock.
 */

export interface HomeSlide {
  id: number;
  title: string;
  /** The body copy under the h1. May be "" — the CMS currently leaves it so. */
  subtitle: string;
  /** Absolute https URL, or "" when no file is uploaded. */
  image: string;
  /** Both cta fields are "" together when the slide has no button. */
  cta_label: string;
  cta_url: string;
}

export interface HomeStat {
  id: number;
  /** A STRING, deliberately — it carries its own "+", "%" or "K". Never
   *  reformatted for display. */
  value: string;
  label: string;
}

export interface HomeCategory {
  id: number;
  name: string;
  slug: string;
  image: string;
  /** Ascending display order. The response order is NOT trustworthy. */
  sort_order: number;
}

export interface HomeFlavor {
  id: number;
  name: string;
  slug: string;
}

/** Same shape as products.ts's ProductImage — `image` is the URL, not the row. */
export interface HomeProductImage {
  id: number;
  image: string;
  alt: string;
  is_main: boolean;
  sort_order: number;
}

export interface HomeFeaturedProduct {
  id: number;
  /** The PRODUCT name. The card title is this, never category.name. */
  name: string;
  slug: string;
  category: HomeCategory;
  flavor: HomeFlavor | null;
  /** "new" | "hit" | null. Null means no chip at all, never an empty chip. */
  badge: string | null;
  is_featured: boolean;
  main_image: HomeProductImage | null;
}

/**
 * Only `id` and `name` are modelled. The payload also carries position_x and
 * position_y, which are DELIBERATELY not read: the map's marker coordinates are
 * three hand-tuned per-breakpoint sets in content/regions.ts, and the API sends
 * a single "1.00"/"1.00" pair for every region. Wiring those in would stack all
 * seven markers in one spot.
 */
export interface HomeExportRegion {
  id: number;
  name: string;
}

export interface HomePost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  /** ISO 8601 UTC ("2026-08-18T17:05:00Z"). Formatted with Intl at render. */
  published_at: string;
}

export interface HomeData {
  slides: HomeSlide[];
  stats: HomeStat[];
  categories: HomeCategory[];
  featured_products: HomeFeaturedProduct[];
  export_regions: HomeExportRegion[];
  latest_posts: HomePost[];
}

/** Trailing slash is load-bearing: Django's APPEND_SLASH 301s the slashless
 *  form. The `/api/v1` prefix lives here, never in the base. */
const HOME_PATH = "/api/v1/home/";

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(source: Record<string, unknown>, key: string): number | null {
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Reads one array off the body. A missing or non-array key is an empty
 *  section, not a failure — one absent field must not blank the whole page. */
function readArray(source: Record<string, unknown>, key: string): unknown[] {
  const value = source[key];
  return Array.isArray(value) ? value : [];
}

function toSlide(value: unknown, origin: string): HomeSlide | null {
  if (!isRecord(value)) return null;
  const id = readNumber(value, "id");
  const title = readString(value, "title");
  // No id means no stable React key, and no title means nothing to show.
  if (id === null || !title) return null;

  return {
    id,
    title,
    subtitle: readString(value, "subtitle"),
    // Shared helper, never a local copy: these arrive over http:// and a
    // component must never see one. mediaImageUrl, not mediaUrl — this lands in
    // a full-bleed hero `src`, so the hero photograph stands in for a missing
    // upload rather than the small product placeholder.
    image: mediaImageUrl(readString(value, "image"), origin, IMAGES.heroFactory),
    cta_label: readString(value, "cta_label"),
    cta_url: readString(value, "cta_url"),
  };
}

function toStat(value: unknown): HomeStat | null {
  if (!isRecord(value)) return null;
  const id = readNumber(value, "id");
  const raw = readString(value, "value");
  if (id === null || !raw) return null;

  // `value` is passed through verbatim — no parsing, no reformatting. The "+"
  // in "32+" is content, not decoration.
  return { id, value: raw, label: readString(value, "label") };
}

function toCategory(value: unknown, origin: string): HomeCategory | null {
  if (!isRecord(value)) return null;
  const id = readNumber(value, "id");
  const name = readString(value, "name");
  const slug = readString(value, "slug");
  // The slug is the catalog filter key; a category without one links nowhere.
  if (id === null || !name || !slug) return null;

  return {
    id,
    name,
    slug,
    image: mediaImageUrl(readString(value, "image"), origin),
    // Missing sort_order sinks to the end rather than jumping to the front.
    sort_order: readNumber(value, "sort_order") ?? Number.MAX_SAFE_INTEGER,
  };
}

function toFlavor(value: unknown): HomeFlavor | null {
  if (!isRecord(value)) return null;
  const id = readNumber(value, "id");
  const name = readString(value, "name");
  if (id === null || !name) return null;
  return { id, name, slug: readString(value, "slug") };
}

function toProductImage(
  value: unknown,
  origin: string,
): HomeProductImage | null {
  if (!isRecord(value)) return null;
  const id = readNumber(value, "id");
  const url = mediaUrl(readString(value, "image"), origin);
  // An image row whose URL resolves to nothing is the same as no image at all:
  // return null so the caller falls back to its placeholder instead of
  // rendering <Image src="">, which makes the browser re-request the page.
  if (id === null || !url) return null;

  return {
    id,
    image: url,
    alt: readString(value, "alt"),
    is_main: value.is_main === true,
    sort_order: readNumber(value, "sort_order") ?? 0,
  };
}

function toFeaturedProduct(
  value: unknown,
  origin: string,
): HomeFeaturedProduct | null {
  if (!isRecord(value)) return null;
  const id = readNumber(value, "id");
  const name = readString(value, "name");
  const slug = readString(value, "slug");
  const category = toCategory(value.category, origin);
  // The href is built from category.slug + slug, so a row missing either one
  // cannot produce a working card.
  if (id === null || !name || !slug || !category) return null;

  const badge = readString(value, "badge");

  return {
    id,
    name,
    slug,
    category,
    flavor: toFlavor(value.flavor),
    // "" collapses to null so a caller can never render an empty badge chip.
    badge: badge || null,
    is_featured: value.is_featured === true,
    main_image: toProductImage(value.main_image, origin),
  };
}

function toExportRegion(value: unknown): HomeExportRegion | null {
  if (!isRecord(value)) return null;
  const id = readNumber(value, "id");
  const name = readString(value, "name");
  if (id === null || !name) return null;
  // position_x / position_y are read on purpose nowhere. See HomeExportRegion.
  return { id, name };
}

function toPost(value: unknown, origin: string): HomePost | null {
  if (!isRecord(value)) return null;
  const id = readNumber(value, "id");
  const title = readString(value, "title");
  const slug = readString(value, "slug");
  if (id === null || !title || !slug) return null;

  return {
    id,
    title,
    slug,
    excerpt: readString(value, "excerpt"),
    cover: mediaImageUrl(readString(value, "cover"), origin),
    published_at: readString(value, "published_at"),
  };
}

/**
 * Returns null on ANY failure — unreachable host, non-2xx, unparseable body,
 * wrong shape — so the caller falls back to its static content for all six
 * sections at once. Exactly one console.error is emitted per failure, carrying
 * `cause`, which is where fetch hides the underlying DNS/TLS/socket error.
 *
 * The response is language-dependent, so the locale reaches the cache key the
 * same way getSettings does it: Accept-Language is the mechanism the backend
 * documents, but a header is not a reliable part of Next's Data Cache key, and
 * one cached response replayed across locales would serve Russian copy on the
 * English page. The locale therefore also rides in the query string, which the
 * backend ignores and which makes the URL — and so the cache entry — distinct
 * per locale.
 */
export async function getHome(locale: string): Promise<HomeData | null> {
  const origin = apiOrigin();
  const url = `${origin}${HOME_PATH}?lang=${encodeURIComponent(locale)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
      },
      // EXPLICIT, never the default: leaving it unset freezes the build-time
      // result into static HTML, so CMS edits would never appear.
      next: { revalidate: 300 },
    });
  } catch (error) {
    console.error(
      "[getHome] request did not reach the server —",
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
    return null;
  }

  if (!response.ok) {
    console.error(
      `[getHome] GET ${url} failed with ${response.status} | cause: (none)`,
    );
    return null;
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    console.error(
      `[getHome] GET ${url} returned unparseable JSON —`,
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
    return null;
  }

  if (!isRecord(body)) {
    console.error(
      `[getHome] GET ${url} did not return a singleton object — got ${
        Array.isArray(body) ? "an array" : typeof body
      } | cause: (none)`,
    );
    return null;
  }

  return {
    slides: readArray(body, "slides")
      .map((row) => toSlide(row, origin))
      .filter((row): row is HomeSlide => row !== null),
    stats: readArray(body, "stats")
      .map(toStat)
      .filter((row): row is HomeStat => row !== null),
    // Sorted here, once, so no component has to trust the response order.
    categories: readArray(body, "categories")
      .map((row) => toCategory(row, origin))
      .filter((row): row is HomeCategory => row !== null)
      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    featured_products: readArray(body, "featured_products")
      .map((row) => toFeaturedProduct(row, origin))
      .filter((row): row is HomeFeaturedProduct => row !== null),
    export_regions: readArray(body, "export_regions")
      .map(toExportRegion)
      .filter((row): row is HomeExportRegion => row !== null),
    latest_posts: readArray(body, "latest_posts")
      .map((row) => toPost(row, origin))
      .filter((row): row is HomePost => row !== null),
  };
}
