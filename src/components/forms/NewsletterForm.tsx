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
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          E-mail
        </label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="E-mail"
          className="w-full rounded-md border border-white/30 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/70 focus:border-white focus:outline-none"
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
        {/* Disabled until the address is plausible, and while a request is in
            flight — which is also what stops a second click firing a second
            POST. cursor-not-allowed added alongside the existing opacity. */}
        <button
          type="submit"
          disabled={!emailIsValid || isSubmitting}
          className="shrink-0 rounded-md bg-white px-4 py-2 text-sm font-semibold text-brand-600 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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