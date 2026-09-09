import Link from "next/link";

import ProductCard from "@/components/products/ProductCard";
import { ScrollReveal, type BadgeVariant } from "@/components/ui";
import type { Locale } from "@/lib/i18n/config";

/** One card, already resolved to what ProductCard takes. */
export interface FeaturedProductItem {
  id: string | number;
  /** The PRODUCT name — never category.name. */
  title: string;
  image: string;
  href: string;
  /** Absent when the API sent no badge; an absent badge renders no chip. */
  badge?: { text: string; variant: BadgeVariant };
}

export interface FeaturedProductsProps {
  locale: Locale;
  allCatalogLabel: string;
  products: FeaturedProductItem[];
}

export default function FeaturedProducts({
  locale,
  allCatalogLabel,
  products,
}: FeaturedProductsProps) {
  return (
    <section className="bg-[#FFFCF7] text-ink-900">
      <div className="mx-auto w-full px-2.5">
        <div className="pt-2.5 pb-2.5 lg:pt-2.5 lg:pb-2.5">
          <div className="grid grid-cols-2 gap-2.5 max-md:-mx-2.5 max-md:gap-x-3  lg:grid-cols-4">
            {products.map((product, index) => (
              <ScrollReveal
                key={product.id}
                direction="up"
                delay={index * 0.08}
              >
                <ProductCard
                  href={product.href}
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
