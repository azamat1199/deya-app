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
    <Link href={href} className={cn("group relative inline-block transition-colors", className)}>
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -bottom-0.5 left-0 h-px w-full bg-current",
          "[@media(hover:hover)]:scale-x-0",
          // enter: grow from the left — exit: shrink toward the right
          "origin-right [@media(hover:hover)]:group-hover:origin-left",
          "[@media(hover:hover)]:group-hover:scale-x-100",
          "[@media(hover:hover)]:group-focus-visible:origin-left [@media(hover:hover)]:group-focus-visible:scale-x-100",
          "transition-transform duration-300 ease-out",
          activeUnderline && "[@media(hover:hover)]:origin-left [@media(hover:hover)]:scale-x-100",
          "motion-reduce:transition-none",
        )}
      />
    </Link>
  );
}
