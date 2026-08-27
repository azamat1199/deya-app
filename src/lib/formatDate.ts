import type { Locale } from "./i18n/config";

/**
 * Formats a date for display from either a plain "2025-07-10" or a full ISO
 * 8601 UTC timestamp ("2026-08-18T17:05:00Z").
 *
 * Intl.DateTimeFormat, not hardcoded month tables: ru, uz and en need different
 * month names AND different orders, and the previous hand-rolled version both
 * lacked uz (it fell through to English) and split the string on "-", which
 * turned a timestamp's day into "18T17:05:00Z" → NaN.
 *
 * An unparseable or empty value renders NOTHING rather than "Invalid Date".
 */
export function formatPostDate(isoDate: string, locale: Locale): string {
  const trimmed = (isoDate ?? "").trim();
  if (!trimmed) return "";

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return "";

  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(parsed);
  } catch {
    return "";
  }
}
