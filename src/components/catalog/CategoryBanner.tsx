import Image from "next/image";
import Link from "next/link";

import { homeCategories } from "@/content/categories";
import type { Locale } from "@/lib/i18n/config";

export interface CategoryBannerProps {
  locale: Locale;
}

// The one place the gutter is defined. A grid gap sits between tracks only, so
// the row's outer edges stay on the full-bleed 0 → 100vw they already occupy
// and the four cards absorb the 30px themselves — 7.5px each. It is the row
// gutter too, so a wrapped 2×2 is separated by the same 10px.
const CARD_GUTTER = "gap-[10px]";

// Below md the whole 2×2 has to land inside the first screen. The banner is the
// first thing under the (in-flow) header and carries no spacing of its own, so
// the height left for it is exactly one viewport minus the bar; two rows and
// one gutter share that, which fixes each card's height — and with the column
// width already set by the grid, its aspect ratio along with it. No number is
// hardcoded: it re-solves on any device from a 640px-tall phone up.
//
// svh, not dvh: svh is the URL-bar-visible state, the smaller of the two, so
// the block fits whether the bar is showing or collapsed. dvh would also fit,
// but it re-resolves as the bar animates, and that is a visible reflow.
const CARD_HEIGHT = "max-md:h-[calc((100svh_-_var(--header-height)_-_10px)/2)]";

export default function CategoryBanner({ locale }: CategoryBannerProps) {
  return (
    <div className="relative left-1/2 right-1/2 w-screen mx-[-50vw]">
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${CARD_GUTTER}`}
      >
        {homeCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/${locale}/catalog?category=${category.slug}`}
            className={`group relative flex h-105 items-end justify-center overflow-hidden pb-12 md:h-125 lg:h-150 ${CARD_HEIGHT}`}
          >
            <Image
              src={category.image}
              alt={category.title}
              fill
              sizes="(min-width: 1200px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />
            <span className="relative z-10 text-2xl font-normal text-white lg:text-3xl">
              {category.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
