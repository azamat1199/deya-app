/**
 * Shared type for the partners page's two section blocks — "Наши партнёры"
 * (PartnersLogos) and "Сертификаты и награды" (CertificatesSection).
 *
 * One definition rather than the same class string written twice: the mobile
 * spec is identical for both headings, so duplicating it would be two places to
 * keep in sync. This follows the project's existing habit of exporting class
 * constants for markup shared across components — see NewsListCard's
 * ALL_NEWS_LINK_CLASSES / NEWS_LIST_GRID_CLASSES — and lives in its own tiny
 * module, the way catalogGridAnchor.ts does for the catalog folder, so neither
 * section has to import from the other.
 *
 * NOT put on ui/SectionHeading: that component exists but nothing outside
 * components/ui imports it, and its markup is a different shape (a flex row
 * with an optional trailing link, left-aligned). Styling it would have changed
 * nothing on this page.
 *
 * Roboto is NOT declared here. It comes from next/font on <html> →
 * --font-roboto → --font-sans, which <body> already applies; confirmed loaded
 * rather than re-added.
 */

/**
 * Section heading. Mobile: Roboto 300 / 24px / 110% / -3%, centred.
 *
 * `text-2xl` IS the 24px — Tailwind v4's scale puts it at 1.5rem and this
 * project does not override the type scale (there is no tailwind.config; the
 * v4 theme lives in globals.css's @theme inline block). So the size is a config
 * token and needs no `max-md:` restatement: it is already what the phone
 * renders, with `md:text-3xl` taking over above the breakpoint.
 *
 * What does need restating below md:
 *   font-light        300, against the unprefixed font-normal desktop keeps.
 *   leading-[1.1]     110%. ARBITRARY — the leading scale has none/tight/snug
 *                     (1 / 1.25 / 1.375) and nothing at 1.1. It also has to
 *                     override the 2rem line-height that v4's text-2xl pairs
 *                     with its font-size.
 *   tracking-[-0.03em] -3% = -0.72px at 24px. ARBITRARY — the tracking scale
 *                     has no -3% step.
 */
export const PARTNERS_SECTION_HEADING =
  "text-center text-2xl font-normal text-ink-900 max-md:font-light max-md:leading-[1.1] max-md:tracking-[-0.03em] md:text-3xl";

/**
 * The description under a section heading. Mobile: Roboto 400 / 13px / 135% /
 * 0, centred.
 *
 * Only CertificatesSection has one — PartnersLogos renders its marquee straight
 * after its heading with no paragraph at all — so today this has a single
 * consumer. It is defined here anyway so the second section cannot acquire a
 * differently-typed paragraph later.
 *
 *   text-[13px]      ARBITRARY — the scale steps 12px (text-xs) → 14px
 *                    (text-sm), so 13px has no token.
 *   leading-[1.35]   135%. ARBITRARY, as above.
 *   font-normal /    both config tokens.
 *   tracking-normal
 */
export const PARTNERS_SECTION_DESCRIPTION =
  "mx-auto mt-4 max-w-2xl text-center text-ink-500 max-md:text-[13px] max-md:leading-[1.35] max-md:font-normal max-md:tracking-normal";
