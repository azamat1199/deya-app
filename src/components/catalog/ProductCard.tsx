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
      {/* Height carries the SYMMETRIC py-14 below: 316 = 204 of image area +
          56 top + 56 bottom, 244 = 132 + 56 + 56. The image area is the same
          it has always been; only the breathing room around it grew. */}
      <div className="relative h-[316px] w-full overflow-hidden rounded-lg border border-line-100 bg-white shadow-sm max-md:h-[244px]">
        {product.badge && (
          <Badge
            text={product.badge.text}
            variant={product.badge.variant}
            // nowrap is load-bearing, not cosmetic: "Хит продаж" wrapped to two
            // lines in the narrower mobile column, pushing the chip's bottom to
            // 61px and straight through the padding below. Colours, radius,
            // font and padding are untouched.
            className="absolute top-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap"
          />
        )}
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(min-width: 1200px) 20vw, (min-width: 768px) 33vw, 50vw"
          // py-14, equal top and bottom. object-contain centres the painted
          // pixels in this padded box, so both clearances stay equal whatever
          // the packaging's aspect ratio — a tall image fills the box and gets
          // exactly 56/56, a wide one letterboxes and gets more, symmetrically.
          // 56 also clears the badge, whose bottom sits at 44px.
          className="object-contain px-7 py-14 transition-transform duration-300 ease-in-out group-hover:scale-105"
        />
      </div>
      <h3 className="mt-4 line-clamp-2 text-center text-sm text-ink-900">
        {product.title}
      </h3>
    </Link>
  );
}
