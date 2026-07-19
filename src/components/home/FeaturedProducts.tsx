import Link from "next/link";
import { Section, ScrollReveal } from "@/components/ui";

import { Card } from "@/components/ui";
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
    <Section className="bg-[#FFFCF7]" containerWidth="home">
      <ScrollReveal>
        <div className="pt-16 pb-8 lg:pt-24 lg:pb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <div
                key={product.slug}
                className="border-line-100 px-4 odd:border-r lg:border-r lg:px-6 lg:last:border-r-0"
              >
                <Card
                  image={product.image}
                  imageAlt={product.title}
                  title={product.title}
                  badge={product.badge}
                  href={`/${locale}/catalog/${product.categorySlug}/${product.slug}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center lg:mt-12">
            <Link
              href={`/${locale}/catalog`}
              className="text-sm font-medium tracking-wide text-ink-900 uppercase underline decoration-1 underline-offset-4 transition-colors hover:text-brand-600"
            >
              {allCatalogLabel}
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </Section>
  );
}
