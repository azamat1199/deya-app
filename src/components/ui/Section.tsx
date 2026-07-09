import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type SectionBackground = "white" | "dark" | "red" | "light" | "cream";
export type SectionContainerWidth = "home" | "inner";

export interface SectionProps {
  bg?: SectionBackground;
  containerWidth?: SectionContainerWidth;
  className?: string;
  children: ReactNode;
}

const BG_CLASSES: Record<SectionBackground, string> = {
  white: "bg-white text-ink-900",
  dark: "bg-ink-900 text-white",
  red: "bg-brand-600 text-white",
  light: "bg-light text-ink-900",
  cream: "bg-cream text-ink-900",
};

// Figma grid: home sections get 1440px max width with 80px desktop margins,
// inner pages get a tighter 1080px reading column with 40px margins.
const CONTAINER_CLASSES: Record<SectionContainerWidth, string> = {
  home: "mx-auto w-full max-w-[1440px] px-5 md:px-10 lg:px-20",
  inner: "mx-auto w-full max-w-[1080px] px-5 md:px-8 lg:px-10",
};

export default function Section({
  bg = "white",
  containerWidth = "home",
  className,
  children,
}: SectionProps) {
  return (
    <section className={cn("py-16 lg:py-24", BG_CLASSES[bg], className)}>
      <div className={CONTAINER_CLASSES[containerWidth]}>{children}</div>
    </section>
  );
}