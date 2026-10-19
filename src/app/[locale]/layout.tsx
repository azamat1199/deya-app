import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Roboto } from "next/font/google";
import { notFound } from "next/navigation";

import CookieConsent from "@/components/layout/CookieConsent";
import Layout from "@/components/layout/Layout";
import { getCategories, type Category } from "@/lib/categories";
import { CONSENT_DECIDED_SCRIPT } from "@/lib/consent";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { DictionaryProvider } from "@/lib/i18n/DictionaryProvider";
import { isLocale, locales } from "@/lib/i18n/config";
import { getSettings } from "@/lib/settings";

import "../globals.css";

// Self-hosted by next/font: no render-blocking request to Google and no
// layout shift. The cyrillic subset is required — the whole site is Russian.
// `weight` is omitted on purpose: next/font rejects `axes` alongside a static
// weight list, and the variable face already covers the 300/400/500 the design
// uses — plus the wdth axis the type spec sets.
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

// The app-wide fallback Next merges under whatever a route's own
// generateMetadata returns.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.meta.siteTitle,
    description: dictionary.meta.siteDescription,
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

/**
 * The ROOT layout, under the [locale] segment (the pattern Next's i18n guide
 * uses) so <html lang> comes from the route param. It used to live in
 * app/layout.tsx and read the locale from a header the proxy set, and calling
 * headers() there — like calling cookies() here for the banner — made every
 * route render on demand. Neither is read now, so the pages prerender per
 * locale and revalidate on their fetches' 5-minute window.
 */
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
    // suppressHydrationWarning: the inline script below may add
    // data-cookie-decided before React hydrates. It covers <html>'s own
    // attributes only, not its children.
    <html
      lang={locale}
      className={`${roboto.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Synchronous, before the body is parsed: hides the prerendered
            cookie banner before the first paint for a visitor who has already
            answered. See CONSENT_DECIDED_SCRIPT. */}
        <script dangerouslySetInnerHTML={{ __html: CONSENT_DECIDED_SCRIPT }} />
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
