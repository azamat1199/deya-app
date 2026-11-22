import type { Dictionary, TranslationKey } from "./dictionary";

function resolvePath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

/**
 * `t(key)` for a dictionary: the string at the dotted path, or the key itself
 * when there is none. Server-safe (no React), so server components can
 * translate without the client-side DictionaryProvider; useTranslation wraps
 * this same function for client components.
 */
export function createTranslator(dictionary: Dictionary) {
  return (key: TranslationKey): string => {
    const value = resolvePath(dictionary, key);
    return typeof value === "string" ? value : key;
  };
}
