"use client";

import { useState } from "react";

import type { PhoneInputProps } from "@/components/ui/PhoneInput";

/**
 * The phone field's state for a lead form, shared by ContactForm and
 * PartnerForm. Phone lives outside react-hook-form: PhoneInput produces two
 * representations (the spaced display and E.164) plus a validity flag, and a
 * DRF error naming `phone` needs its own slot because there is no registered
 * field for react-hook-form to put it on.
 *
 * `inputProps` spreads straight onto <PhoneInput>; `showInvalid` is the same
 * condition the field's error uses, for forms that also tint the row.
 */
export function usePhoneField(invalidMessage: string) {
  const [display, setDisplay] = useState("");
  const [e164, setE164] = useState("");
  const [valid, setValid] = useState(false);
  const [touched, setTouched] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const showInvalid = touched && !valid && display !== "";

  const inputProps = {
    value: display,
    onChange: ({ display, e164, isValid }) => {
      setDisplay(display);
      setE164(e164);
      setValid(isValid);
    },
    onBlur: () => setTouched(true),
    ariaInvalid: touched && !valid,
    error: apiError ?? (showInvalid ? invalidMessage : undefined),
  } satisfies Pick<
    PhoneInputProps,
    "value" | "onChange" | "onBlur" | "ariaInvalid" | "error"
  >;

  return {
    e164,
    valid,
    showInvalid,
    inputProps,
    setApiError,
    markTouched: () => setTouched(true),
    /** Clears the field after a successful submit. */
    reset: () => {
      setDisplay("");
      setE164("");
      setValid(false);
      setTouched(false);
      setApiError(null);
    },
  };
}
