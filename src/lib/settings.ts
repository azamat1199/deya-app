import { apiOrigin, mediaUrl } from "@/lib/api";

/**
 * GET /api/v1/settings/
 *
 * A SINGLETON OBJECT, not an array and not paginated. Nothing here maps over
 * it and nothing needs a React key.
 *
 * Every field is a plain string and may be empty — an empty value means "no
 * such row", and callers hide the corresponding element rather than rendering
 * an empty link or a label with nothing after it.
 */
export interface Settings {
  phone: string;
  hotline: string;
  email: string;
  address: string;
  work_hours: string;
  yandex_map_url: string;
  instagram_url: string;
  telegram_url: string;
  /** Absolute https URL to the catalog PDF, or "" when none is uploaded. */
  catalog_file: string;
  cookie_notice_text: string;
}

/** Trailing slash is load-bearing: Django's APPEND_SLASH 301s the slashless
 *  form. The `/api/v1` prefix lives here, never in the base. */
const SETTINGS_PATH = "/api/v1/settings/";

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Returns null on any failure so the caller can fall back to its static values.
 * A broken footer is worse than a stale one.
 *
 * The response is language-dependent by design, so the locale reaches the cache
 * key: Accept-Language is the mechanism the backend documents, but a header is
 * not a reliable part of Next's Data Cache key, and one cached response replayed
 * across locales would serve Russian copy on the English page. The locale
 * therefore also rides in the query string, which the backend ignores and which
 * makes the URL — and so the cache entry — distinct per locale.
 *
 * Called from the layout and from the pages that need `catalog_file`; Next
 * memoises identical fetches within a single render, so that is still one
 * network request per render.
 */
export async function getSettings(locale: string): Promise<Settings | null> {
  const origin = apiOrigin();
  const url = `${origin}${SETTINGS_PATH}?lang=${encodeURIComponent(locale)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
      },
      // EXPLICIT, never the default.
      next: { revalidate: 300 },
    });
  } catch (error) {
    console.error(
      "[getSettings] request did not reach the server —",
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
    return null;
  }

  if (!response.ok) {
    console.error(`[getSettings] GET ${url} failed with ${response.status}`);
    return null;
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    console.error(
      `[getSettings] GET ${url} returned unparseable JSON —`,
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }

  // An array here would mean the endpoint changed shape; treat it as unusable
  // rather than silently reading index 0.
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    console.error(
      `[getSettings] GET ${url} did not return a singleton object — got ${Array.isArray(body) ? "an array" : typeof body}`,
    );
    return null;
  }

  const raw = body as Record<string, unknown>;
  const origin_ = origin;

  return {
    phone: readString(raw, "phone"),
    hotline: readString(raw, "hotline"),
    email: readString(raw, "email"),
    address: readString(raw, "address"),
    work_hours: readString(raw, "work_hours"),
    yandex_map_url: readString(raw, "yandex_map_url"),
    instagram_url: readString(raw, "instagram_url"),
    telegram_url: readString(raw, "telegram_url"),
    // Shared helper, never a local copy: this arrives over http:// and a
    // component must never see one. Empty stays empty so callers can tell.
    catalog_file: mediaUrl(readString(raw, "catalog_file"), origin_),
    cookie_notice_text: readString(raw, "cookie_notice_text"),
  };
}

/** Digits only, keeping a leading +, for a tel: href. Empty in, empty out. */
export function telHref(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/[^\d]/g, "");
  return digits ? `tel:+${digits}` : "";
}
