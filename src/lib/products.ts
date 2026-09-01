import { IMAGES } from "@/content/images";
import { apiOrigin, mediaImageUrl, readJson } from "@/lib/api";
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

/** One weight the product is sold in. `value` is a decimal string ("1.00"). */
export interface ProductWeight {
  id: number;
  value: string;
  unit: string;
}

/**
 * GET /api/v1/products/{slug}/
 *
 * NOT a strict superset of the list shape: the detail view drops `main_image`
 * and answers with a full `images` array instead, and adds description, code,
 * box_weight, shelf_life_months, weights and variants. The shared sub-types
 * (Category, ProductFlavor, ProductImage) are reused rather than redeclared.
 */
export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  /** Article/SKU code, e.g. "B-214". */
  code: string;
  /** Decimal string in kilograms, e.g. "1.500". */
  box_weight: string;
  shelf_life_months: number | null;
  category: Category;
  flavor: ProductFlavor | null;
  badge: string | null;
  is_featured: boolean;
  images: ProductImage[];
  weights: ProductWeight[];
  /** Sibling products offered as alternative variants. */
  variants: Product[];
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
  // Non-empty is part of the shape. A row whose url is "" is not a usable
  // image, and admitting it only moves the empty string downstream — which is
  // exactly how `<Image src="">` reached the catalog card.
  return typeof candidate.image === "string" && candidate.image.trim() !== "";
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

/**
 * The url for a product card's image, placeholder included. THE single place
 * that decision is made: every card — the catalog grid, the recommendation row,
 * the home featured row — reads it from here rather than each spelling out its
 * own `?? ""`, which is what let an empty string reach next/image.
 */
export function productImageUrl(product: Product): string {
  return product.main_image?.image || IMAGES.placeholder;
}

function toProduct(value: unknown, origin: string): Product {
  const raw = value as Record<string, unknown>;
  const category = raw.category as Category;
  const image = isProductImage(raw.main_image) ? raw.main_image : null;

  return {
    id: raw.id as number,
    name: raw.name as string,
    slug: raw.slug as string,
    // Category tiles always show artwork, so an absent one takes the
    // placeholder rather than travelling as "".
    category: { ...category, image: mediaImageUrl(category.image, origin) },
    flavor: isFlavor(raw.flavor) ? raw.flavor : null,
    badge:
      typeof raw.badge === "string" && raw.badge.trim() ? raw.badge.trim() : null,
    is_featured: raw.is_featured === true,
    // Shared helper, never a local copy: these arrive over http:// and the
    // component must never see one. Stays nullable — "this product has no
    // photograph" is real information; productImageUrl above is what turns it
    // into a renderable src.
    main_image: image
      ? { ...image, image: mediaImageUrl(image.image, origin) }
      : null,
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

    const body: unknown = await readJson(response, url);
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

/**
 * GET /api/v1/products/{slug}/related/
 *
 * Confirmed against the live host: a BARE ARRAY, not the paginated envelope
 * /api/v1/products/ uses and not a single object. The items are the LIST shape
 * — `main_image` plus nested category/flavor — so `Product` and its validator
 * are reused rather than redeclared.
 *
 * An empty array is a normal answer, not an error: the caller hides its section
 * instead of substituting unrelated products.
 */
export async function getRelatedProducts(slug: string): Promise<Product[]> {
  const trimmed = slug.trim();
  if (!trimmed) return [];

  const origin = apiOrigin();
  const url = `${origin}${PRODUCTS_PATH}${encodeURIComponent(trimmed)}/related/`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    // EXPLICIT, never the default.
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`);
  }

  const body: unknown = await readJson(response, url);
  if (!Array.isArray(body)) {
    throw new Error(`GET ${url} did not return an array`);
  }

  // Order is the backend's — this endpoint carries no sort field.
  return body.filter(isProduct).map((row) => toProduct(row, origin));
}

function isWeight(value: unknown): value is ProductWeight {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.value === "string" && typeof candidate.unit === "string";
}

/**
 * The API's badge is a bare string ("new"); Badge takes text plus a variant.
 * Lives here rather than in a component so the card grid and the detail page
 * can share one mapping instead of keeping their own copies.
 */
export function badgeLabel(
  badge: string | null,
): { text: string; variant: "new" | "hit" } | undefined {
  if (!badge) return undefined;
  const known: Record<string, { text: string; variant: "new" | "hit" }> = {
    new: { text: "Новинка", variant: "new" },
    hit: { text: "Хит продаж", variant: "hit" },
  };
  return known[badge.toLowerCase()] ?? { text: badge, variant: "new" };
}

/**
 * A single product by slug.
 *
 * A 404 returns null — a URL naming a product that does not exist is a normal
 * outcome, not an error, and the caller turns it into a real Next 404. Any
 * other non-2xx still throws: a backend fault must not be indistinguishable
 * from "no such product", which would silently 404 the whole catalog during an
 * outage.
 */
export async function getProduct(slug: string): Promise<ProductDetail | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;

  const origin = apiOrigin();
  const url = `${origin}${PRODUCTS_PATH}${encodeURIComponent(trimmed)}/`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    // EXPLICIT, never the default.
    next: { revalidate: 300 },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`);
  }

  const body: unknown = await readJson(response, url);
  if (typeof body !== "object" || body === null) {
    throw new Error(`GET ${url} did not return an object`);
  }

  const raw = body as Record<string, unknown>;
  if (
    typeof raw.id !== "number" ||
    typeof raw.name !== "string" ||
    !raw.name.trim() ||
    typeof raw.slug !== "string" ||
    !isCategory(raw.category)
  ) {
    throw new Error(`GET ${url} returned an unusable product shape`);
  }

  // isProductImage now rejects an empty url, so a gallery never carries a
  // blank entry for ProductGallery to filter out again downstream.
  const images = Array.isArray(raw.images)
    ? raw.images.filter(isProductImage).map((image) => ({
        ...image,
        image: mediaImageUrl(image.image, origin),
      }))
    : [];

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: typeof raw.description === "string" ? raw.description : "",
    code: typeof raw.code === "string" ? raw.code : "",
    box_weight: typeof raw.box_weight === "string" ? raw.box_weight : "",
    shelf_life_months:
      typeof raw.shelf_life_months === "number" ? raw.shelf_life_months : null,
    category: {
      ...raw.category,
      image: mediaImageUrl(raw.category.image, origin),
    },
    flavor: isFlavor(raw.flavor) ? raw.flavor : null,
    badge:
      typeof raw.badge === "string" && raw.badge.trim() ? raw.badge.trim() : null,
    is_featured: raw.is_featured === true,
    // Sorted so the gallery order is the backend's, not the payload's.
    images: images.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    weights: Array.isArray(raw.weights) ? raw.weights.filter(isWeight) : [],
    variants: Array.isArray(raw.variants)
      ? raw.variants.filter(isProduct).map((row) => toProduct(row, origin))
      : [],
  };
}
