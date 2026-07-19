"use client";

import { useEffect, useRef } from "react";

export interface MarqueeItem {
  name: string;
  href: string;
}

export interface MarqueeRowProps {
  items: readonly MarqueeItem[];
  direction: "left" | "right";
  pxPerSecond?: number;
}

export default function MarqueeRow({ items, direction, pxPerSecond = 35 }: MarqueeRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const offsetRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf: number;
    let last = performance.now();

    function step(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      const halfWidth = track!.scrollWidth / 2;

      if (!pausedRef.current && halfWidth > 0) {
        const delta = pxPerSecond * dt * (direction === "left" ? 1 : -1);
        offsetRef.current = (offsetRef.current + delta + halfWidth) % halfWidth;
        track!.style.transform = `translateX(${-offsetRef.current}px)`;
      }
      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [direction, pxPerSecond]);

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div ref={trackRef} className="flex w-max gap-4">
        {[...items, ...items].map((item, index) => (
          <a
            key={`${item.name}-${index}`}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-25 w-45 shrink-0 items-center justify-center rounded-lg border border-line-100 bg-white px-6 text-center text-sm font-medium text-ink-700 shadow-sm transition-colors hover:border-brand-600 hover:text-brand-600"
          >
            {item.name}
          </a>
        ))}
      </div>
    </div>
  );
}
