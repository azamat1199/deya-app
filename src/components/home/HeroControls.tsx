"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Button from "@/components/ui/Button";
import type { Slide } from "@/content/types";
import { useTranslation } from "@/lib/i18n/useTranslation";

import { isExternalHref } from "./HeroSlide";

export const AUTOPLAY_MS = 6000;

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

export interface HeroControlsProps {
  slides: Slide[];
  selectedIndex: number;
  /** Number of slides shown in the "01 ── 03" counter. */
  count: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** Freezes the autoplay progress bar (hover, hidden tab, reduced motion,
   *  or the carousel not loaded yet). */
  paused: boolean;
}

/**
 * The hero's "‹ 01 ── 03 ›" row (mobile) and CTA + arrows row (desktop).
 * Positioned against HeroSlider's root, so the static first slide and the
 * carousel render it in exactly the same place.
 */
export default function HeroControls({
  slides,
  selectedIndex,
  count,
  canPrev,
  canNext,
  onPrev,
  onNext,
  paused,
}: HeroControlsProps) {
  const { t } = useTranslation();
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
          onClick={onPrev}
          disabled={!canPrev}
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
            paused={paused}
            className="absolute inset-y-0 left-0 bg-white"
          />
        </span>
        <span className="text-sm font-medium">
          {String(count).padStart(2, "0")}
        </span>

        <button
          type="button"
          aria-label={t("a11y.nextSlide")}
          onClick={onNext}
          disabled={!canNext}
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
              onClick={onPrev}
              disabled={!canPrev}
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
                paused={paused}
                className="absolute inset-y-0 left-0 bg-white"
              />
            </span>
            <span className="text-sm font-medium">
              {String(count).padStart(2, "0")}
            </span>

            <button
              type="button"
              aria-label={t("a11y.nextSlide")}
              onClick={onNext}
              disabled={!canNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition-colors duration-200 hover:border-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
