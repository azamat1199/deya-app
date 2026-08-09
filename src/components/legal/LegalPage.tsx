import type { ReactNode } from "react";
import Link from "next/link";

import { ScrollReveal } from "@/components/ui";
import type { LegalBlock, LegalPageContent } from "@/content/legal/types";
import type { Locale } from "@/lib/i18n/config";

const URL_OR_EMAIL = /(https?:\/\/[^\s]+|[\w.-]+@[\w.-]+\.\w+)/g;

function renderTextWithLinks(text: string): ReactNode[] {
  return text.split(URL_OR_EMAIL).map((part, index) => {
    if (!part) return null;
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 hover:underline"
        >
          {part}
        </a>
      );
    }
    if (/^[\w.-]+@[\w.-]+\.\w+$/.test(part)) {
      return (
        <a
          key={index}
          href={`mailto:${part}`}
          className="text-brand-600 hover:underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function LegalBlocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p
              key={index}
              className="mb-4 text-sm leading-relaxed text-ink-600"
            >
              {renderTextWithLinks(block.text)}
            </p>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={index} className="mb-4">
              {block.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="mb-1 text-sm leading-relaxed text-ink-600"
                >
                  — {renderTextWithLinks(item)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <div key={index}>
            <h2 className="mt-6 mb-2 text-sm font-semibold text-ink-900">
              {block.heading}
            </h2>
            <LegalBlocks blocks={block.blocks} />
          </div>
        );
      })}
    </>
  );
}

export interface LegalPageProps {
  content: LegalPageContent;
  locale: Locale;
  backLabel: string;
}

export default function LegalPage({
  content,
  locale,
  backLabel,
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

          <ScrollReveal direction="fade">
            <h1 className="mb-8 text-3xl leading-snug font-normal text-ink-900 lg:mb-10 lg:text-4xl">
              {content.title}
            </h1>
            <LegalBlocks blocks={content.blocks} />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
