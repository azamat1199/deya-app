import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LegalPage from "@/components/legal/LegalPage";
import { privacyPolicyContent } from "@/content/legal/privacy-policy";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type PrivacyPolicyPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PrivacyPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${privacyPolicyContent.title} — DEYA`,
    description: privacyPolicyContent.title,
  };
}

export default async function PrivacyPolicyPage({ params }: PrivacyPolicyPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  return (
    <LegalPage
      content={privacyPolicyContent}
      locale={locale}
      backLabel={dictionary.buttons.backToHome}
    />
  );
}
