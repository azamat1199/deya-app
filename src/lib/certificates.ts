/**
 * GET /api/v1/certificates/
 *
 * Answers with a BARE ARRAY, not the `{ count, next, results }` envelope DRF
 * list views usually return — nothing here unwraps `.results`.
 */
export interface Certificate {
  id: number;
  title: string;
  image: string;
  file: string;
}

/**
 * Trailing slash is load-bearing: Django's APPEND_SLASH answers the slashless
 * form with a 301. The `/api/v1` prefix lives here in the path, never in the
 * base.
 */
const CERTIFICATES_PATH = "/api/v1/certificates/";

/** Throws rather than defaulting to a relative base — a relative base silently
 *  sends requests to whatever host the app is deployed on. */
function apiOrigin(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base?.trim()) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return base.trim().replace(/\/+$/, "");
}

/** Absolute URLs pass through; a server-relative `/media/...` path is resolved
 *  against the API origin here, so no component hardcodes the host. */
function absoluteUrl(value: string, origin: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${origin}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

function isCertificate(value: unknown): value is Certificate {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.title === "string" &&
    candidate.title.trim() !== "" &&
    typeof candidate.image === "string" &&
    typeof candidate.file === "string"
  );
}

/**
 * Malformed entries are dropped rather than failing the list, so one bad row
 * cannot blank the section. A non-array body, a non-2xx status or a missing
 * base URL throw — the caller decides whether to fall back.
 */
export async function getCertificates(): Promise<Certificate[]> {
  const origin = apiOrigin();
  const url = `${origin}${CERTIFICATES_PATH}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    // EXPLICIT, not the default: leaving it unset freezes the build-time
    // result into static HTML, which is what stalled the companies row.
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`);
  }

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new Error(`GET ${url} did not return an array`);
  }

  return body.filter(isCertificate).map((certificate) => ({
    ...certificate,
    image: absoluteUrl(certificate.image, origin),
    file: absoluteUrl(certificate.file, origin),
  }));
}
