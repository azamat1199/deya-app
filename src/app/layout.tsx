import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";

import { defaultLocale } from "@/lib/i18n/config";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
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
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}