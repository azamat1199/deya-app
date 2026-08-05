/**
 * 40px inset on the OUTER edges of a catalog card row — the first card starts
 * 40px in from its section's left boundary, the last ends 40px in from the
 * right. Padding on the row container, so the gaps *between* cards are
 * untouched.
 *
 * Shared by RecommendedProducts and ProductGrid so the two can never drift.
 *
 * Held back to md and up on purpose: at 390px the page container already only
 * offers 350px, and taking 80 more would leave ~111px per card in the two-up
 * mobile grid. The mobile rows keep the gutter they have.
 */
export const CATALOG_ROW_INSET = "md:px-10";

/**
 * The recommended-products section measures its 40px from the *viewport*, not
 * from the page container it happens to sit inside — so it breaks out to full
 * width first and then takes the same inset, once, on the container that holds
 * both the heading row and the card row. That is what puts the heading, the
 * link and the cards on one pair of boundaries.
 *
 * Held to md and up like the token above: below it the section keeps the page
 * gutter it already has.
 */
export const CATALOG_SECTION_BLEED =
  "md:relative md:left-1/2 md:right-1/2 md:w-screen md:-mx-[50vw] md:px-10";
