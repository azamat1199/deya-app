import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LegalPage from "@/components/legal/LegalPage";
import { consentContent } from "@/content/legal/consent";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type ConsentPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ConsentPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${consentContent.title} — DEYA`,
    description: consentContent.title,
  };
}

export default async function ConsentPage({ params }: ConsentPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  return (
    <LegalPage content={consentContent} locale={locale} backLabel={dictionary.buttons.backToHome} />
  );
}
