import Image from "next/image";

import type { ProductInfoItem } from "@/lib/productInfo";

export interface CareersCultureProps {
  /** One row from GET /api/v1/product-info/. Title becomes the heading,
   *  description becomes the body paragraph, image becomes the photo. Every
   *  field on screen comes from this row — there is no static copy left in
   *  this component to fall back to. */
  item: ProductInfoItem;
}

export default function CareersCulture({ item }: CareersCultureProps) {
  // const [headingBefore, headingAfter] = item.title.split("Deya");
  const image = item.image || null;
  const title = item.title || "Deya";
  return (
    <div className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
      <div>
        <h2 className="text-3xl leading-snug font-normal text-ink-900 lg:text-4xl">
          {title}
        </h2>

        <div className="mt-6 space-y-4">
          <p className="text-sm leading-relaxed text-ink-700 lg:text-base">
            {item.description}
          </p>
        </div>
      </div>

      {/* bg-light on the wrapper is the fallback when there is no image — the
          same "never hand next/image an empty src" rule the rest of this
          project follows, applied without inventing a placeholder graphic. */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-light">
        {image && (
          <Image
            src={image}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
    </div>
  );
}
