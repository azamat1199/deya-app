import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ContactForm from "@/components/contacts/ContactForm";
import ContactInfo from "@/components/contacts/ContactInfo";
import { Section } from "@/components/ui";
import { contactsContent } from "@/content/contacts";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type ContactsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ContactsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = await getDictionary(locale);
  return { title: `${dictionary.nav.contacts} — DEYA` };
}

export default async function ContactsPage({ params }: ContactsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <Section bg="white" containerWidth="home">
      <h1 className="max-w-xl text-3xl font-normal text-ink-900 lg:text-4xl">
        {contactsContent.heading}
      </h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <ContactInfo />
        <ContactForm />
      </div>
    </Section>
  );
}
