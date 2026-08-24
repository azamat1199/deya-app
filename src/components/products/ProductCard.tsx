import Image from "next/image";
import Link from "next/link";

import { Badge, type BadgeVariant } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * "default" is the original treatment and stays the default so FeaturedProducts
 * on the home page renders byte-for-byte as before. "framed" is the catalog
 * recommendation row: a thin border instead of the drop shadow, and a slightly
 * shorter 4:5 card below lg that becomes 3:4 from lg up.
 */
export type ProductCardVariant = "default" | "framed";

const FRAME_CLASSES: Record<ProductCardVariant, string> = {
  default: "aspect-3/4 shadow-[0px_0px_20px_0px_#0000001A]",
  framed: "aspect-4/5 border border-line-100 lg:aspect-3/4",
};

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
  /** Opt-in only; omitting it keeps the existing appearance exactly. */
  variant?: ProductCardVariant;
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
  variant = "default",
}: ProductCardProps) {
  return (
    <Link href={href} className="group block">
      {/* The badge is absolutely positioned, so its slot costs no layout height
          and cannot collapse — a card without one still aligns its image with
          the rest of the row. */}
      <div className={cn("relative w-full bg-white", FRAME_CLASSES[variant])}>
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
      {/* max-w-[80%] + mx-auto keeps the title narrower than the card and
          centred under it, so it wraps to two short lines instead of running
          the full card width. No new wrapper: both are applied to the h3
          itself, which is already a block. */}
      {/* line-clamp-2 removed deliberately: at max-w-[80%] the longer names
          need three lines, and the clamp was truncating them with an ellipsis.
          The brief requires the full title to stay visible, so it wraps freely
          and the title block grows instead. */}
      <h3 className="mx-auto mt-6 max-w-[80%] text-center text-sm leading-snug text-ink-900 lg:text-base">
        {title}
      </h3>
    </Link>
  );
}
