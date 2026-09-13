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
      {/* One viewport tall at every width. This was a fixed ladder — h-125,
          md:h-150, lg:h-175, xl:h-197.5 — which capped the photo at 700px on a
          1280/1440 screen and 790px on a 1920/2560 one, so it never reached the
          fold. Width was already edge to edge: the wrapper above is w-full and
          the page renders this hero outside any Section, so no breakout,
          negative margin or calc(100vw) is needed — the container-page inside
          insets only the copy, which is what keeps it on the logo's left edge.

          svh with a dvh upgrade, matching HistoryHero and PartnersHero: svh is
          the URL-bar-visible height, so the hero fits whether a mobile toolbar
          is showing or collapsed, and dvh takes over where supported. Never
          100vh, which overflows by the toolbar height on iOS. This also
          subsumes the old max-md:h-dvh. */}
      <div className="relative h-svh w-full supports-[height:100dvh]:h-dvh">
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
          {/* Roboto 300 / 34px / 105% / -3%. Everything but the size was
              already right: font-light IS the 300, leading-[1.05] the 105%,
              tracking-[-0.03em] the -3% (-1.02px at 34px). Only the clamp is
              replaced — it bottomed out at 30.6px on a 360px frame.

              34px is DELIBERATELY smaller than the 46px the about and partners
              heroes use on mobile; it is this hero's own value, not a drift to
              be reconciled with theirs.

              Unprefixed classes are safe here: this whole block is `md:hidden`
              and the desktop hero is the separate `md:flex` block below, so
              nothing in here can reach desktop. */}
          <h1 className="max-w-xs font-light text-white text-[34px] leading-[1.05] tracking-[-0.03em]">
            {title}
          </h1>

          <div aria-hidden="true" />

          <div>
            {/* Roboto 400 / 13px / 135% / 0. font-normal is already the 400;
                the size, leading and tracking are all replaced — the previous
                tracking was -0.02em and the spec asks for 0. */}
            <p className="font-normal text-white/90 text-[13px] leading-[1.35] tracking-normal">
              {subtitle}
            </p>
            {/* Roboto 500 / 12px / 120% / 0.
                `text-[12px]` was already here and already wins over ui/Button's
                size-lg `text-base` — measured at 12px before this change, so it
                stays as it is.

                The other three carry `max-md:` because they compete with the
                Button's OWN classes and cn() is plain clsx, which keeps both:
                  · font-semibold (BASE) beat a plain font-medium — Tailwind
                    emits font-weight utilities in scale order, so 600 lands
                    after 500. Measured: the button rendered 600 before this.
                  · tracking-wide (BASE) would likewise beat a plain
                    tracking-normal, since `wide` sorts after `normal`.
                  · leading-[1.2] replaces the 1.5 ratio text-base pairs with
                    its size (18px before, 14.4px now).
                A variant sorts after every unprefixed utility, which settles
                all three. The element only exists below md anyway.

                Width, height (52px), padding, radius, colour states and the
                link target are untouched — type only. */}
            <Button
              variant="white"
              size="lg"
              href={ctaHref}
              external={ctaExternal}
              fullWidth
              className="mt-[26px] h-[52px] text-[12px] max-md:leading-[1.2] max-md:font-medium max-md:tracking-normal"
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
