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

function resolveInitialSlug(initialCategory?: string) {
  return FILTER_TABS.some((tab) => tab.slug === initialCategory) ? initialCategory! : "all";
}

export default function ProductGrid({ locale, initialCategory }: ProductGridProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState(() => resolveInitialSlug(initialCategory));
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (activeSlug === "all") return catalogProducts;
    return catalogProducts.filter((product) => product.categorySlug === activeSlug);
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
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-line-200 pb-6">
        <div className="flex flex-wrap gap-6">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              onClick={() => handleFilterChange(tab.slug)}
              className={cn(
                "text-sm transition-colors",
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
          className="text-sm font-medium tracking-wide text-brand-600 uppercase underline decoration-1 underline-offset-4 hover:text-brand-700"
        >
          {t("buttons.downloadCatalog")}
        </a>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
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
