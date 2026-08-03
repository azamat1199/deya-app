import Image from "next/image";
import Link from "next/link";

import { homeCategories } from "@/content/categories";
import type { Locale } from "@/lib/i18n/config";

export interface CategoryGridProps {
  locale: Locale;
  toCatalogLabel: string;
}

const GRADIENT =
  "linear-gradient(180deg, #FFFCF7 30.77%, rgba(255, 252, 247, 0.00) 77.4%)";

// Single source for the gutter — it is a grid gap, so it applies between cards
// only and leaves the row's outer edges (the full-bleed 0 → 100vw) untouched.
// The same value is the row gutter once the row wraps.
const CARD_GUTTER = "gap-[10px]";

export default function CategoryGrid({
  locale,
  toCatalogLabel,
}: CategoryGridProps) {
  return (
    <div
      className="relative left-1/2 right-1/2 w-screen -mx-[50vw]"
      style={{ background: GRADIENT }}
    >
      {/* All four in one row from lg, so the three 10px gutters come out of the
          cards' widths (7.5px each) and the row spans exactly what it did
          before. Below that it wraps to 2×2 and then to a single column, with
          the same gutter in both axes. */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${CARD_GUTTER}`}
      >
        {homeCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/${locale}/catalog?category=${category.slug}`}
            aria-label={`Перейти в каталог: ${category.title}`}
            className="group relative aspect-4/3 overflow-hidden lg:aspect-square"
          >
            <Image
              src={category.image}
              alt={category.title}
              fill
              sizes="(min-width: 1200px) 25vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-600 ease-out motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-[1.04]"
            />

            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/45 via-black/10 to-transparent transition-colors duration-600 ease-out [@media(hover:hover)]:group-hover:from-black/60" />

            <div className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center px-4 text-center lg:bottom-10">
              <h3 className="text-xl font-normal text-white drop-shadow-sm md:text-2xl lg:text-3xl">
                {category.title}
              </h3>
              <span className="mt-2 text-xs text-white/90 underline decoration-1 underline-offset-4">
                {toCatalogLabel}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
