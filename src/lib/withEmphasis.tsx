import type { ReactNode } from "react";

export function withEmphasis(
  text: string,
  highlights: readonly string[],
  emphasisClassName: string,
  /**
   * Nest an <em> inside the <strong>, for runs the design sets in bold *and*
   * italic — the two carry different meanings, so both elements are warranted.
   * Off by default: existing callers style the slant with a class instead, and
   * flipping them would change their markup for no visual gain.
   */
  stressEmphasis = false,
): ReactNode {
  if (highlights.length === 0) return text;

  const pattern = new RegExp(`(${highlights.join("|")})`, "g");
  return text.split(pattern).map((part, index) =>
    highlights.includes(part) ? (
      <strong key={index} className={emphasisClassName}>
        {stressEmphasis ? <em>{part}</em> : part}
      </strong>
    ) : (
      part
    ),
  );
}
