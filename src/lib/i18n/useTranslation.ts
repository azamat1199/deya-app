"use client";

import { useCallback } from "react";

import { useI18nContext } from "./DictionaryProvider";
import type { TranslationKey } from "./dictionary";

function resolvePath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

export function useTranslation() {
  const { dictionary, locale } = useI18nContext();

  // Stable per dictionary, so callers can list `t` as a memo/effect
  // dependency without recomputing on every render.
  const t = useCallback(
    (key: TranslationKey): string => {
      const value = resolvePath(dictionary, key);
      return typeof value === "string" ? value : key;
    },
    [dictionary],
  );

  return { t, locale };
}