"use client";

import { useMemo } from "react";

import { useI18nContext } from "./DictionaryProvider";
import { createTranslator } from "./translator";

export function useTranslation() {
  const { dictionary, locale } = useI18nContext();

  // Stable per dictionary, so callers can list `t` as a memo/effect
  // dependency without recomputing on every render.
  const t = useMemo(() => createTranslator(dictionary), [dictionary]);

  return { t, locale };
}