import Image from "next/image";
import Link from "next/link";

import { homeCategories } from "@/content/categories";
import type { Locale } from "@/lib/i18n/config";

export interface CategoryBannerProps {
  locale: Locale;
}

export default function CategoryBanner({ locale }: CategoryBannerProps) {
  return (
    <div className="relative left-1/2 right-1/2 w-screen mx-[-50vw]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {homeCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/${locale}/catalog?category=${category.slug}`}
            className="group relative flex h-105 items-end justify-center overflow-hidden pb-12 md:h-125 lg:h-150"
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
