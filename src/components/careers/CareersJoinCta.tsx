import { Button } from "@/components/ui";
import { careersContent } from "@/content/careers";
import { cn } from "@/lib/cn";

import { CAREERS_BODY_13, CAREERS_SECTION_HEADING } from "./sectionType";

export default function CareersJoinCta() {
  const { heading, paragraph, paragraphHighlight, buttonLabel } =
    careersContent.joinCta;

  return (
    // text-center on this wrapper is what centres the heading, the paragraph
    // and the button label — already here, so none of them needs its own
    // alignment class.
    <div className="flex flex-col items-center py-16 text-center lg:py-24">
      <h2
        className={cn(
          "text-2xl font-normal text-ink-900 lg:text-3xl",
          CAREERS_SECTION_HEADING,
        )}
      >
        {heading}
      </h2>

      {/* The spec's "13px SemiBold" sentence is `paragraphHighlight` — the
          <span> below, which is already font-semibold (600) and keeps its own
          colour. So the weight needs nothing new; what it needs is the 13px and
          the 135% leading, and those are set HERE on the paragraph so the span
          inherits them.

          JUDGEMENT CALL, FLAGGED: that also takes the first sentence from 14px
          to 13px. The spec lists only the highlighted sentence, but the two are
          one continuous paragraph — sizing half of it differently would read as
          a defect, and 13px/135% is the same body size the brief specifies for
          CareersCulture. Sizing only the span is the one-line alternative if
          Figma really does mix the two. */}
      <p
        className={cn(
          "mt-6 max-w-2xl text-sm leading-relaxed text-ink-700 lg:text-base",
          CAREERS_BODY_13,
          "max-md:font-normal",
        )}
      >
        {paragraph}{" "}
        <span className="font-semibold text-ink-900">{paragraphHighlight}</span>
      </p>

      {/* Roboto 500 / 12px / 120% / 0, uppercase, full width.
          `uppercase` and the centring already come from ui/Button (BASE's
          `uppercase` plus `justify-center`), so only weight, size, leading,
          tracking and width are stated.

          `max-md:` throughout because these compete with the Button's own
          classes and cn() is plain clsx, which keeps both: BASE's font-semibold
          would beat a plain font-medium (600 sorts after 500) and its
          tracking-wide would beat tracking-normal. `max-md:w-full` rather than
          the component's `fullWidth` prop, which has no breakpoint and would
          stretch the desktop button too.

          text-xs IS the 12px — a config token, not an arbitrary value; the
          leading-[1.2] after it overrides the line-height v4 pairs with that
          size. rounded-[3px], the colour states and the href are untouched. */}
      <Button
        variant="primary"
        size="lg"
        href="#"
        className="mt-8 rounded-[3px] max-md:w-full max-md:text-xs max-md:leading-[1.2] max-md:font-medium max-md:tracking-normal"
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
