"use client";

import { useState } from "react";
import Image from "next/image";

import PartnerForm from "@/components/forms/PartnerForm";
import { Button, Modal } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/useTranslation";

export interface PartnersHeroProps {
  /**
   * From GET /api/v1/banners/?type=partner, resolved by partners/page.tsx —
   * this component is "use client" (modal state), so it cannot fetch its own.
   *
   * All three are REQUIRED with no defaults and no t() fallback: this
   * project's rule (see CareersCulture) is that API data replaces static
   * content rather than layering over it. When the endpoint has no row the
   * page omits this component entirely, so there is no "empty banner" state
   * to design for here.
   */
  title: string;
  subtitle: string;
  /**
   * Non-empty by the time it arrives: partners/page.tsx substitutes local
   * artwork for an empty CMS field, so next/image can never be handed src="".
   * The guard below stays as defence in depth.
   */
  image: string;
}

export default function PartnersHero({
  title,
  subtitle,
  image,
}: PartnersHeroProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    // Exactly one viewport: svh is the URL-bar-visible state, so the hero fits
    // whether the bar is showing or collapsed, and dvh takes over where it is
    // supported. Never 100vh, which overflows by the toolbar height on iOS.
    // The header is fixed and transparent on this route, so it adds no height.
    <div className="relative min-h-svh w-full overflow-hidden bg-ink-900 supports-[height:100dvh]:min-h-dvh">
      {/* Omitted rather than given a placeholder when the CMS sends no
          artwork: the wrapper's bg-ink-900 is already a finished dark hero,
          and the overlay below keeps the copy legible either way. */}
      {image && (
        <Image
          src={image}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-ink-900/50" />

      {/* Three rows, not a flex column: with `justify-end` the spare height
          piled up ABOVE the copy and pushed it into the middle of the frame.
          Here row 2 absorbs it instead, so row 1 stays under the header and
          row 3 stays on the floor. The offset is derived from --header-height
          — the same token the Header sizes itself with — and min() stops it
          collapsing the gap on a short laptop screen. container-page is the
          Header's own container, so the h1, the paragraph and the button share
          the logo block's left edge without repeating it three times. */}
      <div
        className={cn(
          "container-page absolute inset-0 z-10 grid grid-rows-[auto_1fr_auto]",
          "pt-[calc(var(--header-height)_+_min(4vh,32px))]",
          "md:pt-[calc(var(--header-height)_+_min(6vh,48px))]",
          "min-[1024px]:pt-[calc(var(--header-height)_+_min(8vh,72px))]",
          "pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-[calc(5rem+env(safe-area-inset-bottom))]",
        )}
      >
        <div>
          {/* Figma type, authored at a 1440 reference width: 90px / 0.95 /
              -0.03em / 300. Line-height and tracking are constant — only the
              size scales. Roboto comes from --font-roboto on <html> via the
              theme's font-sans; no family is declared here.

              Mobile: 46px / 105% / -3% / 300. font-light is already the 300 and
              tracking-[-0.03em] is already the -3% (-1.38px at 46px), so only
              the size and leading are restated under max-md:. The clamp above
              bottoms out at 40px, which is what the phone was showing.
              max-w-xl (576px) is left alone — it cannot bind inside a 320px
              container, so it constrains nothing here.

              max-md:pt-8 is the spec's 32px above the title. `pt-8` is a
              spacing-scale token, not an arbitrary value: this project does not
              override --spacing, so Tailwind v4's 0.25rem base makes 8 → 2rem →
              32px. It sits on the h1 rather than the row wrapper so it cannot
              also move the paragraph, and the grid's own pt-[calc(...)] above
              is untouched. */}
          <h1 className="max-w-xl font-light text-white text-[clamp(40px,6.25vw,90px)] leading-[0.95] tracking-[-0.03em] max-md:pt-8 max-md:text-[46px] max-md:leading-[1.05]">
            {title}
          </h1>
          {/* 20px / 1.25 / -0.03em / 400 at the same reference width. max-w-md
              is kept so the line breaks match the design.

              Mobile: 13px / 135% / 0 / 400. font-normal is already the 400; the
              tracking DOES need restating, because the desktop value is -0.03em
              and the spec asks for 0 here. */}
          <p className="mt-4 max-w-md font-normal text-white/85 text-[clamp(15px,1.39vw,20px)] leading-[1.25] tracking-[-0.03em] max-md:text-[13px] max-md:leading-[1.35] max-md:tracking-normal">
            {subtitle}
          </p>
        </div>

        <div aria-hidden="true" />

        {/* Mobile: Roboto 500 / 12px / 120% / 0, full container width.
            `max-md:w-full` beats the unprefixed `w-fit`, so the button spans
            the same container-page bounds as the h1 and the paragraph above —
            all three share the 20px gutters. `self-end` stays: it is this
            grid row's alignment, not a width.

            The type overrides carry `max-md:` because cn() is plain clsx and
            keeps both classes: unprefixed, Tailwind's own scale order would
            pick ui/Button's BASE `font-semibold` over `font-medium`, and its
            `tracking-wide` over `tracking-normal`. A variant sorts after every
            unprefixed utility, which settles it.

            Colour states, radius, height, padding and the click target are
            untouched — only width and type change. */}
        <Button
          variant="white"
          size="lg"
          className="w-fit self-end max-md:w-full max-md:text-xs max-md:leading-[1.2] max-md:font-medium max-md:tracking-normal"
          onClick={() => setIsOpen(true)}
        >
          {t("buttons.partnerForm")}
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={title}>
        <PartnerForm onSuccess={() => setIsOpen(false)} />
      </Modal>
    </div>
  );
}
