import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type SectionBackground =
  | "white"
  | "dark"
  | "red"
  | "light"
  | "cream"
  | "cream50";
export type SectionContainerWidth = "page" | "home" | "inner";

export interface SectionProps {
  bg?: SectionBackground;
  containerWidth?: SectionContainerWidth;
  className?: string;
  /** Escape hatch for backgrounds Tailwind can't express (e.g. a gradient
   * with specific percentage stops) — takes priority over `bg`. */
  style?: CSSProperties;
  children: ReactNode;
}

const BG_CLASSES: Record<SectionBackground, string> = {
  white: "bg-white text-ink-900",
  dark: "bg-ink-900 text-white",
  red: "bg-brand-600 text-white",
  light: "bg-light text-ink-900",
  cream: "bg-cream text-ink-900",
  cream50: "bg-cream-50 text-ink-900",
};

// Figma grid: home sections get 1440px max width with 80px desktop margins,
// inner pages get a tighter 1080px reading column with 40px margins.
const CONTAINER_CLASSES: Record<SectionContainerWidth, string> = {
  // The site-wide gutter, shared with the Header, Footer and HeroSlider so
  // content lands on the same left/right line everywhere. Defined once as the
  // `.container-page` utility in globals.css — never re-declare its values.
  page: "container-page",
  home: "mx-auto w-full max-w-[1440px] px-5 md:px-10 lg:px-20",
  inner: "mx-auto w-full max-w-[1080px] px-5 md:px-8 lg:px-10",
};

export default function Section({
  bg = "white",
  containerWidth = "home",
  className,
  style,
  children,
}: SectionProps) {
  return (
    <section className={cn("", BG_CLASSES[bg], className)} style={style}>
      <div>
        <div className={CONTAINER_CLASSES[containerWidth]}>{children}</div>
      </div>
    </section>
  );
}
