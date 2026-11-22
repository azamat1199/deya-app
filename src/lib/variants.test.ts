// Run with `npm test` — Node's built-in runner, no extra dependencies.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildOptions,
  formatWeight,
  resolveVariant,
  variantPool,
  type VariantItem,
  type VariantWeight,
} from "./variants.ts";

const CHOCOLATE = { id: 2, name: "Chocolate", slug: "chocolate", sort_order: 1 };
const VANILLA = { id: 3, name: "Vanilla", slug: "vanilla", sort_order: 2 };
const G200: VariantWeight = { id: 4, value: "200.00", unit: "g" };
const G500: VariantWeight = { id: 5, value: "500.00", unit: "g" };
const KG1: VariantWeight = { id: 6, value: "1.00", unit: "kg" };

function product(
  id: number,
  slug: string,
  flavor: VariantItem["flavor"],
  weight: VariantItem["weight"],
): VariantItem {
  return { id, slug, category: { slug: "cookies" }, flavor, weight };
}

const choc500 = product(21, "choco-cookie-chocolate-500g", CHOCOLATE, G500);
const choc200 = product(22, "choco-cookie-chocolate-200g", CHOCOLATE, G200);
const van500 = product(23, "choco-cookie-vanilla-500g", VANILLA, G500);

const UNITS = { g: "g", kg: "kg" };
const label = (weight: VariantWeight) => formatWeight(weight, "en", UNITS);

describe("formatWeight", () => {
  it("strips trailing zeros", () => {
    assert.equal(formatWeight(G500, "en", UNITS), "500 g");
    assert.equal(formatWeight(KG1, "en", UNITS), "1 kg");
  });

  it("localises the unit and the decimal separator", () => {
    const ru = { g: "г", kg: "кг" };
    assert.equal(formatWeight({ value: "1.50", unit: "kg" }, "ru", ru), "1,5 кг");
    assert.equal(formatWeight({ value: "1.50", unit: "kg" }, "en", UNITS), "1.5 kg");
    assert.equal(formatWeight({ value: "200.00", unit: "G" }, "ru", ru), "200 г");
  });

  it("passes unknown units and unparseable values through", () => {
    assert.equal(formatWeight({ value: "abc", unit: "lb" }, "en", UNITS), "abc lb");
  });
});

describe("variantPool", () => {
  it("puts the current product first and never duplicates it", () => {
    const pool = variantPool(choc500, [choc200, choc500, van500]);
    assert.deepEqual(
      pool.map((item) => item.id),
      [21, 22, 23],
    );
  });
});

describe("resolveVariant", () => {
  const pool = variantPool(choc500, [choc200, van500]);

  it("returns the exact flavour + weight match", () => {
    assert.equal(resolveVariant(pool, choc500, { weightId: G200.id }), choc200);
    assert.equal(resolveVariant(pool, choc500, { flavorId: VANILLA.id }), van500);
  });

  it("resolves the current pair to the current product", () => {
    assert.equal(resolveVariant(pool, choc500, {}), choc500);
    assert.equal(resolveVariant(pool, choc500, { weightId: G500.id }), choc500);
  });

  it("falls back to the clicked dimension when the pair does not exist", () => {
    // On chocolate 200 g, vanilla exists only in 500 g.
    const fromChoc200 = variantPool(choc200, [choc500, van500]);
    assert.equal(
      resolveVariant(fromChoc200, choc200, { flavorId: VANILLA.id }),
      van500,
    );
    // On vanilla 500 g, 200 g exists only in chocolate.
    const fromVan500 = variantPool(van500, [choc500, choc200]);
    assert.equal(
      resolveVariant(fromVan500, van500, { weightId: G200.id }),
      choc200,
    );
  });

  it("prefers the earliest product in API order on fallback", () => {
    const a = product(30, "a-1kg", CHOCOLATE, KG1);
    const b = product(31, "b-1kg", VANILLA, KG1);
    const current = product(32, "c-200g", { ...VANILLA, id: 9 }, G200);
    const pool = variantPool(current, [a, b]);
    assert.equal(resolveVariant(pool, current, { weightId: KG1.id }), a);
  });

  it("returns null when nothing has the clicked value", () => {
    assert.equal(resolveVariant(pool, choc500, { weightId: 999 }), null);
    assert.equal(resolveVariant(pool, choc500, { flavorId: 999 }), null);
  });

  it("handles a current product with a null dimension", () => {
    const plain = product(40, "plain-500g", null, G500);
    const pool = variantPool(plain, [choc200]);
    assert.equal(resolveVariant(pool, plain, { weightId: G200.id }), choc200);
  });
});

describe("buildOptions", () => {
  it("builds both rows with target slugs and the active option", () => {
    const pool = variantPool(choc500, [choc200, van500]);
    const { flavor, weight } = buildOptions(pool, choc500, label);

    assert.deepEqual(
      flavor.map((o) => [o.label, o.slug, o.active]),
      [
        ["Chocolate", "choco-cookie-chocolate-500g", true],
        ["Vanilla", "choco-cookie-vanilla-500g", false],
      ],
    );
    assert.deepEqual(
      weight.map((o) => [o.label, o.slug, o.active]),
      [
        ["200 g", "choco-cookie-chocolate-200g", false],
        ["500 g", "choco-cookie-chocolate-500g", true],
      ],
    );
  });

  it("on chocolate 200 g, vanilla links to the vanilla 500 g fallback", () => {
    const pool = variantPool(choc200, [choc500, van500]);
    const { flavor } = buildOptions(pool, choc200, label);
    const vanilla = flavor.find((o) => o.id === VANILLA.id);
    assert.equal(vanilla?.slug, "choco-cookie-vanilla-500g");
  });

  it("after the fallback, the landed product's weight is the active one", () => {
    const pool = variantPool(van500, [choc500, choc200]);
    const { weight, flavor } = buildOptions(pool, van500, label);
    assert.deepEqual(
      weight.filter((o) => o.active).map((o) => o.label),
      ["500 g"],
    );
    assert.deepEqual(
      flavor.filter((o) => o.active).map((o) => o.label),
      ["Vanilla"],
    );
  });

  it("sorts weights g before kg, then numerically", () => {
    const g1500 = { id: 7, value: "1500.00", unit: "g" };
    const pool = variantPool(product(1, "kg1", CHOCOLATE, KG1), [
      product(2, "g1500", CHOCOLATE, g1500),
      product(3, "g200", CHOCOLATE, G200),
      product(4, "g500", CHOCOLATE, G500),
    ]);
    const { weight } = buildOptions(pool, pool[0], label);
    assert.deepEqual(
      weight.map((o) => o.label),
      ["200 g", "500 g", "1,500 g", "1 kg"],
    );
  });

  it("sorts flavours by sort_order, keeping API order on ties", () => {
    const z = { id: 10, name: "Z", slug: "z", sort_order: 0 };
    const y = { id: 11, name: "Y", slug: "y", sort_order: 0 };
    const pool = variantPool(product(1, "van", VANILLA, G500), [
      product(2, "z", z, G500),
      product(3, "y", y, G500),
    ]);
    const { flavor } = buildOptions(pool, pool[0], label);
    assert.deepEqual(
      flavor.map((o) => o.label),
      ["Z", "Y", "Vanilla"],
    );
  });

  it("hides a row with fewer than two options", () => {
    // Weight-only family: one flavour, two weights.
    const pool = variantPool(choc500, [choc200]);
    const { flavor, weight } = buildOptions(pool, choc500, label);
    assert.equal(flavor.length, 0);
    assert.equal(weight.length, 2);
  });

  it("renders no rows for a product without a family", () => {
    const pool = variantPool(choc500, []);
    assert.deepEqual(buildOptions(pool, choc500, label), {
      flavor: [],
      weight: [],
    });
  });

  it("skips variants whose dimension is null", () => {
    const noFlavor = product(50, "no-flavor-1kg", null, KG1);
    const pool = variantPool(choc500, [van500, noFlavor]);
    const { flavor, weight } = buildOptions(pool, choc500, label);
    assert.deepEqual(
      flavor.map((o) => o.label),
      ["Chocolate", "Vanilla"],
    );
    assert.deepEqual(
      weight.map((o) => [o.label, o.slug]),
      [
        ["500 g", "choco-cookie-chocolate-500g"],
        ["1 kg", "no-flavor-1kg"],
      ],
    );
  });
});
