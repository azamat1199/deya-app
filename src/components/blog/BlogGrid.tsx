"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui";
import { newsPosts } from "@/content/news";
import type { Locale } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/useTranslation";

import BlogCard from "./BlogCard";

export interface BlogGridProps {
  locale: Locale;
}

const POSTS_PER_PAGE = 8;

export default function BlogGrid({ locale }: BlogGridProps) {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const gridRef = useRef<HTMLDivElement>(null);
  // Index of the first card of the batch just revealed, parked between the
  // click and the commit that renders it.
  const pendingFocusRef = useRef<number | null>(null);

  const visiblePosts = newsPosts.slice(0, visibleCount);
  const hasMore = visibleCount < newsPosts.length;

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
        {visiblePosts.map((post) => (
          <BlogCard
            key={post.slug}
            post={post}
            href={`/${locale}/blog/${post.slug}`}
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
