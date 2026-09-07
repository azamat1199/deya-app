import { partnerLogos } from "@/content/partners";
import { getPartners, type Partner } from "@/lib/partners";

import MarqueeRow, { type MarqueeItem } from "./MarqueeRow";

/**
 * The hand-authored partners, kept only as the fallback — never in the live
 * render path. Used when the request fails or yields nothing usable, so a
 * public marketing page shows stale names rather than an empty marquee.
 *
 * These carry no id, so the name stands in as the stable key.
 */
const STATIC_PARTNERS: MarqueeItem[] = partnerLogos.map((partner) => ({
  id: partner.name,
  name: partner.name,
  href: partner.href,
}));

function toMarqueeItem(partner: Partner): MarqueeItem {
  return {
    id: partner.id,
    name: partner.name,
    // Empty website => no anchor at all, decided in MarqueeRow.
    href: partner.website || undefined,
    // Already rewritten to https in lib/partners.ts — the component never sees
    // an http:// URL. Empty => the tile falls back to the partner name.
    logo: partner.logo || undefined,
  };
}

export default async function PartnersLogos() {
  // An async server component so it can await the fetch and honour
  // `next: { revalidate: 300 }`; the marquee's rAF loop lives in the client
  // child, which can do neither.
  let fetched: Partner[] = [];
  let fetchError: unknown = null;
  try {
    fetched = await getPartners();
  } catch (error) {
    fetchError = error;
  }

  const usingApi = fetched.length > 0;
  const items = usingApi ? fetched.map(toMarqueeItem) : STATIC_PARTNERS;

  // Never silent: whenever the static content stands in, say why. `cause` is a
  // separate argument because Node reports network-level failures as the bare
  // string "fetch failed" and hides the reason there.
  if (!usingApi) {
    console.error(
      "[PartnersLogos] falling back to static content —",
      fetchError instanceof Error
        ? fetchError.message
        : "request returned an empty or wholly malformed array",
      "| cause:",
      fetchError instanceof Error ? (fetchError.cause ?? "(none)") : "(none)",
    );
  }


  // Order is the backend's; the split is the existing halving, untouched.
  const midpoint = Math.ceil(items.length / 2);
  const topRow = items.slice(0, midpoint);
  const bottomRow = items.slice(midpoint);

  return (
    <div className="py-16 lg:py-24">
      <h2 className="text-center text-2xl font-normal text-ink-900 md:text-3xl">
        Наши партнёры
      </h2>

      <div className="relative mt-10 space-y-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white to-transparent" />

        <MarqueeRow items={topRow} direction="left" />
        <MarqueeRow items={bottomRow} direction="right" />
      </div>
    </div>
  );
}
