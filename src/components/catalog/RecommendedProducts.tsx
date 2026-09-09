"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { BadgeVariant } from "@/components/ui";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/cn";

import ProductCard from "@/components/products/ProductCard";

import { CATALOG_SECTION_BLEED } from "./rowInset";

/** One recommended card, already resolved by the page. */
export interface RecommendedItem {
  key: string | number;
  title: string;
  image: string;
  href: string;
  badge?: { text: string; variant: BadgeVariant };
}

export interface RecommendedProductsProps {
  locale: Locale;
  items: RecommendedItem[];
  allCatalogLabel: string;
}

export default function RecommendedProducts({
  locale,
  allCatalogLabel,
  items,
}: RecommendedProductsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    function handleScroll() {
      const cards = Array.from(scroller!.children) as HTMLElement[];
      if (cards.length === 0) return;

      // One card plus one gap, taken from the live layout.
      const first = cards[0].getBoundingClientRect();
      const step =
        cards.length > 1
          ? cards[1].getBoundingClientRect().left - first.left
          : first.width;

      if (step <= 0) {
        setDotCount(1);
        setActiveIndex(0);
        return;
      }

      const visible = Math.max(1, Math.floor(scroller!.clientWidth / step));
      const stops = Math.max(1, cards.length - visible + 1);
      setDotCount(stops);
      setActiveIndex(
        Math.min(
          stops - 1,
          Math.max(0, Math.round(scroller!.scrollLeft / step)),
        ),
      );
    }

    handleScroll();
    scroller.addEventListener("scroll", handleScroll, { passive: true });
    // Recomputed on resize too, since how many cards fit decides the stop count.
    const observer = new ResizeObserver(handleScroll);
    observer.observe(scroller);
    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className={cn("mt-20 mb-20 pb-5", CATALOG_SECTION_BLEED)}>
      <div className="flex items-end justify-between gap-4">
        {/* Larger on mobile than on desktop, per the two references. */}
        <h2 className="text-[32px] leading-tight font-normal text-ink-900 lg:text-[28px]">
          Мы также рекомендуем
        </h2>

        <Link
          href={`/${locale}/catalog`}
          className="hidden shrink-0 text-[13px] font-medium tracking-wide text-ink-900 uppercase underline decoration-1 underline-offset-4 hover:text-brand-600 lg:block"
        >
          {allCatalogLabel}
        </Link>
      </div>

      <div
        ref={scrollerRef}
        className={cn(
          "mt-8 flex snap-x snap-mandatory gap-[10px] overflow-x-auto",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "lg:grid lg:grid-cols-4 lg:snap-none lg:overflow-visible",
        )}
      >
        {items.map((item) => (
          <div
            key={item.key}
            className="w-[44%] shrink-0 snap-start lg:w-auto lg:shrink"
          >
            <ProductCard
              variant="framed"
              href={item.href}
              image={item.image}
              title={item.title}
              badge={item.badge}
            />
          </div>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="mt-6 flex items-center justify-center gap-2 lg:hidden"
      >
        {Array.from({ length: dotCount }, (_, index) => (
          <span
            key={`snap-${index}`}
            className={cn(
              "h-2 w-2 rounded-full transition-colors duration-200",
              index === activeIndex ? "bg-brand-600" : "bg-ink-200",
            )}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center lg:hidden">
        <Link
          href={`/${locale}/catalog`}
          className="text-[15px] font-medium tracking-wide text-ink-900 uppercase underline decoration-1 underline-offset-4 hover:text-brand-600"
        >
          {allCatalogLabel}
        </Link>
      </div>
    </div>
  );
}
