import { apiOrigin, mediaImageUrl, mediaUrl, readJson } from "@/lib/api";

/**
 * GET /api/v1/posts/           — PAGINATED { count, next, previous, results }
 * GET /api/v1/posts/{slug}/    — a SINGLE OBJECT, not an array
 *
 * Both live here; there is no second posts module.
 */

/** A card on the listing. */
export interface PostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  /** https URL, or "" when none was uploaded. */
  cover: string;
  /** ISO 8601 UTC, or "" when absent. */
  published_at: string;
}

/**
 * One body block. `type` is an enum; the only value the live API emits today is
 * "text" — the docs' "heading" does not appear in real data. A block may carry
 * text, an image, or both.
 */
export interface PostBlock {
  id: number;
  type: string;
  text: string;
  image: string;
  sort_order: number;
}

export interface PostDetail extends PostSummary {
  blocks: PostBlock[];
  /**
   * Documented as "string" — it is actually an ARRAY. Every observed post
   * returns `[]`, so the element shape is still unknown and nothing renders it.
   */
  other_posts: unknown[];
}

const POSTS_PATH = "/api/v1/posts/";

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

function toSummary(raw: Record<string, unknown>, origin: string): PostSummary {
  return {
    id: raw.id as number,
    title: readString(raw, "title"),
    slug: readString(raw, "slug"),
    excerpt: readString(raw, "excerpt"),
    // Shared helper: these arrive over http:// and a component must never see
    // one. Empty stays empty so the caller can substitute a placeholder.
    cover: mediaImageUrl(readString(raw, "cover"), origin),
    published_at: readString(raw, "published_at"),
  };
}

/** A row is usable only with a numeric id and a slug — the id is the React key
 *  and the slug builds the href. */
function isUsableSummary(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.slug === "string" &&
    candidate.slug.trim() !== ""
  );
}

/**
 * The locale reaches the cache key twice over: Accept-Language is the mechanism
 * the backend documents, and the query string makes the URL distinct so one
 * cached response is never replayed across locales. The backend ignores the
 * query itself.
 */
function localisedRequest(locale: string): RequestInit & {
  next: { revalidate: number };
} {
  return {
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
    },
    // EXPLICIT, never the default.
    next: { revalidate: 300 },
  };
}

export interface GetPostsParams {
  locale: string;
  page?: number;
  pageSize?: number;
}

/**
 * One page only — never a loop over every page into a single render. `count` is
 * returned so the caller can drive its existing load-more UI.
 *
 * Sorted newest-first by published_at, matching a news listing's convention;
 * the endpoint's own order is not trusted.
 */
export async function getPosts({
  locale,
  page = 1,
  pageSize,
}: GetPostsParams): Promise<{ posts: PostSummary[]; count: number }> {
  const origin = apiOrigin();
  const query = new URLSearchParams({ lang: locale, page: String(page) });
  if (pageSize) query.set("page_size", String(pageSize));
  const url = `${origin}${POSTS_PATH}?${query.toString()}`;

  const response = await fetch(url, localisedRequest(locale));
  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`);
  }

  const body: unknown = await readJson(response, url);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new Error(`GET ${url} did not return a paginated object`);
  }

  const envelope = body as Record<string, unknown>;
  const results = Array.isArray(envelope.results) ? envelope.results : [];

  const posts = results
    .filter(isUsableSummary)
    .map((row) => toSummary(row, origin))
    .sort((a, b) => {
      const left = Date.parse(b.published_at);
      const right = Date.parse(a.published_at);
      if (Number.isNaN(left) || Number.isNaN(right)) return 0;
      return left - right;
    });

  return {
    posts,
    count: typeof envelope.count === "number" ? envelope.count : posts.length,
  };
}

/**
 * A single post, or null when there is none.
 *
 * The spec maps 404 to null. This backend does NOT send 404 for an unknown
 * slug — it answers 500 (verified against the live host) — so any non-2xx is
 * treated as "no such post" and logged. The trade-off is deliberate and worth
 * knowing: during a genuine outage an article URL renders a 404 rather than an
 * error page. Reverting to "only 404 means missing" would make every bad slug a
 * 500 instead.
 */
export async function getPost(
  slug: string,
  locale: string,
): Promise<PostDetail | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;

  const origin = apiOrigin();
  const url = `${origin}${POSTS_PATH}${encodeURIComponent(trimmed)}/?lang=${encodeURIComponent(locale)}`;

  let response: Response;
  try {
    response = await fetch(url, localisedRequest(locale));
  } catch (error) {
    console.error(
      `[getPost] request for "${trimmed}" did not reach the server —`,
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
    return null;
  }

  if (response.status === 404) return null;
  if (!response.ok) {
    console.error(
      `[getPost] GET ${url} answered ${response.status}; treating "${trimmed}" as not found (this host returns 500 for unknown slugs)`,
    );
    return null;
  }

  const body: unknown = await readJson(response, url);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    console.error(`[getPost] GET ${url} did not return a single object`);
    return null;
  }

  const raw = body as Record<string, unknown>;
  if (typeof raw.id !== "number" || typeof raw.slug !== "string") {
    console.error(`[getPost] GET ${url} returned an unusable post shape`);
    return null;
  }

  const rawBlocks = Array.isArray(raw.blocks) ? raw.blocks : [];
  const blocks: PostBlock[] = rawBlocks
    .filter(
      (block): block is Record<string, unknown> =>
        typeof block === "object" && block !== null,
    )
    .map((block) => ({
      id: typeof block.id === "number" ? block.id : -1,
      type: readString(block, "type"),
      text: readString(block, "text"),
      image: mediaUrl(readString(block, "image"), origin),
      sort_order: typeof block.sort_order === "number" ? block.sort_order : 0,
    }))
    // Sorted here, never trusting the response order. id breaks ties so equal
    // sort_order values stay stable.
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  // Logged so its real shape is on record; still not rendered anywhere.
  const otherPosts = Array.isArray(raw.other_posts) ? raw.other_posts : [];
  console.info(
    `[getPost] other_posts is ${Array.isArray(raw.other_posts) ? "an array" : typeof raw.other_posts} of length ${otherPosts.length}${otherPosts.length ? ` — first element keys: ${Object.keys(otherPosts[0] as object).join(", ")}` : " (no samples yet)"}`,
  );

  return {
    ...toSummary(raw, origin),
    blocks,
    other_posts: otherPosts,
  };
}
