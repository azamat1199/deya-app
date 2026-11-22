import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Roboto } from "next/font/google";
import { notFound } from "next/navigation";

import CookieConsent from "@/components/layout/CookieConsent";
import Layout from "@/components/layout/Layout";
import { getCategories, type Category } from "@/lib/categories";
import { CONSENT_BOOT_SCRIPT } from "@/lib/consent";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { DictionaryProvider } from "@/lib/i18n/DictionaryProvider";
import { isLocale, locales } from "@/lib/i18n/config";
import { SITE_NAME, SITE_URL, pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

import "../globals.css";

/**
 * THE ROOT LAYOUT. It lives in [locale] rather than app/ because <html lang>
 * depends on the locale, and the only way app/layout.tsx could learn it was
 * `headers()` — which opts every page on the site out of static rendering.
 * Here the locale is a route param, so every page can be prerendered/ISR'd.
 * Unmatched paths under a locale hit the [locale]/[...missing] catch-all and
 * render [locale]/not-found; the proxy redirects every locale-less path into
 * /ru/..., so Next's built-in global 404 is effectively never reached.
 */

// Self-hosted by next/font: no request to Google, no layout shift. Latin +
// cyrillic only (the site is uz/ru/en). No `weight` list: the variable face
// covers the 300/400/500 the design uses in one file per subset.
//
// Two calls on purpose. next/font preloads every style declared in a call,
// and the italic faces are used only by the /about founder quote and <em>/<i>
// in CMS rich text. In one call, italic was either preloaded on every page
// (~105 KB wasted) or — as before this split — nothing was preloaded at all,
// so even the upright faces were discovered only after the CSS was parsed.
// Now the upright faces are preloaded everywhere and the italic ones load
// only on pages that actually render italic text.
//
// The italic family has its own name, so italic text must ask for it
// explicitly — `font-style: italic` alone would synthesise an oblique from the
// upright family. globals.css does that for .italic, <em> and <i>, and
// `font-italic` (theme --font-italic) covers the rest.
//
// The variable `wdth` axis is gone: nothing used a width other than the
// default, and it made every font file substantially larger.
const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  style: ["normal"],
  display: "swap",
  variable: "--font-roboto",
});

const robotoItalic = Roboto({
  subsets: ["latin", "cyrillic"],
  style: ["italic"],
  display: "swap",
  preload: false,
  variable: "--font-roboto-italic",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * The site-wide fallback every route's own generateMetadata is merged over:
 * metadataBase (so relative canonical/hreflang/og URLs become absolute), the
 * default title/description, and the locale home's alternates.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = await getDictionary(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: dictionary.meta.siteTitle,
    description: dictionary.meta.siteDescription,
    applicationName: SITE_NAME,
    ...pageMetadata(locale, ""),
  };
}

/**
 * getCategories throws on EVERY failure path — non-2xx, non-array body,
 * unparseable JSON, missing base URL — unlike getSettings, which returns null.
 * This runs in the layout wrapping every page, so an unhandled rejection here
 * would take down the whole route, not just the footer. Settled to [] instead:
 * the ПРОДУКЦИЯ heading then renders with nothing under it and every other
 * part of the page is untouched.
 *
 * Deliberately NOT falling back to a hardcoded list. The old static one
 * pointed at /catalog/{slug}, a route that needs a product slug after it, so
 * all five links 404'd — a dead fallback is worse than an empty column.
 */
async function getFooterCategories(locale: string): Promise<Category[]> {
  try {
    return await getCategories(locale);
  } catch (error) {
    console.error(
      "[LocaleLayout] GET categories failed, the footer product column will be empty —",
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
    return [];
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Fetched HERE, once, because the footer is on every page. getSettings
  // already logs its own failure with the cause and returns null, which the
  // footer reads as "use the static values". Categories join it for the same
  // reason, wrapped above because they throw rather than returning null.
  const [dictionary, settings, categories] = await Promise.all([
    getDictionary(locale),
    getSettings(locale),
    getFooterCategories(locale),
  ]);

  return (
    // suppressHydrationWarning: CONSENT_BOOT_SCRIPT may add an attribute to
    // <html> before React hydrates. It applies to this element's own
    // attributes only, not to the tree below.
    <html
      lang={locale}
      className={`${roboto.variable} ${robotoItalic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Must run before first paint: hides the (static) cookie banner for
            visitors who already answered it — see lib/consent.ts. */}
        <script dangerouslySetInnerHTML={{ __html: CONSENT_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <DictionaryProvider locale={locale} dictionary={dictionary}>
          <Layout settings={settings} categories={categories}>
            {children}
          </Layout>
          {/* Outside <Layout> on purpose: the banner is position-fixed, so it
              needs no place in the page's flex column, and keeping it here
              means Layout keeps its current shape. */}
          <CookieConsent />
        </DictionaryProvider>
      </body>
    </html>
  );
}
