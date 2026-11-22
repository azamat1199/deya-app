"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import type { Slide } from "@/content/types";

import HeroControls from "./HeroControls";
import HeroSlide from "./HeroSlide";

export interface HeroSliderProps {
  slides: Slide[];
}

const loadCarousel = () => import("./HeroCarousel");
const HeroCarousel = dynamic(loadCarousel, { ssr: false });

/** Same gutter ui/Slider gives its track (gap 16 → -8px per side), so the
 *  static slide lands exactly where the carousel's first slide will. */
const TRACK_STYLE = { marginLeft: -8, marginRight: -8 };

/**
 * The home hero, in two stages.
 *
 * 1. Server HTML and first paint: ONLY the first slide (heading, photo and
 *    controls) as plain markup. The <h1> and the LCP photo are in the HTML;
 *    neither the carousel library nor the other slides are in the initial JS
 *    or the DOM.
 * 2. Once the page is idle — or immediately on the first pointer, touch or
 *    keyboard interaction with the hero — HeroCarousel (embla + autoplay +
 *    all slides) loads and mounts ON TOP of the static slide with a
 *    transparent background. When its first photo is decoded the static
 *    layer is removed. The two render the same HeroSlide/HeroControls, so
 *    the swap is invisible.
 *
 * An arrow clicked before the carousel arrives is not lost: the carousel
 * opens on the slide that click asked for.
 */
export default function HeroSlider({ slides }: HeroSliderProps) {
  const [requested, setRequested] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [carouselReady, setCarouselReady] = useState(false);
  const interactive = slides.length > 1;

  const load = useCallback(() => {
    if (!interactive) return;
    void loadCarousel();
    setRequested(true);
  }, [interactive]);

  useEffect(() => {
    if (!interactive) return;
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(load, { timeout: 4000 })
      : window.setTimeout(load, 2500);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [interactive, load]);

  const goTo = (index: number) => {
    setStartIndex(index);
    load();
  };

  const first = slides[0];
  if (!first) return null;

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-ink-900"
      onPointerDownCapture={load}
      onTouchStartCapture={load}
      onFocusCapture={load}
    >
      {!carouselReady && (
        // The same overflow/track/slide boxes ui/Slider renders, so the
        // first slide sits on the identical geometry.
        <div className="absolute inset-0">
          <div className="overflow-hidden">
            <div className="flex" style={TRACK_STYLE}>
              <div className="min-w-0 shrink-0 grow-0 basis-full">
                <HeroSlide slide={first} index={0} />
              </div>
            </div>
          </div>
          <HeroControls
            slides={slides}
            selectedIndex={0}
            count={slides.length}
            canPrev={interactive}
            canNext={interactive}
            onPrev={() => goTo(slides.length - 1)}
            onNext={() => goTo(1)}
            paused
          />
        </div>
      )}

      {requested && (
        // Invisible until ready, so its overlay gradient never doubles up
        // with the static one. A plain block: it adds no layout of its own.
        <div className={carouselReady ? undefined : "opacity-0"}>
          <HeroCarousel
            slides={slides}
            startIndex={startIndex}
            onReady={() => setCarouselReady(true)}
          />
        </div>
      )}
    </div>
  );
}
