import Link from "next/link";

import { SectionHeading } from "@/components/ui";
import { homeContent } from "@/content/home";
import { newsPosts } from "@/content/news";
import type { Locale } from "@/lib/i18n/config";

export interface NewsTeaserProps {
  locale: Locale;
  allNewsLabel: string;
  readMoreLabel: string;
}

export default function NewsTeaser({ locale, allNewsLabel, readMoreLabel }: NewsTeaserProps) {
  return (
    <div>
      <SectionHeading
        title={homeContent.newsTeaser.heading}
        link={{ text: allNewsLabel, href: `/${locale}/blog` }}
      />

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {newsPosts.map((post) => (
          <div
            key={post.slug}
            className="border-line-100 px-0 pb-6 sm:px-6 sm:odd:border-r lg:border-r lg:px-8 lg:last:border-r-0"
          >
            <p className="text-xs text-ink-500">{post.date}</p>
            <h3 className="mt-3 text-xl text-brand-700">{post.title}</h3>
            <p className="mt-3 line-clamp-3 text-sm text-ink-500">{post.excerpt}</p>
            <Link
              href={`/${locale}/blog/${post.slug}`}
              className="mt-8 inline-block text-xs font-medium tracking-wide text-ink-500 uppercase underline decoration-1 underline-offset-4 transition-colors hover:text-brand-600"
            >
              {readMoreLabel}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}