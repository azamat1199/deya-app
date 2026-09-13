import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import CookieConsent from "@/components/layout/CookieConsent";
import Layout from "@/components/layout/Layout";
import { getCategories, type Category } from "@/lib/categories";
import { CONSENT_COOKIE_NAME, parseConsent } from "@/lib/consent";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { DictionaryProvider } from "@/lib/i18n/DictionaryProvider";
import { isLocale, locales } from "@/lib/i18n/config";
import { getSettings } from "@/lib/settings";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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
  const [dictionary, settings, categories, cookieStore] = await Promise.all([
    getDictionary(locale),
    getSettings(locale),
    getFooterCategories(locale),
    cookies(),
  ]);

  // Read on the SERVER so the banner's first render is already correct. That
  // is what keeps hydration clean: the client mounts with this same value
  // instead of discovering the decision in an effect afterwards.
  const consent = parseConsent(cookieStore.get(CONSENT_COOKIE_NAME)?.value);

  return (
    <DictionaryProvider locale={locale} dictionary={dictionary}>
      <Layout settings={settings} categories={categories}>
        {children}
      </Layout>
      {/* Outside <Layout> on purpose: the banner is position-fixed, so it
          needs no place in the page's flex column, and keeping it here means
          Layout keeps its current shape. */}
      <CookieConsent initialConsent={consent} />
    </DictionaryProvider>
  );
}