import Image from "next/image";
import Link from "next/link";

import { Badge, type BadgeVariant } from "@/components/ui";

export interface ProductCardProps {
  href: string;
  image: string;
  title: string;
  /**
   * Optional because the data is: most SKUs carry no badge. Not an escape
   * hatch for a second caller's shape — callers adapt their own data to these
   * four props rather than the card growing to fit them.
   */
  badge?: { text: string; variant: BadgeVariant };
}

/**
 * The single product card. Lifted verbatim out of FeaturedProducts, which was
 * the only place it existed, so that section renders byte-for-byte as before.
 */
export default function ProductCard({
  href,
  image,
  title,
  badge,
}: ProductCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-3/4 w-full bg-white shadow-[0px_0px_20px_0px_#0000001A]">
        {badge && (
          <Badge
            text={badge.text}
            variant={badge.variant}
            className="absolute top-5 left-1/2 z-10 -translate-x-1/2"
          />
        )}
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1200px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-contain p-12 transition-transform duration-600 ease-out motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-[1.04] lg:p-16"
        />
      </div>
      <h3 className="mt-5 line-clamp-2 text-center text-sm leading-snug text-ink-900 lg:text-base">
        {title}
      </h3>
    </Link>
  );
}
