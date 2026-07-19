"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button, Checkbox } from "@/components/ui";
import { contactsContent } from "@/content/contacts";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { submitForm } from "@/lib/submitForm";

type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
  consentPersonalData: boolean;
  consentMarketing: boolean;
};

const INPUT_CLASSES =
  "w-full rounded-md bg-white px-4 py-3.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-500 focus:ring-1 focus:ring-ink-900";
const INPUT_ERROR_CLASSES = "ring-1 ring-brand-600";
const REQUIRED_MESSAGE = "Это поле обязательно для заполнения";
const EMAIL_INVALID_MESSAGE = "Введите корректный e-mail";

export default function ContactForm() {
  const { t, locale } = useTranslation();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>();

  const onSubmit = handleSubmit(async (values) => {
    const result = await submitForm({ formName: "contact", locale, ...values });
    setStatus(result.ok ? "success" : "error");
    if (result.ok) reset();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-lg bg-light p-8">
      <div className="space-y-4">
        <div>
          <input
            {...register("name", { required: REQUIRED_MESSAGE })}
            placeholder={t("form.namePlaceholder")}
            aria-invalid={Boolean(errors.name)}
            className={cn(INPUT_CLASSES, errors.name && INPUT_ERROR_CLASSES)}
          />
          {errors.name && <p className="mt-1.5 text-sm text-brand-600">{errors.name.message}</p>}
        </div>

        <div>
          <input
            type="email"
            {...register("email", {
              required: REQUIRED_MESSAGE,
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: EMAIL_INVALID_MESSAGE },
            })}
            placeholder={t("form.emailPlaceholder")}
            aria-invalid={Boolean(errors.email)}
            className={cn(INPUT_CLASSES, errors.email && INPUT_ERROR_CLASSES)}
          />
          {errors.email && <p className="mt-1.5 text-sm text-brand-600">{errors.email.message}</p>}
        </div>

        <div>
          <div
            className={cn(
              "flex items-center rounded-md bg-white transition-colors focus-within:ring-1 focus-within:ring-ink-900",
              errors.phone && INPUT_ERROR_CLASSES,
            )}
          >
            <span className="shrink-0 py-3.5 pl-4 text-sm text-ink-700">🇺🇿 +998</span>
            <input
              type="tel"
              {...register("phone", { required: REQUIRED_MESSAGE })}
              placeholder={t("form.phonePlaceholder")}
              aria-invalid={Boolean(errors.phone)}
              className="w-full bg-transparent py-3.5 pr-4 pl-2 text-sm text-ink-900 outline-none placeholder:text-ink-500"
            />
          </div>
          {errors.phone && <p className="mt-1.5 text-sm text-brand-600">{errors.phone.message}</p>}
        </div>

        <textarea
          rows={3}
          {...register("message")}
          placeholder={t("form.messagePlaceholder")}
          className={cn(INPUT_CLASSES, "resize-none")}
        />
      </div>

      <div className="mt-5 space-y-3">
        <Checkbox<ContactFormValues>
          name="consentPersonalData"
          required
          register={register}
          error={errors.consentPersonalData?.message}
          label={
            <>
              {contactsContent.form.consentPrefix}{" "}
              <Link
                href={`/${locale}/consent`}
                className="underline hover:text-brand-600"
                onClick={(event) => event.stopPropagation()}
              >
                {contactsContent.form.consentLinkText}
              </Link>{" "}
              {contactsContent.form.consentMiddle}{" "}
              <Link
                href={`/${locale}/privacy-policy`}
                className="underline hover:text-brand-600"
                onClick={(event) => event.stopPropagation()}
              >
                {contactsContent.form.privacyLinkText}
              </Link>
            </>
          }
        />

        <Checkbox<ContactFormValues>
          name="consentMarketing"
          register={register}
          label={contactsContent.form.marketingConsent}
        />
      </div>

      {status === "success" && <p className="mt-4 text-sm text-brand-600">{t("form.success")}</p>}
      {status === "error" && <p className="mt-4 text-sm text-brand-600">{t("form.error")}</p>}

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting} className="mt-6">
        {t("buttons.sendRequest")}
      </Button>
    </form>
  );
}
