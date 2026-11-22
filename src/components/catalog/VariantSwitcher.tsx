"use client";

import { useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";
import type { VariantOption } from "@/lib/variants";

import { useVariantNavigation } from "./VariantNavigation";

export interface VariantRow {
  /** "flavor" | "weight" — stable key and test hook. */
  id: string;
  heading: string;
  options: VariantOption[];
}

export interface VariantSwitcherProps {
  locale: string;
  rows: VariantRow[];
}

const CHIP =
  "rounded-md border border-brand-600 px-4 py-2 text-xs font-medium tracking-wide uppercase";

/**
 * The "Flavor" / "Weight" chip rows. Every inactive option is a real
 * `<a href>` to the sibling product's own URL, so it is crawlable, opens in a
 * new tab on Cmd/Ctrl-click and works without JavaScript. With JavaScript, a
 * plain click becomes a client-side transition that keeps the scroll position
 * (see VariantNavigation). The active option is not a link.
 *
 * Rows with no options are not rendered; the page passes empty rows for a
 * dimension with fewer than two values, or for a product without a family.
 */
export default function VariantSwitcher({ locale, rows }: VariantSwitcherProps) {
  const visible = rows.filter((row) => row.options.length > 0);
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((row) => (
        <div key={row.id} className="mt-8" data-variant-row={row.id}>
          <h3
            id={`variant-${row.id}`}
            className="mb-3 text-xs font-semibold tracking-wide text-ink-500 uppercase"
          >
            {row.heading}
          </h3>
          <ul
            aria-labelledby={`variant-${row.id}`}
            className="flex flex-wrap gap-2"
          >
            {row.options.map((option) => (
              <li key={option.id}>
                {option.active ? (
                  <span
                    aria-current="page"
                    className={cn(CHIP, "block bg-brand-600 text-white")}
                  >
                    {option.label}
                  </span>
                ) : (
                  <VariantLink
                    href={`/${locale}/catalog/${option.categorySlug}/${option.slug}`}
                  >
                    {option.label}
                  </VariantLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function VariantLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const navigation = useVariantNavigation();
  // Prefetch on intent only (hover / focus / touch), and then the FULL route:
  // the product page is dynamic, so the default prefetch would stop short of
  // the data that actually changes between variants.
  const [intent, setIntent] = useState(false);
  const warm = () => setIntent(true);

  return (
    <Link
      href={href}
      scroll={false}
      prefetch={intent}
      onMouseEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
      onNavigate={(event) => {
        // Only fires for same-tab client navigation — modifier clicks still
        // open a new tab. Routed through the shared transition so the content
        // blocks can show the pending state.
        if (!navigation) return;
        event.preventDefault();
        navigation.navigate(href);
      }}
      className={cn(
        CHIP,
        "block text-brand-600 transition-colors hover:bg-brand-50",
      )}
    >
      {children}
    </Link>
  );
}
