"use client";

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

  function t(key: TranslationKey): string {
    const value = resolvePath(dictionary, key);
    return typeof value === "string" ? value : key;
  }

  return { t, locale };
}