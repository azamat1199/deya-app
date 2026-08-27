"use client";

import { MapPin } from "lucide-react";

import { contactsContent } from "@/content/contacts";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { formatForDisplay } from "@/lib/phone";
import { telHref, type Settings } from "@/lib/settings";

export interface ContactInfoProps {
  /**
   * Live site settings, fetched once by the page (deduped against the locale
   * layout's own call). `null` means the request failed, and every value below
   * falls back to the static copy it shipped with — a stale card beats a blank
   * one.
   */
  settings: Settings | null;
}

export default function ContactInfo({ settings }: ContactInfoProps) {
  const { t } = useTranslation();
  const { hotline, email, hours, social, address } = contactsContent;

  // Each value falls back individually, so one empty API field cannot blank a
  // whole column. Labels are not in the payload and stay static.
  const phoneRaw = settings?.hotline || settings?.phone || "";
  // Spaced for display; the href stays digits-only E.164.
  const phoneValue = phoneRaw ? formatForDisplay(phoneRaw) : hotline.value;
  const phoneHref = telHref(phoneRaw) || `tel:${hotline.raw}`;
  const emailValue = settings?.email || email.value;
  const hoursValue = settings?.work_hours || hours.value;
  const addressValue = settings?.address || address.value;

  // URL-valued elements are rendered ONLY with a real URL. The static content
  // ships "#" for all three, which links nowhere — so it is treated as absent
  // rather than preserved as a dead link.
  const mapUrl = settings?.yandex_map_url ?? "";
  const socialLinks = [
    { label: "Instagram", href: settings?.instagram_url ?? "" },
    { label: social.links[1]?.label ?? "Telegram", href: settings?.telegram_url ?? "" },
  ].filter((link) => link.href);

  return (
    <div className="rounded-lg bg-light p-8">
      {/* Two real columns rather than one flowing grid with `order`: the left
          one owns the hotline, the hours, the address and the map button, the
          right one the e-mail and the socials. space-y-11 is the 44px rhythm
          between label groups; each label sits 8px above its value (mt-2). */}
      {/* Uneven columns: the left one carries the address, which needs ~280px
          for "г.Джизак, промышленная зона «А»" to stay on one line. At an even
          split it only gets 260 and the max-width below can never bind. */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-11 md:grid-cols-[1.45fr_1fr]">
        <div className="space-y-11">
          {phoneValue && phoneHref && (
            <div>
              <p className="text-sm text-ink-500">{hotline.label}</p>
              <a
                href={phoneHref}
                className="mt-2 block text-lg text-ink-900 hover:text-brand-600"
              >
                {phoneValue}
              </a>
            </div>
          )}

          <div>
            <p className="text-sm text-ink-500">{hours.label}</p>
            <p className="mt-2 whitespace-pre-line text-lg text-ink-900">
              {hoursValue}
            </p>
          </div>

          <div>
            <p className="text-sm text-ink-500">{address.label}</p>
            {/* 34ch breaks it after the postcode instead of orphaning «А». */}
            <p className="mt-2 max-w-[34ch] text-lg text-ink-900">
              {addressValue}
            </p>
          </div>

          {mapUrl && (
            <div>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-ink-900 px-6 py-3.5 text-sm font-semibold tracking-wide text-ink-900 uppercase transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white"
              >
                <MapPin size={16} />
                <span>{t("buttons.openInYandexMap")}</span>
              </a>
            </div>
          )}
        </div>

        <div className="space-y-11">
          {emailValue && (
            <div>
              <p className="text-sm text-ink-500">{email.label}</p>
              <a
                href={`mailto:${emailValue}`}
                className="mt-2 block text-lg text-ink-900 hover:text-brand-600"
              >
                {emailValue}
              </a>
            </div>
          )}

          {socialLinks.length > 0 && (
            <div>
              <p className="text-sm text-ink-500">{social.label}</p>
              <div className="mt-2 space-y-1">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-lg text-ink-900 hover:text-brand-600"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
