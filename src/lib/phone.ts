import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  isValidPhoneNumber,
  parsePhoneNumber,
  type CountryCode,
} from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";

/**
 * Every phone rule in the project comes from libphonenumber-js. Nothing here
 * hardcodes a dial code, a digit count or a format: those differ per country
 * and per operator prefix, and a hand-rolled table would be wrong.
 */

export const DEFAULT_COUNTRY: CountryCode = "UZ";

/** Pinned to the top of the selector, in this order, ahead of the alphabet. */
const PINNED: CountryCode[] = ["UZ", "RU", "KZ"];

export interface CountryOption {
  code: CountryCode;
  /** Localised country name, from the platform — not a bundled list. */
  name: string;
  /** Dial code without the plus, e.g. "998". */
  callingCode: string;
}

/** Regional-indicator flag for an ISO code, derived rather than stored. */
export function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
}

/**
 * The full country list, localised to `locale` via Intl.DisplayNames, with the
 * pinned entries first and the rest sorted by the locale's own collation.
 */
export function countryOptions(locale: string): CountryOption[] {
  let displayNames: Intl.DisplayNames | null = null;
  try {
    displayNames = new Intl.DisplayNames([locale], { type: "region" });
  } catch {
    displayNames = null;
  }

  const all: CountryOption[] = getCountries().map((code) => ({
    code,
    name: displayNames?.of(code) ?? code,
    callingCode: getCountryCallingCode(code),
  }));

  const pinned = PINNED.map((code) => all.find((item) => item.code === code)).filter(
    (item): item is CountryOption => Boolean(item),
  );
  const pinnedCodes = new Set(pinned.map((item) => item.code));

  const rest = all
    .filter((item) => !pinnedCodes.has(item.code))
    .sort((a, b) => a.name.localeCompare(b.name, locale));

  return [...pinned, ...rest];
}

/** Matches on country name OR dial code, so "germ", "49" and "+49" all work. */
export function matchesQuery(option: CountryOption, query: string): boolean {
  const needle = query.trim().toLowerCase().replace(/^\+/, "");
  if (!needle) return true;
  return (
    option.name.toLowerCase().includes(needle) ||
    option.callingCode.startsWith(needle) ||
    option.code.toLowerCase().startsWith(needle)
  );
}

/**
 * Live formatting in the selected country's national style — the spaced form
 * the user sees. Never includes the dial code: that is rendered by the
 * selector beside the input.
 */
export function formatAsYouType(
  nationalInput: string,
  country: CountryCode,
): string {
  return new AsYouType(country).input(nationalInput);
}

/** A localised example number for the placeholder, national part only. */
export function examplePlaceholder(country: CountryCode): string {
  const example = getExampleNumber(country, examples);
  return example ? example.formatNational().replace(/^0+\s*/, "") : "";
}

/**
 * The E.164 string the API receives: a plus and digits, nothing else. Built by
 * the library from the dial code plus whatever the user typed, so spaces,
 * dashes and brackets cannot survive.
 */
export function toE164(nationalInput: string, country: CountryCode): string {
  const digits = nationalInput.replace(/[^\d]/g, "");
  if (!digits) return "";
  try {
    const parsed = parsePhoneNumber(
      `+${getCountryCallingCode(country)}${digits}`,
    );
    return parsed?.number ?? "";
  } catch {
    return `+${getCountryCallingCode(country)}${digits}`;
  }
}

/** Per-country validity — length included. Never one rule for all countries. */
export function isValidFor(
  nationalInput: string,
  country: CountryCode,
): boolean {
  const e164 = toE164(nationalInput, country);
  if (!e164) return false;
  return isValidPhoneNumber(e164);
}

export interface PastedNumber {
  country: CountryCode;
  /** National part, already formatted for display. */
  national: string;
}

/**
 * Paste handling. A value carrying its own country code switches the selector
 * to that country; anything else is treated as a national number for the
 * country currently selected.
 */
export function parsePasted(
  raw: string,
  fallback: CountryCode,
): PastedNumber | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // A leading + or a bare international number ("998...") can name its own
  // country; try that first.
  const candidates = /^\+/.test(trimmed) ? [trimmed] : [`+${trimmed}`, trimmed];
  for (const candidate of candidates) {
    try {
      const parsed = parsePhoneNumber(candidate, fallback);
      if (parsed?.country && parsed.isValid()) {
        return {
          country: parsed.country,
          national: new AsYouType(parsed.country).input(
            parsed.nationalNumber.toString(),
          ),
        };
      }
    } catch {
      // fall through to the national reading below
    }
  }

  const digits = trimmed.replace(/[^\d]/g, "");
  if (!digits) return null;
  return { country: fallback, national: formatAsYouType(digits, fallback) };
}

/**
 * Turns an E.164 value from the API into the spaced international form for
 * DISPLAY only — "+998551515555" becomes "+998 55 151 55 55". The tel: href
 * keeps the digits-only value. Anything unparseable is returned untouched
 * rather than blanked.
 */
export function formatForDisplay(e164: string): string {
  const trimmed = e164.trim();
  if (!trimmed) return "";
  try {
    const parsed = parsePhoneNumber(
      trimmed.startsWith("+") ? trimmed : `+${trimmed}`,
    );
    return parsed?.formatInternational() ?? trimmed;
  } catch {
    return trimmed;
  }
}
