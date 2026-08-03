import Image from "next/image";

import { aboutContent } from "@/content/about";
import { withEmphasis } from "@/lib/withEmphasis";

// Figma type, authored at a 1440px reference width. Line-height and tracking
// stay constant; only the size scales.
const HEADING_TYPE =
  "font-light text-[clamp(22px,2.36vw,34px)] leading-[1.1] tracking-[-0.03em] text-white";
const BODY_TYPE =
  "font-normal text-[clamp(14px,1.11vw,16px)] leading-[1.25] text-white/90";
const NAME_TYPE =
  "font-light text-[clamp(18px,1.53vw,22px)] leading-[1.1] tracking-[-0.03em] text-white";
// [quotes:none] so no engine adds its own marks — the guillemets below are
// literal characters belonging to the copy.
const QUOTE_TYPE =
  "font-normal italic [quotes:none] text-[clamp(14px,1.11vw,16px)] leading-[1.25] text-white/90";

/** The two runs the design sets in bold italic, inside the body paragraph. */
const EMPHASIS = "font-medium italic text-white";

const GAP_UNDER_HEADING = "mt-[clamp(14px,1.53vw,22px)]";
const GAP_UNDER_NAME = "mt-[clamp(10px,0.97vw,14px)]";

// ---------------------------------------------------------------------------
// Mobile (< 768px). The design places each block by its FIRST BASELINE as a
// fraction of the section height, which no layout mode expresses directly — so
// each one is positioned absolutely and pulled back up by the distance from its
// own top edge to that baseline.
//
//   baseline offset = half-leading + ascender
//                   = (lineHeight - contentArea)/2 + ascender     [in em]
//
// Roboto's metrics are ascender 0.9277em, descender 0.2441em, so its content
// area is 1.1719em. Percentages resolve against the section's height and the em
// against the element's own font-size, so both survive any device size.
// ---------------------------------------------------------------------------
// Written out in full rather than composed: Tailwind extracts candidates from
// the source text, so an interpolated class name is never generated.
const M_INSET = "absolute left-[7.8vw] right-[7.8vw]";
/** baseline 42%, line-height 1.1 → (1.1 - 1.1719)/2 + 0.9277 = 0.892em */
const M_HEADING_POS = "top-[calc(42%_-_0.892em)]";
/** baseline 60.5%, line-height 1.3 → 0.992em */
const M_BODY_POS = "top-[calc(60.5%_-_0.992em)]";
/** baseline 82.5%, line-height 1.1 → 0.892em */
const M_NAME_POS = "top-[calc(82.5%_-_0.892em)]";
/** baseline 86.5%, line-height 1.25 → 0.967em; 3rd line lands on 91% */
const M_QUOTE_POS = "top-[calc(86.5%_-_0.967em)]";

const M_HEADING_TYPE =
  "font-light text-[clamp(21px,6.3vw,28px)] leading-[1.1] tracking-[-0.03em] text-white";
const M_BODY_TYPE =
  "font-normal text-[clamp(13px,3.6vw,16px)] leading-[1.3] tracking-normal text-white/90";
const M_NAME_TYPE =
  "font-light text-[clamp(17px,4.9vw,21px)] leading-[1.1] tracking-[-0.03em] text-white";
const M_QUOTE_TYPE =
  "font-normal italic [quotes:none] text-[clamp(12px,3.4vw,15px)] leading-[1.25] tracking-normal text-white/90";

/** Bold italic runs inside the body copy — <strong><em>, not a split. */
const M_EMPHASIS = "font-medium text-white";

// The heading crosses the subject's white shirt, so the scrim has to carry the
// contrast on its own. Stops are tuned against the measured lightest pixel
// behind the first heading line, not the average: it lands at ~58% up, where
// this ramp is still ~0.59 opaque (white-on-#6b6b6b, 5.5:1). Everything above
// 80% is untouched so the face and the wood panelling behind it stay clean.
const M_SCRIM =
  "bg-[linear-gradient(to_top,rgba(0,0,0,0.84)_0%,rgba(0,0,0,0.72)_45%,rgba(0,0,0,0.55)_62%,rgba(0,0,0,0.30)_72%,rgba(0,0,0,0)_80%)]";

export default function FounderStory() {
  const { heading, paragraph, paragraphHighlights, name, quote, image } =
    aboutContent.founder;

  const headingGroup = (
    <>
      <h2 className={HEADING_TYPE}>{heading}</h2>
      <p className={`${GAP_UNDER_HEADING} ${BODY_TYPE}`}>
        {withEmphasis(paragraph, paragraphHighlights, EMPHASIS)}
      </p>
    </>
  );

  const attributionGroup = (
    <>
      <p className={NAME_TYPE}>{name}</p>
      <blockquote className={`${GAP_UNDER_NAME} ${QUOTE_TYPE}`}>
        «{quote}»
      </blockquote>
    </>
  );

  return (
    // No bottom margin — the section butts straight against the footer strip.
    <section className="w-full bg-ink-900">
      {/* < 768: one full-bleed 1/1.95 frame, text overlaid on its lower half
          and the last quote line clearing the footer strip. The source photo is
          landscape, so `cover` at this aspect is height-constrained — the full
          frame height is in shot (head clear of the top edge, watch bottom
          right) and only the sides are cropped, which is what centres the
          subject. */}
      <div className="relative aspect-[1/1.95] w-full overflow-hidden md:hidden">
        <Image
          src={image}
          alt={name}
          fill
          sizes="100vw"
          quality={90}
          className="object-cover object-[50%_50%]"
        />

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${M_SCRIM}`}
        />

        <h2 className={`${M_INSET} ${M_HEADING_POS} ${M_HEADING_TYPE}`}>
          {heading}
        </h2>

        <p className={`${M_INSET} ${M_BODY_POS} ${M_BODY_TYPE}`}>
          {withEmphasis(paragraph, paragraphHighlights, M_EMPHASIS, true)}
        </p>

        {/* Absolute inset-0 rather than display:contents — the figure has to
            stay the containing block so its children's percentages still
            resolve against the section's height. */}
        <figure className="absolute inset-0">
          <figcaption className={`${M_INSET} ${M_NAME_POS} ${M_NAME_TYPE}`}>
            {name}
          </figcaption>
          <blockquote className={`${M_INSET} ${M_QUOTE_POS} ${M_QUOTE_TYPE}`}>
            «{quote}»
          </blockquote>
        </figure>
      </div>

      {/* >= 768: text overlaid on a full-bleed photo. 4/3 through the tablet
          range so the figure stays tall enough, widening to the Figma 1772/896
          from 1024 up. */}
      <div className="relative hidden aspect-4/3 w-full overflow-hidden md:block min-[1024px]:aspect-[1772/896]">
        <Image
          src={image}
          alt={name}
          fill
          sizes="100vw"
          quality={90}
          className="object-cover object-center"
        />

        {/* Soft vignettes, not panels: each fades to fully transparent well
            before the centre so the subject's face and hands stay clean. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.22)_30%,rgba(0,0,0,0)_58%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(300deg,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.18)_26%,rgba(0,0,0,0)_52%)]"
        />

        {/* top/bottom percentages resolve against the section's height, which
            is what the 9% / 92% anchors in the design are measured against —
            percentage padding would resolve against width instead. */}
        <div className="container-page absolute inset-x-0 top-[9%] z-10">
          <div className="max-w-[70%] min-[1024px]:max-w-[56%] min-[1280px]:max-w-[48%]">
            {headingGroup}
          </div>
        </div>

        <div className="container-page absolute inset-x-0 bottom-[8%] z-10">
          {/* Tablet keeps both groups on the left; from 1024 the attribution
              moves to the container's right edge. */}
          <div className="max-w-[56%] min-[1024px]:ml-auto min-[1024px]:max-w-[28%]">
            {attributionGroup}
          </div>
        </div>
      </div>
    </section>
  );
}
