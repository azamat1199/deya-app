/**
 * The contract between the two halves of "click a category banner, land on the
 * filtered grid":
 *
 *   ProductGrid  owns the element, stamps it with the filter it is CURRENTLY
 *                rendering, and otherwise knows nothing about scrolling.
 *   CategoryBanner  asks to be taken there after its own tile click.
 *
 * Kept in a module of its own so neither component imports the other just to
 * agree on an id string.
 */

/** Marks the filter-tabs row — the top of the grid section, not the cards. */
export const CATALOG_GRID_ID = "catalog-grid";

/**
 * Slug of the filter the grid is rendering right now, or "all". Read by the
 * scroll helper to tell "the new results are on screen" apart from "the URL
 * changed and React has not re-rendered yet".
 */
export const CATALOG_GRID_CATEGORY_ATTR = "data-active-category";

/**
 * Longest we will wait for the grid to catch up before giving up silently.
 * Generous next to a same-page re-render, and short enough that a scroll can
 * never arrive so late it feels detached from the click that asked for it.
 */
const SETTLE_TIMEOUT_MS = 1500;

/**
 * Scroll the catalog grid into view once it ACTUALLY shows `slug`.
 *
 * The waiting is the point. A tile click is a <Link> navigation: the URL
 * updates, the server re-renders the page, and only then does ProductGrid
 * re-derive its filter. Scrolling straight from the click handler would move
 * the page while the old, unfiltered cards were still mounted — landing on a
 * stale position and, when the two lists differ in length, at a scroll offset
 * that no longer exists a frame later. So we poll the grid's own report of
 * what it is rendering and move only when it matches.
 *
 * Falls through and does nothing if the grid never reports `slug` (a failed
 * fetch, a slug with no matching category). Not scrolling is the right
 * failure: it leaves the user where they chose to be.
 */
export function scrollToCatalogGrid(slug: string): void {
  // Same idiom as OtherArticles and HistoryHero — honour reduced motion by
  // jumping instead of animating, rather than skipping the move entirely.
  const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const deadline = performance.now() + SETTLE_TIMEOUT_MS;

  function attempt(): void {
    const grid = document.getElementById(CATALOG_GRID_ID);

    if (grid?.getAttribute(CATALOG_GRID_CATEGORY_ATTR) === slug) {
      // The header clearance lives in the element's own scroll-margin-top, so
      // it tracks --header-height across breakpoints instead of being measured
      // here and going stale on resize.
      grid.scrollIntoView({
        block: "start",
        behavior: instant ? "auto" : "smooth",
      });
      return;
    }

    if (performance.now() < deadline) requestAnimationFrame(attempt);
  }

  requestAnimationFrame(attempt);
}
