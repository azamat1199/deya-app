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
  /** One row from GET /api/v1/product-info/. Title becomes the heading,
   *  description becomes the body paragraph, image becomes the photo. Every
   *  field on screen comes from this row — there is no static copy left in
   *  this component to fall back to. */
  item: ProductInfoItem;
}

export default function CareersCulture({ item }: CareersCultureProps) {
  const image = item.image || null;

  // BOTH fields are TipTap HTML — the API sends "<p>…</p>", with <br> and
  // multiple paragraphs in `description` — not the flat text this component
  // first assumed, which is why the tags printed on screen. Sanitized the same
  // way CareersBrands renders its own `description`; a field that sanitizes
  // down to nothing renders no element at all rather than an empty one.
  const titleHtml = isBlankRichText(item.title)
    ? null
    : sanitizeRichText(item.title);
  const descriptionHtml = isBlankRichText(item.description)
    ? null
    : sanitizeRichText(item.description);

  return (
    <div className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
      <div>
        {/* The heading's own markup is a <p> the CMS wraps everything in.
            Preflight zeroes p margins, so the text lands exactly where it did
            as a plain child and inherits the size/leading/colour set here. */}
        {titleHtml && (
          <h2
            className={cn(
              "text-3xl leading-snug font-normal text-ink-900 lg:text-4xl",
              // No [&_p]: variant needed here, unlike the description below.
              // The CMS wraps this field in a single <p>, and a <p> sets none of
              // font-size, weight, leading or tracking of its own, so all four
              // inherit straight through from this h2 — verified on the rendered
              // inner <p>, not assumed. Preflight zeroes its margin, so the text
              // also sits exactly where a plain child would.
              CAREERS_SECTION_HEADING,
            )}
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        )}

        {descriptionHtml && (
          // Same typography as the single <p> this replaces, re-aimed at the
          // paragraphs inside the markup — the BrandCopyHtml idiom. `space-y-4`
          // was already here and now has real siblings to space.
          <div
            className={cn(
              "mt-6 space-y-4",
              "[&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-ink-700",
              "lg:[&_p]:text-base",
              "[&_strong]:font-semibold [&_b]:font-semibold",
              // Mobile body: Roboto 400 / 13px / 135% / 0. Aimed at the <p>s
              // INSIDE the sanitized markup, not at this wrapper — the wrapper
              // holds no text of its own, and `[&_p]:text-sm` above would win
              // on the children regardless. CAREERS_BODY_13 cannot be reused
              // verbatim for that reason: it targets an element directly, this
              // has to target rendered children. Values kept identical to it.
              // The [&_strong] rule above is untouched, so a bold run inside
              // the CMS copy still renders bold.
              "max-md:[&_p]:text-[13px] max-md:[&_p]:leading-[1.35] max-md:[&_p]:font-normal max-md:[&_p]:tracking-normal",
            )}
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        )}
      </div>
      {/* bg-light on the wrapper is the fallback when there is no image — the
          same "never hand next/image an empty src" rule the rest of this
          project follows, applied without inventing a placeholder graphic. */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-light">
        {image && (
          <Image
            src={image}
            // Tags stripped, not sanitized: an accessible name cannot render
            // markup, so the raw field would have a screen reader announce
            // "<p>" along with the sentence.
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
