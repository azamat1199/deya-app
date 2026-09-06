import type { Locale } from "./i18n/config";

/**
 * Uzbek Latin month names, "day-month, year" order — verified against Node's
 * own `Intl.DateTimeFormat("uz", ...)` output, which is correct.
 *
 * Hand-rolled ONLY for uz, and only because of a confirmed hydration bug: the
 * same Intl call against the same (date, locale) produces different text in
 * Node than in a browser —
 *   Node (server):    "6-sentabr, 2026"
 *   Chrome (client):  "2026 M09 6"
 * — a genuine CLDR-version gap between two different FULL-ICU engines, not a
 * missing-data (small-icu) problem: this Node build already reports
 * `process.config.variables.icu_small === false`. No Node flag closes a gap
 * between two engines' bundled ICU versions, so a lookup table is the only
 * thing that is byte-identical everywhere. ru and en stay on Intl below —
 * verified identical between Node and Chrome for the same inputs, and
 * hand-rolling either would reintroduce the exact bug this file's previous
 * version had (see below).
 */
const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
] as const;

function formatUz(date: Date): string {
  return `${date.getUTCDate()}-${UZ_MONTHS[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;
}

/**
 * Formats a date for display from either a plain "2025-07-10" or a full ISO
 * 8601 UTC timestamp ("2026-08-18T17:05:00Z").
 *
 * `new Date(trimmed)` plus UTC-only accessors (`getUTCDate` and Intl's own
 * `timeZone: "UTC"`), never local-time getters — the previous hand-rolled
 * version this replaced split the string on "-", which turned a timestamp's
 * day into "18T17:05:00Z" → NaN, and lacked uz entirely (it fell through to
 * English). Both of those are fixed here without reintroducing either bug.
 *
 * An unparseable or empty value renders NOTHING rather than "Invalid Date".
 */
export function formatPostDate(isoDate: string, locale: Locale): string {
  const trimmed = (isoDate ?? "").trim();
  if (!trimmed) return "";

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return "";

  if (locale === "uz") return formatUz(parsed);

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
