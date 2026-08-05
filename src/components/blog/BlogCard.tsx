import Image from "next/image";
import Link from "next/link";

import type { NewsPost } from "@/content/types";
import type { Locale } from "@/lib/i18n/config";
import { formatPostDate } from "@/lib/formatDate";
import { cn } from "@/lib/cn";

export interface BlogCardProps {
  post: NewsPost;
  href: string;
  readMoreLabel: string;
  locale: Locale;
}

// The two hover variants are gated on the capability query rather than a
// breakpoint: a touch tablet at 1024px matches `md:` but not `hover: hover`, and
// there the zoom would fire on tap and stay stuck afterwards, because nothing
// ever un-hovers.
//
// Written out in full rather than composed from a constant — Tailwind extracts
// candidates from the source text, so an interpolated variant is never
// generated and the zoom silently does nothing.
const IMAGE_CLASSES = cn(
  "object-cover will-change-transform",
  // transform only — the frame around it never changes size, so no neighbouring
  // card can be pushed by a pixel.
  "transition-transform duration-500 ease-in-out",
  // motion-safe, not a motion-reduce override: an override loses to the
  // arbitrary media variant on cascade order and the image still scaled. Nested
  // inside the query, the rule simply never generates under reduced motion.
  "[@media(hover:hover)_and_(pointer:fine)]:motion-safe:group-hover:scale-105",
  "[@media(hover:hover)_and_(pointer:fine)]:motion-safe:group-focus-visible:scale-105",
  "motion-reduce:transition-none",
);

export default function BlogCard({
  post,
  href,
  readMoreLabel,
  locale,
}: BlogCardProps) {
  const titleId = `blog-card-${post.slug}`;

  return (
    // The whole card is the link, so the image, title and excerpt are clickable
    // too — including on touch, where there is no hover affordance to hint that
    // only one line was. aria-labelledby pins the accessible name to the title
    // so the date and excerpt are not read out as part of it.
    <Link
      href={href}
      aria-labelledby={titleId}
      className="group block cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-light">
        <Image
          src={post.cover}
          alt={post.title}
          fill
          sizes="(min-width: 1200px) 25vw, (min-width: 768px) 50vw, 100vw"
          className={IMAGE_CLASSES}
        />
      </div>
      <p className="mt-4 text-xs text-ink-500">
        {formatPostDate(post.date, locale)}
      </p>
      <h3 id={titleId} className="mt-2 text-xl text-brand-700">
        {post.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm text-ink-500">{post.excerpt}</p>
      {/* A span, not a nested <Link> — an <a> cannot contain an <a>. Identical
          classes, with the hover colour moved onto the card's group so it still
          responds. aria-hidden so it is not announced once per card. */}
      <span
        aria-hidden="true"
        className="mt-4 inline-block text-xs font-medium tracking-wide text-ink-500 uppercase underline decoration-1 underline-offset-4 transition-colors group-hover:text-brand-600"
      >
        {readMoreLabel}
      </span>
    </Link>
  );
}
