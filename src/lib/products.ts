import { apiOrigin, mediaUrl } from "@/lib/api";
import { isCategory, type Category } from "@/lib/categories";

/**
 * GET /api/v1/products/
 *
 * PAGINATED, unlike every other endpoint in this project: the body is a
 * `{ count, next, previous, results }` envelope and the array lives at
 * `.results`. Do not copy the bare-array handling from categories.ts.
 */
export interface ProductFlavor {
  id: number;
  name: string;
  slug: string;
}

/**
 * `main_image` is an OBJECT, not the plain URL string the API spec advertises.
 * The URL is at `.image` and there is a usable `.alt`.
 */
export interface ProductImage {
  id: number;
  image: string;
  alt: string;
  is_main: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: Category;
  /** Null when the product has no flavor variant. */
  flavor: ProductFlavor | null;
  /** "new" | "hit" | anything else the CMS grows; null when unset. */
  badge: string | null;
  is_featured: boolean;
  main_image: ProductImage | null;
}

/** Trailing slash is load-bearing: Django's APPEND_SLASH 301s the slashless
 *  form. The `/api/v1` prefix lives here, never in the base. */
const PRODUCTS_PATH = "/api/v1/products/";

/**
 * Safety valve. `next` is backend-controlled, so a paging bug upstream could
 * otherwise loop forever. Hitting this cap is logged, never silent.
 */
const MAX_PAGES = 10;

interface PaginatedBody {
  count: number;
  next: unknown;
  results: unknown[];
}

function isPaginatedBody(value: unknown): value is PaginatedBody {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.results);
}

function isProductImage(value: unknown): value is ProductImage {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.image === "string";
}

function isFlavor(value: unknown): value is ProductFlavor {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.name === "string" && candidate.name.trim() !== "";
}

/** A product is only usable if it has an id, a name and a valid category —
 *  the category id is what the filter compares against. */
function isProduct(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    candidate.name.trim() !== "" &&
    typeof candidate.slug === "string" &&
    isCategory(candidate.category)
  );
}

function toProduct(value: unknown, origin: string): Product {
  const raw = value as Record<string, unknown>;
  const category = raw.category as Category;
  const image = isProductImage(raw.main_image) ? raw.main_image : null;

  return {
    id: raw.id as number,
    name: raw.name as string,
    slug: raw.slug as string,
    category: { ...category, image: mediaUrl(category.image, origin) },
    flavor: isFlavor(raw.flavor) ? raw.flavor : null,
    badge:
      typeof raw.badge === "string" && raw.badge.trim() ? raw.badge.trim() : null,
    is_featured: raw.is_featured === true,
    // Shared helper, never a local copy: these arrive over http:// and the
    // component must never see one.
    main_image: image ? { ...image, image: mediaUrl(image.image, origin) } : null,
  };
}

/**
 * DRF returns `next` as an absolute URL built by the backend, which means it
 * carries the same wrong http:// scheme as the media URLs. Rebuilt against the
 * configured origin so following it never downgrades the request, and refused
 * outright if it points at another host.
 */
function nextPageUrl(next: unknown, origin: string): string | null {
  if (typeof next !== "string" || !next.trim()) return null;
  try {
    const parsed = new URL(next, origin);
    if (parsed.hostname !== new URL(origin).hostname) return null;
    return `${origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

/**
 * Follows `next` until it runs out, so the grid gets every product rather than
 * page one. Malformed rows are dropped instead of failing the list; a non-2xx
 * status, a missing envelope or a missing base URL throw and the caller decides
 * whether to fall back.
 */
export async function getProducts(): Promise<Product[]> {
  const origin = apiOrigin();
  let url: string | null = `${origin}${PRODUCTS_PATH}`;
  const collected: Product[] = [];
  let requests = 0;

  while (url && requests < MAX_PAGES) {
    requests += 1;

    const response: Response = await fetch(url, {
      headers: { Accept: "application/json" },
      // EXPLICIT, never the default: leaving it unset freezes the build-time
      // result into static HTML, so CMS edits would never appear.
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`GET ${url} failed with ${response.status}`);
    }

    const body: unknown = await response.json();
    if (!isPaginatedBody(body)) {
      throw new Error(`GET ${url} did not return a { count, next, results } body`);
    }

    for (const row of body.results) {
      if (isProduct(row)) collected.push(toProduct(row, origin));
    }

    url = nextPageUrl(body.next, origin);
  }

  // Never a silent truncation: if the cap stopped us, say so.
  if (url) {
    console.warn(
      `[getProducts] stopped at the ${MAX_PAGES}-request cap with more pages still available — ${collected.length} products collected`,
    );
  }

  return collected;
}
