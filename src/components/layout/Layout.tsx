import type { ReactNode } from "react";

import type { Category } from "@/lib/categories";
import type { Settings } from "@/lib/settings";

import Footer from "./Footer";
import Header from "./Header";

export default function Layout({
  children,
  settings,
  categories,
}: {
  children: ReactNode;
  /** Fetched once in the locale layout; null when the request failed. */
  settings: Settings | null;
  /**
   * Fetched once in the locale layout for the footer's product column, already
   * sorted by `sort_order`. Empty when the request failed or returned nothing.
   */
  categories: Category[];
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} categories={categories} />
    </div>
  );
}