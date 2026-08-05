import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

export interface AnimatedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  /** Current-route nav item — underline stays visible instead of only on hover. */
  activeUnderline?: boolean;
}

export default function AnimatedLink({
  href,
  children,
  className,
  activeUnderline = false,
}: AnimatedLinkProps) {
  return (
    <Link
      href={href}
      className={cn("group relative inline-block transition-colors", className)}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -bottom-0.5 left-0 h-px w-full bg-current",
          // Hidden by default — unconditionally. This used to sit behind
          // `@media (hover:hover)` alongside the hover growth, so anything
          // reporting `hover: none` (touch, a hybrid laptop, device emulation)
          // never got the collapsed state and rendered EVERY nav item
          // permanently underlined. Only the growth is hover-gated.
          "scale-x-0",
          // enter: grow from the left — exit: shrink toward the right
          "origin-right [@media(hover:hover)]:group-hover:origin-left",
          "[@media(hover:hover)]:group-hover:scale-x-100",
          "[@media(hover:hover)]:group-focus-visible:origin-left [@media(hover:hover)]:group-focus-visible:scale-x-100",
          "transition-transform duration-300 ease-out",
          // The current-route indicator is not a hover affordance, so it is not
          // hover-gated either.
          activeUnderline && "origin-left scale-x-100",
          "motion-reduce:transition-none",
        )}
      />
    </Link>
  );
}
