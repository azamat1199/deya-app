import Link from "next/link";

import { ScrollReveal, SectionHeading } from "@/components/ui";
import { homeContent } from "@/content/home";
import { newsPosts } from "@/content/news";
import type { Locale } from "@/lib/i18n/config";
import { formatPostDate } from "@/lib/formatDate";
import { cn } from "@/lib/cn";

export interface NewsTeaserProps {
  locale: Locale;
  allNewsLabel: string;
  readMoreLabel: string;
}

export default function NewsTeaser({
  locale,
  allNewsLabel,
  readMoreLabel,
}: NewsTeaserProps) {
  return (
    <div className="pt-16 pb-12 lg:pt-32 lg:pb-16">
      <ScrollReveal direction="up">
        <SectionHeading
          title={homeContent.newsTeaser.heading}
          link={{ text: allNewsLabel, href: `/${locale}/blog` }}
        />
        <div className="mt-10 grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:gap-y-0">
          {newsPosts.map((post, index) => (
            <ScrollReveal key={post.slug} direction="up" delay={index * 0.1}>
              <div
                className={cn(
                  "flex h-full flex-col border-line-100 px-4",
                  "odd:border-r lg:border-r lg:px-6 lg:last:border-r-0",
                )}
              >
                <p className="text-xs text-ink-500">
                  {formatPostDate(post.date, locale)}
                </p>
                <h3 className="mt-3 line-clamp-2 text-xl leading-snug text-brand-600">
                  {post.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm text-ink-500">
                  {post.excerpt}
                </p>
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="mt-auto inline-block pt-8 text-xs font-medium tracking-wide text-ink-900 uppercase underline decoration-1 underline-offset-4 transition-colors hover:text-brand-600"
                >
                  {readMoreLabel}
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}
