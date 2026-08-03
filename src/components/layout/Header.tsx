"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { InstagramIcon, TelegramIcon } from "@/components/icons/SocialIcons";
import { AnimatedLink } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { NAV_ITEMS } from "@/lib/nav";

import LanguageSwitch from "./LanguageSwitch";
import MobileMenu from "./MobileMenu";

const HERO_ROUTES = ["", "/about", "/partners", "/careers"];

/**
 * Routes that opt out of the bar's bottom rule. A page cannot hand a prop up to
 * the layout that renders this header, so the opt-in is declared the same way
 * HERO_ROUTES already is — by route shape. Product detail is
 * `/{locale}/catalog/{category}/{product}`; the catalog root and the category
 * listing are shorter and keep the rule.
 */
function isBorderlessRoute(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length === 4 && segments[1] === "catalog";
}

export default function Header() {
  const { t, locale } = useTranslation();
  const pathname = usePathname();
  // Routes whose first section is a full-bleed photo the header should
  // float over (transparent) until the user scrolls past it.
  const hasHeroBackground = HERO_ROUTES.some(
    (route) => pathname === `/${locale}${route}`,
  );

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!hasHeroBackground) return;

    function onScroll() {
      setScrolled(window.scrollY > 40);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasHeroBackground]);

  const transparent = hasHeroBackground && !scrolled;
  const borderless = isBorderlessRoute(pathname);

  return (
    <>
      <header
        className={cn(
          "inset-x-0 top-0 z-40 w-full transition-colors duration-300",
          // On hero routes the header stays `fixed` for the whole page and
          // only swaps its background on scroll. Switching fixed→sticky mid
          // scroll would put it back into flow and shove everything below it
          // down by its own height — a visible jump, and it would also break
          // the sticky hero on /about by inserting a box above it.
          hasHeroBackground ? "fixed" : "sticky",
          transparent
            ? "bg-transparent text-white"
            : cn(
                "bg-white text-ink",
                // The rule under the bar is a shadow, not a border — dropping
                // it takes no height with it, so nothing shifts by a pixel.
                borderless ? "shadow-none" : "shadow-sm",
              ),
        )}
      >
        {/* Height comes from --header-height (globals.css) so the hero copy's
            top offset can clear the header without hardcoding a second copy
            of the value. */}
        <div className="container-page flex h-(--header-height) items-center justify-between">
          {/* The link keeps the bar-height slot it always had — staying a flex
              item of the row is what puts its left edge on the container's
              content inset without repeating the gutter — while the block
              itself is absolutely positioned inside it. So the overhang costs
              no layout height (the bar stays h-(--header-height) and nothing
              below it moves) and no layout width (the nav does not shift). */}
          <Link
            href={`/${locale}`}
            className="relative block h-full w-(--header-height) shrink-0"
            aria-label="Deya — на главную"
          >
            <Image
              src="/logo.svg"
              alt="Deya"
              width={102}
              height={102}
              // max-w-none: preflight's `img { max-width: 100% }` would
              // otherwise clamp the block back to the width of its slot and
              // erase the overhang.
              className="absolute top-0 left-0 size-(--logo-size) max-w-none"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-3 whitespace-nowrap md:flex lg:gap-8">
            {NAV_ITEMS.map((item) => {
              const href = `/${locale}${item.href}`;
              const active = pathname === href;
              return (
                <AnimatedLink
                  key={item.key}
                  href={href}
                  activeUnderline={active}
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide transition-colors  lg:text-sm",
                    active && "text-brand-500",
                  )}
                >
                  {t(item.key)}
                </AnimatedLink>
              );
            })}
          </nav>
          <div className="hidden items-center gap-4 whitespace-nowrap md:flex lg:gap-5">
            <LanguageSwitch variant="dropdown" />
            <div className="hidden items-center gap-3 lg:flex">
              <a
                href="#"
                aria-label="Telegram"
                className="transition-opacity hover:opacity-70"
              >
                <TelegramIcon width={18} height={18} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="transition-opacity hover:opacity-70"
              >
                <InstagramIcon width={18} height={18} />
              </a>
            </div>

            <a
              href={`tel:${t("common.phoneRaw")}`}
              className="hidden rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 lg:inline-flex lg:items-center"
            >
              {t("common.phone")}
            </a>
          </div>
          <button
            type="button"
            className="flex items-center justify-center md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={26} />
          </button>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={closeMobileMenu} />
    </>
  );
}
