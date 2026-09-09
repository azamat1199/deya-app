"use client";

import { useMemo, useState } from "react";
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

import ProductCard from "./ProductCard";

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
 * The API's badge is a bare lowercase string, while Badge takes text +
 * variant. Verified against the live endpoint: the field is `badge` and the
 * only values it emits are "new", "bestseller", "discount" and "" — never
 * "hit", which is what the previous map was keyed on.
 *
 * That mismatch is why chips rendered inconsistently: "new" hit the map and
 * showed hardcoded Russian, while "bestseller" and "discount" missed it and
 * fell through to a branch that passed the RAW API STRING through as the
 * label, which Badge's `uppercase` turned into "BESTSELLER" / "DISCOUNT".
 * Every label now resolves through the dictionary instead, so all three
 * switch with the site language.
 *
 * `new` and `hit` are the same red chip in Badge — the variant here carries
 * no visual difference, only intent.
 */
const BADGE_KEYS: Record<
  string,
  { key: TranslationKey; variant: "new" | "hit" }
> = {
  new: { key: "catalog.badges.new", variant: "new" },
  bestseller: { key: "catalog.badges.bestseller", variant: "hit" },
  discount: { key: "catalog.badges.discount", variant: "hit" },
};

/**
 * An empty/absent badge renders no chip. So does an UNRECOGNISED one — it is
 * reported rather than shown, because the old pass-the-raw-string behaviour is
 * exactly the untranslated-label bug being fixed here. A new CMS value
 * therefore needs a dictionary key before it can appear.
 */
function toBadge(
  badge: string | null,
  t: (key: TranslationKey) => string,
): Product["badge"] {
  const value = badge?.trim().toLowerCase();
  if (!value) return undefined;

  const entry = BADGE_KEYS[value];
  if (!entry) {
    console.warn(
      `[ProductGrid] unmapped badge value ${JSON.stringify(badge)} — no chip rendered. Add a catalog.badges.* key and map it in BADGE_KEYS.`,
    );
    return undefined;
  }

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

const FILTER_ALL =
  "max-md:w-full max-md:text-center max-md:text-[clamp(14px,4.2vw,17px)] max-md:font-normal max-md:text-ink-500";

const FILTER_CATEGORY =
  "max-md:text-[clamp(13px,3.8vw,16px)] max-md:font-normal max-md:text-ink-900";

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
      <div className="flex flex-wrap items-center justify-between gap-6 pb-6 max-md:flex-col max-md:flex-nowrap max-md:gap-10">
        <div className={cn("flex flex-wrap gap-6", FILTER_ROW)}>
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              onClick={() => handleFilterChange(tab)}
              className={cn(
                "text-sm transition-colors cursor-pointer",
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
