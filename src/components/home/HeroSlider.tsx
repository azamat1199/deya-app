"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Badge, Button, Slider } from "@/components/ui";
import type { Slide } from "@/content/types";
import { cn } from "@/lib/cn";

export interface HeroSliderProps {
  slides: Slide[];
}

const AUTOPLAY_MS = 6000;

/** Clears the fixed header, then drops the copy ~12vh further down — the
 * Figma frame puts the h1's cap-height about 12% of the viewport below the
 * header bar. Clamped at both ends so a 700px-tall laptop doesn't push the
 * copy into the header and a tall monitor doesn't strand it mid-frame.
 * --header-height is the same token the Header renders itself with. */
const COPY_TOP_OFFSET =
  "pt-[calc(var(--header-height)+clamp(1rem,6vh,2.5rem))] md:pt-[calc(var(--header-height)+clamp(1.5rem,12vh,6rem))]";

interface AutoplayProgressProps {
  selectedIndex: number;
  durationMs: number;
  paused: boolean;
  className?: string;
}

/** Fills 0→100% over `durationMs`, restarting on every slide change (manual
 * or auto) and freezing in place while `paused` (hover, hidden tab, or
 * reduced motion). Driven by requestAnimationFrame rather than a CSS
 * @keyframes rule — this project has had hot-reload issues with keyframes
 * declared in globals.css, so animated fills are done in JS instead. */
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
  return (
    <div className="relative h-screen w-full overflow-hidden bg-ink-900">
      <Slider
        items={slides}
        loop
        autoplay
        autoplayInterval={AUTOPLAY_MS}
        renderSlide={(slide) => (
          // No `items-center` here any more: the content layers below own
          // their own vertical rhythm via a three-row grid, so the copy is
          // top-anchored instead of being centred by the parent.
          <div className="relative h-screen w-full overflow-hidden">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink-900/85 via-ink-900/30 to-transparent md:bg-linear-to-r md:from-ink-900/80 md:via-ink-900/40 md:to-transparent" />

            {/* Phone: copy top-anchored under the header, CTA pinned to the
                bottom. grid-rows-[auto_1fr_auto] puts every bit of leftover
                height in the middle row, so the copy's position is identical
                on every slide no matter how many lines it runs to. */}
            <div className="container-page relative z-10 grid h-full w-full grid-rows-[auto_1fr_auto] pb-24 text-white md:hidden">
              <div className={cn("space-y-6", COPY_TOP_OFFSET)}>
                {/* Always-present 24px slot (Badge's own height). Rendering the
                    badge conditionally would drop the h1 50px lower on the
                    slides that have one — a visible jump on every switch. */}
                <div className="flex h-6 items-start">
                  {slide.badge && <Badge text={slide.badge} variant="new" />}
                </div>
                <h1 className="text-4xl leading-tight font-normal">
                  {slide.title}
                </h1>
                <p className="text-base text-white/85">{slide.description}</p>
              </div>
              <div aria-hidden="true" />
              <Button variant="white" size="lg" href={slide.ctaHref} fullWidth>
                {slide.ctaLabel}
              </Button>
            </div>

            {/* Desktop: same three-row grid. The CTA is deliberately NOT here —
                it lives in the controls row below so it shares one line with
                the slide switcher; a button inside the track would sit at a
                different height on every slide. Row 3 is therefore an empty
                gutter reserving that row's height so the copy can never run
                into it. */}
            <div className="container-page relative z-10 hidden h-full w-full grid-rows-[auto_1fr_auto] md:grid">
              <div
                className={cn("max-w-xl space-y-6 text-white", COPY_TOP_OFFSET)}
              >
                {/* Always-present 24px slot (Badge's own height). Rendering the
                    badge conditionally would drop the h1 50px lower on the
                    slides that have one — a visible jump on every switch. */}
                <div className="flex h-6 items-start">
                  {slide.badge && <Badge text={slide.badge} variant="new" />}
                </div>
                <h1 className="text-4xl leading-tight font-normal md:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                <p className="text-base text-white/85 md:text-lg">
                  {slide.description}
                </p>
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
        }) => (
          <>
            {/* Phone/tablet: pagination spans the full width. */}
            <div className="absolute inset-x-5 bottom-8 z-10 flex items-center gap-3 text-white md:hidden">
              <button
                type="button"
                aria-label="Previous slide"
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
                aria-label="Next slide"
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 transition-colors duration-200 hover:border-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Desktop: one row — CTA on the left, switcher on the right, both
                on the shared container gutter so the CTA's left edge lines up
                with the headline above it. The CTA reads from selectedIndex so
                it still tracks the visible slide. */}
            <div className="absolute inset-x-0 bottom-8 z-10 hidden md:block lg:bottom-12">
              <div className="container-page flex items-center justify-between gap-6">
                <Button
                  variant="white"
                  size="lg"
                  href={(slides[selectedIndex] ?? slides[0]).ctaHref}
                >
                  {(slides[selectedIndex] ?? slides[0]).ctaLabel}
                </Button>

                <div className="flex items-center gap-4 text-white">
                  <button
                    type="button"
                    aria-label="Previous slide"
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
                    aria-label="Next slide"
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
        )}
      />
    </div>
  );
}
