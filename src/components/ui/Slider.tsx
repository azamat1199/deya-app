"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";

export type SliderPaginationStyle = "dots" | "progress";

export interface SliderBreakpoint {
  slidesPerView: number;
  gap?: number;
}

export interface SliderControlsState {
  selectedIndex: number;
  scrollSnaps: number[];
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
}

export interface SliderProps<T> {
  items: T[];
  renderSlide: (item: T, index: number) => React.ReactNode;
  slidesPerView?: number;
  gap?: number;
  showNavigation?: boolean;
  showPagination?: boolean;
  paginationStyle?: SliderPaginationStyle;
  autoplay?: boolean;
  autoplayInterval?: number;
  loop?: boolean;
  breakpoints?: Record<number, SliderBreakpoint>;
  className?: string;
  /** Replaces the default nav/pagination row entirely for custom layouts
   * (e.g. an overlaid "‹ 01 ── 02 ›" widget on a full-bleed hero). */
  renderControls?: (state: SliderControlsState) => React.ReactNode;
}

function useResponsiveSlideConfig(
  base: { slidesPerView: number; gap: number },
  breakpoints?: Record<number, SliderBreakpoint>,
) {
  const [config, setConfig] = useState(base);

  useEffect(() => {
    if (!breakpoints) return;

    const sortedKeys = Object.keys(breakpoints)
      .map(Number)
      .sort((a, b) => a - b);

    function resolve() {
      let next = base;
      for (const key of sortedKeys) {
        if (window.innerWidth >= key) {
          const bp = breakpoints![key];
          next = { slidesPerView: bp.slidesPerView, gap: bp.gap ?? base.gap };
        }
      }
      setConfig(next);
    }

    resolve();
    window.addEventListener("resize", resolve);
    return () => window.removeEventListener("resize", resolve);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base.slidesPerView, base.gap]);

  return config;
}

export default function Slider<T>({
  items,
  renderSlide,
  slidesPerView = 1,
  gap = 16,
  showNavigation = false,
  showPagination = false,
  paginationStyle = "dots",
  autoplay = false,
  autoplayInterval = 5000,
  loop = false,
  breakpoints,
  className,
  renderControls,
}: SliderProps<T>) {
  const { slidesPerView: activeSlidesPerView, gap: activeGap } = useResponsiveSlideConfig(
    { slidesPerView, gap },
    breakpoints,
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop, align: "start" });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const isHovering = useRef(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // Sync initial state from the embla instance as soon as it's ready,
    // then keep it in sync via the subscriptions below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, activeSlidesPerView, activeGap]);

  useEffect(() => {
    if (!autoplay || !emblaApi) return;

    const id = window.setInterval(() => {
      if (isHovering.current) return;
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else if (loop) {
        emblaApi.scrollTo(0);
      }
    }, autoplayInterval);

    return () => window.clearInterval(id);
  }, [autoplay, autoplayInterval, emblaApi, loop]);

  const slideBasis = `calc((100% - ${activeGap * (activeSlidesPerView - 1)}px) / ${activeSlidesPerView})`;

  return (
    <div className={className}>
      <div
        className="overflow-hidden"
        ref={emblaRef}
        onMouseEnter={() => {
          isHovering.current = true;
        }}
        onMouseLeave={() => {
          isHovering.current = false;
        }}
      >
        <div className="flex" style={{ marginLeft: -activeGap / 2, marginRight: -activeGap / 2 }}>
          {items.map((item, index) => (
            <div
              key={index}
              className="min-w-0 shrink-0 grow-0"
              style={{
                flexBasis: slideBasis,
                paddingLeft: activeGap / 2,
                paddingRight: activeGap / 2,
              }}
            >
              {renderSlide(item, index)}
            </div>
          ))}
        </div>
      </div>

      {renderControls
        ? renderControls({
            selectedIndex,
            scrollSnaps,
            canScrollPrev,
            canScrollNext,
            scrollPrev,
            scrollNext,
            scrollTo,
          })
        : (showNavigation || showPagination) && (
        <div className="mt-6 flex items-center justify-between">
          {showPagination && paginationStyle === "dots" && (
            <div className="flex items-center gap-2">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors duration-200",
                    index === selectedIndex ? "bg-brand-600" : "bg-ink-200 hover:bg-ink-300",
                  )}
                />
              ))}
            </div>
          )}

          {showPagination && paginationStyle === "progress" && (
            <div className="flex items-center gap-3 text-sm font-medium text-ink-500">
              <span className="text-ink-900">{String(selectedIndex + 1).padStart(2, "0")}</span>
              <span className="h-px w-12 bg-line-300" aria-hidden="true" />
              <span>{String(scrollSnaps.length).padStart(2, "0")}</span>
            </div>
          )}

          {showNavigation && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={scrollPrev}
                disabled={!loop && !canScrollPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line-300 text-ink-900 transition-colors duration-200 hover:border-brand-600 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={scrollNext}
                disabled={!loop && !canScrollNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line-300 text-ink-900 transition-colors duration-200 hover:border-brand-600 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}