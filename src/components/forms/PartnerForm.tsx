"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";

import { Button, Checkbox, FormField, PhoneInput } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  API_FIELD_TO_FORM,
  isValidEmail,
  isValidPhone,
  normalisePhone,
  submitLead,
  type LeadType,
} from "@/lib/leads";

type PartnerFormValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
  consentPersonalData: boolean;
  consentMarketing: boolean;
};

export interface PartnerFormProps {
  /**
   * NOTE: no longer called on success. The modal is required to stay open and
   * show its success message, and all three parents used this to close it.
   * Kept so those call sites still type-check untouched.
   */
  onSuccess?: () => void;
  /**
   * Which kind of lead this submission is. Defaults to "partner"; the sales and
   * contact forms can pass their own without any change here.
   */
  type?: LeadType;
  /**
   * Real product id, and ONLY when this form was opened from a product page.
   * Left undefined everywhere else, which keeps `product` out of the request
   * body entirely rather than sending 0 or null.
   */
  productId?: number;
}

export default function PartnerForm({
  type = "partner",
  productId,
}: PartnerFormProps) {
  const { t, locale } = useTranslation();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  // Phone lives outside react-hook-form: PhoneInput owns two representations
  // (a spaced display string and the E.164 the API gets) plus its country.
  const [phoneDisplay, setPhoneDisplay] = useState("");
  const [phoneE164, setPhoneE164] = useState("");
  const [phoneValid, setPhoneValid] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  // The phone field is not registered with react-hook-form any more, so a DRF
  // error naming `phone` would have nowhere to land. It is held here and passed
  // straight to PhoneInput's own error slot.
  const [phoneApiError, setPhoneApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PartnerFormValues>();

  // Legal consent gates submission entirely, so the button is disabled until
  // the box is ticked rather than the form failing validation afterwards.
  //
  // useWatch, not watch(): the latter returns a fresh function each render,
  // which makes React Compiler skip memoising this whole component.
  const consentGiven = Boolean(
    useWatch({ control, name: "consentPersonalData" }),
  );

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setPhoneApiError(null);

    // Validated BEFORE the request, not after. FormField already enforces
    // required-ness and the e-mail shape through its own register options;
    // these two checks add what it cannot express, and report through the same
    // `error` props so no new error UI appears.
    const email = values.email.trim();
    if (!isValidEmail(email)) {
      setError("email", { message: t("form.emailInvalid") });
      return;
    }

    // PhoneInput already produced E.164; normalisePhone is the last guard that
    // no space, dash or bracket can reach the API.
    const phone = normalisePhone(phoneE164);
    if (!isValidPhone(phone)) {
      setPhoneTouched(true);
      return;
    }

    // `product` is passed through only when a product page supplied an id;
    // undefined keeps the key out of the request body altogether.
    const result = await submitLead({
      type,
      name: values.name.trim(),
      email,
      phone,
      message: (values.message ?? "").trim(),
      consent_personal_data: Boolean(values.consentPersonalData),
      consent_marketing: Boolean(values.consentMarketing),
      product: productId,
    });

    if (result.ok) {
      setStatus("success");
      // Cleared only on success, so a failure never costs the user their typing.
      reset();
      setPhoneDisplay("");
      setPhoneE164("");
      setPhoneValid(false);
      setPhoneTouched(false);
      setPhoneApiError(null);
      return;
    }

    setStatus("error");

    // Field-specific rejections land on their inputs; whatever is left over
    // becomes the form-level message.
    let matched = false;
    for (const [apiField, message] of Object.entries(result.fieldErrors)) {
      const formField = API_FIELD_TO_FORM[apiField];
      if (formField === "phone") {
        setPhoneApiError(message);
        matched = true;
      } else if (formField) {
        setError(formField, { message });
        matched = true;
      }
    }

    setFormError(result.detail ?? (matched ? null : t("form.error")));
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
      {/* Same bordered row, divider and input classes FormField's tel branch
          used; only the prefix became a combobox. */}
      <div>
        {/* <label className="mb-1.5 block text-sm font-medium text-ink-900">
          {t("form.phonePlaceholder")}
          <span className="ml-0.5 text-brand-600" aria-hidden="true">
            *
          </span>
        </label> */}
        <PhoneInput
          locale={locale}
          value={phoneDisplay}
          onChange={({ display, e164, isValid }) => {
            setPhoneDisplay(display);
            setPhoneE164(e164);
            setPhoneValid(isValid);
          }}
          onBlur={() => setPhoneTouched(true)}
          ariaInvalid={phoneTouched && !phoneValid}
          error={
            phoneApiError ??
            (phoneTouched && !phoneValid && phoneDisplay
              ? t("form.phoneInvalid")
              : undefined)
          }
          rowClassName="flex items-center rounded-md border border-line-200 bg-white transition-colors duration-200 ease-in-out focus-within:border-ink-900 focus-within:ring-1 focus-within:ring-ink-900"
          prefixClassName="shrink-0 border-r border-line-200 px-3.5 py-2.5 text-sm text-ink-700"
          inputClassName="w-full bg-transparent px-3.5 py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-500"
        />
      </div>
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
              href={`/${locale}/personal-data-consent`}
              className="underline hover:text-brand-600"
              onClick={(event) => event.stopPropagation()}
            >
              {t("form.consentLinkText")}
            </Link>{" "}
            {t("form.consentMiddle")}{" "}
            <Link
              href={`/${locale}/privacy-policy`}
              className="underline hover:text-brand-600"
              onClick={(event) => event.stopPropagation()}
            >
              {t("form.consentPrivacyLinkText")}
            </Link>
          </>
        }
      />

      <Checkbox<PartnerFormValues>
        name="consentMarketing"
        register={register}
        label={t("form.consentMarketing")}
      />

      {status === "success" && (
        <p className="text-sm text-brand-600">{t("form.success")}</p>
      )}
      {status === "error" && formError && (
        <p className="text-sm text-brand-600">{formError}</p>
      )}

      {/* disabled until consent is given, and while a request is in flight —
          which is also what stops a second click firing a second POST. Button's
          base classes already carry disabled:cursor-not-allowed. */}
      <Button
        className="hover:cursor-pointer"
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={!consentGiven || !phoneValid || isSubmitting}
      >
        {t("buttons.sendRequest")}
      </Button>
    </form>
  );
}
