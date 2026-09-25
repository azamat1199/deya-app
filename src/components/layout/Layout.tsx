import type { ReactNode } from "react";

import type { Category } from "@/lib/categories";
import { formatForDisplay } from "@/lib/phone";
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
  // Formatted HERE, on the server, and handed down as a plain string.
  // formatForDisplay() is the only thing the header and the footer wanted from
  // lib/phone, and it reaches parsePhoneNumber, which pulls libphonenumber-js's
  // whole metadata table. Because both components are client components living
  // in the layout, that put ~190KB of phone metadata in the shared chunk of
  // EVERY page — including pages with no phone field anywhere. Measured, not
  // assumed; see the optimization report. Keep this on the server side.
  const hotlineRaw = settings?.hotline || settings?.phone || "";
  const hotlineText = hotlineRaw ? formatForDisplay(hotlineRaw) : "";

  return (
    <div className="flex min-h-screen flex-col">
      <Header settings={settings} hotlineText={hotlineText} />
      <main className="flex-1">{children}</main>
      <Footer
        settings={settings}
        categories={categories}
        hotlineText={hotlineText}
      />
    </div>
  );
}