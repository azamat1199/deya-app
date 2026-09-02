import Image from "next/image";
import Link from "next/link";

import { ScrollReveal, Stat } from "@/components/ui";
import { homeContent } from "@/content/home";
import type { StatItem } from "@/content/types";
import type { Locale } from "@/lib/i18n/config";
import { withEmphasis } from "@/lib/withEmphasis";

export interface AboutPreviewProps {
  locale: Locale;
  /** From GET /api/v1/home/ `stats[]`, or the static set when that request
   *  failed. No default: the page owns the fallback, so a missing prop is a
   *  bug rather than a silent revert to mock content. */
  stats: StatItem[];
}

export default function AboutPreview({ locale, stats }: AboutPreviewProps) {
  const {
    eyebrow,
    heading,
    paragraphs,
    paragraphHighlights,
    linkLabel,
    linkHref,
    factoryImage,
  } = homeContent.about;

  return (
    <div className="py-[10px] lg:py-[10px]">
      <ScrollReveal direction="up">
        <div className="pt-16 pb-12 lg:pt-32 lg:pb-16">
          <p className="mb-4 text-xs font-normal tracking-[0.2em] text-ink-400 uppercase">
            {eyebrow}
          </p>
          <h2 className="mb-8 max-w-2xl text-2xl leading-snug font-light text-ink-900 lg:mb-12 lg:text-4xl">
            {heading}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-12 lg:gap-24">
            <p className="text-sm leading-relaxed text-ink-700 lg:text-base">
              {withEmphasis(
                paragraphs[0],
                paragraphHighlights,
                "font-semibold text-ink-900",
              )}
            </p>
            <div className="space-y-6">
              <p className="text-sm leading-relaxed text-ink-700 lg:text-base">
                {paragraphs[1]}
              </p>
              <Link
                href={`/${locale}${linkHref}`}
                className="inline-block text-sm font-medium tracking-wide text-ink-900 uppercase underline decoration-1 underline-offset-4 transition-colors hover:text-brand-600"
              >
                {linkLabel}
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="fade">
        <div className="relative left-1/2 right-1/2 w-screen -mx-[50vw]">
          <div className="relative  overflow-hidden h-[500px] md:h-[600px] lg:h-[800px] xl:h-[800px]">
            <Image
              src={factoryImage}
              alt="Кондитерская фабрика Deya"
              fill
              sizes="100vw"
              className="object-fill max-md:top-[120px]! max-md:h-[380px]! max-md:bottom-auto!"
            />

            {/* Desktop only. Being a sibling of the stats overlay, a fixed
                height here can never track how tall the stats actually are —
                which is why the phone uses the overlay's own background
                instead and hides this one. Both active at once would stack two
                white fades and double the opacity. */}
            {/* Explicit stops rather than from/via/to: the new factory photo is
                a bright exterior, and on the old three-stop ramp all five stat
                captions measured between 2.98:1 and 4.47:1 against #6b6b6b —
                every one under WCAG AA. Holding white to 58% and 0.92 through
                80% covers the caption band (it ends at ~80% of this ramp) and
                lifts them past 4.5:1. The element's height is unchanged, so
                nothing moves. */}
            <div className="absolute inset-x-0 top-0 z-10 h-[200px] bg-[linear-gradient(to_bottom,#fff_0%,#fff_58%,rgba(255,255,255,0.92)_80%,rgba(255,255,255,0)_100%)] max-md:hidden lg:h-[250px]" />
            {/* On mobile the fade lives here rather than on the sibling above:
                this wrapper is auto-height, so it is exactly as tall as the
                stats plus pb-40, and the gradient tracks the content at any
                width instead of needing a tuned pixel value per breakpoint.
                The padding is what produces the clear space between the last
                caption and the photograph. */}
            <div className="absolute inset-x-0 top-0 z-20 max-md:bg-linear-to-b max-md:from-[#FFFCF7] max-md:from-[49.52%] max-md:to-[#FFFCF700] max-md:pb-[40px]">
              <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-20">
                {/* Mobile divider and row rhythm are driven from the container
                    with nth-child rules — the same idiom CareersBrands uses —
                    so the mapped cell markup below stays untouched.
                    The row gap is zero and the separation lives on the inner
                    edges instead: below row 1, 10px padding plus 10px margin;
                    above row 2, 12px padding — 32px total. Note the margin sits
                    OUTSIDE the border box, so the 10px of it interrupts the
                    divider: row 1's segment ends 10px above row 2's. The
                    padding does not, being inside the border box.
                    Column gap is already 0 and the two columns are equal, so
                    the border lands exactly on the midline with no horizontal
                    padding needed. */}
                <div className="grid grid-cols-2 gap-y-6  max-md:gap-y-0 max-md:pt-6.5 max-md:[&>*:nth-child(-n+2)]:pb-[10px] max-md:[&>*:nth-child(-n+2)]:mb-[10px]  max-md:[&>*:nth-child(odd)]:border-r-[0.5px] max-md:[&>*:nth-child(odd)]:border-r-[#0000004D] md:flex md:gap-y-0 md:divide-x md:divide-line-200/50  ">
                  {stats.map((stat) => (
                    <div
                      key={stat.id}
                      className="text-center md:flex-1 md:mx-6 md:my-8 md:first:ml-0 lg:my-12"
                    >
                      <Stat {...stat} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
