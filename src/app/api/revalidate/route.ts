import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { CACHE_TAGS } from "@/lib/cacheTags";
import { locales } from "@/lib/i18n/config";

/**
 * POST /api/revalidate — on-demand cache refresh, called by the Django admin
 * (post_save / post_delete) so a CMS change is live on the next page view
 * instead of within the 5-minute fallback window.
 *
 *   Authorization: Bearer <REVALIDATION_SECRET>
 *   Content-Type: application/json
 *
 *   { "model": "product" | "product_image" | "category" | "family"
 *              | "flavor" | "weight" | "all",
 *     "slug": "...",          // product slug (product, product_image) or
 *                             // category slug (category); omitted otherwise
 *     "category": "...",      // the product's category slug (product, product_image)
 *     "previous": { "slug": "...", "category": "..." } }   // optional, see below
 *
 * `previous` carries the OLD slug/category when an update changed either, so
 * the page at the old URL is refreshed too (it then 404s or redirects).
 *
 * What gets invalidated (tags: lib/cacheTags.ts):
 *   product / product_image → tags products, product:<slug>, home; paths: the
 *       product page in every locale, /<locale>/catalog, /<locale>
 *   category → tags categories, products, home; every page (the footer lists
 *       the categories, so the whole site is re-rendered)
 *   family / flavor / weight → tags products, home; /<locale>/catalog and
 *       /<locale> (product pages via the products tag: variant rows change)
 *   all → everything
 *
 * Tags use `{ expire: 0 }`: the next request for affected data refetches
 * before responding, so the admin sees the change on the next page load.
 * Nothing is rebuilt eagerly — each page re-renders on its next visit.
 */

const MODELS = [
  "product",
  "product_image",
  "category",
  "family",
  "flavor",
  "weight",
  "all",
] as const;
type Model = (typeof MODELS)[number];

/** Same alphabet the backend uses for slugs; also keeps paths well-formed. */
const SLUG = /^[a-z0-9][a-z0-9_-]{0,219}$/i;

const EXPIRE_NOW = { expire: 0 };

interface Payload {
  model: Model;
  slug?: string;
  category?: string;
  previous?: { slug?: string; category?: string };
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/** Constant-time comparison; hashing first equalises the lengths. */
function isAuthorized(request: NextRequest, secret: string): boolean {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  return token !== "" && timingSafeEqual(digest(token), digest(secret));
}

function optionalSlug(value: unknown): string | undefined | null {
  if (value === undefined || value === null || value === "") return undefined;
  return typeof value === "string" && SLUG.test(value) ? value : null;
}

/** Validated payload, or an error message. */
function parsePayload(body: unknown): Payload | string {
  if (typeof body !== "object" || body === null) return "body must be a JSON object";
  const raw = body as Record<string, unknown>;

  if (!MODELS.includes(raw.model as Model)) {
    return `model must be one of: ${MODELS.join(", ")}`;
  }
  const model = raw.model as Model;

  const slug = optionalSlug(raw.slug);
  const category = optionalSlug(raw.category);
  if (slug === null) return "slug is not a valid slug";
  if (category === null) return "category is not a valid slug";

  const prevRaw =
    typeof raw.previous === "object" && raw.previous !== null
      ? (raw.previous as Record<string, unknown>)
      : {};
  const prevSlug = optionalSlug(prevRaw.slug);
  const prevCategory = optionalSlug(prevRaw.category);
  if (prevSlug === null || prevCategory === null) {
    return "previous.slug / previous.category must be valid slugs";
  }

  if ((model === "product" || model === "product_image") && (!slug || !category)) {
    return `${model} requires "slug" and "category" (the product's slug and its category slug)`;
  }

  return {
    model,
    slug,
    category,
    previous: { slug: prevSlug, category: prevCategory },
  };
}

function forEachLocale(path: string): string[] {
  return locales.map((locale) => `/${locale}${path}`);
}

function plan(payload: Payload): { tags: string[]; paths: string[]; wholeSite: boolean } {
  const { model, slug, category, previous } = payload;

  switch (model) {
    case "product":
    case "product_image": {
      const productSlugs = [slug!, previous?.slug].filter(Boolean) as string[];
      const pages = new Set<string>();
      for (const s of productSlugs) {
        for (const c of [category!, previous?.category].filter(Boolean) as string[]) {
          forEachLocale(`/catalog/${c}/${s}`).forEach((p) => pages.add(p));
        }
      }
      return {
        tags: [
          CACHE_TAGS.products,
          ...productSlugs.map((s) => CACHE_TAGS.product(s)),
          CACHE_TAGS.home,
        ],
        paths: [
          ...pages,
          ...forEachLocale("/catalog"),
          ...forEachLocale(""),
          "/sitemap.xml",
        ],
        wholeSite: false,
      };
    }
    case "family":
    case "flavor":
    case "weight":
      return {
        tags: [CACHE_TAGS.products, CACHE_TAGS.home],
        paths: [...forEachLocale("/catalog"), ...forEachLocale("")],
        wholeSite: false,
      };
    case "category":
    case "all":
      return {
        tags: [CACHE_TAGS.categories, CACHE_TAGS.products, CACHE_TAGS.home],
        paths: ["/sitemap.xml"],
        wholeSite: true,
      };
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATION_SECRET?.trim();
  if (!secret) {
    // Fail closed: an unset secret must never mean "no auth".
    console.error("[revalidate] REVALIDATION_SECRET is not set — refusing all requests");
    return NextResponse.json(
      { ok: false, error: "revalidation is not configured" },
      { status: 503 },
    );
  }
  if (!isAuthorized(request, secret)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  const payload = parsePayload(body);
  if (typeof payload === "string") {
    return NextResponse.json({ ok: false, error: payload }, { status: 400 });
  }

  const { tags, paths, wholeSite } = plan(payload);
  for (const tag of tags) revalidateTag(tag, EXPIRE_NOW);
  for (const path of paths) revalidatePath(path);
  // The root layout is app/[locale]/layout.tsx, so this re-renders every page.
  if (wholeSite) revalidatePath("/[locale]", "layout");

  console.info(
    `[revalidate] ${payload.model}${payload.slug ? ` "${payload.slug}"` : ""} → tags [${tags.join(", ")}], ${wholeSite ? "whole site" : `${paths.length} paths`}`,
  );

  return NextResponse.json({
    ok: true,
    revalidated: { tags, paths: wholeSite ? ["/[locale] (layout: every page)", ...paths] : paths },
  });
}
