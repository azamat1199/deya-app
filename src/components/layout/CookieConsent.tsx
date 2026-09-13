"use client";

import { useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  acceptAll,
  hasDecision,
  writeConsentCookie,
  type ConsentRecord,
} from "@/lib/consent";

export interface CookieConsentProps {
  initialConsent: ConsentRecord | null;
}

export default function CookieConsent({ initialConsent }: CookieConsentProps) {
  const { t, locale } = useTranslation();
  const [consent, setConsent] = useState<ConsentRecord | null>(initialConsent);

  if (hasDecision(consent)) return null;

  function handleAccept() {
    const decision = acceptAll();
    writeConsentCookie(decision);
    setConsent(decision);
  }

  return (
    <div
      role="region"
      aria-label={t("cookies.ariaLabel")}
      className={cn(
        "fixed z-50 flex flex-col justify-between rounded-md border border-line-200 bg-white p-4 shadow-lg",
        // MOBILE (base): 320 × 175. The spec's `left: 20px` on a 360px frame
        // is a real inset — 20 + 320 + 20 = 360 — so it is applied as a 20px
        // gutter on both sides. The width is `min(100vw - 40px, 320px)` rather
        // than a flat 320px so a 320px-wide phone keeps its gutters instead of
        // overflowing by 40px; on the 360px frame the spec describes, the two
        // are the same number.
        "right-5 bottom-5 h-[175px] w-[min(calc(100vw-2.5rem),320px)]",
        // DESKTOP: 478 × 130, bottom-right, from `md:` up.
        //
        // `md:`, NOT `sm:` — this project retunes Tailwind's breakpoints to the
        // Figma frames in globals.css (`--breakpoint-sm: 360px`, `md: 768px`,
        // `lg: 1200px`), so `sm:` IS the 360px mobile frame and styling desktop
        // there put the 478px panel on phones, hanging 142px off the left edge.
        // `md:` is where the header already swaps mobile chrome for desktop.
        "md:right-6 md:bottom-6 md:h-[130px] md:w-[478px]",
      )}
    >
      <p className="text-[12px] leading-[1.25] font-normal tracking-normal text-ink-700">
        {/* The explicit {" "} is load-bearing: JSX discards the whitespace
            around a newline between expressions, so without it the sentence
            renders as "...в соответствии сПолитикой конфиденциальности" and
            the link stops reading as part of the sentence. */}
        {t("cookies.message")}{" "}
        <Link
          href={`/${locale}/privacy-policy`}
          className="underline underline-offset-2 hover:text-brand-600"
        >
          {t("cookies.policyLink")}
        </Link>
        {t("cookies.messageSuffix")}
      </p>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAccept}
          className="inline-flex cursor-pointer items-center justify-center rounded-md bg-ink-900 px-4 py-2 text-xs font-semibold tracking-wide text-white uppercase transition-colors duration-200 ease-in-out hover:bg-ink-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none active:bg-ink-700"
        >
          {t("cookies.accept")}
        </button>
      </div>
    </div>
  );
}
