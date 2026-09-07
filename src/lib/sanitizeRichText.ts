import "server-only";

import sanitizeHtml from "sanitize-html";

/**
 * Server-side sanitiser for CMS-authored rich text before it goes anywhere near
 * dangerouslySetInnerHTML.
 *
 * "It's our own CMS" is not a reason to trust it: the admin is a TipTap editor
 * whose output is stored verbatim, so anything an editor can paste — or anyone
 * who reaches the admin can inject — arrives here as markup.
 *
 * `p` is in the allowlist because the payload depends on it: /api/v1/factory/'s
 * `subdescription` is three separate <p> elements, one per line of the quote.
 * Stripping p would merge all three into one run of text.
 *
 * Everything not listed is dropped, which covers script, style, iframe, every
 * on* handler, and any style attribute that could position an element over the
 * page.
 */
const ALLOWED_TAGS = ["p", "br", "strong", "b", "em", "i", "a"] as const;

export function sanitizeRichText(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  return sanitizeHtml(trimmed, {
    allowedTags: [...ALLOWED_TAGS],
    allowedAttributes: { a: ["href", "target", "rel"] },
    // javascript: and data: are not on this list, so an href using either is
    // dropped rather than rendered.
    allowedSchemes: ["http", "https", "mailto"],
    // Anything still unparented after tags are stripped keeps its text; only
    // these two carry no meaningful text content.
    nonTextTags: ["style", "script"],
    transformTags: {
      // Forced, never merely defaulted: the CMS already emits
      // rel="noopener noreferrer nofollow" today, but a link pasted by an
      // editor would not, and target="_blank" without noopener hands the new
      // tab a window.opener reference back to this page.
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
  });
}

/**
 * The same markup reduced to its text, for the places that cannot render HTML
 * at all: an `alt`, a `title` attribute, a meta description. Without it a
 * TipTap field like "<p>Text</p>" reaches an accessible name with its tags
 * intact — the attribute-side half of the bug that printed literal "<p>" on
 * the careers page.
 *
 * The entity pass is not decoration: sanitize-html re-encodes the text it
 * emits, so "A & B" comes back as "A &amp; B", and an attribute needs the
 * character, not the entity (React escapes the attribute itself on output).
 * `&amp;` is decoded last so a literal "&lt;" in the copy — encoded twice on
 * the way through — cannot decode into a working tag.
 */
export function richTextToPlainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

/**
 * True when sanitising leaves nothing renderable — an empty string, or markup
 * that was entirely stripped, or tags with no text between them ("<p></p>").
 * Callers use it to omit the element rather than render an empty paragraph.
 */
export function isBlankRichText(html: string): boolean {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim() === "";
}
