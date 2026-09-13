"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";
import { locales, type Locale } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/useTranslation";

const LOCALE_LABELS: Record<string, string> = {
  uz: "UZ",
  ru: "RU",
  en: "ENG",
};

function localeLabel(loc: string) {
  return LOCALE_LABELS[loc] ?? loc.toUpperCase();
}

const LOCALE_ORDER: readonly Locale[] = ["ru", "en", "uz"];

const ORDERED_LOCALES: readonly Locale[] = [
  ...LOCALE_ORDER.filter((loc) => locales.includes(loc)),
  ...locales.filter((loc) => !LOCALE_ORDER.includes(loc)),
];

const TYPE_SPEC =
  "text-[14px] leading-[1.25] font-medium tracking-[-0.02em] uppercase";

const PANEL_BOX = "h-[117px] w-[50px]";

export interface LanguageSwitchProps {
  className?: string;
  variant?: "toggle" | "dropdown";
}

export default function LanguageSwitch({
  className,
  variant = "toggle",
}: LanguageSwitchProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const pendingFocusRef = useRef<number | null>(null);

  const pathWithoutLocale = pathname.split("/").slice(2).join("/");

  const query = searchParams.toString();

  function localeHref(loc: string) {
    const path = pathWithoutLocale ? `/${pathWithoutLocale}` : "";
    return `/${loc}${path}${query ? `?${query}` : ""}`;
  }

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
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const index = pendingFocusRef.current;
    pendingFocusRef.current = null;
    if (index === null) return;
    itemRefs.current[index]?.focus();
  }, [open]);

  if (variant === "dropdown") {
    const lastIndex = ORDERED_LOCALES.length - 1;

    function focusItem(index: number) {
      const count = ORDERED_LOCALES.length;
      // Wraps both ways, so ArrowUp from the first option lands on the last.
      itemRefs.current[((index % count) + count) % count]?.focus();
    }

    function onTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const target = event.key === "ArrowDown" ? 0 : lastIndex;

      if (open) {
        focusItem(target);
        return;
      }
      pendingFocusRef.current = target;
      setOpen(true);
    }

    function onPanelKeyDown(event: ReactKeyboardEvent<HTMLUListElement>) {
      const current = itemRefs.current.findIndex(
        (el) => el === document.activeElement,
      );
      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusItem(current + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        focusItem(current - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        focusItem(0);
      } else if (event.key === "End") {
        event.preventDefault();
        focusItem(lastIndex);
      }
    }

    return (
      <div ref={rootRef} className={cn("relative", className)}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          onKeyDown={onTriggerKeyDown}
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-4",
            TYPE_SPEC,
          )}
        >
          {localeLabel(locale)}
          <svg
            width="9"
            height="6"
            viewBox="0 0 10 6"
            aria-hidden="true"
            className={cn(
              "transition-transform duration-200",
              open && "rotate-180",
            )}
          >
            <path d="M0 0h10L5 6z" fill="currentColor" />
          </svg>
        </button>

        {open && (
          <ul
            role="menu"
            onKeyDown={onPanelKeyDown}
            className={cn(
              "absolute top-full right-0 z-50 mt-2 flex flex-col bg-white px-2 text-ink-900 shadow-md",
              PANEL_BOX,
            )}
          >
            {ORDERED_LOCALES.map((loc, index) => (
              <li
                key={loc}
                role="none"
                className="flex min-h-0 flex-1 border-t border-line-200 first:border-t-0"
              >
                <Link
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  role="menuitem"
                  href={localeHref(loc)}
                  className={cn(
                    "flex w-full items-center justify-center transition-colors outline-brand-500 hover:text-brand-500 focus-visible:text-brand-500 focus-visible:outline-2 focus-visible:-outline-offset-2",
                    TYPE_SPEC,
                  )}
                  aria-current={loc === locale ? "true" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {localeLabel(loc)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-1 text-sm font-semibold", className)}
    >
      {locales.map((loc, index) => (
        <span key={loc} className="flex items-center gap-1">
          <Link
            href={localeHref(loc)}
            className={cn(
              "uppercase transition-colors hover:text-brand-500",
              loc === locale ? "text-brand-500" : "opacity-60",
            )}
            aria-current={loc === locale ? "true" : undefined}
          >
            {localeLabel(loc)}
          </Link>
          {index < locales.length - 1 && (
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
