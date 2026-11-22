"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * True when the visitor asked for reduced motion. A few lines of matchMedia in
 * place of framer-motion's useReducedMotion, which pulled all of framer-motion
 * into the bundle of every page with a Slider just to read one media query.
 * false during SSR/hydration (no preference known), then the real value.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
