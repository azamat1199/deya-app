import Link from "next/link";

import ProductCard from "@/components/products/ProductCard";
import { ScrollReveal } from "@/components/ui";
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
          {/* The CategoryGrid row above is full-bleed — it cancels its own
              container with -mx-[50vw] and sits on the viewport edges at 0.
              To line up with it, this row has to lose the 10px the wrapper
              above contributes, so the negative margin cancels exactly that
              px-2.5 rather than reaching for the viewport. Margin on the grid,
              not on ProductCard: it moves the row's edges, leaving each card's
              own white background and shadow intact. */}
          <div className="grid grid-cols-2 gap-2.5 max-md:-mx-2.5 max-md:gap-x-3  lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <ScrollReveal
                key={product.slug}
                direction="up"
                delay={index * 0.08}
              >
                <ProductCard
                  href={`/${locale}/catalog/${product.categorySlug}/${product.slug}`}
                  image={product.image}
                  title={product.title}
                  badge={product.badge}
                />
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
