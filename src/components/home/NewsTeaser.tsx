// Required by the mobile branch: Slider is a client component and renderSlide
// is a function, which cannot cross the server/client boundary as a prop.
// CareersAbout carries the same directive for the same reason.
"use client";

import Link from "next/link";

import NewsListCard, {
  ALL_NEWS_LINK_CLASSES,
  NEWS_LIST_CELL_CLASSES,
  NEWS_LIST_GRID_CLASSES,
} from "@/components/news/NewsListCard";
import { ScrollReveal, Slider } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { NewsTeaserItem, NewsTeaserProps } from "./NewsTeaser.types";

export type { NewsTeaserItem, NewsTeaserProps } from "./NewsTeaser.types";

/**
 * The home teaser shows the newest four only. Applied here rather than in
 * content/news.ts because that array is also read by the blog listing, the
 * blog detail route and OtherArticles, all of which need the full twelve.
 * NewsTeaser has exactly one consumer — the home page — so scoping the limit
 * to this component is equivalent to scoping it to that usage.
 */
const HOME_NEWS_LIMIT = 4;

export default function NewsTeaser({
  items,
  locale,
  heading,
  allNewsHref,
  allNewsLabel,
  readMoreLabel,
  emptyLabel,
}: NewsTeaserProps) {
  const visibleItems = items.slice(0, HOME_NEWS_LIMIT);

  // One definition of the card for both branches, so the slider and the grid
  // can never drift apart.
  const renderCard = (item: NewsTeaserItem) => (
    <NewsListCard
      id={item.id}
      href={item.href}
      date={item.date}
      title={item.title}
      excerpt={item.excerpt}
      locale={locale}
      readMoreLabel={readMoreLabel}
    />
  );

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

      {visibleItems.length === 0 ? (
        <ScrollReveal direction="fade">
          <p className="mt-10 text-sm text-ink-500 min-[1024px]:mt-[90px]">
            {emptyLabel}
          </p>
        </ScrollReveal>
      ) : (
        <>
          {/* Phone: one card per view, swipe-driven with dot pagination —
              the same two-branch shape CareersAbout uses. Dragging is embla's
              own behaviour, so there are no gesture handlers here. The cell
              classes are deliberately absent: they draw the rules between
              stacked cards, which a one-per-view carousel has no use for. */}
          <div className="mt-10 md:hidden">
            <Slider
              items={visibleItems}
              slidesPerView={1}
              gap={10}
              showPagination
              renderSlide={renderCard}
            />
          </div>

          {/* Tablet/desktop: the existing grid, unchanged. The show/hide lives
              on a wrapper rather than on the grid itself — `hidden md:block`
              on the grid would override its own display:grid and collapse the
              columns. */}
          <div className="hidden md:block">
            <div
              className={cn(
                "mt-10 min-[1024px]:mt-[90px]",
                NEWS_LIST_GRID_CLASSES,
              )}
            >
              {visibleItems.map((item, index) => (
                <ScrollReveal
                  key={item.id}
                  direction="up"
                  delay={index * 0.08}
                  className={NEWS_LIST_CELL_CLASSES}
                >
                  {renderCard(item)}
                </ScrollReveal>
              ))}
            </div>
          </div>
        </>
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
