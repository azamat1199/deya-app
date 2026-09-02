import { apiOrigin, mediaUrl, readJson } from "@/lib/api";
import { sanitizeRichText } from "@/lib/sanitizeRichText";

/**
 * GET /api/v1/factory/
 *
 * The founder block on /[locale]/about. A SINGLETON OBJECT — not paginated, not
 * an array.
 *
 * FLAT STRINGS, unlike /api/v1/privacy-policy/, which documents flat strings and
 * actually returns { en, ru, uz } dicts. Verified against the live host. `pick`
 * below handles both anyway, because one sibling endpoint already lies about
 * this and an object reaching JSX throws "Objects are not valid as a React
 * child".
 *
 * BACKEND CONSTRAINT: the admin serializer for this model accepts only
 * { ru, en } and rejects a payload containing `uz` outright, so there is no
 * Uzbek content and /uz/about is served Russian by design. The server already
 * resolves that itself — an Accept-Language: uz request returns the ru strings
 * byte for byte — so the fallback chain here is inert today. It stays because
 * it is what will cover the gap if the backend ever answers uz with blanks, and
 * the warning is how we will notice the situation change.
 */
export interface Factory {
  /** Plain text. */
  title: string;
  /** Sanitised HTML. */
  subtitle: string;
  /** Plain text — the person's name. */
  description: string;
  /** Sanitised HTML — the quote. Guillemets are part of the content. */
  subdescription: string;
  /** Absolute https URL, or null when no file is uploaded. NEVER "" — an empty
   *  next/image src makes the browser re-request the current page. */
  image: string | null;
}

/** Trailing slash is load-bearing: Django's APPEND_SLASH 301s the slashless
 *  form. The `/api/v1` prefix lives here, never in the base. */
const FACTORY_PATH = "/api/v1/factory/";

const TIMEOUT_MS = 8000;

/** Locale order tried when a field comes back empty. */
const FALLBACK_ORDER = ["ru", "en", "uz"] as const;

/**
 * Narrows one field to a string whatever shape it arrives in. A flat string is
 * returned as-is; a locale dict is resolved for `locale` and then down the
 * fallback chain. Anything else — a number, null, a nested object — yields "",
 * so an object can never reach JSX.
 *
 * Returns the resolved text and which locale it came from, so the caller can
 * report a fallback without re-deriving it.
 */
function pick(
  value: unknown,
  locale: string,
): { text: string; from: string | null } {
  if (typeof value === "string") return { text: value.trim(), from: null };

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const dict = value as Record<string, unknown>;
    for (const key of [locale, ...FALLBACK_ORDER]) {
      const candidate = dict[key];
      if (typeof candidate === "string" && candidate.trim()) {
        return { text: candidate.trim(), from: key === locale ? null : key };
      }
    }
  }

  return { text: "", from: null };
}

/**
 * Returns null on ANY failure — unreachable host, timeout, non-2xx,
 * unparseable body, wrong shape — so the caller renders the section's gradient
 * with no text rather than crashing the route. Exactly one console.error per
 * failure, carrying `cause`, which is where fetch hides the underlying
 * DNS/TLS/socket error.
 *
 * The locale reaches the cache key the same way getSettings and getHome do it:
 * Accept-Language is the mechanism the backend documents, but a header is not a
 * reliable part of Next's Data Cache key, and one cached response replayed
 * across locales would serve Russian copy on the English page. The locale
 * therefore also rides in the query string, which the backend ignores.
 */
export async function getFactory(locale: string): Promise<Factory | null> {
  const origin = apiOrigin();
  const url = `${origin}${FACTORY_PATH}?lang=${encodeURIComponent(locale)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // EXPLICIT, never the default: leaving it unset freezes the build-time
      // result into static HTML, so CMS edits would never appear. An hour,
      // because this block changes rarely.
      next: { revalidate: 3600 },
    });
  } catch (error) {
    console.error(
      "[getFactory] request did not reach the server —",
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
    return null;
  }

  if (!response.ok) {
    console.error(
      `[getFactory] GET ${url} failed with ${response.status} | cause: (none)`,
    );
    return null;
  }

  let body: unknown;
  try {
    body = await readJson(response, url);
  } catch (error) {
    console.error(
      "[getFactory] unparseable body —",
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
    return null;
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    console.error(
      `[getFactory] GET ${url} did not return a singleton object — got ${
        Array.isArray(body) ? "an array" : typeof body
      } | cause: (none)`,
    );
    return null;
  }

  const raw = body as Record<string, unknown>;

  const title = pick(raw.title, locale);
  const subtitle = pick(raw.subtitle, locale);
  const description = pick(raw.description, locale);
  const subdescription = pick(raw.subdescription, locale);

  // One line, not four: a per-field burst would be scrolled past.
  const fellBack = [
    ["title", title.from],
    ["subtitle", subtitle.from],
    ["description", description.from],
    ["subdescription", subdescription.from],
  ].filter(([, from]) => from !== null);

  if (fellBack.length > 0) {
    console.warn(
      `[getFactory] ${locale} is unpopulated for ${fellBack.length} field(s), served another locale instead: ${fellBack
        .map(([field, from]) => `${field}←${from}`)
        .join(", ")}`,
    );
  }

  const image = pick(raw.image, locale).text;

  return {
    title: title.text,
    // Sanitised HERE rather than in the component, so no caller can forget and
    // hand raw CMS markup to dangerouslySetInnerHTML.
    subtitle: sanitizeRichText(subtitle.text),
    description: description.text,
    subdescription: sanitizeRichText(subdescription.text),
    // Shared helper, never a local copy: these arrive over http:// and a
    // component must never see one. mediaUrl, not mediaImageUrl — a missing
    // portrait resolves to null and the section renders its gradient, which is
    // the designed fallback here rather than a product placeholder.
    image: mediaUrl(image, origin) || null,
  };
}
