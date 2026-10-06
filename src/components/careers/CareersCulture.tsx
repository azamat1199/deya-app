import Image from "next/image";

import { cn } from "@/lib/cn";
import type { ProductInfoItem } from "@/lib/productInfo";
import {
  isBlankRichText,
  richTextToPlainText,
  sanitizeRichText,
} from "@/lib/sanitizeRichText";

import { CAREERS_SECTION_HEADING } from "./sectionType";

export interface CareersCultureProps {
  item: ProductInfoItem;
  /** The block's position among the CareersCulture blocks on the page. Even
   *  index: text left, image right. Odd index: image left, text right. */
  index: number;
}

export default function CareersCulture({ item, index }: CareersCultureProps) {
  const image = item.image || null;
  // Reordered at lg only. The markup stays text-first, so the single-column
  // mobile stack (text above image) is the same for every block.
  const imageFirst = index % 2 === 1;

  const titleHtml = isBlankRichText(item.title)
    ? null
    : sanitizeRichText(item.title);
  const descriptionHtml = isBlankRichText(item.description)
    ? null
    : sanitizeRichText(item.description);

  return (
    <div className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
      <div>
        {titleHtml && (
          <h2
            className={cn(
              "text-3xl leading-snug font-normal text-ink-900 lg:text-4xl",
              CAREERS_SECTION_HEADING,
            )}
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        )}

        {descriptionHtml && (
          <div
            className={cn(
              "mt-6 space-y-4",
              "[&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-ink-700",
              "lg:[&_p]:text-base",
              "[&_strong]:font-semibold [&_b]:font-semibold",
              "max-md:[&_p]:text-[13px] max-md:[&_p]:leading-[1.35] max-md:[&_p]:font-normal max-md:[&_p]:tracking-normal",
            )}
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        )}
      </div>
      <div
        className={cn(
          "relative aspect-4/3 w-full overflow-hidden bg-light",
          imageFirst && "lg:order-first",
        )}
      >
        {image && (
          <Image
            src={image}
            alt={richTextToPlainText(item.title)}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
    </div>
  );
}
