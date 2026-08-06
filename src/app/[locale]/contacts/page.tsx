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

export async function generateMetadata({
  params,
}: ContactsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = await getDictionary(locale);
  return { title: `${dictionary.nav.contacts} — DEYA` };
}

export default async function ContactsPage({ params }: ContactsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    // The logo block hangs past the header bar, so the page starts below the
    // block, not the bar. Only the overhang is added here: this route's header
    // is sticky, i.e. in flow, so its own height is already consumed above
    // <main> — adding --header-height too would double-count it. The 4rem is
    // the clear space from the logo's bottom edge down to the heading.
    // containerWidth="page" is the `.container-page` utility the Header itself
    // uses, so the heading's and the info card's left edges land on the logo
    // block's x and the form card's right edge on the phone button's. "home" is
    // a different container (max-w-1440, lg:px-20) and was inset 40px further.
    // Applied once here rather than on the heading and each card.
    <Section
      bg="white"
      containerWidth="page"
      className="pt-[calc(var(--logo-overhang)_+_4rem)]"
    >
      {/* 24ch is what breaks it after "нами" — a width, not a <br>, so it
          re-breaks if the type scale ever moves. */}
      <h1 className="max-w-[24ch] text-3xl font-normal text-ink-900 lg:text-4xl">
        {contactsContent.heading}
      </h1>

      <div className="mt-10 mb-10 grid gap-8 lg:grid-cols-2">
        <ContactInfo />
        <ContactForm />
      </div>
    </Section>
  );
}
