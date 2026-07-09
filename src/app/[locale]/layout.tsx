import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import Layout from "@/components/layout/Layout";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { DictionaryProvider } from "@/lib/i18n/DictionaryProvider";
import { isLocale, locales } from "@/lib/i18n/config";

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

  const dictionary = await getDictionary(locale);

  return (
    <DictionaryProvider locale={locale} dictionary={dictionary}>
      <Layout>{children}</Layout>
    </DictionaryProvider>
  );
}