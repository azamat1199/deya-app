import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogBlocks from "@/components/blog/BlogBlocks";
import OtherArticles from "@/components/blog/OtherArticles";
import { Section } from "@/components/ui";
import { newsPosts } from "@/content/news";
import { formatPostDate } from "@/lib/formatDate";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type BlogPostPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function findPost(slug: string) {
  return newsPosts.find((post) => post.slug === slug);
}

// Only the slug: the [locale] layout already enumerates the locales, and Next
// crosses the two sets itself.
export function generateStaticParams() {
  return newsPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const post = findPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} — DEYA`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.cover],
    },
  };
}

/**
 * The reading column. Below 1024 it is simply the container's full width — the
 * Section's own padding is the only inset, so nothing is left over on the
 * right. From 1024 it moves left-of-centre on 20vw and the measure caps at
 * 835px; 58vw is what makes that cap bind rather than merely limit, so the
 * column is exactly 835 from 1440 up instead of tracking the viewport.
 * Everything on the page — back link, title, date, every block — is a child of
 * this one element, so they cannot drift out of alignment with each other.
 */
const COLUMN =
  "w-full min-[1024px]:ml-[20vw] min-[1024px]:w-[58vw] min-[1024px]:max-w-[835px]";

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const post = findPost(slug);
  if (!post) notFound();

  const dictionary = await getDictionary(locale as Locale);

  return (
    // The logo block hangs below the header bar; the page starts clear of the
    // block, not the bar. The header on this route is sticky — in flow — so its
    // own height is already accounted for above <main>.
    <Section
      bg="white"
      containerWidth="page"
      className="pt-[calc(var(--logo-overhang)_+_1.5rem)]"
    >
      <article className={COLUMN}>
        {/* A real Link, not router.back(): this has to point at the listing
            even when the post was opened cold from a shared URL. The arrow is
            a character in the copy, not an icon. */}
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.06em] text-ink-500 uppercase transition-colors hover:text-ink-900"
        >
          {/* Long, thin shaft with a small chevron head — deliberately not the
              "←" glyph, which is short and heavy at this size. currentColor so
              it picks up the link's hover state for free. items-center puts it
              on the line-box middle, which for this uppercase 11px text sits
              within 0.2px of the cap-height middle. */}
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
          {dictionary.buttons.backToList}
        </Link>

        <h1 className="mt-10 font-light text-[clamp(26px,2.6vw,34px)] leading-[1.15] tracking-[-0.02em] text-ink-900">
          {post.title}
        </h1>

        {/* dateTime carries the ISO value for machines; the visible string is
            formatted from it per locale, never stored pre-formatted. */}
        <time
          dateTime={post.date}
          className="mt-2.5 block text-[11px] text-ink-500"
        >
          {formatPostDate(post.date, locale as Locale)}
        </time>

        <BlogBlocks blocks={post.blocks} />
      </article>

      {/* Outside the reading column on purpose: this spans the page container,
          so its edges land on the same gutter as the header's content. */}
      <OtherArticles
        locale={locale as Locale}
        currentSlug={post.slug}
        heading={dictionary.blog.otherArticles}
        allNewsLabel={dictionary.buttons.allNews}
        readMoreLabel={dictionary.buttons.readMore}
      />
    </Section>
  );
}
