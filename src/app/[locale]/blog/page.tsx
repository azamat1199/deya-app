import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogGrid, { type BlogGridPost } from "@/components/blog/BlogGrid";
import { Section } from "@/components/ui";
import { blogContent } from "@/content/blog";
import { newsPosts } from "@/content/news";
import { IMAGES } from "@/content/images";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getPosts, type PostSummary } from "@/lib/posts";

/**
 * One request, a generous page_size — never a loop over every page. The grid's
 * existing load-more then pages through this set client-side exactly as before.
 */
const PAGE_SIZE = 100;

/**
 * The hand-authored posts, kept ONLY for a fetch failure. An empty API result
 * is a genuine empty state, not a reason to show fake articles. Each entry
 * carries a key so React never sees an undefined one.
 */
const STATIC_POSTS: BlogGridPost[] = newsPosts.map((post) => ({
  key: post.slug,
  post,
}));

function toGridPost(summary: PostSummary): BlogGridPost {
  return {
    key: summary.id,
    post: {
      slug: summary.slug,
      // BlogCard formats this per locale; the raw ISO value is passed through.
      date: summary.published_at,
      title: summary.title,
      // An empty excerpt renders an empty line, so it is omitted instead.
      excerpt: summary.excerpt,
      // Empty cover falls back to the existing placeholder rather than handing
      // next/image an empty src.
      cover: summary.cover || IMAGES.placeholder,
      blocks: [],
    },
  };
}

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = await getDictionary(locale);
  return { title: `${dictionary.nav.news} — DEYA` };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  let fetched: PostSummary[] = [];
  let total = 0;
  let failed = false;
  try {
    const result = await getPosts({ locale, page: 1, pageSize: PAGE_SIZE });
    fetched = result.posts;
    total = result.count;
  } catch (error) {
    failed = true;
    console.error(
      "[BlogPage] GET posts failed, falling back to static content —",
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
  }

  // Only a FAILURE substitutes the static posts. An empty result stays empty.
  const posts = failed ? STATIC_POSTS : fetched.map(toGridPost);

  // The grid pages through one request's worth; anything past it is unreachable
  // without pagination UI this brief forbids inventing.
  if (!failed && total > fetched.length) {
    console.warn(
      `[BlogPage] ${total} posts exist but only ${fetched.length} were fetched (page_size ${PAGE_SIZE}); the rest are unreachable without pagination wiring.`,
    );
  }

  return (
    // containerWidth="page" is the `.container-page` utility the Header itself
    // uses, so the first card's left edge and the last card's right edge land
    // on exactly the same x as the logo block and the phone button. "home" is a
    // different container (max-w-1440, lg:px-20) and was inset 40px further in.
    <Section bg="white" containerWidth="page">
      <div className="flex justify-center">
        <h1 className="mt-14 text-3xl font-normal text-ink-900 lg:text-4xl">
          {blogContent.heading}
        </h1>
      </div>
      <div className="mt-10 lg:mt-14">
        <BlogGrid
          locale={locale as Locale}
          posts={posts}
          emptyLabel={dictionary.home.newsTeaser.empty}
        />
      </div>
    </Section>
  );
}
