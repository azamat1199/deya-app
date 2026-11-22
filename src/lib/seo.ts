import type { Metadata } from "next";

import { normaliseOrigin } from "@/lib/api";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";

/**
 * The PUBLIC origin of this site — what canonical, hreflang, og:url, the
 * sitemap and robots.txt point at. Not NEXT_PUBLIC_API_URL: that is the
 * backend, which may or may not share the host.
 *
 * Falls back to https://deya.uz so a missing variable still yields absolute,
 * same-brand URLs rather than Next's localhost default. Set
 * NEXT_PUBLIC_SITE_URL per environment (a preview deploy should point at
 * itself, or better, be noindexed).
 */
export const SITE_URL = normaliseOrigin(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://deya.uz",
);

export const SITE_NAME = "DEYA";

/** og:locale wants language_TERRITORY. */
export const OG_LOCALE: Record<Locale, string> = {
  uz: "uz_UZ",
  ru: "ru_RU",
  en: "en_US",
};

/**
 * A locale-less path ("" for the locale home, else "/catalog", "/blog/x") as
 * it appears under each locale prefix.
 */
export function localizedPath(locale: Locale, path: string): string {
  return `/${locale}${path}`;
}

/**
 * canonical + hreflang for a page that exists under every locale at the same
 * locale-less path. `x-default` points at the default locale, which is where
 * the proxy sends a locale-less visit anyway. Relative URLs are resolved
 * against `metadataBase` (set in the locale layout).
 */
export function localeAlternates(
  locale: Locale,
  path: string,
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const candidate of locales) {
    languages[candidate] = localizedPath(candidate, path);
  }
  languages["x-default"] = localizedPath(defaultLocale, path);

  return { canonical: localizedPath(locale, path), languages };
}

/**
 * The metadata every page shares: canonical, hreflang and the og fields that
 * depend on the URL and locale. Pages spread their own title/description/images
 * on top. `openGraph` is merged one level deep by the caller — Next does NOT
 * deep-merge it across segments, so a page that sets openGraph must include
 * these fields itself (which this return value makes a one-liner).
 */
export function pageMetadata(
  locale: Locale,
  path: string,
): Pick<Metadata, "alternates" | "openGraph"> {
  return {
    alternates: localeAlternates(locale, path),
    openGraph: {
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      alternateLocale: locales
        .filter((candidate) => candidate !== locale)
        .map((candidate) => OG_LOCALE[candidate]),
      url: localizedPath(locale, path),
      type: "website",
    },
  };
}
