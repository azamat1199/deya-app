"use client";

import { useEffect, useState } from "react";

export type CrossfadePhase = "static" | "enter" | "exit";

export interface CrossfadeLayer<T> {
  key: string | number;
  item: T;
  phase: CrossfadePhase;
}

/**
 * Layers for a CSS crossfade between successive items — the
 * AnimatePresence mode="sync" initial={false} behaviour this site used:
 * when `key` changes, the new item mounts in phase "enter" while the
 * previous one stays mounted in phase "exit" for `exitMs`, both stacked in
 * one place by the caller. The very first item is "static" (no fade on
 * load). The caller maps phases to animation classes.
 */
export function useCrossfade<T>(
  item: T,
  key: string | number,
  exitMs: number,
): CrossfadeLayer<T>[] {
  const [layers, setLayers] = useState<CrossfadeLayer<T>[]>([
    { key, item, phase: "static" },
  ]);
  const [lastKey, setLastKey] = useState(key);

  if (key !== lastKey) {
    setLastKey(key);
    setLayers((previous) => [
      ...previous
        .filter((layer) => layer.key !== key)
        .map((layer) => ({ ...layer, phase: "exit" as const })),
      { key, item, phase: "enter" },
    ]);
  }

  const exiting = layers.some((layer) => layer.phase === "exit");
  useEffect(() => {
    if (!exiting) return;
    const id = window.setTimeout(
      () => setLayers((previous) => previous.filter((l) => l.phase !== "exit")),
      exitMs,
    );
    return () => window.clearTimeout(id);
  }, [exiting, layers, exitMs]);

  // The current layer always shows the latest item (e.g. after a locale
  // change with the same key).
  return layers.map((layer) =>
    layer.key === key ? { ...layer, item } : layer,
  );
}
