"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Phone, X } from "lucide-react";

import { InstagramIcon, TelegramIcon } from "@/components/icons/SocialIcons";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { NAV_ITEMS } from "@/lib/nav";

import LanguageSwitch from "./LanguageSwitch";
import Logo from "./Logo";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { t, locale } = useTranslation();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  useFocusTrap(open, panelRef, onClose);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/50"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="relative flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-white px-6 py-6"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between">
              <Logo href={`/${locale}`} />
              <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="rounded-full p-1 hover:bg-light"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="mt-10 flex flex-1 flex-col gap-6">
              {NAV_ITEMS.map((item) => {
                const href = `/${locale}${item.href}`;
                const active = pathname === href;
                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={cn(
                      "text-lg font-medium uppercase tracking-wide",
                      active ? "text-brand-500" : "text-ink",
                    )}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-4 border-t border-line pt-6">
              <LanguageSwitch />
              <a href="mailto:info@deya.uz" className="flex items-center gap-2 text-sm text-ink-soft">
                <Mail size={16} /> info@deya.uz
              </a>
              <a
                href={`tel:${t("common.phoneRaw")}`}
                className="flex items-center gap-2 text-sm font-semibold text-ink"
              >
                <Phone size={16} /> {t("common.phone")}
              </a>
              <div className="flex gap-4 pt-2">
                <a href="#" aria-label="Instagram" className="text-ink-soft hover:text-brand-500">
                  <InstagramIcon width={20} height={20} />
                </a>
                <a href="#" aria-label="Telegram" className="text-ink-soft hover:text-brand-500">
                  <TelegramIcon width={20} height={20} />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}