"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";

import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  isValidSubscriptionEmail,
  submitSubscription,
} from "@/lib/subscriptions";

type FormValues = {
  email: string;
  company?: string; // honeypot, kept empty by real users
};

export default function NewsletterForm() {
  const { t, locale } = useTranslation();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  // Gates the button before submission rather than failing afterwards.
  // useWatch, not watch(): the latter returns a fresh function each render and
  // makes React Compiler skip memoising the component.
  const emailValue = useWatch({ control, name: "email" });
  const emailIsValid = isValidSubscriptionEmail(emailValue ?? "");

  const onSubmit = handleSubmit(async (values) => {
    if (values.company) return; // honeypot filled — likely a bot, drop silently
    setFormError(null);

    const email = values.email.trim();
    // Checked before the request, not after.
    if (!isValidSubscriptionEmail(email)) {
      setError("email", { message: t("form.emailInvalid") });
      return;
    }

    // Only the address is sent. `company` is the honeypot and never leaves the
    // browser; the endpoint accepts nothing but `email` anyway.
    const result = await submitSubscription({ email });

    if (result.ok) {
      setStatus("success");
      // Cleared only on success, so a failure never costs the user their input.
      reset();
      return;
    }

    setStatus("error");

    // A duplicate address arrives as a 400 with the backend's own wording on
    // `email`; surfaced verbatim so it reads as "already subscribed" rather
    // than a generic failure.
    if (result.emailError) {
      setError("email", { message: result.emailError });
      setFormError(result.detail ?? null);
      return;
    }

    setFormError(result.detail ?? t("form.error"));
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <label htmlFor="newsletter-email" className="sr-only">
        E-mail
      </label>

      {/* The composite is built from the two elements' OWN edges now, not from
          a bordered wrapper that clips them — that is what the spec describes,
          and it is the only way the border can belong to the field while the
          button stays a plain white block:

            · the field carries the 0.75px #FFFFFF80 border and the 3.75px
              LEFT corners, square on the right;
            · the button carries the 3.75px RIGHT corners, square on the left;
            · the join between them is two square edges meeting, so the unit
              reads as one pill rounded only on its outer corners.

          The wrapper is therefore just a flex row: no border, no radius, and
          no `overflow-hidden` (which would have clipped the focus ring).
          `gap` stays absent — that 8px gap was the original visible seam.
          `items-stretch` is gone too: both children now state the spec's 35px
          height themselves rather than inheriting one from the other. */}
      <div className="flex">
        {/* THE FIELD. Spec values, verbatim:
              border      0.75px solid #FFFFFF80  →  border-[0.75px] border-white/50
                          (0x80 = 128/255 = 50% alpha, so white/50 is the token
                          form of #FFFFFF80 exactly — no new hex needed)
              height      35px, to match the button so the join has no seam
              left corners 3.75px, right corners square where the button meets it

            `h-[35px]` with `py-0` replaces the old `py-2`: padding cannot set
            an exact height once a border is involved, and the spec gives a
            height, not padding.

            TOTAL WIDTH IS DELIBERATELY NOT HARDCODED. The spec gives a width
            for the button only; the Figma frame's field width comes with the
            canvas coordinates, which must not be transcribed as CSS. `w-full`
            lets the field take whatever the footer column leaves, which is
            what keeps the control responsive. FLAGGED in the report as a value
            still to confirm.

            Three states:
              Normal — transparent field, 0.75px #FFFFFF80 border, faint
                       placeholder.
              Hover  — border opacity rises, placeholder brightens.
              Active — the field fills.

            HOVER AND ACTIVE BORDER VALUES ARE NOT FROM FIGMA. Only the
            normal-state border was specified and Figma was unreachable all
            session (local MCP server down, connector needs an OAuth this
            session cannot run). white/80 on hover is a proportional step up
            from the specified white/50; the active fill stays white/25. Both
            FLAGGED — they are the two lines to correct once the real values
            are available.

            The fill is white/25 over the footer's own bg-brand-600 rather than
            a literal grey: the export's panels sit on Figma's grey canvas, so
            the same translucent white reads as "light grey" there and as a
            lightened red here. A literal grey would be a new hex with no token
            behind it.

            WHICH condition the active state is — (a) :focus, (b) has-value, or
            (c) both — could NOT be confirmed without Figma. Implemented as
            (a) :focus, and VERIFIED to behave as (a): the fill appears on
            click/tab with the field still empty and disappears on blur while
            the typed text is still there. The two are NOT conflated — nothing
            keys off having a value. For (b) swap `focus:` for
            `not-placeholder-shown:`; for (c) add it alongside.

            The focus ring sits on the field itself (no clipping wrapper any
            more), so it follows the field's own 3.75px left corners. */}
        <input
          id="newsletter-email"
          type="email"
          placeholder="E-mail"
          className="h-[35px] w-full min-w-0 rounded-l-[3.75px] rounded-r-none border-[0.75px] border-white/50 bg-transparent px-4 py-0 text-sm text-white outline-none transition-colors duration-200 ease-in-out placeholder:text-white/70 hover:border-white/80 hover:placeholder:text-white/90 focus:bg-white/25 focus-visible:ring-2 focus-visible:ring-white"
          {...register("email", {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          })}
        />
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          {...register("company")}
        />
        {/* Still disabled until the address is plausible, and while a request
            is in flight — that gate is untouched, and it is also what stops a
            second click firing a second POST.

            The button stays white with the same padding-y and type in all
            three panels; only two things changed for the composite:

              · `rounded-md` is GONE. Its corners now come from the wrapper's
                clipping, which is what produces matching right corners and a
                flat left join. Leaving a radius here would cut a notch out of
                the pill.
              · `text-brand-600` → `text-ink-900`. The export shows this label
                as DARK text, not red, in all three panels, and the brief says
                so twice. FLAGGED in the report as the one colour change to
                the button, in case the red was deliberate.

            Spec values, verbatim — and these are the BUTTON's, not the
            field's:
              width   85px   → w-[85px]
              height  35px   → h-[35px], the same 35px the field now states,
                               which is what removes the vertical seam
              radius  3.75px on the RIGHT corners, 0 on the left
                             → rounded-r-[3.75px] rounded-l-none
              opacity 1      → already the default; NOT pinned, because that
                               would override the opacity-60 this button drops
                               to while disabled

            The width is fixed at 85px, so the horizontal padding is gone: any
            px-* would fight the stated width. `shrink-0` stops the flex row
            from compressing it below 85px.

            `enabled:` keeps the disabled button off the hover treatment:
            `hover:opacity-90` and `disabled:opacity-60` both used to match a
            hovered disabled button, with variant order alone deciding. The
            focus-visible ring is what a keyboard user gets, since a white
            button has no visible hover shift; ring-offset-brand-600 is the
            footer's own background, so the ring reads as a ring. */}
        <button
          type="submit"
          disabled={!emailIsValid || isSubmitting}
          className="h-[35px] w-[85px] shrink-0 rounded-l-none rounded-r-[3.75px] bg-white text-sm font-semibold text-ink-900 transition-opacity duration-200 ease-in-out enabled:hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("buttons.send")}
        </button>
      </div>

      {/* Renders the server's own message when there is one — that is how a
          duplicate address reads as "already subscribed" — and falls back to
          the existing copy for local validation. */}
      {errors.email && (
        <p className="text-xs text-white">
          {errors.email.message ?? t("form.emailInvalid")}
        </p>
      )}
      {status === "success" && <p className="text-xs text-white">{t("form.newsletterSuccess")}</p>}
      {status === "error" && formError && <p className="text-xs text-white">{formError}</p>}

      <p className="text-xs leading-relaxed text-white/70">
        {t("footer.newsletterConsent")}{" "}
        <Link href={`/${locale}/privacy-policy`} className="underline hover:text-white">
          {t("form.privacyPolicyLinkText")}
        </Link>
        .
      </p>
    </form>
  );
}