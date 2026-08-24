"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface MarqueeItem {
  /** Stable identity — the API id, or the name on the static fallback. Used in
   *  the React key together with the copy index, never the array index. */
  id: string | number;
  name: string;
  /** Empty or absent renders the tile without an anchor — never href="". */
  href?: string;
  /** https logo URL. Empty or absent falls back to the partner NAME in the same
   *  tile, so a missing asset is never a broken image or an empty box. */
  logo?: string;
}

/**
 * Two copies is the floor for a seamless wrap; the real count is measured at
 * runtime so a growing partner list never leaves a gap. See the sizing effect.
 */
const MIN_COPIES = 2;

const TILE_CLASSES =
  "flex h-25 w-45 shrink-0 items-center justify-center rounded-lg border border-line-100 bg-white px-6 text-center text-sm font-medium text-ink-700 shadow-sm transition-colors hover:border-brand-600 hover:text-brand-600";

export interface MarqueeRowProps {
  items: readonly MarqueeItem[];
  direction: "left" | "right";
  pxPerSecond?: number;
}

export default function MarqueeRow({ items, direction, pxPerSecond = 35 }: MarqueeRowProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const offsetRef = useRef(0);
  const [copies, setCopies] = useState(MIN_COPIES);

  // How many copies of the row it takes to outrun the viewport. Derived from
  // the MEASURED width of one copy rather than a hardcoded number, so the
  // seam stays invisible whether the backend returns 8 partners or 21, and it
  // re-measures when the container resizes.
  //
  // One copy's width is scrollWidth / copies, which stays constant as `copies`
  // changes — so this converges instead of oscillating.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track || items.length === 0) return;

    function measure() {
      const oneCopy = track!.scrollWidth / copies;
      if (oneCopy <= 0) return;
      // +1 so a full copy always follows the one being scrolled out of view.
      const needed = Math.max(
        MIN_COPIES,
        Math.ceil(wrapper!.clientWidth / oneCopy) + 1,
      );
      if (needed !== copies) setCopies(needed);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [copies, items.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf: number;
    let last = performance.now();

    function step(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      // Wraps after ONE copy, not half the track — that is what keeps the seam
      // invisible for any copy count.
      const oneCopy = track!.scrollWidth / copies;

      if (!pausedRef.current && oneCopy > 0) {
        // Unchanged: px per second, so more copies never alter the speed.
        const delta = pxPerSecond * dt * (direction === "left" ? 1 : -1);
        offsetRef.current = (offsetRef.current + delta + oneCopy) % oneCopy;
        track!.style.transform = `translateX(${-offsetRef.current}px)`;
      }
      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [direction, pxPerSecond, copies]);

  return (
    <div
      ref={wrapperRef}
      className="overflow-hidden"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div ref={trackRef} className="flex w-max gap-4">
        {/* Flattened deliberately: the tiles stay DIRECT flex children of the
            track, exactly as before, so gap-4 and the measured scrollWidth are
            unchanged. Wrapping each copy in its own element would have added a
            flex child and moved the seam. */}
        {Array.from({ length: copies }, (_, copy) => copy).flatMap((copy) =>
          items.map((item) => {
            const isDuplicate = copy > 0;

            // Every copy after the first exists only to make the scroll
            // seamless: hidden from assistive tech and skipped by the tab order
            // so the same partner is never announced or focused twice.
            const duplicateProps = isDuplicate
              ? { "aria-hidden": true, tabIndex: -1 }
              : {};

            // The tile keeps its border, background, padding and size; only its
            // CONTENTS change. object-contain, never cover — these logos have
            // wildly different aspect ratios and must not be cropped. An empty
            // logo falls back to the partner name in the same tile, so there is
            // never a broken image or an empty box.
            const content = item.logo ? (
              <span className="relative block h-full w-full">
                <Image
                  src={item.logo}
                  alt={item.name}
                  fill
                  sizes="180px"
                  className="object-contain"
                />
              </span>
            ) : (
              item.name
            );

            // No anchor at all when there is no website — never href="" or
            // href="undefined". A span with the identical class list keeps the
            // tile's size, spacing and position in the row untouched.
            return item.href ? (
              <a
                key={`${item.id}-${copy}`}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${TILE_CLASSES} cursor-pointer`}
                {...duplicateProps}
              >
                {content}
              </a>
            ) : (
              <span key={`${item.id}-${copy}`} className={TILE_CLASSES} {...duplicateProps}>
                {content}
              </span>
            );
          }),
        )}
      </div>
    </div>
  );
}
