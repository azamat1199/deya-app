import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui";
import type { Product } from "@/content/types";

export interface ProductCardProps {
  product: Product;
  href: string;
}

export default function ProductCard({ product, href }: ProductCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="relative h-[316px] w-full overflow-hidden rounded-lg border border-line-100 bg-white shadow-sm max-md:h-[244px]">
        {product.badge && (
          <Badge
            text={product.badge.text}
            variant={product.badge.variant}
            className="absolute top-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap"
          />
        )}
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(min-width: 1200px) 20vw, (min-width: 768px) 33vw, 50vw"
          className="object-contain px-7 py-14 transition-transform duration-300 ease-in-out group-hover:scale-105"
        />
      </div>
      {/* Mobile type: Roboto 400 / 12px / 120% (14.4px) / 0, centred.
          `text-center` is already here and `font-normal` is already what an h3
          resolves to under Tailwind's preflight (headings inherit their
          weight), but it is stated explicitly so a future change to the base
          cannot silently make these titles bold on phones only.

          `line-clamp-2` is PRE-EXISTING and deliberately left in place: the
          brief rules out adding truncation Figma does not specify, and this is
          not new. It does mean a long product name still stops at two lines —
          28.8px at this size — which is reported rather than changed.

          The card box above, its height, the badge and every colour, margin
          and radius are untouched. */}
      <h3 className="mt-4 line-clamp-2 text-center text-sm text-ink-900 max-md:text-[12px] max-md:leading-[1.2] max-md:font-normal max-md:tracking-normal">
        {product.title}
      </h3>
    </Link>
  );
}
