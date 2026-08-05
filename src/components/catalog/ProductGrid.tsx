"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, ScrollReveal } from "@/components/ui";
import { catalogProducts } from "@/content/catalog";
import type { Locale } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/lib/i18n/dictionary";

import ProductCard from "./ProductCard";
import { CATALOG_ROW_INSET } from "./rowInset";

export interface ProductGridProps {
  locale: Locale;
  initialCategory?: string;
}

const FILTER_TABS: { slug: string; labelKey: TranslationKey }[] = [
  { slug: "all", labelKey: "buttons.allCatalog" },
  { slug: "croissants", labelKey: "categories.croissants" },
  { slug: "waffles", labelKey: "categories.waffles" },
  { slug: "candies", labelKey: "categories.candies" },
  { slug: "wafer-candies", labelKey: "categories.waferCandies" },
  { slug: "cookies", labelKey: "categories.cookies" },
];

const PAGE_SIZE = 10;

// Below md the six filters stay in this one container — splitting them into two
// wrappers would have to be undone at md to keep the desktop row intact — but
// they render as two blocks: `w-full` on the first item claims a whole line, so
// the five categories wrap beneath it and the row-gap becomes the space between
// the two. Where the categories break is left to justify-center and the column
// gap, so it re-flows with the type scale instead of being pinned.
const FILTER_ROW = "max-md:justify-center max-md:gap-x-10 max-md:gap-y-[22px]";

const FILTER_ALL =
  "max-md:w-full max-md:text-center max-md:text-[clamp(14px,4.2vw,17px)] max-md:font-normal max-md:text-ink-500";

const FILTER_CATEGORY =
  "max-md:text-[clamp(13px,3.8vw,16px)] max-md:font-normal max-md:text-ink-900";

function resolveInitialSlug(initialCategory?: string) {
  return FILTER_TABS.some((tab) => tab.slug === initialCategory)
    ? initialCategory!
    : "all";
}

export default function ProductGrid({
  locale,
  initialCategory,
}: ProductGridProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState(() =>
    resolveInitialSlug(initialCategory),
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (activeSlug === "all") return catalogProducts;
    return catalogProducts.filter(
      (product) => product.categorySlug === activeSlug,
    );
  }, [activeSlug]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function handleFilterChange(slug: string) {
    setActiveSlug(slug);
    setVisibleCount(PAGE_SIZE);

    const query = slug === "all" ? "" : `?category=${slug}`;
    router.replace(`/${locale}/catalog${query}`, { scroll: false });
  }

  return (
    <ScrollReveal direction="up">
      {/* Below md this stacks into a centred column 40px apart: the download
          link on top (order-first), then the filter block. The base
          `items-center` is what centres them — the filter container takes
          fit-content width, capped by the container, which is also what lets it
          wrap. flex-nowrap keeps the column from wrapping into a second one. */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-6 max-md:flex-col max-md:flex-nowrap max-md:gap-10">
        <div className={cn("flex flex-wrap gap-6", FILTER_ROW)}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              onClick={() => handleFilterChange(tab.slug)}
              className={cn(
                "text-sm transition-colors cursor-pointer",
                // Below md the ink is positional, not stateful: the catch-all
                // reads muted on its own line, the five categories read dark.
                // The underline stays the one moving active indicator.
                tab.slug === "all" ? FILTER_ALL : FILTER_CATEGORY,
                activeSlug === tab.slug
                  ? "font-medium text-ink-900 underline underline-offset-4"
                  : "text-ink-500 hover:text-ink-900",
              )}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        <a
          href="#"
          className="text-sm font-medium tracking-wide text-brand-600 uppercase underline decoration-1 underline-offset-4 hover:text-brand-700 max-md:order-first"
        >
          {t("buttons.downloadCatalog")}
        </a>
      </div>

      {/* 36px from the filter row down to the grid below md: the wrapper's own
          pb-6 (24) plus this 12. The inset is padding on this container, so the
          24px column gap between cards is unaffected. */}
      <div
        className={cn(
          "mt-10 grid grid-cols-2 gap-x-6 gap-y-10 max-md:mt-3 md:grid-cols-3 lg:grid-cols-5",
          CATALOG_ROW_INSET,
        )}
      >
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            href={`/${locale}/catalog/${product.categorySlug}/${product.slug}`}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            {t("buttons.showMoreProducts")}
          </Button>
        </div>
      )}
    </ScrollReveal>
  );
}
