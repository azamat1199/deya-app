import Image from "next/image";

import { Button } from "@/components/ui";

export interface CareersHeroProps {
  vacanciesLabel: string;
  /**
   * From GET /api/v1/banners/ type="carrier", resolved by careers/page.tsx —
   * this component never fetches. REQUIRED with no defaults and no t()
   * fallback: the page omits this component entirely when the CMS has no
   * carrier row, so there is no empty-hero state to design for here.
   */
  title: string;
  subtitle: string;
  /** Never empty: the page substitutes local artwork before passing it, so
   *  next/image can never be handed src="". */
  image: string;
  /**
   * The banner's cta_url, already collapsed to undefined by the page when the
   * API sends null or "". Undefined makes Button render a plain <button>
   * rather than a link — never href="" or href="null". The LABEL stays
   * `vacanciesLabel`; the banner's own cta_label is deliberately unused.
   */
  ctaHref?: string;
  /**
   * True when ctaHref points off-site, which the live carrier row does (an
   * hh.uz vacancies page). Button then renders a plain anchor in a new tab
   * instead of a next/link, which would try to client-navigate to an absolute
   * URL it does not own — the same decision HeroSlider makes for its own
   * CMS-supplied cta_url. Resolved by the page, so this stays logic-free.
   */
  ctaExternal?: boolean;
}

export default function CareersHero({
  vacanciesLabel,
  title,
  subtitle,
  image,
  ctaHref,
  ctaExternal,
}: CareersHeroProps) {
  return (
    <div className="relative w-full overflow-hidden bg-ink-900">
      <div className="relative h-125 w-full max-md:h-dvh md:h-150 lg:h-175 xl:h-197.5">
        <Image
          src={image}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover max-md:object-[50%_38%]"
        />
        <div className="absolute inset-0 bg-ink-900/50" />

        {/* Phone: additional bottom scrim so the paragraph stays legible over
            the lighter parts of the photo. Sits above the flat overlay and
            below the copy. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.35)_32%,rgba(0,0,0,0)_55%)] md:hidden"
        />

        {/* Phone: everything overlaid on the photo in three rows — h1 under the
            header, an empty spacer taking the slack, copy + CTA on the floor.
            A flex column with justify-end would pile the slack ABOVE the h1 and
            push it down the frame. The offset comes from --header-height, the
            token the Header sizes itself with; min() stops it collapsing the
            gap on a 640px-tall device. container-page puts all three on the
            same left edge as the logo, set once here. */}
        <div className="container-page relative z-10 grid h-full grid-rows-[auto_1fr_auto] pt-[calc(var(--header-height)_+_min(6vh,48px))] pb-[calc(30px_+_env(safe-area-inset-bottom))] md:hidden">
          <h1 className="max-w-xs font-light text-white text-[clamp(30px,8.5vw,38px)] leading-[1.05] tracking-[-0.03em]">
            {title}
          </h1>

          <div aria-hidden="true" />

          <div>
            <p className="font-normal text-white/90 text-[clamp(14px,3.9vw,16px)] leading-[1.4] tracking-[-0.02em]">
              {subtitle}
            </p>
            <Button
              variant="white"
              size="lg"
              href={ctaHref}
              external={ctaExternal}
              fullWidth
              className="mt-[26px] h-[52px] text-[12px] tracking-[0.05em]"
            >
              {vacanciesLabel}
            </Button>
          </div>
        </div>

        {/* Tablet/desktop: heading + description + CTA all overlaid at the bottom of the image. */}
        <div className="container-page relative z-10 hidden h-full flex-col justify-end gap-8 pb-16 md:flex lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:pb-20">
          <h1 className="max-w-xl text-5xl font-light text-white lg:text-7xl">
            {title}
          </h1>

          <div className="max-w-sm lg:pb-2">
            <p className="text-sm leading-relaxed text-white/85 lg:text-base">
              {subtitle}
            </p>
            <Button
              variant="white"
              size="lg"
              href={ctaHref}
              external={ctaExternal}
              className="mt-6 w-full"
            >
              {vacanciesLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
