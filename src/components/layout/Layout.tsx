import type { ReactNode } from "react";

import type { Settings } from "@/lib/settings";

import Footer from "./Footer";
import Header from "./Header";

export default function Layout({
  children,
  settings,
}: {
  children: ReactNode;
  /** Fetched once in the locale layout; null when the request failed. */
  settings: Settings | null;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}