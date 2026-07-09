"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { submitForm } from "@/lib/submitForm";

type FormValues = {
  email: string;
  company?: string; // honeypot, kept empty by real users
};

export default function NewsletterForm() {
  const { t, locale } = useTranslation();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async (values) => {
    if (values.company) return; // honeypot filled — likely a bot, drop silently

    const result = await submitForm({
      formName: "newsletter",
      locale,
      email: values.email,
    });

    setStatus(result.ok ? "success" : "error");
    if (result.ok) reset();
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
        <button
          type="submit"
          disabled={isSubmitting}
          className="shrink-0 rounded-md bg-white px-4 py-2 text-sm font-semibold text-brand-600 transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {t("buttons.send")}
        </button>
      </div>

      {errors.email && <p className="text-xs text-white">{t("form.emailInvalid")}</p>}
      {status === "success" && <p className="text-xs text-white">{t("form.newsletterSuccess")}</p>}
      {status === "error" && <p className="text-xs text-white">{t("form.error")}</p>}

      <p className="text-xs leading-relaxed text-white/70">{t("footer.newsletterConsent")}</p>
    </form>
  );
}