import { apiOrigin, readJson } from "@/lib/api";
import { sanitizeRichText } from "@/lib/sanitizeRichText";

/**
 * GET /api/v1/privacy-policy/{slug}/
 *
 * ONE endpoint, TWO documents on this site — "privacy-policy" and
 * "personal-data-consent" are both real, live slugs, distinguished only by the
 * path param. A single object, not an array.
 *
 * Documented as flat strings; verified against the live host and, like
 * /api/v1/factory/, that is wrong — `title` and `body` are actually
 * { en, ru, uz } locale dicts. `pick()` below handles both anyway, because an
 * object reaching JSX throws "Objects are not valid as a React child".
 *
 * Unlike the singleton /api/v1/privacy-policy/ this project hit earlier, the
 * two slugs here do NOT cross-contaminate: body.ru/uz/en all agree with each
 * other per slug, and the two slugs' bodies are confirmed distinct. Today
 * every locale key holds the same untranslated text (the same "not translated
 * yet" gap every other endpoint in this project has), not wrong content.
 */
export interface LegalDocument {
  slug: string;
  title: string;
  /** Sanitised HTML, ready for dangerouslySetInnerHTML. */
  body: string;
}

const PRIVACY_POLICY_PATH = "/api/v1/privacy-policy/";

/** Locale order tried when a field comes back empty for the requested one. */
const FALLBACK_ORDER = ["ru", "en", "uz"] as const;

/**
 * Narrows one field to a string whatever shape it arrives in. A flat string is
 * returned as-is; a locale dict is resolved for `locale` and then down the
 * fallback chain. Anything else yields "", so an object can never reach JSX.
 */
function pick(value: unknown, locale: string): string {
  if (typeof value === "string") return value.trim();

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const dict = value as Record<string, unknown>;
    for (const key of [locale, ...FALLBACK_ORDER]) {
      const candidate = dict[key];
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
  }

  return "";
}

/**
 * Returns null on ANY failure — unreachable host, timeout, non-2xx,
 * unparseable body, wrong shape, or a title/body that resolves to nothing —
 * so the caller renders a minimal "unavailable" state for THIS document only.
 * Never throws: the two pages that call this each get their own slug, and one
 * slug's failure must not affect the other's page.
 *
 * revalidate: 3600, matching getFactory's reasoning — a legal document changes
 * even less often than the founder block.
 *
 * The locale reaches the cache key the way every other module in this project
 * does it: Accept-Language is the mechanism the backend documents, but a
 * header is not a reliable part of Next's Data Cache key, so the locale also
 * rides in the query string, which the backend ignores.
 */
export async function getLegalDocument(
  slug: string,
  locale: string,
): Promise<LegalDocument | null> {
  const origin = apiOrigin();
  const url = `${origin}${PRIVACY_POLICY_PATH}${encodeURIComponent(slug)}/?lang=${encodeURIComponent(locale)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });
  } catch (error) {
    console.error(
      `[getLegalDocument] request for "${slug}" did not reach the server —`,
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
    return null;
  }

  if (!response.ok) {
    console.error(
      `[getLegalDocument] GET ${url} failed with ${response.status} | cause: (none)`,
    );
    return null;
  }

  let body: unknown;
  try {
    body = await readJson(response, url);
  } catch (error) {
    console.error(
      `[getLegalDocument] unparseable body for "${slug}" —`,
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
    return null;
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    console.error(
      `[getLegalDocument] GET ${url} did not return a singleton object — got ${
        Array.isArray(body) ? "an array" : typeof body
      } | cause: (none)`,
    );
    return null;
  }

  const raw = body as Record<string, unknown>;
  const title = pick(raw.title, locale);
  const rawBody = pick(raw.body, locale);

  if (!title || !rawBody) {
    console.error(
      `[getLegalDocument] "${slug}" resolved to an empty title or body for locale "${locale}"`,
    );
    return null;
  }

  return {
    slug,
    title,
    // Sanitised HERE, not in the component, so no caller can forget and hand
    // raw CMS markup to dangerouslySetInnerHTML.
    body: sanitizeRichText(rawBody),
  };
}
