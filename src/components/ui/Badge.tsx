import { cn } from "@/lib/cn";

export type BadgeVariant = "new" | "hit" | "default";

export interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  new: "bg-brand-600 text-white",
  hit: "bg-brand-600 text-white",
  default: "bg-ink-100 text-ink-700",
};

export default function Badge({ text, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium uppercase tracking-wide",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {text}
    </span>
  );
}