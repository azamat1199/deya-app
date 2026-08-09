"use client";

import { useEffect, useRef, useState } from "react";

export interface StatProps {
  value: string;
  numericValue: number;
  label: string;
  className?: string;
}

const COUNT_UP_DURATION_MS = 2000;

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export default function Stat({ value, numericValue, label, className }: StatProps) {
  const [display, setDisplay] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const numericPrefixLength = String(numericValue).length;
  const suffix = value.startsWith(String(numericValue)) ? value.slice(numericPrefixLength) : "";

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasAnimated) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        setHasAnimated(true);
        observer.disconnect();

        if (prefersReducedMotion) {
          setDisplay(numericValue);
          return;
        }

        const start = performance.now();
        function tick(now: number) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / COUNT_UP_DURATION_MS, 1);
          setDisplay(Math.round(numericValue * easeOutQuad(progress)));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasAnimated, numericValue]);

  return (
    <div ref={elementRef} className={className}>
      <p className="text-5xl font-light text-brand-500 lg:text-7xl xl:text-8xl">
        {display}
        {suffix}
      </p>
      {/* The number-to-caption distance is this margin, not a gap on the
          wrapper — the number itself carries no margin-bottom. Overriding it
          here rather than adding mb to the number keeps a single margin in
          play, so the 10px is not the result of two margins collapsing. */}
      <p className="mt-2 text-sm text-ink-500 max-md:mt-[10px]">{label}</p>
    </div>
  );
}