// Run with `npm test` — Node's built-in runner, no extra dependencies.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatBoxQuantity,
  parseBoxQuantity,
  type BoxQuantityUnitLabels,
} from "./boxQuantity.ts";

// Same strings as src/locales/*/common.json → product.unitKg / unitPcs.
const RU: BoxQuantityUnitLabels = { kg: "кг", pcs: "шт" };
const UZ: BoxQuantityUnitLabels = { kg: "kg", pcs: "dona" };
const EN: BoxQuantityUnitLabels = { kg: "kg", pcs: "pcs" };

describe("formatBoxQuantity", () => {
  it("strips trailing zeros", () => {
    assert.equal(formatBoxQuantity("24.000", "pcs", "ru", RU), "24 шт");
    assert.equal(formatBoxQuantity("24.000", "pcs", "en", EN), "24 pcs");
    assert.equal(formatBoxQuantity("24", "pcs", "en", EN), "24 pcs");
  });

  it("uses the locale's decimal separator", () => {
    assert.equal(formatBoxQuantity("5.500", "kg", "ru", RU), "5,5 кг");
    assert.equal(formatBoxQuantity("5.500", "kg", "uz", UZ), "5,5 kg");
    assert.equal(formatBoxQuantity("5.500", "kg", "en", EN), "5.5 kg");
  });

  it("keeps up to three decimals", () => {
    assert.equal(formatBoxQuantity("0.125", "kg", "en", EN), "0.125 kg");
    assert.equal(formatBoxQuantity("0.125", "kg", "ru", RU), "0,125 кг");
  });

  it("localises the unit label", () => {
    assert.equal(formatBoxQuantity("12.000", "pcs", "uz", UZ), "12 dona");
    assert.equal(formatBoxQuantity("12.000", "kg", "uz", UZ), "12 kg");
  });

  it("returns null when there is nothing to show", () => {
    assert.equal(formatBoxQuantity(null, "", "ru", RU), null);
    assert.equal(formatBoxQuantity(null, "kg", "ru", RU), null);
    assert.equal(formatBoxQuantity("5.500", "", "ru", RU), null);
    assert.equal(formatBoxQuantity("", "kg", "ru", RU), null);
  });

  it("returns null for an older backend that omits the fields", () => {
    assert.equal(formatBoxQuantity(undefined, undefined, "ru", RU), null);
  });

  it("returns null for junk instead of printing it", () => {
    assert.equal(formatBoxQuantity("abc", "kg", "ru", RU), null);
    assert.equal(formatBoxQuantity("5.5", "box", "ru", RU), null);
  });
});

describe("parseBoxQuantity", () => {
  it("keeps a valid pair", () => {
    assert.deepEqual(parseBoxQuantity("5.500", "kg"), {
      box_quantity: "5.500",
      box_quantity_unit: "kg",
    });
  });

  it("reads missing, null, half-filled and unknown values as absent", () => {
    const absent = { box_quantity: null, box_quantity_unit: "" };
    assert.deepEqual(parseBoxQuantity(undefined, undefined), absent);
    assert.deepEqual(parseBoxQuantity(null, ""), absent);
    assert.deepEqual(parseBoxQuantity("24.000", ""), absent);
    assert.deepEqual(parseBoxQuantity(null, "pcs"), absent);
    assert.deepEqual(parseBoxQuantity(24, "pcs"), absent);
    assert.deepEqual(parseBoxQuantity("24", "litres"), absent);
  });
});

/**
 * Variant switching: each flavour/weight chip is a link to ANOTHER product
 * (its own slug), whose detail payload carries its own resolved value. The
 * row must follow the payload, never stick to the previous product's.
 */
describe("variant switching", () => {
  // Spec example: family = 24 pcs; 500 g variant has its own 5.5 kg; 200 g
  // has none, so the backend sends the family's value.
  const choc500 = { box_quantity: "5.500", box_quantity_unit: "kg" };
  const choc200 = { box_quantity: "24.000", box_quantity_unit: "pcs" };

  it("shows each variant's own resolved value", () => {
    const row = (p: { box_quantity: string; box_quantity_unit: string }) =>
      formatBoxQuantity(p.box_quantity, p.box_quantity_unit, "ru", RU);
    assert.equal(row(choc500), "5,5 кг");
    assert.equal(row(choc200), "24 шт");
  });
});
