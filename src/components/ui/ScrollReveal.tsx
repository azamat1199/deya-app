"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ScrollRevealDirection = "up" | "fade";

export interface ScrollRevealProps {
  children: ReactNode;
  direction?: ScrollRevealDirection;
  delay?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const initial = direction === "up" ? { opacity: 0, y: 20 } : { opacity: 0 };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}