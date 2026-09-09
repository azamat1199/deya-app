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
  return (
    <div className="relative h-screen w-full overflow-hidden bg-ink-900">
      <Slider
        items={slides}
        loop
        autoplay
        autoplayInterval={AUTOPLAY_MS}
        renderSlide={(slide) => (
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

            <div className="container-page relative z-10 grid h-full w-full grid-rows-[auto_1fr_auto] pb-24 text-white md:hidden">
              <div className={cn("space-y-6", COPY_TOP_OFFSET)}>
                <div className="flex h-6 items-start">
                  {slide.badge && <Badge text={slide.badge} variant="new" />}
                </div>
                <h1 className="text-4xl leading-tight font-normal">
                  {slide.title}
                </h1>
                {slide.description && (
                  <p className="text-base text-white/85">{slide.description}</p>
                )}
              </div>
              <div aria-hidden="true" />

              {slide.ctaHref && slide.ctaLabel ? (
                <Button
                  variant="white"
                  size="lg"
                  href={slide.ctaHref}
                  external={isExternalHref(slide.ctaHref)}
                  fullWidth
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
          );
        }}
      />
    </div>
  );
}
