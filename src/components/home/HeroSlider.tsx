"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Badge, Button, Slider } from "@/components/ui";
import type { Slide } from "@/content/types";

export interface HeroSliderProps {
  slides: Slide[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-ink-900">
      <Slider
        items={slides}
        loop
        autoplay
        autoplayInterval={5000}
        renderSlide={(slide) => (
          <div className="relative flex h-screen w-full items-center overflow-hidden">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink-900/85 via-ink-900/30 to-transparent md:bg-linear-to-r md:from-ink-900/80 md:via-ink-900/40 md:to-transparent" />

            {/* Phone/tablet: content anchored to the bottom, above the pagination row. */}
            <div className="container-page relative z-10 flex h-full w-full flex-col justify-end gap-6 pb-28 text-white md:hidden">
              {slide.badge && <Badge text={slide.badge} variant="new" />}
              <h1 className="text-4xl leading-tight font-normal">{slide.title}</h1>
              <p className="text-base text-white/85">{slide.description}</p>
              <Button variant="white" size="lg" href={slide.ctaHref} fullWidth>
                {slide.ctaLabel}
              </Button>
            </div>

            {/* Desktop: vertically centered content, matches the existing approved layout. */}
            <div className="container-page relative z-10 hidden md:block">
              <div className="max-w-xl space-y-6 text-white">
                {slide.badge && <Badge text={slide.badge} variant="new" />}
                <h1 className="text-4xl leading-tight font-normal md:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                <p className="text-base text-white/85 md:text-lg">{slide.description}</p>
                <Button variant="white" size="lg" href={slide.ctaHref}>
                  {slide.ctaLabel}
                </Button>
              </div>
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
              <span className="relative h-px flex-1 bg-white/30" aria-hidden="true">
                <span
                  className="absolute inset-y-0 left-0 bg-white transition-all duration-300"
                  style={{
                    width: `${((selectedIndex + 1) / scrollSnaps.length) * 100}%`,
                  }}
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

            {/* Desktop: pagination clustered to the right, matches the existing approved layout. */}
            <div className="absolute inset-x-8 bottom-8 z-10 hidden items-center justify-end gap-4 text-white md:flex lg:inset-x-20">
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
              <span className="relative h-px w-16 bg-white/30" aria-hidden="true">
                <span
                  className="absolute inset-y-0 left-0 bg-white transition-all duration-300"
                  style={{
                    width: `${((selectedIndex + 1) / scrollSnaps.length) * 100}%`,
                  }}
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
          </>
        )}
      />
    </div>
  );
}
