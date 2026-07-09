import Image from "next/image";
import Link from "next/link";

import { homeCategories } from "@/content/categories";
import type { Locale } from "@/lib/i18n/config";

export interface CategoryGridProps {
  locale: Locale;
  toCatalogLabel: string;
}

export default function CategoryGrid({
  locale,
  toCatalogLabel,
}: CategoryGridProps) {
  return (
    <div className="relative left-1/2 right-1/2 w-screen -mx-[50vw]">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {homeCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/${locale}/catalog/${category.slug}`}
            aria-label={`Перейти в каталог: ${category.title}`}
            className="group relative aspect-4/3 overflow-hidden"
          >
            <Image
              src={category.image}
              alt={category.title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/20 to-transparent transition-colors duration-700 ease-out group-hover:from-black/65" />
            <div className="absolute bottom-0 left-0 p-6 lg:p-10">
              <h3 className="text-2xl font-medium text-white md:text-3xl lg:text-4xl">
                {category.title}
              </h3>
              <span className="mt-2 inline-block text-sm text-white/80 underline decoration-white/60 underline-offset-4 transition-colors duration-300 group-hover:text-white group-hover:decoration-2 group-hover:decoration-white">
                {toCatalogLabel}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
