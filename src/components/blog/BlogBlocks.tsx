import { Fragment } from "react";
import Image from "next/image";

import type { BlogBlock } from "@/content/types";

export interface BlogBlocksProps {
  blocks: BlogBlock[];
}

/**
 * Space above each section. It is a property of the PAIR, not of the incoming
 * block alone: a paragraph opening a group sits 22px under its heading but only
 * 18px under another paragraph. Defined here once so every post — and every
 * future block type — inherits the same rhythm instead of setting it per
 * instance. The very first block overrides this to sit 30px under the date.
 */
const FIRST_SPACE_ABOVE = "mt-[30px]";

function spaceAbove(previous: BlogBlock["type"], current: BlogBlock["type"]) {
  if (current === "image") return "mt-[34px]";
  if (current === "heading") return "mt-[46px]";
  // current === "paragraph"
  return previous === "heading" ? "mt-[22px]" : "mt-[18px]";
}

const PARAGRAPH_TYPE = "text-[14px] leading-[1.55] text-ink-900/85";
const HEADING_TYPE =
  "font-normal leading-[1.25] tracking-[-0.01em] text-ink-900 text-[clamp(20px,1.8vw,26px)]";

// The column is 100vw under 768, 72vw to 1023, then 52vw capped at 600.
const IMAGE_SIZES = "(min-width: 1024px) 600px, (min-width: 768px) 72vw, 100vw";

/**
 * One renderer per block type. Adding a section means adding a variant to
 * BlogBlock and one `case` here — the page itself never changes.
 *
 * `isFirstImage` rather than the array index: only the first *image* takes
 * priority, and it is rarely block 0.
 */
function renderBlock(block: BlogBlock, spacing: string, isFirstImage: boolean) {
  switch (block.type) {
    case "paragraph":
      return <p className={`${spacing} ${PARAGRAPH_TYPE}`}>{block.text}</p>;

    case "heading": {
      const Tag = block.level === 3 ? "h3" : "h2";
      return <Tag className={`${spacing} ${HEADING_TYPE}`}>{block.text}</Tag>;
    }

    case "image":
      return (
        <div
          className={`${spacing} relative aspect-4/3 w-full overflow-hidden md:aspect-[16/11]`}
        >
          <Image
            src={block.src}
            alt={block.alt}
            fill
            sizes={IMAGE_SIZES}
            priority={isFirstImage}
            className="object-cover"
          />
        </div>
      );

    default:
      // An unrecognised type renders nothing rather than throwing — a post
      // authored against a newer block set still displays everything else.
      return null;
  }
}

export default function BlogBlocks({ blocks }: BlogBlocksProps) {
  // Resolved up front rather than tracked with a mutable flag through the map —
  // reassigning during render is a lint error and unsafe under re-entry.
  const firstImageIndex = blocks.findIndex((block) => block.type === "image");

  return (
    <>
      {blocks.map((block, index) => {
        const isFirstImage = index === firstImageIndex;

        // Keyed Fragment, not a wrapper element: the sections are siblings in
        // one column and an extra box would break the margin rhythm above.
        return (
          <Fragment key={index}>
            {renderBlock(
              block,
              index === 0
                ? FIRST_SPACE_ABOVE
                : spaceAbove(blocks[index - 1].type, block.type),
              isFirstImage,
            )}
          </Fragment>
        );
      })}
    </>
  );
}
