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

// Self-hosted by next/font: no render-blocking request to Google and no
// layout shift. The cyrillic subset is required — the whole site is Russian.
// `weight` is omitted on purpose: next/font rejects `axes` alongside a static
// weight list, and the variable face already covers the 300/400/500 the design
// uses. The italic style is loaded for real — the founder quote is set in it,
// and a synthesised oblique of Cyrillic looks wrong.
const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
  axes: ["wdth"],
  display: "swap",
  // The italic faces are only used by the founder quote on /about and by
  // [&_em]:italic on the legal pages, but next/font preloads every declared
  // style on every page — measured at 104.7KB of italic (latin 68.8 + cyrillic
  // 35.9) on routes with no italic text at all.
  //
  // This does NOT drop the italic faces: `style` still declares them, the
  // @font-face rules are still emitted, and /about still renders a real italic
  // rather than a synthesised oblique. It only stops them being PRELOADED, so
  // the browser fetches an italic file when it actually meets italic text.
  //
  // The flag is per font call, not per style, so the upright faces lose their
  // preload too and are discovered after the CSS is parsed. `display: swap`
  // means no invisible text, at the cost of a possible brief fallback flash on
  // a cold cache. Splitting italic into a second Roboto() call would give it a
  // different family name, and `font-style: italic` on the base family would
  // then synthesise an oblique — which is why it is not done that way.
  preload: false,
  variable: "--font-roboto",
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
      className={`${roboto.variable} h-full antialiased`}
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
