"use client";

import Image from "next/image";
import { useState } from "react";

export interface FounderImageProps {
  /** null when the CMS has no portrait. Never "" — getFactory normalises. */
  src: string | null;
  alt: string;
  className: string;
}

/**
 * The portrait, with the two ways it can be absent handled identically: no URL
 * at all, and a URL that 404s at runtime. Both leave the parent's gradient
 * showing through, which is what keeps the white text legible.
 *
 * A client component ONLY because next/image's onError takes a function, which
 * cannot cross the server/client boundary. Kept as a leaf so FounderStory
 * itself stays a server component and its text is server-rendered.
 */
export default function FounderImage({ src, alt, className }: FounderImageProps) {
  // The url that failed, not a boolean: if the CMS swaps in a different
  // portrait the new one deserves a fresh attempt rather than inheriting the
  // old one's failure. Compared during render — no effect, no second pass.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!src || src === failedUrl) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="100vw"
      quality={90}
      priority
      className={className}
      onError={() => setFailedUrl(src)}
    />
  );
}
