import Link from "next/link";

import { ScrollReveal } from "@/components/ui";
import { formatPostDate } from "@/lib/formatDate";
import { cn } from "@/lib/cn";
import type { NewsTeaserProps } from "./NewsTeaser.types";

export type { NewsTeaserItem, NewsTeaserProps } from "./NewsTeaser.types";

const ALL_NEWS_LINK_CLASSES =
  "text-xs font-medium tracking-[0.08em] text-ink-900 uppercase underline decoration-1 underline-offset-6 transition-colors duration-150 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 motion-reduce:transition-none";

// Hairlines live on the grid items themselves (border-left / border-top on all
// but the first of a row) rather than on a pseudo-element or a striped
// background, so they follow the items when the grid rewraps and never paint on
// the outer edge. Each breakpoint's rules are scoped to its own band —
// `md:max-[1024px]:*` must not leak into the 4-column layout, where it would
// otherwise win on specificity because of the :nth-child() selectors.
const CARD_CELL_CLASSES = cn(
  "h-full border-hairline",
  // The grid has no gap and the 40px gutter is padding *inside* each column,
  // so the hairline sits exactly on the column boundary while neighbouring
  // columns keep 40px of air on either side of it. The padding is dropped on
  // the outer edges of each row so the first card's text starts on the same
  // vertical line as the section heading and the last card's ends on the same
  // line as "ВСЕ НОВОСТИ".
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

export default function NewsTeaser({
  items,
  locale,
  heading,
  allNewsHref,
  allNewsLabel,
  readMoreLabel,
  emptyLabel,
}: NewsTeaserProps) {
  return (
    // No bottom margin: the section butts straight up against the footer's
    // solid top strip.
    <div className="pt-16 pb-12 lg:pt-32 lg:pb-16">
      <ScrollReveal direction="up">
        {/* items-baseline so the small uppercase link sits on the h2's baseline
            rather than being centred against its much larger line box. */}
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="text-3xl leading-tight font-light text-ink-900 lg:text-[38px]">
            {heading}
          </h2>
          <Link
            href={allNewsHref}
            className={cn(
              "hidden shrink-0 md:inline-block",
              ALL_NEWS_LINK_CLASSES,
            )}
          >
            {allNewsLabel}
          </Link>
        </div>
      </ScrollReveal>

      {items.length === 0 ? (
        <ScrollReveal direction="fade">
          <p className="mt-10 text-sm text-ink-500 min-[1024px]:mt-[90px]">
            {emptyLabel}
          </p>
        </ScrollReveal>
      ) : (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 min-[1024px]:mt-[90px] min-[1024px]:grid-cols-4">
          {items.map((item, index) => {
            const titleId = `news-teaser-${item.id}`;
            return (
              <ScrollReveal
                key={item.id}
                direction="up"
                delay={index * 0.08}
                className={CARD_CELL_CLASSES}
              >
                <article className="h-full">
                  {/* The whole card is the link; aria-labelledby pins its
                      accessible name to the title so the date, excerpt and
                      read-more text aren't read out as part of it. */}
                  <Link
                    href={item.href}
                    aria-labelledby={titleId}
                    className="group flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                  >
                    <time dateTime={item.date} className="text-xs text-ink-400">
                      {formatPostDate(item.date, locale)}
                    </time>
                    <h3
                      id={titleId}
                      className="mt-3 text-[21px] leading-[1.3] font-normal text-brand-600 transition-colors duration-150 group-hover:text-brand-700 motion-reduce:transition-none"
                    >
                      {item.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-[15px] leading-[1.55] text-ink-700">
                      {item.excerpt}
                    </p>
                    {/* mt-auto pushes this to the bottom of the equal-height
                        flex column, so all four align on one baseline however
                        long the titles run. */}
                    <span
                      aria-hidden="true"
                      className="mt-auto inline-block pt-8 text-xs font-medium tracking-[0.08em] text-ink-900 uppercase underline decoration-1 underline-offset-6 transition-[text-decoration-thickness] duration-150 group-hover:decoration-2 motion-reduce:transition-none"
                    >
                      {readMoreLabel}
                    </span>
                  </Link>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      {/* Below 768 the header link moves under the list as a full-width,
          centred link. */}
      <Link
        href={allNewsHref}
        className={cn(
          "mt-12 block text-center md:hidden",
          ALL_NEWS_LINK_CLASSES,
        )}
      >
        {allNewsLabel}
      </Link>
    </div>
  );
}
