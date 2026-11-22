"use client";

import { useEffect, useState } from "react";

/**
 * Keeps something mounted while it plays a CSS exit animation — the part of
 * framer-motion's AnimatePresence this site used, without the library.
 *
 * `rendered` is true while open and for `exitMs` after closing; `closing` is
 * true during that tail, so the caller can swap its enter animation class
 * for an exit one. Reopening during the tail cancels the unmount.
 */
export function usePresence(
  open: boolean,
  exitMs: number,
): { rendered: boolean; closing: boolean } {
  const [rendered, setRendered] = useState(open);
  // Mount in the same render that opens (no extra frame), the "adjust state
  // while rendering" pattern rather than an effect.
  if (open && !rendered) setRendered(true);

  useEffect(() => {
    if (open || !rendered) return;
    const id = window.setTimeout(() => setRendered(false), exitMs);
    return () => window.clearTimeout(id);
  }, [open, rendered, exitMs]);

  return { rendered: open || rendered, closing: rendered && !open };
}
