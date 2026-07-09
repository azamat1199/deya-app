"use client";

import Link from "next/link";

import { InstagramIcon, TelegramIcon } from "@/components/icons/SocialIcons";
import NewsletterForm from "@/components/forms/NewsletterForm";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { NAV_ITEMS, PRODUCT_CATEGORY_LINKS } from "@/lib/nav";

export default function Footer() {
  const { t, locale } = useTranslation();

  return (
    <footer className="bg-brand-600 text-white">
      <div className="container-page grid grid-cols-1 gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-80">
            {t("footer.navigation")}
          </h3>
          <ul className="space-y-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <Link href={`/${locale}${item.href}`} className="opacity-90 hover:opacity-100">
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-80">
            {t("footer.products")}
          </h3>
          <ul className="space-y-2 text-sm">
            {PRODUCT_CATEGORY_LINKS.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/${locale}/catalog/${category.slug}`}
                  className="opacity-90 hover:opacity-100"
                >
                  {t(category.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6 text-sm">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide opacity-80">
              {t("footer.address")}
            </h3>
            <p className="whitespace-pre-line opacity-90">{t("footer.addressValue")}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide opacity-80">
              {t("footer.contacts")}
            </h3>
            <p className="opacity-90">
              <a href="mailto:info@deya.uz" className="hover:underline">
                info@deya.uz
              </a>
            </p>
            <p className="opacity-90">
              {t("footer.hotline")}:{" "}
              <a href={`tel:${t("common.phoneRaw")}`} className="hover:underline">
                {t("common.phone")}
              </a>
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide opacity-80">
              {t("footer.workingHours")}
            </h3>
            <p className="whitespace-pre-line opacity-90">{t("footer.workingHoursValue")}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-80">
            {t("footer.newsletter")}
          </h3>
          <p className="mb-4 text-sm opacity-90">{t("footer.newsletterText")}</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs opacity-80 md:flex-row">
          <div className="flex gap-4">
            <a href="#" aria-label="Instagram" className="hover:opacity-100">
              <InstagramIcon width={18} height={18} />
            </a>
            <a href="#" aria-label="Telegram" className="hover:opacity-100">
              <TelegramIcon width={18} height={18} />
            </a>
          </div>
          <p>{t("footer.copyright")}</p>
          <div className="flex gap-4">
            <Link href={`/${locale}/privacy-policy`} className="hover:underline">
              {t("footer.privacyPolicy")}
            </Link>
            <Link href={`/${locale}/consent`} className="hover:underline">
              {t("footer.consent")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}