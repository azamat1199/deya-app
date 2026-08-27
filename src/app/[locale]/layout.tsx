import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import Layout from "@/components/layout/Layout";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { DictionaryProvider } from "@/lib/i18n/DictionaryProvider";
import { isLocale, locales } from "@/lib/i18n/config";
import { getSettings } from "@/lib/settings";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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
  // footer reads as "use the static values".
  const [dictionary, settings] = await Promise.all([
    getDictionary(locale),
    getSettings(locale),
  ]);

  return (
    <DictionaryProvider locale={locale} dictionary={dictionary}>
      <Layout settings={settings}>{children}</Layout>
    </DictionaryProvider>
  );
}