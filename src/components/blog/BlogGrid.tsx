"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui";
import type { NewsPost } from "@/content/types";
import type { Locale } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/useTranslation";

import BlogCard from "./BlogCard";

export interface BlogGridProps {
  locale: Locale;
  /**
   * Posts to render, already fetched, normalised and sorted by the page.
   * REQUIRED and deliberately without a default: a default would silently mask
   * a missing prop and let mock articles render while the fetch logs looked
   * healthy.
   */
  posts: BlogGridPost[];
  /** Shown instead of the grid when there are no posts at all. */
  emptyLabel: string;
}

/** A card's data plus the stable key it is rendered with (the API id). */
export interface BlogGridPost {
  key: string | number;
  post: NewsPost;
}

const POSTS_PER_PAGE = 8;

export default function BlogGrid({
  locale,
  posts,
  emptyLabel,
}: BlogGridProps) {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const gridRef = useRef<HTMLDivElement>(null);
  // Index of the first card of the batch just revealed, parked between the
  // click and the commit that renders it.
  const pendingFocusRef = useRef<number | null>(null);

  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  function showMore() {
    pendingFocusRef.current = visibleCount;
    setVisibleCount((count) => count + POSTS_PER_PAGE);
  }

  // Send focus into the new batch so a keyboard or screen-reader user lands on
  // what just arrived rather than on a button that may have disappeared.
  useEffect(() => {
    const index = pendingFocusRef.current;
    if (index === null) return;
    pendingFocusRef.current = null;
    gridRef.current?.children[index]
      ?.querySelector<HTMLAnchorElement>("a[href]")
      ?.focus();
  }, [visibleCount]);

  // An honest empty state — never mock articles.
  if (posts.length === 0) {
    return <p className="text-sm text-ink-500">{emptyLabel}</p>;
  }

  return (
    <div>
      {/* aria-live sits on the grid itself rather than wrapping only the new
          batch: a second element would be a second grid container, and the
          appended cards would start their own row flow instead of continuing
          the existing one. Additions inside a polite region are announced
          either way. */}
      <div
        ref={gridRef}
        aria-live="polite"
        className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-4 mb-14"
      >
        {visiblePosts.map((item) => (
          <BlogCard
            key={item.key}
            post={item.post}
            href={`/${locale}/blog/${item.post.slug}`}
            readMoreLabel={t("buttons.readMore")}
            locale={locale}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-14 flex justify-center mb-14">
          <Button variant="primary" size="lg" onClick={showMore}>
            {t("buttons.showMoreNews")}
          </Button>
        </div>
      )}
    </div>
  );
}
