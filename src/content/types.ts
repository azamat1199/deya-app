export interface Slide {
  id: string;
  badge?: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
}

export interface StatItem {
  value: string;
  numericValue: number;
  label: string;
}

export interface Category {
  slug: string;
  title: string;
  image: string;
}

export interface ProductVariantOption {
  label: string;
  slug: string;
}

export interface Product {
  slug: string;
  categorySlug: string;
  title: string;
  weight?: string;
  image: string;
  badge?: { text: string; variant: "new" | "hit" };
  /** Detail-page-only fields — optional since most catalog SKUs don't have this yet. */
  description?: string;
  gallery?: string[];
  flavorOptions?: ProductVariantOption[];
  weightOptions?: ProductVariantOption[];
  characteristics?: { label: string; value: string }[];
}

/**
 * A section of a post body. Extend this union — and add one matching case to
 * the renderer registry in components/blog/BlogBlocks.tsx — to introduce a new
 * section type. Nothing else needs to change; the detail page maps over the
 * array and an unrecognised type renders nothing.
 */
export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "image"; src: string; alt: string };

export interface NewsPost {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  /** Listing/teaser thumbnail. Deliberately still named `cover` — the grid,
   *  the card and the home page's teaser all read it. */
  cover: string;
  /** Detail-page body. */
  blocks: BlogBlock[];
}

export interface MapPoint {
  id: string;
  label: string;
  /** Position in the map's own SVG viewBox coordinate space. */
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  /** Label offset from the dot, in viewBox units. */
  labelDx?: number;
  labelDy?: number;
}

export interface ExportMapConfig {
  /** e.g. "0 0 1321 377" — the container's CSS aspect-ratio must match
   * this exactly so preserveAspectRatio="meet" never letterboxes. */
  viewBox: string;
  /** The hub. Label placement is optional per-breakpoint because the hub sits
   * in a different position in each layout (mid-right on desktop/tablet,
   * bottom-centre on mobile) and its label must dodge the spokes. */
  factory: {
    label: string;
    x: number;
    y: number;
    anchor?: MapPoint["anchor"];
    labelDx?: number;
    labelDy?: number;
  };
  regions: MapPoint[];
  /** Label size and dot radius, in this config's own viewBox units. */
  fontSize: number;
  dotRadius: number;
}
