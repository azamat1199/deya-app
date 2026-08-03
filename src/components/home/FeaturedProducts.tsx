import Image from "next/image";
import Link from "next/link";

import { Badge, ScrollReveal } from "@/components/ui";
import { featuredProducts } from "@/content/products";
import type { Locale } from "@/lib/i18n/config";

export interface FeaturedProductsProps {
  locale: Locale;
  allCatalogLabel: string;
}

export default function FeaturedProducts({
  locale,
  allCatalogLabel,
}: FeaturedProductsProps) {
  return (
    <section className="bg-[#FFFCF7] text-ink-900">
      <div className="mx-auto w-full px-2.5">
        <div className="pt-2.5 pb-2.5 lg:pt-2.5 lg:pb-2.5">
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <ScrollReveal
                key={product.slug}
                direction="up"
                delay={index * 0.08}
              >
                <Link
                  href={`/${locale}/catalog/${product.categorySlug}/${product.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-3/4 w-full bg-white shadow-[0px_0px_20px_0px_#0000001A]">
                    {product.badge && (
                      <Badge
                        text={product.badge.text}
                        variant={product.badge.variant}
                        className="absolute top-5 left-1/2 z-10 -translate-x-1/2"
                      />
                    )}
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="(min-width: 1200px) 25vw, (min-width: 768px) 50vw, 100vw"
                      className="object-contain p-12 transition-transform duration-600 ease-out motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-[1.04] lg:p-16"
                    />
                  </div>
                  <h3 className="mt-5 line-clamp-2 text-center text-sm leading-snug text-ink-900 lg:text-base">
                    {product.title}
                  </h3>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-10 flex justify-center lg:mt-14">
            <Link
              href={`/${locale}/catalog`}
              className="text-xs font-medium tracking-wide text-ink-900 uppercase underline decoration-1 underline-offset-4 transition-colors hover:text-brand-600"
            >
              {allCatalogLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
