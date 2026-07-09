import type { TranslationKey } from "@/lib/i18n/dictionary";

export type NavItem = {
  key: TranslationKey;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { key: "nav.about", href: "/about" },
  { key: "nav.products", href: "/catalog" },
  { key: "nav.partners", href: "/partners" },
  { key: "nav.careers", href: "/careers" },
  { key: "nav.news", href: "/blog" },
  { key: "nav.contacts", href: "/contacts" },
];

export type ProductCategoryLink = {
  slug: string;
  labelKey: TranslationKey;
};

export const PRODUCT_CATEGORY_LINKS: ProductCategoryLink[] = [
  { slug: "croissants", labelKey: "categories.croissants" },
  { slug: "waffles", labelKey: "categories.waffles" },
  { slug: "wafer-candies", labelKey: "categories.waferCandies" },
  { slug: "candies", labelKey: "categories.candies" },
  { slug: "cookies", labelKey: "categories.cookies" },
];