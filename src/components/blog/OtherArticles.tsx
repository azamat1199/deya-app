"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import NewsListCard, {
  ALL_NEWS_LINK_CLASSES,
  NEWS_LIST_CELL_CLASSES,
  NEWS_LIST_GRID_CLASSES,
} from "@/components/news/NewsListCard";
import { newsPosts } from "@/content/news";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";

export interface OtherArticlesProps {
  locale: Locale;
  /** The post being read — never offered back to the reader. */
  currentSlug: string;
  heading: string;
  allNewsLabel: string;
  readMoreLabel: string;
}

const RELATED_COUNT = 4;

// Below md the grid becomes a one-up scroll-snap track. Native scrolling only:
// no touch handlers, no preventDefault, so horizontal swipe keeps the OS feel
// and vertical page scrolling is never blocked. scroll-p-5 matches the
// container's 20px gutter so the first and last slides rest on it rather than
// flush against the viewport edge.
const TRACK_MOBILE = cn(
  "max-md:flex max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto",
  "max-md:scroll-p-5 max-md:scrollbar-none",
  "max-md:[-webkit-overflow-scrolling:touch]",
);

// One-up slides, and no hairlines: a single-column carousel has no column
// boundaries to divide.
const SLIDE_MOBILE =
  "max-md:w-full max-md:shrink-0 max-md:basis-full max-md:snap-center max-md:border-t-0 max-md:py-0";

export default function OtherArticles({
  locale,
  currentSlug,
  heading,
  allNewsLabel,
  readMoreLabel,
}: OtherArticlesProps) {
  // Filter first, then sort, then take: sorting a copy keeps the exported
  // array's order intact for every other consumer. If fewer than four remain
  // the grid simply renders fewer cells — the column count is fixed, so the
  // cards never stretch to fill.
  const related = useMemo(
    () =>
      newsPosts
        .filter((post) => post.slug !== currentSlug)
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, RELATED_COUNT),
    [currentSlug],
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // The dots read the scroll position rather than a click counter, so a swipe
  // and a tap can never disagree about which slide is showing.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = slideRefs.current.indexOf(
            entry.target as HTMLDivElement,
          );
          if (index !== -1) setActiveIndex(index);
        }
      },
      { root: track, threshold: 0.6 },
    );

    for (const slide of slideRefs.current) {
      if (slide) observer.observe(slide);
    }
    return () => observer.disconnect();
  }, [related.length]);

  const goToSlide = useCallback((index: number) => {
    const instant = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    slideRefs.current[index]?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: instant ? "auto" : "smooth",
    });
  }, []);

  if (related.length === 0) return null;

  const allNewsHref = `/${locale}/blog`;

  return (
    // No bottom margin: the section butts straight up against the footer's
    // solid top strip.
    <section className="mt-24 pb-16">
      {/* items-baseline so the small uppercase link sits on the heading's
          baseline. Below md the heading stands alone on its own line and the
          "all news" link moves down beside the card's read-more. */}
      <div className="flex items-baseline justify-between gap-6 max-md:block">
        <h2 className="text-[26px] leading-tight font-light text-ink-900">
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

      <div
        ref={trackRef}
        className={cn(
          "mt-10 min-[1024px]:mt-[72px]",
          NEWS_LIST_GRID_CLASSES,
          TRACK_MOBILE,
        )}
      >
        {related.map((post, index) => (
          <div
            key={post.slug}
            ref={(el) => {
              slideRefs.current[index] = el;
            }}
            className={cn(NEWS_LIST_CELL_CLASSES, SLIDE_MOBILE)}
          >
            <NewsListCard
              id={post.slug}
              href={`/${locale}/blog/${post.slug}`}
              date={post.date}
              title={post.title}
              excerpt={post.excerpt}
              locale={locale}
              readMoreLabel={readMoreLabel}
            />
          </div>
        ))}
      </div>

      {/* Mobile only. -1lh lifts this onto the card's own read-more line: that
          label is the card's last line and lives inside the card's <Link>, so
          the two cannot share a flex row without nesting an <a>. One line
          height, not a tuned pixel value, so it tracks the type scale. */}
      <div className="flex justify-end text-xs md:hidden">
        <Link
          href={allNewsHref}
          className={cn("-mt-[1lh]", ALL_NEWS_LINK_CLASSES)}
        >
          {allNewsLabel}
        </Link>
      </div>

      {/* Dot count is derived from the slides actually rendered. */}
      <div
        role="tablist"
        aria-label={heading}
        className="mt-8 flex items-center justify-center gap-2.5 md:hidden"
      >
        {related.map((post, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={post.slug}
              type="button"
              role="tab"
              aria-label={post.title}
              aria-selected={isActive}
              aria-current={isActive ? "true" : undefined}
              onClick={() => goToSlide(index)}
              // The visual dot stays small; the button pads out to a 32px-tall
              // target around it rather than being enlarged.
              className="flex h-8 items-center justify-center px-[5px]"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "block rounded-full transition-all duration-200 motion-reduce:transition-none",
                  isActive
                    ? "size-[5px] bg-brand-600 ring-1 ring-brand-600 ring-offset-1 ring-offset-white"
                    : "size-[7px] bg-ink-200",
                )}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
