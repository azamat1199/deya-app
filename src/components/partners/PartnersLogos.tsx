import { partnerLogos } from "@/content/partners";

import MarqueeRow from "./MarqueeRow";

export default function PartnersLogos() {
  const midpoint = Math.ceil(partnerLogos.length / 2);
  const topRow = partnerLogos.slice(0, midpoint);
  const bottomRow = partnerLogos.slice(midpoint);

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
