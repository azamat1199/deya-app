"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button, Slider } from "@/components/ui";
import { certificates, certificatesContent } from "@/content/certificates";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function CertificatesSection() {
  const { t } = useTranslation();

  return (
    <div className="py-16 lg:py-24">
      <h2 className="text-center text-2xl font-normal text-ink-900 md:text-3xl">
        {certificatesContent.heading}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-ink-500">
        {certificatesContent.description}
      </p>

      <div className="relative mt-10">
        <Slider
          items={certificates}
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
            // md: throughout because the phone view (1-up) is out of scope.
            //
            // The 10px between cards is 5px of margin per side, not the Slider's
            // `gap` prop: that prop feeds slideBasis and the track's -gap/2
            // margins, but the per-slide padding it would otherwise apply is
            // commented out in Slider.tsx, so the slide's content box is its
            // full width and nothing separates the cards. The width is
            // compensated by the same 10px so the card still occupies exactly
            // one slide and embla's transform math is untouched. Scoped to
            // 1024 because that is where the 3-up breakpoint and its gap live.
            // If the Slider padding is ever restored, remove these two classes
            // rather than leaving both mechanisms to double up.
            // 15px per side, not 10: the track carries a -5px margin (-gap/2),
            // so the card starts 5px OUTSIDE the embla viewport and its own
            // border is clipped, not just the shadow. 5px cancels that overhang
            // and the remaining 10px is the blur radius, so the whole falloff
            // lands inside the clip.
            <div className="rounded-lg border border-line-100 bg-white p-6 shadow-[0px_0px_10px_0px_#0000001A] max-md:mx-[15px] md:flex md:aspect-[467/498] md:max-w-[467px] md:items-center md:justify-center min-[1024px]:mx-[5px] min-[1024px]:w-[calc(100%-10px)]">
              {/* Height-driven, not a fixed 271x358: once the card is
                  aspect-locked its content box is 50px shorter than the card,
                  and 358px only fits from ~1318px of viewport up. Capping the
                  height at 358 and deriving the width from the 271/358 ratio
                  hits the design size exactly where there is room and shrinks
                  proportionally where there is not, never overflowing. */}
              {/* 180x238 on the phone is the same 0.756 ratio as the desktop
                  271x358, so it is a pure scale-down. Both dimensions are
                  explicit below md, which is what neutralises aspect-3/4 and
                  w-full there; every md: value is untouched, so >=768 is
                  unaffected. mx-auto because the card is only a flex container
                  from md up — below that the wrapper is a plain block child. */}
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
    </div>
  );
}
