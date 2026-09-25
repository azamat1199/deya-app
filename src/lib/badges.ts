import type { Dictionary, TranslationKey } from "./i18n/dictionary";

/** The chip Badge renders. `new` and `hit` are the same red chip — the
 *  variant carries intent, not a visual difference. */
export interface ProductBadge {
  text: string;
  variant: "new" | "hit";
}

type BadgeName = keyof Dictionary["catalog"]["badges"];

/**
 * THE badge vocabulary — one copy, imported by both the client grid and the
 * server pages.
 *
 * Keys are the EXACT lowercase strings /api/v1/products/ puts in its `badge`
 * field. There used to be a second, independent map in this file's
 * `badgeLabel` that knew `new` and `hit` and hardcoded Russian text for both.
 * The API never sends `hit` — it sends `bestseller` — and it also sends
 * `discount`, which that map had never heard of. Both fell through its
 * `?? { text: badge }` fallback and rendered the raw API value, which is why
 * the home page and the product detail page showed "BESTSELLER" and
 * "DISCOUNT" while the catalogue grid, which used the dictionary, showed them
 * correctly. Adding strings on top of that map would not have helped: its keys
 * were wrong and its fallback was designed to leak.
 */
const BADGE_VARIANTS: Record<string, { name: BadgeName; variant: "new" | "hit" }> = {
  new: { name: "new", variant: "new" },
  bestseller: { name: "bestseller", variant: "hit" },
  discount: { name: "discount", variant: "hit" },
};

/** Dictionary key for a badge, for the client path which resolves via t(). */
export function badgeTranslationKey(
  badge: string | null,
): { key: TranslationKey; variant: "new" | "hit" } | undefined {
  const entry = lookup(badge);
  if (!entry) return undefined;
  return { key: `catalog.badges.${entry.name}`, variant: entry.variant };
}

/**
 * Resolved badge for the SERVER path, which holds the dictionary as a plain
 * object and has no t().
 */
export function badgeLabel(
  badge: string | null,
  badges: Dictionary["catalog"]["badges"],
): ProductBadge | undefined {
  const entry = lookup(badge);
  if (!entry) return undefined;
  return { text: badges[entry.name], variant: entry.variant };
}

/**
 * An empty or absent badge renders no chip, and so does an unrecognised one —
 * it is reported rather than shown. Passing the raw string through is the bug
 * this replaces, so a new CMS value needs a dictionary key before it can
 * appear.
 */
function lookup(badge: string | null) {
  const value = badge?.trim().toLowerCase();
  if (!value) return undefined;

  const entry = BADGE_VARIANTS[value];
  if (!entry) {
    console.warn(
      `[badges] unmapped badge value ${JSON.stringify(badge)} — no chip rendered. Add a catalog.badges.* key and map it in BADGE_VARIANTS.`,
    );
    return undefined;
  }
  return entry;
}
