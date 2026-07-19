import Image from "next/image";
import Link from "next/link";

import { ScrollReveal, Stat } from "@/components/ui";
import { homeContent } from "@/content/home";
import { stats } from "@/content/stats";
import type { Locale } from "@/lib/i18n/config";
import { withEmphasis } from "@/lib/withEmphasis";

export interface AboutPreviewProps {
  locale: Locale;
}

export default function AboutPreview({ locale }: AboutPreviewProps) {
  const {
    eyebrow,
    heading,
    paragraphs,
    paragraphHighlights,
    linkLabel,
    linkHref,
    factoryImage,
  } = homeContent.about;

  return (
    <div className="py-[10px] lg:py-[10px]">
      <ScrollReveal direction="up">
        <div className="pt-16 pb-12 lg:pt-32 lg:pb-16">
          <p className="mb-4 text-xs font-normal tracking-[0.2em] text-ink-400 uppercase">
            {eyebrow}
          </p>
          <h2 className="mb-8 max-w-2xl text-2xl leading-snug font-light text-ink-900 lg:mb-12 lg:text-4xl">
            {heading}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-12 lg:gap-24">
            <p className="text-sm leading-relaxed text-ink-700 lg:text-base">
              {withEmphasis(
                paragraphs[0],
                paragraphHighlights,
                "font-semibold text-ink-900",
              )}
            </p>
            <div className="space-y-6">
              <p className="text-sm leading-relaxed text-ink-700 lg:text-base">
                {paragraphs[1]}
              </p>
              <Link
                href={`/${locale}${linkHref}`}
                className="inline-block text-sm font-medium tracking-wide text-ink-900 uppercase underline decoration-1 underline-offset-4 transition-colors hover:text-brand-600"
              >
                {linkLabel}
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="fade">
        <div className="relative left-1/2 right-1/2 w-screen -mx-[50vw]">
          <div className="relative h-[500px] overflow-hidden md:h-[600px] lg:h-[700px] xl:h-[800px]">
            <Image
              src={factoryImage}
              alt="Кондитерская фабрика Deya"
              fill
              sizes="100vw"
              className="object-fill"
            />

            <div className="absolute inset-x-0 top-0 z-10 h-[200px] bg-linear-to-b from-white via-white/80 to-transparent lg:h-[250px]" />
            <div className="absolute inset-x-0 top-0 z-20">
              <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-20">
                <div className="grid grid-cols-2 gap-y-6 pt-8 md:flex md:gap-y-0 md:divide-x md:divide-line-200/50 lg:pt-12">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center md:flex-1 md:px-6 md:py-8 md:first:pl-0 lg:py-12"
                    >
                      <Stat {...stat} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
