"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/useTranslation";

export interface LogoProps {
  href: string;
  className?: string;
  variant?: "badge" | "block";
}

export default function Logo({
  href,
  className,
  variant = "badge",
}: LogoProps) {
  const { t } = useTranslation();
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-center shrink-0",
        variant === "block"
          ? " h-16 self-stretch px-6 md:-ml-8 md:h-20 md:px-8 lg:-ml-10"
          : "h-16 w-16 md:h-12 md:w-12",
        className,
      )}
    >
      <Image
        src="/logo.webp"
        alt={t("a11y.logoAlt")}
        width={65}
        height={65}
        priority
        className="h-full w-auto"
      />
    </Link>
  );
}
