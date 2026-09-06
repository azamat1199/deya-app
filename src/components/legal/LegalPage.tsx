import Link from "next/link";

import { ScrollReveal } from "@/components/ui";
import type { LegalDocument } from "@/lib/legalDocuments";
import type { Locale } from "@/lib/i18n/config";

export interface LegalPageProps {
  /** null when the fetch for this slug failed or resolved to nothing —
   *  renders the minimal unavailable state instead of a title/body. */
  doc: LegalDocument | null;
  locale: Locale;
  backLabel: string;
  /** Shown in place of the title/body when `doc` is null. */
  unavailableLabel: string;
}

export default function LegalPage({
  doc,
  locale,
  backLabel,
  unavailableLabel,
}: LegalPageProps) {
  return (
    <section className="bg-white pt-8 pb-20 lg:pt-12 lg:pb-32">
      <div className="mx-auto w-full max-w-[1080px] px-5 md:px-8 lg:px-10">
        <div className="max-w-180">
          {/* The leading mark used to be a literal em dash in the markup, which
              is why it read as a rule rather than an arrow. lucide-react is
              already a project dependency (Slider, CertificatesSection), and
              ArrowLeft is the long-tailed form — ChevronLeft would give the
              head only. size-[1.1em] tracks the 12px type automatically and
              stroke inherits currentColor, so the arrow can never drift from
              the label's colour on hover or focus. */}
          <Link
            href={`/${locale}`}
            className="mb-8 inline-flex items-center gap-3 text-xs font-medium tracking-wide text-ink-400 uppercase transition-colors hover:text-brand-600 lg:mb-12"
          >
            <svg
              width="14"
              height="8"
              viewBox="0 0 22 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M21 5H1" />
              <path d="M5.5 1 1 5l4.5 4" />
            </svg>
            {backLabel}
          </Link>

          {doc ? (
            <ScrollReveal direction="fade">
              <h1 className="mb-8 text-3xl leading-snug font-normal text-ink-900 lg:mb-10 lg:text-4xl">
                {doc.title}
              </h1>
              {/* Sanitised HTML from the API, styled the same way FounderStory
                  and CareersBrands render their rich-text fields: Tailwind
                  arbitrary variants targeting the tags sanitizeRichText allows
                  through, rather than a second parser. Sizing here matches
                  what this page's paragraphs looked like before the API
                  integration (mb-4 text-sm leading-relaxed text-ink-600). */}
              <div
                className="[&_p]:mb-4 [&_p:last-child]:mb-0 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-ink-600 [&_strong]:font-semibold [&_b]:font-semibold [&_em]:italic [&_i]:italic [&_a]:text-brand-600 [&_a:hover]:underline"
                dangerouslySetInnerHTML={{ __html: doc.body }}
              />
            </ScrollReveal>
          ) : (
            <p className="text-sm leading-relaxed text-ink-600">
              {unavailableLabel}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
