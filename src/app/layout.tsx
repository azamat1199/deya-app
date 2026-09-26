import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { headers } from "next/headers";

import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

import "./globals.css";

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

// Not per-request static metadata: this is the app-wide fallback Next merges
// under whatever a route's own generateMetadata returns, so it still needs the
// visitor's locale. x-locale comes from the proxy the same way the component
// below reads it — there is no other way to reach the request here.
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const localeHeader = headersList.get("x-locale");
  const locale: Locale =
    localeHeader && isLocale(localeHeader) ? localeHeader : defaultLocale;
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.meta.siteTitle,
    description: dictionary.meta.siteDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") ?? defaultLocale;

  return (
    <html lang={locale} className={`${roboto.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}