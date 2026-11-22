/**
 * Lead-form field names and the mapping from the API's error keys to them.
 * Pure (no imports), so it runs under `node --test`.
 */

/** The field names every lead form uses for its own state. */
export type LeadFormField =
  | "name"
  | "email"
  | "phone"
  | "message"
  | "consentPersonalData"
  | "consentMarketing";

/**
 * The API answers in its own snake_case names; this puts each error back on the
 * input that produced it. Shared by every lead form so the mapping exists once.
 */
export const API_FIELD_TO_FORM: Record<string, LeadFormField> = {
  name: "name",
  email: "email",
  phone: "phone",
  message: "message",
  consent_personal_data: "consentPersonalData",
  consent_marketing: "consentMarketing",
};

/**
 * Puts each API field error on the form field that produced it, via
 * `onFieldError` (the phone field lives outside react-hook-form, so the caller
 * routes "phone" to its own error slot). Returns whether any error matched a
 * field; when none did, the caller shows a form-level message instead.
 */
export function applyFieldErrors(
  fieldErrors: Record<string, string>,
  onFieldError: (field: LeadFormField, message: string) => void,
): boolean {
  let matched = false;
  for (const [apiField, message] of Object.entries(fieldErrors)) {
    const formField = API_FIELD_TO_FORM[apiField];
    if (formField) {
      onFieldError(formField, message);
      matched = true;
    }
  }
  return matched;
}
