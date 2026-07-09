import type { ReactNode } from "react";

export function withEmphasis(
  text: string,
  highlights: readonly string[],
  emphasisClassName: string,
): ReactNode {
  if (highlights.length === 0) return text;

  const pattern = new RegExp(`(${highlights.join("|")})`, "g");
  return text.split(pattern).map((part, index) =>
    highlights.includes(part) ? (
      <strong key={index} className={emphasisClassName}>
        {part}
      </strong>
    ) : (
      part
    ),
  );
}
