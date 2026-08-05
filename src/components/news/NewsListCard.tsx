import Link from "next/link";

import { formatPostDate } from "@/lib/formatDate";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";

export interface NewsListCardProps {
  /** Used to build the title's id, which the link's accessible name points at. */
  id: string;
  href: string;
  /** ISO date; formatted here so no pre-formatted strings are stored. */
  date: string;
  title: string;
  excerpt: string;
  locale: Locale;
  readMoreLabel: string;
}

// Hairlines live on the grid items themselves (border-left / border-top on all
// but the first of a row) rather than on a pseudo-element or a striped
// background, so they follow the items when the grid rewraps and never paint on
// the outer edge. Each breakpoint's rules are scoped to its own band —
// `md:max-[1024px]:*` must not leak into the 4-column layout, where it would
// otherwise win on specificity because of the :nth-child() selectors.
export const NEWS_LIST_CELL_CLASSES = cn(
  "h-full border-hairline",
  // The grid has no gap and the 40px gutter is padding *inside* each column,
  // so the hairline sits exactly on the column boundary while neighbouring
  // columns keep 40px of air on either side of it. The padding is dropped on
  // the outer edges of each row so the first card's text starts on the same
  // vertical line as the section heading and the last card's ends on the same
  // line as the "all news" link.
  "md:px-10",
  // < 768 — single column: rule above every card but the first. No side
  // padding here: there are no vertical hairlines to align to, and 40px a side
  // would eat a third of a 360px screen.
  "border-t-[0.5px] py-8 first:border-t-0 first:pt-0 last:pb-0",
  // 768–1023 — 2x2: rule between the pair, and between the two rows.
  "md:max-[1024px]:border-t-0 md:max-[1024px]:py-0",
  "md:max-[1024px]:even:border-l-[0.5px]",
  // 2x2: the odd card is at the row's left edge, the even one at its right.
  "md:max-[1024px]:odd:pl-0 md:max-[1024px]:even:pr-0",
  "md:max-[1024px]:[&:nth-child(-n+2)]:pb-10",
  "md:max-[1024px]:[&:nth-child(n+3)]:border-t-[0.5px] md:max-[1024px]:[&:nth-child(n+3)]:pt-10",
  // >= 1024 — one row of four: rule left of every card but the first.
  "min-[1024px]:border-t-0 min-[1024px]:py-0",
  "min-[1024px]:border-l-[0.5px] min-[1024px]:first:border-l-0",
  "min-[1024px]:first:pl-0 min-[1024px]:last:pr-0",
);

export const NEWS_LIST_GRID_CLASSES =
  "grid grid-cols-1 md:grid-cols-2 min-[1024px]:grid-cols-4";

/** Shared by the section headers that sit above a NewsListCard grid. */
export const ALL_NEWS_LINK_CLASSES =
  "text-xs font-medium tracking-[0.08em] text-ink-900 uppercase underline decoration-1 underline-offset-6 transition-colors duration-150 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 motion-reduce:transition-none";

/**
 * The imageless news card: date, red title, three-line excerpt and a read-more
 * label pinned to the bottom. Lifted verbatim out of NewsTeaser, which was the
 * only place it existed, so that section renders byte-for-byte as before.
 *
 * Distinct from components/blog/BlogCard, which carries a cover image.
 */
export default function NewsListCard({
  id,
  href,
  date,
  title,
  excerpt,
  locale,
  readMoreLabel,
}: NewsListCardProps) {
  const titleId = `news-teaser-${id}`;

  return (
    <article className="h-full">
      {/* The whole card is the link; aria-labelledby pins its accessible name
          to the title so the date, excerpt and read-more text aren't read out
          as part of it. */}
      <Link
        href={href}
        aria-labelledby={titleId}
        className="group flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
      >
        <time dateTime={date} className="text-xs text-ink-400">
          {formatPostDate(date, locale)}
        </time>
        <h3
          id={titleId}
          className="mt-3 text-[21px] leading-[1.3] font-normal text-brand-600 transition-colors duration-150 group-hover:text-brand-700 motion-reduce:transition-none"
        >
          {title}
        </h3>
        <p className="mt-3 line-clamp-3 text-[15px] leading-[1.55] text-ink-700">
          {excerpt}
        </p>
        {/* mt-auto pushes this to the bottom of the equal-height flex column,
            so all four align on one baseline however long the titles run. */}
        <span
          aria-hidden="true"
          className="mt-auto inline-block pt-8 text-xs font-medium tracking-[0.08em] text-ink-900 uppercase underline decoration-1 underline-offset-6 transition-[text-decoration-thickness] duration-150 group-hover:decoration-2 motion-reduce:transition-none"
        >
          {readMoreLabel}
        </span>
      </Link>
    </article>
  );
}
