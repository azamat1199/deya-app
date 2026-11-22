"use client";

import { useCallback, useEffect, useRef } from "react";

import Slider from "@/components/ui/Slider";
import type { Slide } from "@/content/types";

import HeroControls, { AUTOPLAY_MS } from "./HeroControls";
import HeroSlide from "./HeroSlide";

export interface HeroCarouselProps {
  slides: Slide[];
  /** Slide to open on — 1 or the last one when the visitor clicked an arrow
   *  on the static slide before this chunk had loaded. */
  startIndex: number;
  /** Called once the first slide's photo is decoded, i.e. this layer now
   *  looks exactly like the static slide underneath it. */
  onReady: () => void;
}

/**
 * The interactive hero (embla carousel + autoplay). Loaded by HeroSlider
 * after the page is idle or on first interaction, never part of the initial
 * JS. Renders with a transparent background on top of the static slide, so
 * nothing flashes while its first photo decodes.
 */
export default function HeroCarousel({
  slides,
  startIndex,
  onReady,
}: HeroCarouselProps) {
  const readyRef = useRef(false);
  const markReady = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (readyRef.current) return;
      readyRef.current = true;
      // decode() resolves once the pixels can be painted; the photo is
      // already in the HTTP cache from the static slide.
      event.currentTarget
        .decode()
        .catch(() => undefined)
        .finally(onReady);
    },
    [onReady],
  );

  // Safety net: a photo that never loads (error, blocked) must not leave the
  // static layer stuck under an invisible carousel.
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (readyRef.current) return;
      readyRef.current = true;
      onReady();
    }, 3000);
    return () => window.clearTimeout(id);
  }, [onReady]);

  return (
    <Slider
      items={slides}
      loop
      autoplay
      autoplayInterval={AUTOPLAY_MS}
      startIndex={startIndex}
      renderSlide={(slide, index) => (
        <HeroSlide
          slide={slide}
          index={index}
          onImageLoad={index === 0 ? markReady : undefined}
        />
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
        <HeroControls
          slides={slides}
          selectedIndex={selectedIndex}
          // scrollSnaps is empty until embla initialises; the slide count
          // is the same number and avoids a "01 ── 00" frame.
          count={scrollSnaps.length || slides.length}
          canPrev={canScrollPrev}
          canNext={canScrollNext}
          onPrev={scrollPrev}
          onNext={scrollNext}
          paused={isAutoplayPaused}
        />
      )}
    />
  );
}
