import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ScrollRevealDirection = "up" | "fade";

export interface ScrollRevealProps {
  children: ReactNode;
  direction?: ScrollRevealDirection;
  /** Stagger, in seconds as before (0.1 per card). Now shifts where in the
   *  element's entry into view the fade runs, instead of a time delay. */
  delay?: number;
  className?: string;
}

/**
 * Fade/slide-in as the element scrolls into view — CSS ONLY.
 *
 * This used to be a framer-motion `whileInView` wrapper, which server-rendered
 * its children with `style="opacity:0"` and only revealed them once the JS
 * bundle had loaded and hydrated. Wrapped around the home hero, that held the
 * page's LCP element invisible until hydration (seconds on a mid-range phone),
 * and it kept the catalog grid and legal-page titles hidden for any visitor
 * whose JS was slow or failed.
 *
 * Now (see .scroll-reveal in globals.css):
 * - The markup is always visible. There is no hidden start state in the HTML.
 * - The animation is a scroll-driven CSS animation (`animation-timeline:
 *   view()`), applied only where the browser supports it AND the visitor has
 *   not asked for reduced motion. Elsewhere the content is simply shown.
 * - Anything already in view at load is past its entry range, so it renders
 *   at its final state on the first paint — no flash, no LCP delay.
 * - No JS, no hydration, no framer-motion in the bundle for this.
 *
 * Still: do NOT wrap a page's LCP element (hero image/heading) in this.
 */
export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className,
}: ScrollRevealProps) {
  // 0.1s of stagger → the fade starts 10% further into the entry range.
  const style =
    delay > 0
      ? ({ "--reveal-start": `${Math.min(60, Math.round(delay * 100))}%` } as CSSProperties)
      : undefined;

  return (
    <div
      className={cn("scroll-reveal", className)}
      data-reveal={direction}
      style={style}
    >
      {children}
    </div>
  );
}
