"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button, Slider } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/useTranslation";

/** What the slider renders, whichever source filled it. */
export interface CertificateCard {
  key: string | number;
  title: string;
  image: string;
}

export interface CertificatesGridProps {
  items: CertificateCard[];
}

/**
 * The client half of the section: it owns the slider and the i18n hook.
 * CertificatesSection stays a server component so it can await the fetch and
 * use `next: { revalidate: 300 }` — a client component can do neither. The
 * array arrives here as a prop, and nothing in this file reads the static
 * content, so there is no path by which mock data can reappear.
 */
export default function CertificatesGrid({ items }: CertificatesGridProps) {
  const { t } = useTranslation();

  // TEMPORARY diagnostic — remove once the backend is stable.
  console.log(
    "[diag CertificatesGrid]",
    JSON.stringify({ itemsLength: items.length, firstItem: items[0] ?? null }),
  );
  return (
    <>
      <div className="relative mt-10">
        <Slider
          items={items}
          slidesPerView={1}
          gap={10}
          align="center"
          breakpoints={{
            768: { slidesPerView: 2, gap: 10 },
            1024: { slidesPerView: 3, gap: 10 },
          }}
          renderSlide={(cert) => (
            // 467x498 is the 1600 design size. max-w caps rather than fixes it,
            // so the card is exact wherever the track is wide enough and
            // proportional below — a hard w-[467px] would overflow the track.
            //
            // 15px per side, not 10: the track carries a -5px margin (-gap/2),
            // so the card starts 5px OUTSIDE the embla viewport and its own
            // border is clipped, not just the shadow.
            <div className="rounded-lg border border-line-100 bg-white p-6 shadow-[0px_0px_10px_0px_#0000001A] max-md:mx-[15px] md:flex md:aspect-[467/498] md:max-w-[467px] md:items-center md:justify-center min-[1024px]:mx-[5px] min-[1024px]:w-[calc(100%-10px)]">
              {/* Height-driven, not a fixed 271x358: once the card is
                  aspect-locked its content box is 50px shorter than the card,
                  and 358px only fits from ~1318px of viewport up.
                  180x238 on the phone is the same 0.756 ratio, a pure
                  scale-down; both dimensions are explicit below md, which is
                  what neutralises aspect-3/4 and w-full there. */}
              <div className="relative aspect-3/4 w-full overflow-hidden rounded-md bg-white max-md:mx-auto max-md:h-[238px] max-md:w-[180px] md:aspect-[271/358] md:h-full md:max-h-[358px] md:w-auto">
                <Image
                  src={cert.image}
                  alt={cert.title}
                  fill
                  className="object-contain p-3"
                />
              </div>
            </div>
          )}
          renderControls={({
            scrollPrev,
            scrollNext,
            canScrollPrev,
            canScrollNext,
          }) => (
            <>
              {canScrollPrev && (
                <button
                  type="button"
                  aria-label="Предыдущий слайд"
                  onClick={scrollPrev}
                  className="absolute top-1/2 left-0 z-10 flex  -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[3px] bg-brand-600 text-white transition-colors hover:bg-brand-700 w-7.5 h-7.5"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {canScrollNext && (
                <button
                  type="button"
                  aria-label="Следующий слайд"
                  onClick={scrollNext}
                  className="absolute top-1/2 right-0 z-10 flex  translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[3px] bg-brand-600 text-white transition-colors hover:bg-brand-700 w-7.5 h-7.5"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </>
          )}
        />
      </div>

      <div className="mt-10 flex justify-center">
        {/* Passed through Button's own className prop, which cn() merges last
            onto the root — no edit to the shared component. font-sans IS the
            Roboto utility here: globals.css maps --font-sans to --font-roboto
            and deliberately exposes no bare font-roboto class. */}
        <Button
          variant="primary"
          size="lg"
          href="#"
          className="max-md:w-full max-md:font-sans max-md:font-medium max-md:text-[12px] max-md:leading-[1.2] max-md:tracking-normal max-md:text-center max-md:uppercase"
        >
          {t("buttons.downloadCatalog")}
        </Button>
      </div>
    </>
  );
}
