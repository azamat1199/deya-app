import FounderImage from "@/components/about/FounderImage";
import type { Factory } from "@/lib/factory";

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

/**
 * Styling for the tags inside CMS rich text. The wrapper's own *_TYPE class
 * still carries size, colour and leading; this only covers what nested tags
 * need, since markup from the CMS cannot carry classes of its own.
 *
 * The editor emits one <p> per line — the quote is three of them — so
 * consecutive paragraphs get their own rhythm rather than a browser default
 * margin that would fight the clamp()-based spacing above.
 *
 * strong/b reproduce the bold-italic runs the design calls for. They render
 * flat today because the CMS text has no emphasis markup yet; the rule is here
 * so it lights up the moment an editor wraps those phrases, with no code
 * change.
 */
const RICH_TEXT =
  "[&_p]:m-0 [&_p+p]:mt-[0.4em] [&_strong]:font-medium [&_strong]:italic [&_strong]:text-white [&_b]:font-medium [&_b]:italic [&_b]:text-white [&_em]:italic [&_i]:italic [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2";

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

/** The mobile counterpart of RICH_TEXT — same idea, mobile's emphasis weight. */
const M_RICH_TEXT =
  "[&_p]:m-0 [&_p+p]:mt-[0.4em] [&_strong]:font-medium [&_strong]:text-white [&_b]:font-medium [&_b]:text-white [&_em]:italic [&_i]:italic [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2";

// The heading crosses the subject's white shirt, so the scrim has to carry the
// contrast on its own. Stops are tuned against the measured lightest pixel
// behind the first heading line, not the average: it lands at ~58% up, where
// this ramp is still ~0.59 opaque (white-on-#6b6b6b, 5.5:1). Everything above
// 80% is untouched so the face and the wood panelling behind it stay clean.
const M_SCRIM =
  "bg-[linear-gradient(to_top,rgba(0,0,0,0.84)_0%,rgba(0,0,0,0.72)_45%,rgba(0,0,0,0.55)_62%,rgba(0,0,0,0.30)_72%,rgba(0,0,0,0)_80%)]";

export interface FounderStoryProps {
  /** From GET /api/v1/factory/, or null when that request failed. Null renders
   *  the section's gradient with no text — never stale hardcoded copy, which
   *  would hide an outage and drift from what editors see in the CMS. */
  factory: Factory | null;
}

export default function FounderStory({ factory }: FounderStoryProps) {
  const heading = factory?.title ?? "";
  const paragraph = factory?.subtitle ?? "";
  const name = factory?.description ?? "";
  const quote = factory?.subdescription ?? "";
  const image = factory?.image ?? null;
  // The portrait is of the person named in `description`. With no name the
  // photograph carries no information a screen reader can use beyond the copy
  // beside it, so it becomes decorative rather than getting an invented label.
  const imageAlt = name || "";

  // Each slot is omitted rather than rendered empty: no bare heading, and no
  // stray guillemets around nothing. The guillemets themselves live in the CMS
  // text, so there is no literal «» wrapper here to double them.
  const headingGroup = (
    <>
      {heading && <h2 className={HEADING_TYPE}>{heading}</h2>}
      {paragraph && (
        <div
          className={`${GAP_UNDER_HEADING} ${BODY_TYPE} ${RICH_TEXT}`}
          dangerouslySetInnerHTML={{ __html: paragraph }}
        />
      )}
    </>
  );

  const attributionGroup = (
    <>
      {name && <p className={NAME_TYPE}>{name}</p>}
      {quote && (
        <blockquote
          className={`${GAP_UNDER_NAME} ${QUOTE_TYPE} ${RICH_TEXT}`}
          dangerouslySetInnerHTML={{ __html: quote }}
        />
      )}
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
      <div className="relative aspect-[1/1.95] w-full overflow-hidden bg-[linear-gradient(to_bottom,#2a2a2a_0%,#111_100%)] md:hidden">
        <FounderImage
          src={image}
          alt={imageAlt}
          className="object-cover object-[50%_50%]"
        />

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${M_SCRIM}`}
        />

        {heading && (
          <h2 className={`${M_INSET} ${M_HEADING_POS} ${M_HEADING_TYPE}`}>
            {heading}
          </h2>
        )}

        {paragraph && (
          <div
            className={`${M_INSET} ${M_BODY_POS} ${M_BODY_TYPE} ${M_RICH_TEXT}`}
            dangerouslySetInnerHTML={{ __html: paragraph }}
          />
        )}

        {/* Absolute inset-0 rather than display:contents — the figure has to
            stay the containing block so its children's percentages still
            resolve against the section's height. */}
        <figure className="absolute inset-0">
          {name && (
            <figcaption className={`${M_INSET} ${M_NAME_POS} ${M_NAME_TYPE}`}>
              {name}
            </figcaption>
          )}
          {quote && (
            <blockquote
              className={`${M_INSET} ${M_QUOTE_POS} ${M_QUOTE_TYPE} ${M_RICH_TEXT}`}
              dangerouslySetInnerHTML={{ __html: quote }}
            />
          )}
        </figure>
      </div>

      {/* >= 768: text overlaid on a full-bleed photo. 4/3 through the tablet
          range so the figure stays tall enough, widening to the Figma 1772/896
          from 1024 up. */}
      <div className="relative hidden aspect-4/3 w-full overflow-hidden bg-[linear-gradient(115deg,#2a2a2a_0%,#111_100%)] md:block min-[1024px]:aspect-[1772/896]">
        <FounderImage
          src={image}
          alt={imageAlt}
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
            percentage padding would resolve against width instead.

            The max() is the header-clip fix. /about renders its header
            `fixed` (HistoryHero sets hasHeroBackground), so the bar overlays
            every section below it, and a bare 9% put the heading's first line
            inside that band: measured 22px of it covered at 1280 and 14px at
            1440. Flooring the offset at the header height plus a 1rem gap
            clears it.

            Note this is not the root cause — that is the header staying fixed
            past the hero — and because the frame is 1772/896, 9% only exceeds
            the floor above roughly 2100px of viewport width, so at every
            realistic width this now resolves to the floor rather than to 9%.
            The heading therefore sits a little lower than the Figma anchor.
            Tracked separately; fixing it properly means touching the header
            and every other section on this page. */}
        <div className="container-page absolute inset-x-0 top-[max(9%,calc(var(--header-height)+1rem))] z-10">
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
