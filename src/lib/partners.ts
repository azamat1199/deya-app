import { apiOrigin, mediaUrl, readJson } from "@/lib/api";

/**
 * GET /api/v1/partners/
 *
 * Answers with a BARE ARRAY, not the `{ count, next, results }` envelope DRF
 * list views usually return — nothing here unwraps `.results`.
 */
export interface Partner {
  id: number;
  name: string;
  /**
   * Absolute URL to the logo asset. Normalised to https here, though the
   * marquee currently renders partner NAMES rather than images and so has no
   * consumer for it yet — see the note in PartnersLogos.
   */
  logo: string;
  /** May be empty; the component then renders the partner without a link. */
  website: string;
}

/**
 * Trailing slash is load-bearing: Django's APPEND_SLASH answers the slashless
 * form with a 301. The `/api/v1` prefix lives here, never in the base.
 */
const PARTNERS_PATH = "/api/v1/partners/";

function isPartner(value: unknown): value is Partner {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    candidate.name.trim() !== "" &&
    typeof candidate.logo === "string" &&
    typeof candidate.website === "string"
  );
}

/**
 * Returned in the order the backend sent them: this endpoint carries no
 * sort_order, so nothing here sorts.
 *
 * Malformed rows are dropped rather than failing the list. A non-array body, a
 * non-2xx status or a missing base URL throw — the caller decides whether to
 * fall back.
 */
export async function getPartners(): Promise<Partner[]> {
  const origin = apiOrigin();
  const url = `${origin}${PARTNERS_PATH}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    // EXPLICIT, never the default: leaving it unset freezes the build-time
    // result into static HTML, so CMS edits would never appear.
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`);
  }

  const body: unknown = await readJson(response, url);
  if (!Array.isArray(body)) {
    throw new Error(`GET ${url} did not return an array`);
  }

  // A row without a usable id would produce a duplicate React key downstream,
  // so it is reported loudly rather than silently dropped. Logged once with the
  // first offender, not once per row.
  const rejected = body.filter((row) => !isPartner(row));
  if (rejected.length) {
    const missingId = rejected.filter(
      (row) =>
        typeof row !== "object" ||
        row === null ||
        typeof (row as Record<string, unknown>).id !== "number",
    );
    console.error(
      `[getPartners] dropped ${rejected.length} unusable row(s), ${missingId.length} of them lacking a numeric id — first offender:`,
      JSON.stringify(rejected[0]),
    );
  }

  return body.filter(isPartner).map((partner) => ({
    ...partner,
    // Shared helper, never a local copy: these arrive over http:// and a
    // component must never see one.
    logo: mediaUrl(partner.logo, origin),
    website: partner.website.trim(),
  }));
}
