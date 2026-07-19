"use client";

import { MapPin } from "lucide-react";

import { TelegramIcon, InstagramIcon } from "@/components/icons/SocialIcons";
import { contactsContent } from "@/content/contacts";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function ContactInfo() {
  const { t } = useTranslation();
  const { hotline, email, hours, social, address } = contactsContent;

  return (
    <div className="rounded-lg bg-light p-8">
      <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
        <div className="order-1">
          <p className="text-sm text-ink-500">{hotline.label}</p>
          <a
            href={`tel:${hotline.raw}`}
            className="mt-2 block text-lg text-ink-900 hover:text-brand-600"
          >
            {hotline.value}
          </a>
        </div>

        <div className="order-2">
          <p className="text-sm text-ink-500">{email.label}</p>
          <a
            href={`mailto:${email.value}`}
            className="mt-2 block text-lg text-ink-900 hover:text-brand-600"
          >
            {email.value}
          </a>
        </div>

        <div className="order-4 md:order-3">
          <p className="text-sm text-ink-500">{hours.label}</p>
          <p className="mt-2 whitespace-pre-line text-lg text-ink-900">{hours.value}</p>
        </div>

        <div className="order-3 md:order-4">
          <p className="text-sm text-ink-500">{social.label}</p>
          <div className="mt-2 space-y-1">
            {social.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 text-lg text-ink-900 hover:text-brand-600"
              >
                {link.label === "Instagram" ? (
                  <InstagramIcon width={16} height={16} />
                ) : (
                  <TelegramIcon width={16} height={16} />
                )}
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="order-5 md:col-span-2">
          <p className="text-sm text-ink-500">{address.label}</p>
          <p className="mt-2 text-lg text-ink-900">{address.value}</p>
        </div>
      </div>

      <a
        href={address.mapHref}
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-md border border-ink-900 px-6 py-3.5 text-sm font-semibold tracking-wide text-ink-900 uppercase transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white"
      >
        <MapPin size={16} />
        {t("buttons.openInYandexMap")}
      </a>
    </div>
  );
}
