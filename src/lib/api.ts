/**
 * Shared plumbing for the REST client modules in this directory: one copy of
 * the origin lookup and one copy of the media-URL normalisation. Both were
 * duplicated across certificates.ts and companies.ts, which is how an http://
 * image URL reached next/image from one module while the other looked fine.
 */

import { IMAGES } from "@/content/images";

/** Strips trailing slashes so a path constant can be concatenated directly. */
export function normaliseOrigin(base: string): string {
  return base.trim().replace(/\/+$/, "");
}

/**
 * Throws rather than defaulting to a relative base — a relative base silently
 * sends requests to whatever host the app is deployed on.
 */
export function apiOrigin(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base?.trim()) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return normaliseOrigin(base);
}

/**
 * Normalises one `image`/`file` value from the API into something next/image
 * and the browser will both accept. Three cases:
 *
 * 1. Empty → empty, so the caller can fall back to its own artwork rather than
 *    handing next/image an empty src.
 * 2. Server-relative (`/media/...`) → resolved against the configured origin,
 *    which already carries the right scheme. No component hardcodes the host.
 * 3. Absolute over http:// on the SAME host as an https:// origin → upgraded to
 *    https://.
 *
 * Case 3 is the live bug this exists for. Django sits behind a TLS-terminating
 * proxy and is not told about it, so `request.build_absolute_uri()` sees
 * `request.scheme == "http"` and stamps every media URL with the wrong scheme.
 * The site itself is https, so the browser blocks those as mixed content, and
 * next/image rejects them outright because remotePatterns allows https only.
 *
 * Scoped to the origin's own host and only when that origin is https, so a
 * local `http://localhost:8000` backend is left alone instead of being upgraded
 * to a scheme it does not serve. A foreign http host is also left untouched:
 * it is not ours to assume TLS for, and next/image will reject it loudly rather
 * than the browser failing it silently.
 *
 * The proper fix belongs on the backend — SECURE_PROXY_SSL_HEADER =
 * ("HTTP_X_FORWARDED_PROTO", "https") — after which case 3 becomes a no-op.
 */
export function mediaUrl(value: string, origin: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (!/^https?:\/\//i.test(trimmed)) {
    return `${origin}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
  }

  let absolute: URL;
  let base: URL;
  try {
    absolute = new URL(trimmed);
    base = new URL(origin);
  } catch {
    // Not parseable as a URL — pass it through untouched and let the consumer
    // fail on it rather than silently rewriting something unrecognised.
    return trimmed;
  }

  // `host` includes the port (URL drops the default one), so a backend on a
  // different port is treated as a different service and left alone.
  if (
    absolute.protocol === "http:" &&
    base.protocol === "https:" &&
    absolute.host === base.host
  ) {
    absolute.protocol = "https:";
    return absolute.toString();
  }

  return trimmed;
}

/**
 * mediaUrl for a value that is going to end up in an image `src`. GUARANTEES a
 * non-empty URL: an empty, whitespace-only or unset field resolves to local
 * artwork instead.
 *
 * This exists because `<Image src="">` makes the browser re-request the current
 * page as the image — a bug this project has now hit three times (ProductGallery,
 * the catalog card, the catalog_file work). Fixing it with a conditional in the
 * JSX only fixes the one component that got the conditional; fixing it here
 * means no component downstream of a fetch module can be handed "" at all.
 *
 * DELIBERATELY NOT folded into mediaUrl itself. mediaUrl also normalises values
 * bound for an `href` or a download — settings.catalog_file, certificates.file —
 * where empty is load-bearing information: the caller hides the link rather than
 * rendering a dead one, and substituting a .jpg for a missing PDF would be
 * worse than the bug. Two helpers, one per destination:
 *
 *   image src → mediaImageUrl, never empty
 *   href/file → mediaUrl, empty means "hide the link"
 *
 * A field whose emptiness is genuinely meaningful to a component — a partner
 * with no logo renders its NAME instead, a post body block with no image is
 * dropped entirely — also stays on mediaUrl on purpose.
 *
 * `fallback` defaults to the shared placeholder; pass a more apt local asset
 * where one exists (a hero photograph for a hero slide, say).
 */
export function mediaImageUrl(
  value: string,
  origin: string,
  fallback: string = IMAGES.placeholder,
): string {
  return mediaUrl(value, origin) || fallback;
}
