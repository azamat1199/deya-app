"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, ScrollReveal } from "@/components/ui";
import { catalogProducts } from "@/content/catalog";
import type { Product } from "@/content/types";
import type { Category } from "@/lib/categories";
import { productImageUrl, type Product as ApiProduct } from "@/lib/products";
import type { Locale } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { badgeTranslationKey } from "@/lib/badges";

import ProductCard from "./ProductCard";
import {
  CATALOG_GRID_CATEGORY_ATTR,
  CATALOG_GRID_ID,
} from "./catalogGridAnchor";

export interface ProductGridProps {
  locale: Locale;
  initialCategory?: string;
  /**
   * Live categories and products, both fetched on the server by the catalog
   * page. REQUIRED and deliberately WITHOUT default values: a default would
   * silently mask a missing prop and let the mock render while the fetch logs
   * looked healthy, which is how the last three integrations regressed
   * unnoticed. A missing prop is now a compile error instead.
   */
  categories: Category[];
  products: ApiProduct[];
  /** Normalised https URL to the catalog PDF, or "" when none is uploaded. */
  catalogFile: string;
}

/** "All" keeps its existing translated label; every other tab is a live
 *  category, so its label is the API `name` and there is no key to translate. */
interface FilterTab {
  /** `null` is the catch-all tab. Otherwise the category id the cards match. */
  id: number | null;
  slug: string;
  label: string;
}

/**
 * The badge vocabulary lives in lib/badges.ts, shared with the server pages
 * (home, product detail) so there is one map, not two. An empty or
 * unrecognised value renders no chip; badges.ts logs the unrecognised case.
 */
function toBadge(
  badge: string | null,
  t: (key: TranslationKey) => string,
): Product["badge"] {
  const entry = badgeTranslationKey(badge);
  if (!entry) return undefined;
  return { text: t(entry.key), variant: entry.variant };
}

/**
 * One card as the grid renders it. `key` carries the API id rather than an
 * array index, and `categoryId` is what the tab row matches against, so neither
 * concern has to be re-derived inside the JSX.
 */
interface CatalogCard {
  key: string | number;
  /** Null only on the mock fallback, which has no API category ids. */
  categoryId: number | null;
  categorySlug: string;
  product: Product;
  href: string;
}

/**
 * A live product rendered through the existing ProductCard.
 *
 * The title is the PRODUCT name, never category.name. `weight` and
 * `description` have no counterpart in this payload, so they stay absent and
 * their markup renders nothing — no invented values, nothing deleted. `flavor`
 * is carried by the API but ProductCard has no slot for it, so it is not
 * rendered either.
 *
 * href reuses the card's existing two-segment pattern with the API's own slugs.
 */
function apiProductToCard(
  product: ApiProduct,
  locale: Locale,
  t: (key: TranslationKey) => string,
): CatalogCard {
  return {
    key: product.id,
    categoryId: product.category.id,
    categorySlug: product.category.slug,
    product: {
      slug: product.slug,
      categorySlug: product.category.slug,
      title: product.name,
      image: productImageUrl(product),
      badge: toBadge(product.badge, t),
    },
    href: `/${locale}/catalog/${product.category.slug}/${product.slug}`,
  };
}

/** The fallback path: keeps each mock product's original two-segment href. */
function mockProductToCard(product: Product, locale: Locale): CatalogCard {
  return {
    key: product.slug,
    categoryId: null,
    categorySlug: product.categorySlug,
    product,
    href: `/${locale}/catalog/${product.categorySlug}/${product.slug}`,
  };
}

/** The catch-all tab's label is the only one still translated — every other tab
 *  is a live category whose label is the API `name`. */
const ALL_TAB_LABEL_KEY: TranslationKey = "buttons.allCatalog";

/** The catch-all tab's slug. Never appears in a URL — `?category=` is simply
 *  dropped for "all" — but the grid still reports it as its rendered state. */
const ALL_TAB_SLUG = "all";

/** 15 = the 5-column grid's first three rows, per Figma. Also the batch each
 *  "show more" click adds, so every reveal fills whole rows. */
const PAGE_SIZE = 15;

// Below md the six filters stay in this one container — splitting them into two
// wrappers would have to be undone at md to keep the desktop row intact — but
// they render as two blocks: `w-full` on the first item claims a whole line, so
// the five categories wrap beneath it and the row-gap becomes the space between
// the two. Where the categories break is left to justify-center and the column
// gap, so it re-flows with the type scale instead of being pinned.
const FILTER_ROW = "max-md:justify-center max-md:gap-x-10 max-md:gap-y-[22px]";

/**
 * The filter tabs' mobile type, in ONE place. Both "Весь каталог" and every
 * category tab render from the same `tabs.map()` below, so this is applied to
 * their shared class string rather than duplicated into the two role-specific
 * constants underneath — which is also why those two no longer carry a size or
 * a weight of their own.
 *
 * Roboto 400 / 12px / 120% / 0. Every value is a config token except the
 * leading:
 *
 *   font-sans        --font-sans → --font-roboto (@theme inline, globals.css).
 *                    Unprefixed, because the family is the same at every width
 *                    and this only makes explicit what <body> already inherits.
 *                    Confirmed already loaded via next/font — nothing added.
 *   text-xs          Tailwind v4's default scale, 0.75rem = 12px. This project
 *                    does not override the type scale (there is no
 *                    tailwind.config at all — v4 keeps its theme in the
 *                    @theme inline block), so the token is exactly the spec.
 *   font-normal      400.
 *   tracking-normal  0em.
 *   leading-[1.2]    ARBITRARY — there is no 1.2 in the leading scale (none=1,
 *                    tight=1.25, snug=1.375, …), so the spec's 120% has no
 *                    token. Flagged as a candidate for a `--leading-*` entry in
 *                    globals.css's @theme block. Written as a ratio, not 14.4px,
 *                    so it tracks the size. It also has to come after text-xs:
 *                    v4's text-* utilities set a paired line-height, and this
 *                    is what overrides it.
 *
 * MOBILE ONLY, and flagged: the spec gave no desktop size, and desktop is
 * currently text-sm (14px). Applying 12px unprefixed would have silently shrunk
 * it. Dropping the `max-md:` prefixes is the one change if Figma wants 12px
 * everywhere.
 */
const FILTER_TYPE =
  "font-sans max-md:text-xs max-md:leading-[1.2] max-md:font-normal max-md:tracking-normal";

// Size and weight moved to FILTER_TYPE above; these keep only what is specific
// to each role — the full-width centred line for "All", and the two different
// resting colours. Colours, states and layout are untouched.
const FILTER_ALL = "max-md:w-full max-md:text-center max-md:text-ink-500";

const FILTER_CATEGORY = "max-md:text-ink-900";

export default function ProductGrid({
  locale,
  initialCategory,
  categories,
  products,
  catalogFile,
}: ProductGridProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const usingApi = products.length > 0;

  // The ONLY array the grid below reads. Live products when the request
  // produced any, the hand-authored catalog otherwise — a public marketing page
  // shows stale cards rather than an empty grid.
  const cards = useMemo<CatalogCard[]>(
    () =>
      usingApi
        ? products.map((product) => apiProductToCard(product, locale, t))
        : catalogProducts.map((product) => mockProductToCard(product, locale)),
    [products, usingApi, locale, t],
  );

  // "All" first and selected on load, then one tab per live category in the
  // order the fetch module already sorted them (sort_order ascending).
  const tabs = useMemo<FilterTab[]>(
    () => [
      { id: null, slug: ALL_TAB_SLUG, label: t(ALL_TAB_LABEL_KEY) },
      ...categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        label: category.name,
      })),
    ],
    [categories, t],
  );

  // Defaults to the catch-all tab. A ?category= slug still wins when it names a
  // real category, so the home page's category links keep working — on a plain
  // visit there is no query and "All" is what loads.
  const [activeId, setActiveId] = useState<number | null>(() => {
    const match = categories.find((c) => c.slug === initialCategory);
    return match ? match.id : null;
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /**
   * The ?category= this grid has already applied. Seeded with the value the
   * initializer above consumed, so a direct page load syncs nothing.
   */
  const appliedCategoryRef = useRef(initialCategory);

  /**
   * A <Link> navigation WITHIN /catalog — a CategoryBanner tile, a footer
   * category, a breadcrumb — re-renders the page but leaves this component
   * mounted. The useState initializer above therefore never runs again, so
   * every such click used to change the URL and nothing else: the grid kept
   * the filter it mounted with. Only a full reload looked right.
   *
   * Re-derived here from the prop, by the same rule the initializer uses, so
   * there is still one definition of "which tab does this slug mean".
   *
   * Guarded by the ref rather than by the dep array: `categories` is a fresh
   * array on every server render, so an unguarded effect would also re-run —
   * and reset pagination — when the param had not actually changed.
   */
  useEffect(() => {
    if (appliedCategoryRef.current === initialCategory) return;
    appliedCategoryRef.current = initialCategory;

    const match = categories.find((c) => c.slug === initialCategory);
    setActiveId(match ? match.id : null);
    // Same reset handleFilterChange does — a new filter starts at page one.
    setVisibleCount(PAGE_SIZE);
  }, [initialCategory, categories]);

  // Never silent: whenever the static content stands in, say why.
  if (!usingApi) {
    console.error(
      "[ProductGrid] falling back to static catalog content — products request returned an empty or wholly malformed array (the underlying fetch error and its cause are logged by the catalog page)",
    );
  }

  // Compared by category id, not slug, and filtered from the already-fetched
  // array — switching tabs never refetches.
  const filtered = useMemo(() => {
    if (activeId === null) return cards;
    return cards.filter((card) => card.categoryId === activeId);
  }, [activeId, cards]);

  const visibleCards = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function handleFilterChange(tab: FilterTab) {
    setActiveId(tab.id);
    setVisibleCount(PAGE_SIZE);

    const query = tab.id === null ? "" : `?category=${tab.slug}`;
    router.replace(`/${locale}/catalog${query}`, { scroll: false });
  }

  // What the grid is rendering RIGHT NOW, published on the DOM so a banner
  // click can wait for its own category to appear before scrolling. Derived
  // from activeId, never from the URL, so it can only ever claim a filter the
  // cards below actually reflect.
  const activeSlug = tabs.find((tab) => tab.id === activeId)?.slug ?? ALL_TAB_SLUG;

  return (
    <ScrollReveal direction="up">
      <div
        id={CATALOG_GRID_ID}
        {...{ [CATALOG_GRID_CATEGORY_ATTR]: activeSlug }}
        // scroll-margin so scrollIntoView stops clear of the sticky header
        // instead of tucking the filter row underneath it. Reads the same
        // --header-height the header sizes itself with, so it follows the
        // 4rem→5rem breakpoint change on its own.
        className="scroll-mt-[calc(var(--header-height)+1.5rem)] flex flex-wrap items-center justify-between gap-6 pb-6 max-md:flex-col max-md:flex-nowrap max-md:gap-10"
      >
        <div className={cn("flex flex-wrap gap-6", FILTER_ROW)}>
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              onClick={() => handleFilterChange(tab)}
              className={cn(
                "text-sm transition-colors cursor-pointer",
                // One shared type style for both tab kinds — see FILTER_TYPE.
                FILTER_TYPE,
                tab.id === null ? FILTER_ALL : FILTER_CATEGORY,
                activeId === tab.id
                  ? "font-medium text-ink-900 underline underline-offset-4"
                  : "text-ink-500 hover:text-ink-900",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {catalogFile && (
          <a
            href={catalogFile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium tracking-wide text-brand-600 uppercase underline decoration-1 underline-offset-4 hover:text-brand-700 max-md:order-first"
          >
            {t("buttons.downloadCatalog")}
          </a>
        )}
      </div>

      {visibleCards.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 max-md:mt-3 md:grid-cols-3 lg:grid-cols-5">
          {visibleCards.map((card) => (
            <ProductCard
              key={card.key}
              product={card.product}
              href={card.href}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-ink-500 max-md:mt-3">
          {t("catalog.empty")}
        </p>
      )}

      {hasMore && (
        <div className="mt-12 flex justify-center">
          {/* Mobile type: Roboto 500 / 12px / 120% / 0, uppercase, centred.
              `uppercase` and the centring already come from ui/Button (BASE's
              `uppercase` and `justify-center`), so only the weight, size,
              leading and tracking are restated.

              WIDTH: the spec says `width: 100` with no unit. Read as 100%, per
              your own note — 100px cannot hold "ПОКАЗАТЬ ЕЩЕ ПРОДУКЦИЮ", which
              measures far wider even at 12px. Figma could not be opened to
              confirm (unreachable all session); FLAGGED in the report.
              `max-md:w-full` rather than the component's `fullWidth` prop,
              because that prop has no breakpoint and would stretch the desktop
              button too. The wrapper is a sibling of the grid inside the same
              ScrollReveal, so 100% here is exactly the grid's own width.

              The overrides carry `max-md:` because cn() is plain clsx and
              keeps both the losing and winning class: unprefixed, Tailwind's
              own scale order would pick BASE's `font-semibold` over
              `font-medium`. A variant sorts after every unprefixed utility,
              which settles it. Padding, radius and colour are untouched. */}
          <Button
            variant="primary"
            size="lg"
            className="max-md:w-full max-md:text-[12px] max-md:leading-[1.2] max-md:font-medium max-md:tracking-normal"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            {t("buttons.showMoreProducts")}
          </Button>
        </div>
      )}
    </ScrollReveal>
  );
}
