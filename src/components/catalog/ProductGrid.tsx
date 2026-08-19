"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, ScrollReveal } from "@/components/ui";
import { catalogProducts } from "@/content/catalog";
import type { Product } from "@/content/types";
import type { Category } from "@/lib/categories";
import type { Product as ApiProduct } from "@/lib/products";
import type { Locale } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/lib/i18n/dictionary";

import ProductCard from "./ProductCard";
import { CATALOG_ROW_INSET } from "./rowInset";

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
 * The API's badge is a bare string ("new"), while Badge takes text + variant.
 * The text reuses the copy the mock content already ships for that variant
 * rather than inventing new wording; an unrecognised value keeps its raw text
 * on the neutral variant, and null/empty renders no chip at all.
 */
const BADGE_TEXT: Record<string, { text: string; variant: "new" | "hit" }> = {
  new: { text: "Новинка", variant: "new" },
  hit: { text: "Хит продаж", variant: "hit" },
};

function toBadge(badge: string | null): Product["badge"] {
  if (!badge) return undefined;
  return BADGE_TEXT[badge.toLowerCase()] ?? { text: badge, variant: "new" };
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
function apiProductToCard(product: ApiProduct, locale: Locale): CatalogCard {
  return {
    key: product.id,
    categoryId: product.category.id,
    categorySlug: product.category.slug,
    product: {
      slug: product.slug,
      categorySlug: product.category.slug,
      title: product.name,
      image: product.main_image?.image ?? "",
      badge: toBadge(product.badge),
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

const PAGE_SIZE = 10;

// Below md the six filters stay in this one container — splitting them into two
// wrappers would have to be undone at md to keep the desktop row intact — but
// they render as two blocks: `w-full` on the first item claims a whole line, so
// the five categories wrap beneath it and the row-gap becomes the space between
// the two. Where the categories break is left to justify-center and the column
// gap, so it re-flows with the type scale instead of being pinned.
const FILTER_ROW = "max-md:justify-center max-md:gap-x-10 max-md:gap-y-[22px]";

const FILTER_ALL =
  "max-md:w-full max-md:text-center max-md:text-[clamp(14px,4.2vw,17px)] max-md:font-normal max-md:text-ink-500";

const FILTER_CATEGORY =
  "max-md:text-[clamp(13px,3.8vw,16px)] max-md:font-normal max-md:text-ink-900";

export default function ProductGrid({
  locale,
  initialCategory,
  categories,
  products,
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
        ? products.map((product) => apiProductToCard(product, locale))
        : catalogProducts.map((product) => mockProductToCard(product, locale)),
    [products, usingApi, locale],
  );

  // "All" first and selected on load, then one tab per live category in the
  // order the fetch module already sorted them (sort_order ascending).
  const tabs = useMemo<FilterTab[]>(
    () => [
      { id: null, slug: "all", label: t(ALL_TAB_LABEL_KEY) },
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

  // Never silent: whenever the static content stands in, say why.
  if (!usingApi) {
    console.error(
      "[ProductGrid] falling back to static catalog content — products request returned an empty or wholly malformed array (the underlying fetch error and its cause are logged by the catalog page)",
    );
  }

  // TEMPORARY diagnostic — remove once the backend is stable.
  console.log(
    "[diag ProductGrid]",
    JSON.stringify({
      usingApi,
      itemsLength: cards.length,
      firstItemName: cards[0]?.product.title ?? null,
      categoriesLength: categories.length,
    }),
  );

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

  return (
    <ScrollReveal direction="up">
      {/* Below md this stacks into a centred column 40px apart: the download
          link on top (order-first), then the filter block. The base
          `items-center` is what centres them — the filter container takes
          fit-content width, capped by the container, which is also what lets it
          wrap. flex-nowrap keeps the column from wrapping into a second one. */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-6 max-md:flex-col max-md:flex-nowrap max-md:gap-10">
        <div className={cn("flex flex-wrap gap-6", FILTER_ROW)}>
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              onClick={() => handleFilterChange(tab)}
              className={cn(
                "text-sm transition-colors cursor-pointer",
                // Below md the ink is positional, not stateful: the catch-all
                // reads muted on its own line, the five categories read dark.
                // The underline stays the one moving active indicator.
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

        <a
          href="#"
          className="text-sm font-medium tracking-wide text-brand-600 uppercase underline decoration-1 underline-offset-4 hover:text-brand-700 max-md:order-first"
        >
          {t("buttons.downloadCatalog")}
        </a>
      </div>

      {/* 36px from the filter row down to the grid below md: the wrapper's own
          pb-6 (24) plus this 12. The inset is padding on this container, so the
          24px column gap between cards is unaffected. */}
      {visibleCards.length > 0 ? (
        <div
          className={cn(
            "mt-10 grid grid-cols-2 gap-x-6 gap-y-10 max-md:mt-3 md:grid-cols-3 lg:grid-cols-5",
            CATALOG_ROW_INSET,
          )}
        >
          {visibleCards.map((card) => (
            <ProductCard
              key={card.key}
              product={card.product}
              href={card.href}
            />
          ))}
        </div>
      ) : (
        /* A selected category with nothing in it gets a sentence, never a blank
           band where the grid should be. */
        <p className={cn("mt-10 text-sm text-ink-500 max-md:mt-3", CATALOG_ROW_INSET)}>
          {t("catalog.empty")}
        </p>
      )}

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            {t("buttons.showMoreProducts")}
          </Button>
        </div>
      )}
    </ScrollReveal>
  );
}
