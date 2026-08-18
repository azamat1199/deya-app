/**
 * GET /api/v1/companies/
 *
 * Answers with a BARE ARRAY, not the `{ count, next, results }` envelope DRF
 * list views usually return — nothing here unwraps `.results`.
 */
export interface Company {
  id: number;
  name: string;
  /** Present in the payload and kept in the type; no route consumes it yet. */
  slug: string;
  description: string;
  image: string;
  vacancies_url: string;
}

/**
 * Trailing slash is load-bearing: Django's APPEND_SLASH answers the slashless
 * form with a 301, confirmed against the live host. Do not trim it. The
 * `/api/v1` prefix lives here in the path, never in the base.
 */
const COMPANIES_PATH = "/api/v1/companies/";

/** Throws rather than defaulting to a relative base — a relative base silently
 *  sends requests to whatever host the app is deployed on. */
function apiOrigin(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base?.trim()) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return base.trim().replace(/\/+$/, "");
}

/**
 * Absolute URLs pass through unchanged; a server-relative path such as
 * `/media/companies/foo.jpg` is resolved against the API origin here, so no
 * component ever hardcodes the host. An empty value stays empty and the caller
 * falls back to its own artwork.
 */
function absoluteImageUrl(image: string, origin: string): string {
  const value = image.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${origin}${value.startsWith("/") ? value : `/${value}`}`;
}

function isCompany(value: unknown): value is Company {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    candidate.name.trim() !== "" &&
    typeof candidate.slug === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.image === "string" &&
    typeof candidate.vacancies_url === "string"
  );
}

/**
 * Malformed entries are dropped rather than failing the whole list, so one bad
 * row in the CMS cannot blank a section. A non-array body, a non-2xx status or
 * a missing base URL all throw — callers decide whether to fall back.
 */
export async function getCompanies(): Promise<Company[]> {
  const origin = apiOrigin();
  const url = `${origin}${COMPANIES_PATH}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    // Marketing copy, not per-request data: revalidating on an interval keeps
    // the page fast while still picking up edits.
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`);
  }

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new Error(`GET ${url} did not return an array`);
  }

  return body
    .filter(isCompany)
    .map((company) => ({
      ...company,
      image: absoluteImageUrl(company.image, origin),
    }));
}
