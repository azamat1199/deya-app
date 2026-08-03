import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { headers } from "next/headers";

import { defaultLocale } from "@/lib/i18n/config";

import "./globals.css";

// Self-hosted by next/font: no render-blocking request to Google and no
// layout shift. The cyrillic subset is required — the whole site is Russian.
// `weight` is omitted on purpose: next/font rejects `axes` alongside a static
// weight list, and the variable face already covers the 300/400/500 the design
// uses — plus the wdth axis the type spec sets.
// `weight` is omitted on purpose: next/font rejects `axes` alongside a static
// weight list, and the variable face already covers the 300/400/500 the design
// uses. The italic style is loaded for real — the founder quote is set in it,
// and a synthesised oblique of Cyrillic looks wrong.
const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "DEYA — Кондитерская фабрика",
  description:
    "Кондитерская фабрика Deya — производство круассанов, вафель, конфет и печенья с 1994 года. Экспорт в 25+ стран.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") ?? defaultLocale;

  return (
    <html lang={locale} className={`${roboto.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}