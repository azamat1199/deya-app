import type { CountryCode } from "libphonenumber-js";

/**
 * The part of the phone field that must exist on first render, WITHOUT
 * libphonenumber-js (~40 KB gzip). The field renders from these values for the
 * default country and loads the library (lib/phone.ts) on first interaction —
 * see loadPhone() and components/ui/PhoneInput.tsx.
 */

export const DEFAULT_COUNTRY: CountryCode = "UZ";

/** getCountryCallingCode("UZ"). Pinned by phoneLite.test.ts. */
export const DEFAULT_CALLING_CODE = "998";

/** examplePlaceholder("UZ") from lib/phone.ts. Pinned by phoneLite.test.ts. */
export const DEFAULT_PLACEHOLDER = "91 234 56 78";

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

const displayNamesByLocale = new Map<string, Intl.DisplayNames | null>();

/** Localised region name via Intl.DisplayNames (one formatter per locale,
 *  reused across the ~240 countries); the code itself as fallback. */
export function countryName(code: string, locale: string): string {
  if (!displayNamesByLocale.has(locale)) {
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      names = null;
    }
    displayNamesByLocale.set(locale, names);
  }
  return displayNamesByLocale.get(locale)?.of(code) ?? code;
}

/** The default country as an option, for rendering before the library loads. */
export function defaultCountryOption(locale: string): CountryOption {
  return {
    code: DEFAULT_COUNTRY,
    name: countryName(DEFAULT_COUNTRY, locale),
    callingCode: DEFAULT_CALLING_CODE,
  };
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

let phoneModule: Promise<typeof import("./phone")> | undefined;

/** The full phone helpers (libphonenumber-js), loaded once on demand. */
export function loadPhone(): Promise<typeof import("./phone")> {
  phoneModule ??= import("./phone");
  return phoneModule;
}
