/**
 * "Quantity per box" (kg / pcs) for the product detail characteristics.
 *
 * GET /api/v1/products/{slug}/ returns
 *   "box_quantity": "5.500" | null,
 *   "box_quantity_unit": "kg" | "pcs" | ""
 * already resolved by the backend (variant's own value → family's → null), so
 * there is NO fallback logic here — only parsing and display.
 *
 * Pure and framework-free (no `@/` imports, no React), so it runs under
 * `node --test` without a bundler. See boxQuantity.test.ts.
 */

export type BoxQuantityUnit = "kg" | "pcs";

/** Localised unit labels, from the dictionary (ru "кг"/"шт", uz "kg"/"dona", en "kg"/"pcs"). */
export interface BoxQuantityUnitLabels {
  kg: string;
  pcs: string;
}

export interface BoxQuantity {
  box_quantity: string | null;
  box_quantity_unit: BoxQuantityUnit | "";
}

const ABSENT: BoxQuantity = { box_quantity: null, box_quantity_unit: "" };

function isUnit(value: unknown): value is BoxQuantityUnit {
  return value === "kg" || value === "pcs";
}

function isNumericString(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim() !== "" &&
    Number.isFinite(Number(value))
  );
}

/**
 * Raw payload values → a valid pair, or the absent pair.
 *
 * An older backend omits both keys (undefined); that, a null value, an empty
 * or unknown unit, or a non-numeric value all read as "absent" — the page
 * hides the row instead of printing a number with no unit or vice versa.
 */
export function parseBoxQuantity(value: unknown, unit: unknown): BoxQuantity {
  if (isNumericString(value) && isUnit(unit)) {
    return { box_quantity: value.trim(), box_quantity_unit: unit };
  }
  return ABSENT;
}

/**
 * "24.000" + pcs → "24 шт"; "5.500" + kg → "5,5 кг" (ru/uz) / "5.5 kg" (en).
 *
 * Trailing zeros are stripped and the decimal separator is the locale's own
 * (Intl). Returns null when there is nothing to show — the caller drops the
 * row on null, so the same guard covers null, "" and a missing field.
 */
export function formatBoxQuantity(
  value: string | null | undefined,
  unit: string | null | undefined,
  lang: string,
  labels: BoxQuantityUnitLabels,
): string | null {
  const parsed = parseBoxQuantity(value, unit);
  if (parsed.box_quantity === null || parsed.box_quantity_unit === "") {
    return null;
  }
  const number = Number(parsed.box_quantity).toLocaleString(lang, {
    maximumFractionDigits: 3,
  });
  return `${number} ${labels[parsed.box_quantity_unit]}`;
}
