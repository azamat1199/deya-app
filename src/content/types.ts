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

export interface Product {
  slug: string;
  categorySlug: string;
  title: string;
  weight?: string;
  image: string;
  badge?: { text: string; variant: "new" | "hit" };
}

export interface NewsPost {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  cover: string;
}

export interface ExportRegion {
  name: string;
  /** Position on the diagram, in the SVG's 900x450 coordinate space. */
  x: number;
  y: number;
}
