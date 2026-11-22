"use client";

import { useState } from "react";
import Image from "next/image";

import Badge from "@/components/ui/Badge";
import type { Product } from "@/content/types";
import { cn } from "@/lib/cn";

export interface ProductGalleryProps {
  product: Product;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const candidates =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];
  const images = candidates.filter(Boolean);

  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(0, images.length - 1));
  const activeSrc = images[safeIndex];
  const hasThumbnails = images.length > 1;

  if (!activeSrc) return null;

  return (
    // max-md:min-w-0: as a grid item this root defaulted to min-width:auto, so
    // the thumbnail row's 436px min-content (4 × 100 + 3 × 12) stretched it —
    // and the photo with it — past a 320–374px column, and the row could never
    // scroll inside itself. Letting it shrink keeps the scroll in the row.
    //
    // lg:items-start: in the desktop row the frame used to stretch to the
    // thumbnail strip's height, so a product with many photos got a taller
    // frame than one with two. The row starts on the left edge, so the
    // gallery lines up with the header logo.
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start max-md:min-w-0">
      {/* The main frame keeps the 622:635 shape for every photo, whatever the
          photo's own format (it is fitted inside with object-contain).
          - With thumbnails: 622 × 635 at the 1440 design width, beside the
            100px strip + 16px gap; scales down below that.
          - A single photo has no strip, so the frame fills the whole left
            half of the page (the page grid is 50/50 in that case).
          Below desktop it is never wider than 622 and is centred. */}
      <div
        className={cn(
          "relative order-1 mx-auto aspect-622/635 w-full max-w-[622px] overflow-hidden rounded-lg bg-white shadow-[0px_0px_15px_0px_#0000001A] lg:order-2 lg:mx-0 lg:flex-none",
          hasThumbnails
            ? "lg:w-[min(622px,calc(100%-116px))]"
            : "lg:max-w-none",
        )}
      >
        {product.badge && (
          <Badge
            text={product.badge.text}
            variant={product.badge.variant}
            className="absolute top-4 left-4 z-10 max-md:left-1/2 max-md:-translate-x-1/2"
          />
        )}
        <Image
          key={activeSrc}
          src={activeSrc}
          alt={product.title}
          fill
          // The LCP element of the product page. Width tracks the frame: half
          // the page from lg (1200px), else min(622px, viewport − gutters).
          sizes="(min-width: 1200px) 50vw, (min-width: 704px) 622px, calc(100vw - 40px)"
          className="object-contain p-8"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {hasThumbnails && (
        // Capped at the frame's desktop height and scrolls past it, so a long
        // photo list can never push the layout taller than the frame.
        // Below desktop it lines up under the (centred, capped) frame.
        <div className="order-2 mx-auto flex w-full max-w-[622px] gap-3 overflow-x-auto lg:order-1 lg:mx-0 lg:max-h-[635px] lg:w-auto lg:max-w-none lg:shrink-0 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">
          {images.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`${product.title} — ${index + 1}`}
              className={cn(
                "relative h-25 w-25 shrink-0 overflow-hidden rounded-md border bg-light",
                index === safeIndex
                  ? "border-brand-600"
                  : "border-line-200 hover:border-ink-300",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
