import "server-only";

import type { Locale } from "./config";
import type { Dictionary } from "./dictionary";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ru: () => import("@/locales/ru/common.json").then((mod) => mod.default as Dictionary),
  en: () => import("@/locales/en/common.json").then((mod) => mod.default as Dictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}