"use client";

import Link from "next/link";

import Section from "@/components/ui/Section";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * The 404 for everything under a locale: notFound() from any page (a missing
 * product or post) and unmatched paths via the [...missing] catch-all. Renders
 * inside the locale layout, so it keeps the header/footer and the visitor's
 * language. A client component only because not-found receives no params; the
 * locale comes from the layout's DictionaryProvider instead. Next adds
 * `noindex` to 404 responses itself.
 */
export default function NotFound() {
  const { t, locale } = useTranslation();

  return (
    <Section
      bg="white"
      containerWidth="page"
      className="pt-[calc(var(--logo-overhang)_+_4rem)] pb-24"
    >
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-semibold tracking-wide text-brand-600">404</p>
        <h1 className="mt-4 text-3xl font-normal text-ink-900 lg:text-4xl">
          {t("notFound.heading")}
        </h1>
        <p className="mt-4 leading-relaxed text-ink-700">{t("notFound.text")}</p>
        <div className="mt-10 flex flex-col justify-center gap-4 md:flex-row">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center rounded-md bg-brand-600 px-8 py-4 text-sm font-semibold tracking-wide text-white uppercase transition-colors hover:bg-brand-700"
          >
            {t("notFound.backHome")}
          </Link>
          <Link
            href={`/${locale}/catalog`}
            className="inline-flex items-center justify-center rounded-md border border-brand-600 px-8 py-4 text-sm font-semibold tracking-wide text-brand-600 uppercase transition-colors hover:bg-brand-50"
          >
            {t("notFound.toCatalog")}
          </Link>
        </div>
      </div>
    </Section>
  );
}
