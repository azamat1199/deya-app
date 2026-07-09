import Link from "next/link";

import { cn } from "@/lib/cn";

export interface SectionHeadingProps {
  title: string;
  link?: { text: string; href: string };
  className?: string;
}

export default function SectionHeading({ title, link, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <h2 className="text-2xl font-normal text-ink-900 md:text-3xl">{title}</h2>
      {link && (
        <Link
          href={link.href}
          className="shrink-0 text-xs font-medium tracking-wide text-ink-900 uppercase underline decoration-1 underline-offset-4 transition-colors duration-200 hover:text-brand-600"
        >
          {link.text}
        </Link>
      )}
    </div>
  );
}