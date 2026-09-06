import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LegalPage from "@/components/legal/LegalPage";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getLegalDocument } from "@/lib/legalDocuments";

/** The fixed slug this route always requests — never derived from params. */
const SLUG = "privacy-policy";

type PrivacyPolicyPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PrivacyPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  // A failed fetch still needs a non-empty <title>. footer.privacyPolicy is
  // this page's own dictionary-translated identity, not the document's body
  // copy, so using it here is not "falling back to old static copy" — there
  // is no static copy left for the body itself.
  const [dictionary, doc] = await Promise.all([
    getDictionary(locale),
    getLegalDocument(SLUG, locale),
  ]);

  const title = doc?.title ?? dictionary.footer.privacyPolicy;
  return { title: `${title} — DEYA`, description: title };
}

export default async function PrivacyPolicyPage({
  params,
}: PrivacyPolicyPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dictionary, doc] = await Promise.all([
    getDictionary(locale),
    getLegalDocument(SLUG, locale),
  ]);

  return (
    <LegalPage
      doc={doc}
      locale={locale}
      backLabel={dictionary.buttons.backToHome}
      unavailableLabel={dictionary.legal.unavailable}
    />
  );
}
