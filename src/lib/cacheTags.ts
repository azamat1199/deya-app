/**
 * Cache tags on the backend fetches, so POST /api/revalidate can invalidate
 * exactly the data a CMS change touched (see app/api/revalidate/route.ts).
 * One place for the names, so a fetch and the route can never disagree on a
 * spelling.
 *
 * The 5-minute `revalidate: 300` on every fetch stays as the fallback: if a
 * revalidation call is missed, content is at most five minutes stale.
 */
export const CACHE_TAGS = {
  /**
   * Every product payload — the list, every detail and every related list.
   * Broad on purpose: a detail embeds its family siblings (name, flavour,
   * weight, image) and related lists embed other products, so one product's
   * change can be visible on many product pages.
   */
  products: "products",
  /** One product's detail + related list, by slug. */
  product: (slug: string) => `product:${slug}`,
  /** GET /api/v1/categories/ — the footer on every page, the catalog tabs. */
  categories: "categories",
  /** GET /api/v1/home/ — featured products and the home page blocks. */
  home: "home",
} as const;
