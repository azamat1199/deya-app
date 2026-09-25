"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Slider from "@/components/ui/Slider";
import type { Slide } from "@/content/types";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/useTranslation";

export interface HeroSliderProps {
  slides: Slide[];
}

const AUTOPLAY_MS = 6000;

function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//i.test(href);
}

const COPY_TOP_OFFSET =
  "pt-[calc(var(--header-height)+clamp(1rem,6vh,2.5rem))] md:pt-[calc(var(--header-height)+clamp(1.5rem,12vh,6rem))]";

interface AutoplayProgressProps {
  selectedIndex: number;
  durationMs: number;
  paused: boolean;
  className?: string;
}

function AutoplayProgress({
  selectedIndex,
  durationMs,
  paused,
  className,
}: AutoplayProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (paused) return;

    let raf: number;
    const start = performance.now();

    function tick(now: number) {
      const pct = Math.min(100, ((now - start) / durationMs) * 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selectedIndex, paused, durationMs]);

  return <span className={className} style={{ width: `${progress}%` }} />;
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const { t } = useTranslation();
  return (
    <div className="relative h-screen w-full overflow-hidden bg-ink-900">
      <Slider
        items={slides}
        loop
        autoplay
        autoplayInterval={AUTOPLAY_MS}
        renderSlide={(slide) => (
          // `mx-2` is not decoration — it cancels embla's gutter. ui/Slider
          // gives the track `margin-inline: -gap/2` (gap defaults to 16, and
          // this slider does not override it) and then sizes each slide at
          // 100% of that widened track, so every slide box is 16px wider than
          // the viewport and starts 8px to the LEFT of it. That offset is what
          // put the hero copy at x=12 while the header logo sat on the
          // container's real 20px gutter — measured, not guessed. Adding the
          // 8px back per side pulls the slide box onto the viewport exactly,
          // so `container-page`'s px-5 finally lands on 20px like everything
          // else. `w-full` is gone because a block div already fills its
          // parent; keeping it would have added the margins ON TOP of 100%
          // and pushed the slide 16px wide of the frame.
          //
          // md:mx-0 restores the bleed above 768px — the desktop hero is out of
          // scope here and must not move by a pixel.
          <div className="relative mx-2 h-screen overflow-hidden md:mx-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink-900/85 via-ink-900/30 to-transparent md:bg-linear-to-r md:from-ink-900/80 md:via-ink-900/40 md:to-transparent" />

            {/* Everything below is MOBILE ONLY — the block is `md:hidden` and
                the desktop hero is the separate `md:grid` block underneath, so
                unprefixed utilities in here cannot reach desktop. The
                horizontal inset is `container-page`'s px-5 (20px), the same
                class the header uses for the logo and the burger, which is why
                all four now start and end on the same pair of edges.

                `pb-24` still reserves the row the slider arrows sit in; the
                data attribute lets globals.css grow that padding while the
                cookie banner is up, so the CTA clears it. */}
            <div
              data-clears-cookie-banner=""
              className="container-page relative z-10 grid h-full w-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr_auto] pb-24 text-white md:hidden"
            >
              <div className={cn("space-y-6", COPY_TOP_OFFSET)}>
                <div className="flex h-6 items-start">
                  {slide.badge && <Badge text={slide.badge} variant="new" />}
                </div>
                {/* Roboto 300 / 46px / 105% / -3%. The line-height and tracking
                    are unitless and em so they stay tied to the 46px if it
                    ever changes: 46 × 1.05 = 48.3px, 46 × -0.03 = -1.38px. */}
                <h1 className="text-[46px] leading-[1.05] font-light tracking-[-0.03em]">
                  {slide.title}
                </h1>
                {slide.description && (
                  /* Roboto 400 / 13px / 135% (17.55px) / 0. */
                  <p className="text-[13px] leading-[1.35] font-normal tracking-normal text-white/85">
                    {slide.description}
                  </p>
                )}
              </div>
              <div aria-hidden="true" />

              {slide.ctaHref && slide.ctaLabel ? (
                /* 320 × 44 at 3px radius, label Roboto 500 / 12px / 120%.
                   The width comes from `fullWidth` inside the 20px-gutter
                   container rather than a hardcoded 320px: on the 360px Figma
                   frame those are the same number (360 − 20 − 20), and letting
                   it track the container is what keeps the button's edges on
                   the logo's and the burger's at every other width too.

                   The overrides carry `max-md:` even though this block never
                   renders above 768px, because cn() is plain clsx: it does not
                   drop the losing class, so `font-medium` and `font-semibold`
                   would both land in the attribute and Tailwind's own scale
                   order (600 after 500) would pick the wrong one. A variant
                   sorts after every unprefixed utility, which settles it —
                   the same reason CertificatesGrid's button does this. */
                <Button
                  variant="white"
                  size="lg"
                  href={slide.ctaHref}
                  external={isExternalHref(slide.ctaHref)}
                  fullWidth
                  // The spec's `opacity: 1` is not set here: it is already the
                  // default, and pinning it would override the opacity-60 the
                  // Button drops to while loading or disabled.
                  className="max-md:h-11 max-md:rounded-[3px] max-md:px-4 max-md:py-0 max-md:text-[12px] max-md:leading-[1.2] max-md:font-medium max-md:tracking-normal"
                >
                  {slide.ctaLabel}
                </Button>
              ) : (
                <div aria-hidden="true" />
              )}
            </div>

            <div className="container-page relative z-10 hidden h-full w-full grid-rows-[auto_1fr_auto] md:grid">
              <div
                className={cn("max-w-xl space-y-6 text-white", COPY_TOP_OFFSET)}
              >
                <div className="flex h-6 items-start">
                  {slide.badge && <Badge text={slide.badge} variant="new" />}
                </div>
                <h1 className="text-4xl leading-tight font-normal md:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                {slide.description && (
                  <p className="text-base text-white/85 md:text-lg">
                    {slide.description}
                  </p>
                )}
              </div>
              <div aria-hidden="true" />
              <div aria-hidden="true" className="h-24 lg:h-28" />
            </div>
          </div>
        )}
        renderControls={({
          selectedIndex,
          scrollSnaps,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          isAutoplayPaused,
        }) => {
          const active = slides[selectedIndex] ?? slides[0];

          return (
            <>
              {/* `inset-x-5` is the same 20px the header's container and the
                  hero column use, so this row already starts on the logo and
                  ends on the burger — it is positioned against the slider
                  root, which spans the viewport, not against a slide. What it
                  did NOT do was clear the cookie banner, hence the attribute:
                  see the rule in globals.css. */}
              <div
                data-above-cookie-banner=""
                className="absolute inset-x-5 bottom-8 z-10 flex items-center gap-3 text-white md:hidden"
              >
                <button
                  type="button"
                  aria-label={t("a11y.prevSlide")}
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 transition-colors duration-200 hover:border-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="text-sm font-medium">
                  {String(selectedIndex + 1).padStart(2, "0")}
                </span>
                <span
                  className="relative h-px flex-1 bg-white/30"
                  aria-hidden="true"
                >
                  <AutoplayProgress
                    selectedIndex={selectedIndex}
                    durationMs={AUTOPLAY_MS}
                    paused={isAutoplayPaused}
                    className="absolute inset-y-0 left-0 bg-white"
                  />
                </span>
                <span className="text-sm font-medium">
                  {String(scrollSnaps.length).padStart(2, "0")}
                </span>

                <button
                  type="button"
                  aria-label={t("a11y.nextSlide")}
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 transition-colors duration-200 hover:border-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="absolute inset-x-0 bottom-8 z-10 hidden md:block lg:bottom-12">
                <div className="container-page flex items-center justify-between gap-6">
                  {active?.ctaHref && active?.ctaLabel ? (
                    <Button
                      variant="white"
                      size="lg"
                      href={active.ctaHref}
                      external={isExternalHref(active.ctaHref)}
                    >
                      {active.ctaLabel}
                    </Button>
                  ) : (
                    <div aria-hidden="true" />
                  )}

                  <div className="flex items-center gap-4 text-white">
                    <button
                      type="button"
                      aria-label={t("a11y.prevSlide")}
                      onClick={scrollPrev}
                      disabled={!canScrollPrev}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition-colors duration-200 hover:border-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <span className="text-sm font-medium">
                      {String(selectedIndex + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="relative h-px w-16 bg-white/30"
                      aria-hidden="true"
                    >
                      <AutoplayProgress
                        selectedIndex={selectedIndex}
                        durationMs={AUTOPLAY_MS}
                        paused={isAutoplayPaused}
                        className="absolute inset-y-0 left-0 bg-white"
                      />
                    </span>
                    <span className="text-sm font-medium">
                      {String(scrollSnaps.length).padStart(2, "0")}
                    </span>

                    <button
                      type="button"
                      aria-label={t("a11y.nextSlide")}
                      onClick={scrollNext}
                      disabled={!canScrollNext}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition-colors duration-200 hover:border-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          );
        }}
      />
    </div>
  );
}
