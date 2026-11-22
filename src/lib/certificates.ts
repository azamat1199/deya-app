import {
  apiOrigin,
  fetchRows,
  localizedRequest,
  mediaImageUrl,
  mediaUrl,
} from "@/lib/api";
import { keepValidRows } from "@/lib/rows";

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
export async function getCertificates(locale: string): Promise<Certificate[]> {
  const origin = apiOrigin();
  const { url, headers } = localizedRequest(
    `${origin}${CERTIFICATES_PATH}`,
    locale,
  );

  const rows = keepValidRows(
    await fetchRows(url, {
      headers,
      // EXPLICIT, not the default: leaving it unset freezes the build-time
      // result into static HTML, which is what stalled the companies row.
      next: { revalidate: 300 },
    }),
    isCertificate,
    "getCertificates",
  );

  return rows.map((certificate) => ({
    ...certificate,
    image: mediaImageUrl(certificate.image, origin),
    file: mediaUrl(certificate.file, origin),
  }));
}
