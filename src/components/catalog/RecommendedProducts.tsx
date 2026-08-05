"use client";

import Link from "next/link";

import { Slider } from "@/components/ui";
import { recommendedProducts } from "@/content/products";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/cn";

import ProductCard from "@/components/products/ProductCard";

import { CATALOG_SECTION_BLEED } from "./rowInset";

export interface RecommendedProductsProps {
  locale: Locale;
  allCatalogLabel: string;
}

export default function RecommendedProducts({
  locale,
  allCatalogLabel,
}: RecommendedProductsProps) {
  return (
    // The one container for the whole section: heading row and card row both
    // sit inside it, so the single px-10 it carries is the only boundary either
    // of them has. Nothing below adds its own horizontal padding.
    <div className={cn("mt-20", CATALOG_SECTION_BLEED)}>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-normal text-ink-900 md:text-3xl">
          Мы также рекомендуем
        </h2>
        <Link
          href={`/${locale}/catalog`}
          className="hidden shrink-0 text-xs font-medium tracking-wide text-ink-900 uppercase underline decoration-1 underline-offset-4 hover:text-brand-600 lg:block"
        >
          {allCatalogLabel}
        </Link>
      </div>

      {/* No inset of its own — it inherits the section container's. */}
      <Slider
        className="mt-8"
        items={recommendedProducts}
        slidesPerView={1.75}
        // 10px at every breakpoint, matching FeaturedProducts' gap-2.5 row.
        gap={10}
        breakpoints={{
          640: { slidesPerView: 2.3, gap: 10 },
          1024: { slidesPerView: 4, gap: 10 },
        }}
        showPagination
        renderSlide={(product) => (
          <ProductCard
            href={`/${locale}/catalog/${product.categorySlug}/${product.slug}`}
            image={product.image}
            title={product.title}
            badge={product.badge}
          />
        )}
        renderControls={({ selectedIndex, scrollSnaps, scrollTo }) => (
          <div className="mt-8 flex flex-col items-center gap-6 lg:hidden">
            <div className="flex items-center gap-2">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors duration-200",
                    index === selectedIndex
                      ? "bg-brand-600"
                      : "bg-ink-200 hover:bg-ink-300",
                  )}
                />
              ))}
            </div>

            <Link
              href={`/${locale}/catalog`}
              className="text-xs font-medium tracking-wide text-ink-900 uppercase underline decoration-1 underline-offset-4 hover:text-brand-600"
            >
              {allCatalogLabel}
            </Link>
          </div>
        )}
      />
    </div>
  );
}
