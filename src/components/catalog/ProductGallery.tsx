"use client";

import { useState } from "react";
import Image from "next/image";

import { Badge } from "@/components/ui";
import type { Product } from "@/content/types";
import { cn } from "@/lib/cn";

export interface ProductGalleryProps {
  product: Product;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="relative order-1 aspect-square w-full overflow-hidden rounded-lg bg-light lg:order-2 lg:flex-1">
        {product.badge && (
          <Badge
            text={product.badge.text}
            variant={product.badge.variant}
            className="absolute top-4 left-4 z-10"
          />
        )}
        <Image
          key={activeIndex}
          src={images[activeIndex]}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 40vw, 90vw"
          className="object-contain p-8"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:shrink-0 lg:flex-col lg:overflow-visible">
          {images.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`${product.title} — ${index + 1}`}
              className={cn(
                "relative h-25 w-25 shrink-0 overflow-hidden rounded-md border bg-light",
                index === activeIndex
                  ? "border-brand-600"
                  : "border-line-200 hover:border-ink-300",
              )}
            >
              <Image src={src} alt="" fill sizes="100px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
