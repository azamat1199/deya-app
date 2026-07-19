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

  return (
    <>
      <header
        className={cn(
          "inset-x-0 top-0 z-40 w-full transition-colors duration-300",
          // Transparent (home hero, unscrolled): fixed overlay, takes no
          // flow space so the hero renders full-bleed behind it. Solid
          // (scrolled, or any inner page): sticky, back in normal flow so
          // page content isn't hidden underneath.
          transparent
            ? "fixed bg-transparent text-white"
            : "sticky bg-white text-ink shadow-sm",
        )}
      >
        <div className="container-page flex h-16 items-center justify-between md:h-20">
          <Link href={`/${locale}`} className="flex h-full items-center" aria-label="Deya — на главную">
            <Image
              src="/logo.svg"
              alt="Deya"
              width={102}
              height={102}
              className="h-full w-auto"
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
