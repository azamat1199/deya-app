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

export default function CategoryGrid({
  locale,
  toCatalogLabel,
}: CategoryGridProps) {
  return (
    <div
      className="relative left-1/2 right-1/2 w-screen -mx-[50vw]"
      style={{ background: GRADIENT }}
    >
      <div className="grid grid-cols-1 gap-[10px] max-md:grid-cols-2 md:grid-cols-2">
        {homeCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/${locale}/catalog?category=${category.slug}`}
            aria-label={`Перейти в каталог: ${category.title}`}
            className="group relative aspect-4/3 overflow-hidden max-md:aspect-square lg:aspect-square"
          >
            <Image
              src={category.image}
              alt={category.title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-600 ease-out motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-[1.04]"
            />

            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/45 via-black/10 to-transparent transition-colors duration-600 ease-out [@media(hover:hover)]:group-hover:from-black/60" />

            {/* The two hover effects above are gated behind
                [@media(hover:hover)], so a touch device never enters that
                state: the scrim, title and link all render in their resting,
                fully visible form. Nothing here is revealed by interaction, so
                there is no hover treatment to port down. */}
            <div className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center px-4 text-center max-md:bottom-6 max-md:px-2.5 lg:bottom-10">
              <h3 className="text-xl font-normal text-white drop-shadow-sm md:text-2xl lg:text-3xl">
                {category.title}
              </h3>
              <span className="mt-2 text-xs text-white/90 underline decoration-1 underline-offset-4 max-md:mt-1.5">
                {toCatalogLabel}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
