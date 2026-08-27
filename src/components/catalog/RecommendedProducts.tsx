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
  /** React key — the API product id. Never an array index. */
  key: string | number;
  title: string;
  image: string;
  href: string;
  /** Absent renders no chip at all; the slot still reserves its height. */
  badge?: { text: string; variant: BadgeVariant };
}

export interface RecommendedProductsProps {
  locale: Locale;
  /**
   * The related products, already fetched, mapped and capped by the page.
   * REQUIRED and deliberately without a default: a default would silently mask
   * a missing prop and let stale content render while the fetch logs looked
   * healthy. The page does not render this component at all when the list is
   * empty, so this is never an empty array in practice.
   */
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

  // One dot per SNAP POSITION, measured rather than hardcoded — the design
  // mock's five dots were a placeholder.
  //
  // Not one dot per product: two cards are visible at once, so the last card
  // can never scroll flush to the left edge and its dot would be permanently
  // unreachable. The reachable stops are (products - visible + 1), which is
  // exactly what the browser's scroll-snap lands on.
  //
  // Below lg the row is a scroll-snap carousel; from lg up it is a plain grid
  // with no scrolling, so nothing here has any effect there.
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
        Math.min(stops - 1, Math.max(0, Math.round(scroller!.scrollLeft / step))),
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
    // The one container for the whole section: heading row and card row both
    // sit inside it, so the single px-10 it carries is the only boundary either
    // of them has. Nothing below adds its own horizontal padding.
    <div className={cn("mt-20 pb-5", CATALOG_SECTION_BLEED)}>
      <div className="flex items-end justify-between gap-4">
        {/* Larger on mobile than on desktop, per the two references. */}
        <h2 className="text-[32px] leading-tight font-normal text-ink-900 lg:text-[28px]">
          Мы также рекомендуем
        </h2>

        {/* Desktop only: top-right, on the heading's baseline row. On mobile
            this link moves below the dots instead. */}
        <Link
          href={`/${locale}/catalog`}
          className="hidden shrink-0 text-[13px] font-medium tracking-wide text-ink-900 uppercase underline decoration-1 underline-offset-4 hover:text-brand-600 lg:block"
        >
          {allCatalogLabel}
        </Link>
      </div>

      {/*
        One element, two behaviours:
          < lg  flex + overflow-x-auto + snap-x  -> the carousel the design wants
          >= lg grid-cols-4 + overflow-visible   -> a static row, no scrolling
        The desktop scroll came from this being an embla Slider; replacing it
        with CSS scroll-snap is what removes the scroll at desktop widths
        without needing to hide a scrollbar.
      */}
      <div
        ref={scrollerRef}
        className={cn(
          "mt-8 flex snap-x snap-mandatory gap-[10px] overflow-x-auto",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "lg:grid lg:grid-cols-4 lg:snap-none lg:overflow-visible",
        )}
      >
        {items.map((item) => (
          // 44% leaves two cards fully visible with ~14% of the third showing
          // past the right edge — the peek is deliberate, signalling more
          // content. Two cards plus one 10px gap span 318 of a 350px viewport,
          // so 22px of the third remains. From lg up the grid owns the width
          // and this releases it.
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

      {/* Dots: mobile only, one per product, decorative. They report scroll
          position rather than accepting input, so they are aria-hidden and are
          not buttons — the carousel is already reachable by swiping and by
          keyboard scrolling. */}
      <div
        aria-hidden="true"
        className="mt-6 flex items-center justify-center gap-2 lg:hidden"
      >
        {Array.from({ length: dotCount }, (_, index) => (
          // The snap position IS the dot's identity, so keying by it is not an
          // index standing in for a missing id.
          <span
            key={`snap-${index}`}
            className={cn(
              "h-2 w-2 rounded-full transition-colors duration-200",
              index === activeIndex ? "bg-brand-600" : "bg-ink-200",
            )}
          />
        ))}
      </div>

      {/* Mobile only: centred beneath the dots. */}
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
