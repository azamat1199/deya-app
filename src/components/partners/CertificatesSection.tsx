import CertificatesGrid, {
  type CertificateCard,
} from "@/components/partners/CertificatesGrid";
import { certificates, certificatesContent } from "@/content/certificates";
import { getCertificates, type Certificate } from "@/lib/certificates";

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
      certificate.image.trim() || (STATIC_CERTIFICATES[index]?.image ?? ""),
  };
}

export default async function CertificatesSection() {
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

  // Never silent: whenever the static content stands in, say why.
  if (!usingApi) {
    console.warn(
      "[CertificatesSection] falling back to static content —",
      fetchError instanceof Error
        ? fetchError.message
        : "request returned an empty or wholly malformed array",
    );
  }

  return (
    <div className="py-16 lg:py-24">
      <h2 className="text-center text-2xl font-normal text-ink-900 md:text-3xl">
        {certificatesContent.heading}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-ink-500">
        {certificatesContent.description}
      </p>

      <CertificatesGrid items={items} />
    </div>
  );
}
