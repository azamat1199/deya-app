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
