"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "outline" | "outline-white" | "ghost" | "white";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  variant: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800",
  outline:
    "border border-ink-900 bg-transparent text-ink-900 hover:border-brand-600 hover:bg-brand-600 hover:text-white active:bg-brand-700 active:border-brand-700",
  "outline-white":
    "border border-white bg-transparent text-white hover:bg-white hover:text-ink-900 active:bg-ink-100",
  ghost: "bg-transparent text-brand-600 hover:text-brand-700 hover:underline active:text-brand-800",
  white: "bg-white text-ink-900 hover:bg-ink-50 active:bg-ink-100",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "gap-1.5 px-4 py-2 text-xs",
  md: "gap-2 px-6 py-3 text-sm",
  lg: "gap-2.5 px-8 py-4 text-base",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-semibold uppercase tracking-wide transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
      />
    </svg>
  );
}

export default function Button({
  variant,
  size = "md",
  href,
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  type = "button",
  onClick,
  children,
  className,
}: ButtonProps) {
  const isInactive = disabled || loading;

  const classes = cn(
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && "w-full",
    isInactive && "pointer-events-none opacity-60",
    className,
  );

  const content = loading ? (
    <Spinner />
  ) : (
    <>
      {icon}
      {children}
    </>
  );

  if (href) {
    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
      if (isInactive) {
        event.preventDefault();
        return;
      }
      onClick?.();
    }

    return (
      <Link
        href={href}
        className={classes}
        aria-disabled={isInactive}
        tabIndex={isInactive ? -1 : undefined}
        onClick={handleClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={isInactive}
      onClick={onClick}
    >
      {content}
    </button>
  );
}