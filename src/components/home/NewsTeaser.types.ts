import type { Locale } from "@/lib/i18n/config";

export interface NewsTeaserItem {
  id: string;
  /** ISO date ("2025-07-10") — rendered as a <time dateTime> so the machine
   * value stays parseable no matter how the locale formats the label. */
  date: string;
  title: string;
  excerpt: string;
  href: string;
}

export interface NewsTeaserProps {
  items: NewsTeaserItem[];
  /** Drives date formatting only; all copy arrives pre-resolved as props so
   * this stays a server component. */
  locale: Locale;
  heading: string;
  allNewsHref: string;
  allNewsLabel: string;
  readMoreLabel: string;
  emptyLabel: string;
}
