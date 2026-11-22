/**
 * Flavour / weight variant switching for the product detail page.
 *
 * Variant model (backend): every flavour × weight combination is its OWN
 * product with its own slug, images, code and box weight. Products that belong
 * to the same `family` are variants of each other. The detail endpoint answers
 * with the current product plus `variants` — the OTHER active products of the
 * family, never the current one, already sorted
 * flavor.sort_order → weight.unit → weight.value → sort_order → id.
 *
 * Everything here is pure and framework-free (no `@/` imports, no React), so it
 * runs under `node --test` without a bundler. See variants.test.ts.
 */

export interface VariantFlavor {
  id: number;
  name: string;
  slug: string;
  sort_order?: number;
}

export interface VariantWeight {
  id: number;
  /** Decimal string, e.g. "500.00". */
  value: string;
  /** "g" | "kg". */
  unit: string;
}

/** The slice of a product the switcher needs — current and siblings alike. */
export interface VariantItem {
  id: number;
  slug: string;
  category: { slug: string };
  flavor: VariantFlavor | null;
  weight: VariantWeight | null;
}

export interface VariantOption {
  /** flavor.id or weight.id — stable React key. */
  id: number;
  label: string;
  /** Product the option opens. Equals the current slug for the active option. */
  slug: string;
  categorySlug: string;
  active: boolean;
}

export interface VariantOptions {
  /** Empty when the family has fewer than two flavours. */
  flavor: VariantOption[];
  /** Empty when the family has fewer than two weights. */
  weight: VariantOption[];
}

export interface VariantPick {
  flavorId?: number;
  weightId?: number;
}

/**
 * The current product first, then its siblings in API order. The current
 * product must be in the pool so the active option resolves to this very page,
 * and so "earliest in API order" fallbacks still see every product.
 */
export function variantPool<T extends VariantItem>(
  current: T,
  variants: readonly T[],
): T[] {
  return [current, ...variants.filter((item) => item.id !== current.id)];
}

/**
 * The product a flavour or weight click should open.
 *
 * 1. Exact: the clicked value plus the current value of the other dimension.
 * 2. Fallback: any product with the clicked value, earliest in the pool. Only
 *    the dimension that was actually clicked is held fixed — switching to a
 *    flavour that is sold in one weight only lands on that weight.
 * 3. Nothing has the clicked value → null.
 *
 * With neither id given, the pick is the current product's own pair, which
 * resolves to the current product.
 */
export function resolveVariant<T extends VariantItem>(
  allVariants: readonly T[],
  current: VariantItem,
  pick: VariantPick,
): T | null {
  const want = {
    flavorId: pick.flavorId ?? current.flavor?.id,
    weightId: pick.weightId ?? current.weight?.id,
  };

  const exact = allVariants.find(
    (item) =>
      item.flavor?.id === want.flavorId && item.weight?.id === want.weightId,
  );
  if (exact) return exact;

  if (pick.weightId !== undefined) {
    return allVariants.find((item) => item.weight?.id === pick.weightId) ?? null;
  }
  if (pick.flavorId !== undefined) {
    return allVariants.find((item) => item.flavor?.id === pick.flavorId) ?? null;
  }
  return null;
}

/** g before kg, then by numeric value. Unknown units sort last. */
const UNIT_ORDER: Record<string, number> = { g: 0, kg: 1 };

function unitRank(unit: string): number {
  return UNIT_ORDER[unit.toLowerCase()] ?? Number.MAX_SAFE_INTEGER;
}

function compareWeights(a: VariantWeight, b: VariantWeight): number {
  return (
    unitRank(a.unit) - unitRank(b.unit) ||
    Number(a.value) - Number(b.value) ||
    a.id - b.id
  );
}

export interface WeightUnitLabels {
  g: string;
  kg: string;
}

/**
 * "500.00","g" → "500 g"; "1.50","kg" → "1,5 кг" on /ru, "1.5 kg" on /en.
 * Trailing zeros are dropped; the decimal separator follows the locale; the
 * unit label comes from the dictionary. An unparseable value or unknown unit is
 * shown as-is rather than hidden.
 */
export function formatWeight(
  weight: Pick<VariantWeight, "value" | "unit">,
  locale: string,
  units: WeightUnitLabels,
): string {
  const parsed = Number(weight.value);
  const value = Number.isFinite(parsed)
    ? parsed.toLocaleString(locale, { maximumFractionDigits: 3 })
    : weight.value;
  const key = weight.unit.toLowerCase();
  const unit = key === "g" || key === "kg" ? units[key] : weight.unit;
  return `${value} ${unit}`;
}

/** First occurrence wins, so the order matches the pool (= API order). */
function uniqueById<V extends { id: number }>(values: (V | null)[]): V[] {
  const seen = new Map<number, V>();
  for (const value of values) {
    if (value && !seen.has(value.id)) seen.set(value.id, value);
  }
  return [...seen.values()];
}

/**
 * Both option rows, each option carrying the slug it links to.
 *
 * Options are derived from the pool, so every option has at least one product
 * behind it and resolveVariant never returns null for one — the `?? current`
 * is only a type-level guard. A row with fewer than two options is returned
 * empty: a single chip is not a choice. A product without a family has an
 * empty `variants`, a one-item pool, and therefore no rows at all.
 */
export function buildOptions(
  allVariants: readonly VariantItem[],
  current: VariantItem,
  formatWeightLabel: (weight: VariantWeight) => string,
): VariantOptions {
  const toOption = (
    id: number,
    label: string,
    pick: VariantPick,
    isActive: boolean,
  ): VariantOption => {
    const target = resolveVariant(allVariants, current, pick) ?? current;
    return {
      id,
      label,
      slug: target.slug,
      categorySlug: target.category.slug,
      active: isActive,
    };
  };

  // Array.prototype.sort is stable, so equal sort_order keeps API order.
  const flavors = uniqueById(allVariants.map((item) => item.flavor)).sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  const weights = uniqueById(allVariants.map((item) => item.weight)).sort(
    compareWeights,
  );

  return {
    flavor:
      flavors.length < 2
        ? []
        : flavors.map((flavor) =>
            toOption(
              flavor.id,
              flavor.name,
              { flavorId: flavor.id },
              flavor.id === current.flavor?.id,
            ),
          ),
    weight:
      weights.length < 2
        ? []
        : weights.map((weight) =>
            toOption(
              weight.id,
              formatWeightLabel(weight),
              { weightId: weight.id },
              weight.id === current.weight?.id,
            ),
          ),
  };
}
