/**
 * Shared mobile type for the careers page sections.
 *
 * Defined once here rather than repeated in each component, because the spec
 * gives the same heading style to three separate <h2>s that live in three
 * different files (CareersCulture, CareersBrands, CareersJoinCta). Same idea,
 * and same placement, as components/partners/sectionType.ts.
 *
 * Roboto is NOT declared: it comes from next/font on <html> → --font-roboto →
 * --font-sans, which <body> already applies. Confirmed loaded, not re-added.
 *
 * Everything here is `max-md:` — the desktop values on each element are left
 * exactly as they are, and a variant also settles the conflicts for free: every
 * one of these competes with an unprefixed utility already on its element
 * (font-normal, leading-snug, tracking-[-0.01em], a clamp() size), and cn() is
 * plain clsx, so it keeps both and lets Tailwind's own sort order decide. A
 * variant always sorts after an unprefixed utility; relying on scale order
 * instead would be a coin flip.
 */

/**
 * Section heading — Roboto 300 / 24px / 110% / -3%.
 *
 * `text-2xl` IS the 24px: Tailwind v4's scale puts it at 1.5rem, and this
 * project does not override the type scale (there is no tailwind.config — v4
 * keeps the theme in globals.css's @theme inline block). So the size is a
 * config token, not an arbitrary value.
 *
 * ARBITRARY, and flagged as theme candidates: `leading-[1.1]` (the scale has
 * none/tight/snug = 1 / 1.25 / 1.375 and nothing at 1.1) and
 * `tracking-[-0.03em]` (no -3% step).
 *
 * Alignment is deliberately absent — CareersCulture's heading stays
 * left-aligned and the other two are centred by their own wrappers.
 */
export const CAREERS_SECTION_HEADING =
  "max-md:text-2xl max-md:leading-[1.1] max-md:font-light max-md:tracking-[-0.03em]";

/**
 * Body copy — 13px / 135% / 0, mobile only. Weight is NOT set here: the spec
 * gives 400 in one place and 600 in another, so each caller states its own and
 * this stays the part they share.
 *
 * ARBITRARY: 13px falls between text-xs (12px) and text-sm (14px), and 1.35 has
 * no leading token. Both flagged.
 */
export const CAREERS_BODY_13 =
  "max-md:text-[13px] max-md:leading-[1.35] max-md:tracking-normal";
