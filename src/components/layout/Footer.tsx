"use client";

import { InstagramIcon, TelegramIcon } from "@/components/icons/SocialIcons";
import NewsletterForm from "@/components/forms/NewsletterForm";
import { AnimatedLink } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { NAV_ITEMS, PRODUCT_CATEGORY_LINKS } from "@/lib/nav";
import { formatForDisplay } from "@/lib/phone";
import { telHref, type Settings } from "@/lib/settings";

export interface FooterProps {
  /**
   * Live site settings, fetched once in the locale layout. `null` means the
   * request failed or returned nothing usable, and every value below falls back
   * to the static copy it shipped with — a stale footer beats a blank one.
   */
  settings: Settings | null;
}

export default function Footer({ settings }: FooterProps) {
  const { t, locale } = useTranslation();

  // Each value falls back to its existing static source individually, so one
  // empty API field cannot blank a whole column.
  const email = settings?.email || "info@deya.uz";
  const hotlineRaw = settings?.hotline || settings?.phone || "";
  // Spaced for display; the href below stays digits-only E.164.
  const hotline = hotlineRaw ? formatForDisplay(hotlineRaw) : t("common.phone");
  const hotlineHref = telHref(hotlineRaw) || `tel:${t("common.phoneRaw")}`;
  const address = settings?.address || t("footer.addressValue");
  const workHours = settings?.work_hours || t("footer.workingHoursValue");
  const telegramUrl = settings?.telegram_url ?? "";
  const instagramUrl = settings?.instagram_url ?? "";

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
                <AnimatedLink
                  href={`/${locale}/personal-data-consent`}
                  className="opacity-90 hover:opacity-100"
                >
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
              {email && (
                <p className="opacity-90">
                  <a href={`mailto:${email}`} className="hover:underline">
                    {email}
                  </a>
                </p>
              )}
              {hotline && hotlineHref && (
                <p className="opacity-90">
                  {t("footer.hotline")}:{" "}
                  <a href={hotlineHref} className="hover:underline">
                    {hotline}
                  </a>
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-brand-600 transition-opacity hover:opacity-90"
                >
                  <TelegramIcon width={18} height={18} />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-brand-600 transition-opacity hover:opacity-90"
                >
                  <InstagramIcon width={18} height={18} />
                </a>
              )}
            </div>
          </div>

          <div className="order-5 col-span-2 lg:order-3 lg:col-span-1">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-80">
              {t("footer.address")}
            </h3>
            <p className="text-sm whitespace-pre-line opacity-90">{address}</p>
          </div>

          <div className="order-6 col-span-2 lg:order-7 lg:col-span-1">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-80">
              {t("footer.workingHours")}
            </h3>
            <p className="text-sm whitespace-pre-line opacity-90">
              {workHours}
            </p>
          </div>

          <div className="order-7 col-span-2 lg:order-4 lg:col-span-1">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-80">
              {t("footer.newsletter")}
            </h3>
            <p className="mb-4 text-sm opacity-90">
              {t("footer.newsletterText")}
            </p>
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
