"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";
import { locales } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/useTranslation";

function localeLabel(loc: string) {
  return loc === "en" ? "ENG" : "РУС";
}

export interface LanguageSwitchProps {
  className?: string;
  variant?: "toggle" | "dropdown";
}

export default function LanguageSwitch({ className, variant = "toggle" }: LanguageSwitchProps) {
  const pathname = usePathname();
  const { locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const rootRef = useRef<HTMLDivElement>(null);

  const pathWithoutLocale = pathname.split("/").slice(2).join("/");

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (variant === "dropdown") {
    const otherLocales = locales.filter((loc) => loc !== locale);

    return (
      <div ref={rootRef} className={cn("relative", className)}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide"
        >
          {localeLabel(locale)}
          <ChevronDown size={14} className={cn("transition-transform duration-200", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-10 mt-2 min-w-20 overflow-hidden rounded-md bg-white py-1 text-ink-900 shadow-lg">
            {otherLocales.map((loc) => (
              <Link
                key={loc}
                href={`/${loc}${pathWithoutLocale ? `/${pathWithoutLocale}` : ""}`}
                className="block px-3 py-1.5 text-sm font-semibold uppercase tracking-wide hover:bg-light"
                onClick={() => setOpen(false)}
              >
                {localeLabel(loc)}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1 text-sm font-semibold", className)}>
      {locales.map((loc, index) => (
        <span key={loc} className="flex items-center gap-1">
          <Link
            href={`/${loc}${pathWithoutLocale ? `/${pathWithoutLocale}` : ""}`}
            className={cn(
              "uppercase transition-colors hover:text-brand-500",
              loc === locale ? "text-brand-500" : "opacity-60",
            )}
            aria-current={loc === locale ? "true" : undefined}
          >
            {localeLabel(loc)}
          </Link>
          {index < locales.length - 1 && <span aria-hidden="true" className="opacity-40">/</span>}
        </span>
      ))}
    </div>
  );
}
