"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import ProductGrid, { type ProductGridProps } from "./ProductGrid";

type CatalogProductGridProps = Omit<ProductGridProps, "initialCategory">;

/**
 * The catalog grid, filtered by `?category=` from the URL.
 *
 * The catalog page used to read `searchParams` on the server, which made it
 * dynamically rendered on every request. Reading the param here instead lets
 * the page be static/ISR: the prerendered HTML is the Suspense fallback — the
 * full, UNFILTERED grid, so every product link is in the HTML crawlers see —
 * and on hydration the filtered grid replaces it. A plain /catalog visit (no
 * query) renders identically either way.
 */
export default function CatalogProductGrid(props: CatalogProductGridProps) {
  return (
    <Suspense fallback={<ProductGrid {...props} />}>
      <ProductGridFromUrl {...props} />
    </Suspense>
  );
}

function ProductGridFromUrl(props: CatalogProductGridProps) {
  const category = useSearchParams().get("category") ?? undefined;
  return <ProductGrid {...props} initialCategory={category} />;
}
