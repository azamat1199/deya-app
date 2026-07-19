"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { newsPosts } from "@/content/news";
import type { Locale } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/useTranslation";

import BlogCard from "./BlogCard";

export interface BlogGridProps {
  locale: Locale;
}

const PAGE_SIZE = 8;

export default function BlogGrid({ locale }: BlogGridProps) {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visiblePosts = newsPosts.slice(0, visibleCount);
  const hasMore = visibleCount < newsPosts.length;

  return (
    <div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
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
        <div className="mt-14 flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            {t("buttons.showMoreNews")}
          </Button>
        </div>
      )}
    </div>
  );
}
