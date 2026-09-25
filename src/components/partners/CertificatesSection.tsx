import CertificatesGrid, {
  type CertificateCard,
} from "@/components/partners/CertificatesGrid";
import { certificates } from "@/content/certificates";
import { IMAGES } from "@/content/images";
import { getCertificates, type Certificate } from "@/lib/certificates";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

import {
  PARTNERS_SECTION_DESCRIPTION,
  PARTNERS_SECTION_HEADING,
} from "./sectionType";

/**
 * The hand-authored certificates, kept only as the fallback — never in the
 * live render path. Used when the request fails or yields nothing usable, so a
 * public marketing page shows stale artwork rather than an empty row.
 */
const STATIC_CERTIFICATES: CertificateCard[] = certificates.map(
  (certificate) => ({
    key: certificate.slug,
    title: certificate.title,
    image: certificate.image,
  }),
);

/** An empty `image` borrows the static artwork at the same position rather than
 *  handing next/image an empty src. */
function toCertificateCard(
  certificate: Certificate,
  index: number,
): CertificateCard {
  return {
    key: certificate.id,
    title: certificate.title,
    image:
      certificate.image.trim() || STATIC_CERTIFICATES[index]?.image || IMAGES.placeholder,
  };
}

export interface CertificatesSectionProps {
  locale: Locale;
}

export default async function CertificatesSection({
  locale,
}: CertificatesSectionProps) {
  const dictionary = await getDictionary(locale);

  // An async server component so it can await the fetch and honour
  // `next: { revalidate: 300 }`; the slider and the i18n hook live in the
  // client child, which can do neither.
  let fetched: Certificate[] = [];
  let fetchError: unknown = null;
  try {
    fetched = await getCertificates();
  } catch (error) {
    fetchError = error;
  }

  const usingApi = fetched.length > 0;
  const items = usingApi ? fetched.map(toCertificateCard) : STATIC_CERTIFICATES;

  // Never silent: whenever the static content stands in, say why. Stays
  // console.warn deliberately — console.error trips the Next dev error overlay
  // on every page load, and this outage is a known, expected condition.
  // `cause` is a separate argument because Node's fetch reports network-level
  // failures as the bare string "fetch failed" and hides the real reason
  // (ENOTFOUND, ECONNREFUSED, a TLS error) in error.cause.
  if (!usingApi) {
    console.warn(
      "[CertificatesSection] falling back to static content —",
      fetchError instanceof Error
        ? fetchError.message
        : "request returned an empty or wholly malformed array",
      "| cause:",
      fetchError instanceof Error ? (fetchError.cause ?? "(none)") : "(none)",
    );
  }

  return (
    <div className="py-16 lg:py-24">
      <h2 className={PARTNERS_SECTION_HEADING}>
        {dictionary.partners.certificatesTitle}
      </h2>
      <p className={PARTNERS_SECTION_DESCRIPTION}>
        {dictionary.partners.certificatesDescription}
      </p>

      <CertificatesGrid items={items} />
    </div>
  );
}
