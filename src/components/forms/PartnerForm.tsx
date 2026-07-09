"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button, Checkbox, FormField } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { submitForm } from "@/lib/submitForm";

type PartnerFormValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
  consentPersonalData: boolean;
  consentMarketing: boolean;
};

export interface PartnerFormProps {
  onSuccess?: () => void;
}

export default function PartnerForm({ onSuccess }: PartnerFormProps) {
  const { t, locale } = useTranslation();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PartnerFormValues>();

  const onSubmit = handleSubmit(async (values) => {
    const result = await submitForm({
      formName: "partner",
      locale,
      ...values,
    });

    setStatus(result.ok ? "success" : "error");
    if (result.ok) {
      reset();
      onSuccess?.();
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormField<PartnerFormValues>
        label={t("form.namePlaceholder")}
        name="name"
        required
        register={register}
        error={errors.name?.message}
      />
      <FormField<PartnerFormValues>
        label={t("form.emailPlaceholder")}
        name="email"
        type="email"
        required
        register={register}
        error={errors.email?.message}
      />
      <FormField<PartnerFormValues>
        label={t("form.phonePlaceholder")}
        name="phone"
        type="tel"
        required
        register={register}
        error={errors.phone?.message}
      />
      <FormField<PartnerFormValues>
        label={t("form.messagePlaceholder")}
        name="message"
        type="textarea"
        register={register}
        error={errors.message?.message}
      />

      <Checkbox<PartnerFormValues>
        name="consentPersonalData"
        required
        register={register}
        error={errors.consentPersonalData?.message}
        label={
          <>
            {t("form.consentPersonalDataPrefix")}{" "}
            <Link
              href={`/${locale}/privacy-policy`}
              className="underline hover:text-brand-600"
              onClick={(event) => event.stopPropagation()}
            >
              {t("form.privacyPolicyLinkText")}
            </Link>
          </>
        }
      />

      <Checkbox<PartnerFormValues>
        name="consentMarketing"
        register={register}
        label={t("form.consentMarketing")}
      />

      {status === "success" && <p className="text-sm text-brand-600">{t("form.success")}</p>}
      {status === "error" && <p className="text-sm text-brand-600">{t("form.error")}</p>}

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
        {t("buttons.sendRequest")}
      </Button>
    </form>
  );
}