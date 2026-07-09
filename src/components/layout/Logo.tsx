import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

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
  const size = variant === "block" ? 64 : 44;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-center shrink-0",
        variant === "block"
          ? "-ml-5 h-16 self-stretch px-6 md:-ml-8 md:h-20 md:px-8 lg:-ml-10"
          : "h-11 w-11 md:h-12 md:w-12",
        className,
      )}
    >
      <Image src="/logo.svg" alt="Deya" width={size} height={size} priority />
    </Link>
  );
}
