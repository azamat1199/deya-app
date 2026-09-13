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
      // The hook the hero (and anything else with content under this panel)
      // reserves room by — see the `:has([data-cookie-banner])` rule in
      // globals.css. An attribute rather than a class so no styling depends on
      // it and the two cannot be refactored apart by accident.
      data-cookie-banner=""
      className={cn(
        "fixed z-50 flex flex-col justify-between rounded-md border border-line-200 bg-white p-4 shadow-lg",
        // MOBILE (base): pinned to BOTH gutters, height 175.
        //
        // `inset-x-5` — not a width — is the point. The panel is
        // position-fixed, so it cannot sit inside `container-page` and inherit
        // the page's gutter; pinning left AND right to the same 20px that
        // class uses below `md:` is the next best thing, and it makes the
        // panel's edges land on the header logo's left edge and the burger's
        // right edge by construction at every mobile width. The old
        // `w-[min(100vw-40px,320px)]` hit the same two numbers on the 360px
        // Figma frame (20 + 320 + 20 = 360) but capped there, so from 361px up
        // the panel stopped growing and its left edge drifted inward — 50px at
        // 390, 90px at 430 — while the logo stayed at 20. Width is now whatever
        // the logo-to-burger span is: 280 at 320px, 320 at 360px, 350 at 390px,
        // 390 at 430px.
        //
        // The height reads --cookie-banner-height rather than carrying its own
        // 175px: the hero has to reserve exactly this much room above itself,
        // and one variable is what stops the two copies drifting apart.
        "inset-x-5 bottom-5 h-(--cookie-banner-height)",
        // DESKTOP: 478 × 130, bottom-right, from `md:` up.
        //
        // `md:`, NOT `sm:` — this project retunes Tailwind's breakpoints to the
        // Figma frames in globals.css (`--breakpoint-sm: 360px`, `md: 768px`,
        // `lg: 1200px`), so `sm:` IS the 360px mobile frame and styling desktop
        // there put the 478px panel on phones, hanging 142px off the left edge.
        // `md:` is where the header already swaps mobile chrome for desktop.
        //
        // `md:left-auto` releases the left pin that `inset-x-5` sets, so the
        // desktop panel is sized by md:w-[478px] off the right edge exactly as
        // before. Without it a pinned left AND right would stretch it across
        // the whole viewport and w-[478px] would lose to the two insets.
        "md:right-6 md:bottom-6 md:left-auto md:h-[130px] md:w-[478px]",
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
        {/* Normal → black, Hover → red, Click → a darker red, per the
            three-state export. Text, padding, radius and size are identical in
            all three; only the background moves.

            TWO VALUES HERE HAVE NO EXACT TOKEN, and are flagged in the PR
            rather than hardcoded as new hex:

            · Normal. The export gives #000000; this uses ink-900 (#1a1a1a),
              the project's black, which every other "black" surface in the
              codebase already uses. Pure #000000 exists nowhere in the theme.

            · Click. The brief describes it as "very slightly darker" than the
              hover red. brand-700 (#970f19) is the ONLY red below brand-600
              (#be131f) in the scale, and it is a full step down rather than a
              slight one — so this is the closest existing token, not a match.
              An exact Figma value would need either a new token between the
              two or a confirmation that the pair is really one colour, in
              which case this goes back to `active:bg-brand-600`. Figma was
              unreachable all session (see the PR), so this follows the brief's
              written description rather than a measured value.

            `focus-visible:` carries the hover red across as well: a keyboard
            user has no hover, so the ring alone would say "focused" without
            showing the colour a pointer would get. It keeps the brand-500 ring
            on top of that, so focus stays distinct from hover rather than
            merely equal to it — the same reasoning ui/Button documents.

            transition-colors duration-200 ease-in-out was already here and is
            the project's standard duration, confirmed against ui/Button,
            Header and the footer. */}
        <button
          type="button"
          onClick={handleAccept}
          className="inline-flex cursor-pointer items-center justify-center rounded-md bg-ink-900 px-4 py-2 text-xs font-semibold tracking-wide text-white uppercase transition-colors duration-200 ease-in-out hover:bg-brand-600 focus-visible:bg-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none active:bg-brand-700"
        >
          {t("cookies.accept")}
        </button>
      </div>
    </div>
  );
}
