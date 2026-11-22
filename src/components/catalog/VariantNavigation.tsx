"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";

/**
 * Shared pending state for flavour/weight switching on the product page.
 *
 * A variant is a separate product at its own URL, so switching is a real
 * navigation. Running it through useTransition keeps the current product on
 * screen (no blank page, no route-level skeleton) and exposes `pending` for the
 * whole time the next product's RSC payload is loading, which the regions
 * below use to dim the content in place.
 *
 * The provider lives inside the [product] page, so it remounts with each
 * product and `pending` always starts out false on the new one.
 */
interface VariantNavigationValue {
  pending: boolean;
  navigate: (href: string) => void;
}

const VariantNavigationContext = createContext<VariantNavigationValue | null>(
  null,
);

export function VariantNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string) => {
      startTransition(() => {
        // scroll: false — the switcher sits mid-page; jumping to the top on
        // every chip click would lose the user's place.
        router.push(href, { scroll: false });
      });
    },
    [router],
  );

  const value = useMemo(() => ({ pending, navigate }), [pending, navigate]);

  return (
    <VariantNavigationContext.Provider value={value}>
      {children}
    </VariantNavigationContext.Provider>
  );
}

/** Null outside a provider — callers fall back to a plain Link navigation. */
export function useVariantNavigation(): VariantNavigationValue | null {
  return useContext(VariantNavigationContext);
}

/**
 * Dims its children while a variant switch is loading. The fade only starts
 * after a short delay, so a prefetched (near-instant) switch does not flash.
 * Takes the layout classes of the element it replaces, so wrapping a block
 * does not add a level to the grid.
 */
export function VariantPendingRegion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const pending = useVariantNavigation()?.pending ?? false;

  return (
    <div
      aria-busy={pending || undefined}
      className={cn(
        "transition-opacity duration-200",
        pending && "opacity-50 delay-150",
        className,
      )}
    >
      {children}
    </div>
  );
}
