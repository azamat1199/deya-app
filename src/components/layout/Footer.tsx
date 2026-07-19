"use client";

import { InstagramIcon, TelegramIcon } from "@/components/icons/SocialIcons";
import NewsletterForm from "@/components/forms/NewsletterForm";
import { AnimatedLink } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { NAV_ITEMS, PRODUCT_CATEGORY_LINKS } from "@/lib/nav";

export default function Footer() {
  const { t, locale } = useTranslation();

  return (
    <footer className="bg-brand-600 text-white">
      <div className="container-page py-14">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4 lg:gap-y-10">
          <div className="order-1">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-80">
              {t("footer.navigation")}
            </h3>
            <ul className="space-y-2 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <AnimatedLink
                    href={`/${locale}${item.href}`}
                    className="opacity-90 hover:opacity-100"
                  >
                    {t(item.key)}
                  </AnimatedLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-2">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-80">
              {t("footer.products")}
            </h3>
            <ul className="space-y-2 text-sm">
              {PRODUCT_CATEGORY_LINKS.map((category) => (
                <li key={category.slug}>
                  <AnimatedLink
                    href={`/${locale}/catalog/${category.slug}`}
                    className="opacity-90 hover:opacity-100"
                  >
                    {t(category.labelKey)}
                  </AnimatedLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-3 lg:order-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-80">
              {t("footer.documents")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <AnimatedLink
                  href={`/${locale}/privacy-policy`}
                  className="opacity-90 hover:opacity-100"
                >
                  {t("footer.privacyPolicy")}
                </AnimatedLink>
              </li>
              <li>
                <AnimatedLink href={`/${locale}/consent`} className="opacity-90 hover:opacity-100">
                  {t("footer.consent")}
                </AnimatedLink>
              </li>
            </ul>
          </div>

          <div className="order-4 lg:order-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-80">
              {t("footer.contacts")}
            </h3>
            <div className="space-y-2 text-sm">
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

            <div className="mt-6 flex gap-3">
              <a
                href="#"
                aria-label="Telegram"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-brand-600 transition-opacity hover:opacity-90"
              >
                <TelegramIcon width={18} height={18} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-brand-600 transition-opacity hover:opacity-90"
              >
                <InstagramIcon width={18} height={18} />
              </a>
            </div>
          </div>

          <div className="order-5 col-span-2 lg:order-3 lg:col-span-1">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-80">
              {t("footer.address")}
            </h3>
            <p className="text-sm whitespace-pre-line opacity-90">{t("footer.addressValue")}</p>
          </div>

          <div className="order-6 col-span-2 lg:order-7 lg:col-span-1">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-80">
              {t("footer.workingHours")}
            </h3>
            <p className="text-sm whitespace-pre-line opacity-90">
              {t("footer.workingHoursValue")}
            </p>
          </div>

          <div className="order-7 col-span-2 lg:order-4 lg:col-span-1">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-80">
              {t("footer.newsletter")}
            </h3>
            <p className="mb-4 text-sm opacity-90">{t("footer.newsletterText")}</p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-6 text-xs opacity-80 md:flex-row md:items-center md:gap-4">
          <p>{t("footer.copyright")}</p>
          <p>
            {t("footer.designCredit")} | {t("footer.devCredit")}
          </p>
        </div>
      </div>
    </footer>
  );
}