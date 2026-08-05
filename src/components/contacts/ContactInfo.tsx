"use client";

import { MapPin } from "lucide-react";

import { contactsContent } from "@/content/contacts";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function ContactInfo() {
  const { t } = useTranslation();
  const { hotline, email, hours, social, address } = contactsContent;

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
          <div>
            <p className="text-sm text-ink-500">{hotline.label}</p>
            <a
              href={`tel:${hotline.raw}`}
              className="mt-2 block text-lg text-ink-900 hover:text-brand-600"
            >
              {hotline.value}
            </a>
          </div>

          <div>
            <p className="text-sm text-ink-500">{hours.label}</p>
            <p className="mt-2 whitespace-pre-line text-lg text-ink-900">
              {hours.value}
            </p>
          </div>

          <div>
            <p className="text-sm text-ink-500">{address.label}</p>
            {/* 34ch breaks it after the postcode instead of orphaning «А». */}
            <p className="mt-2 max-w-[34ch] text-lg text-ink-900">
              {address.value}
            </p>
          </div>

          <div>
            <a
              href={address.mapHref}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-ink-900 px-6 py-3.5 text-sm font-semibold tracking-wide text-ink-900 uppercase transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white"
            >
              <MapPin size={16} />
              <span>{t("buttons.openInYandexMap")}</span>
            </a>
          </div>
        </div>

        <div className="space-y-11">
          <div>
            <p className="text-sm text-ink-500">{email.label}</p>
            <a
              href={`mailto:${email.value}`}
              className="mt-2 block text-lg text-ink-900 hover:text-brand-600"
            >
              {email.value}
            </a>
          </div>

          <div>
            <p className="text-sm text-ink-500">{social.label}</p>
            <div className="mt-2 space-y-1">
              {social.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-lg text-ink-900 hover:text-brand-600"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
