import { isValidPhoneNumber } from "libphonenumber-js";

import { apiOrigin } from "@/lib/api";

/**
 * POST /api/v1/leads/
 *
 * One chokepoint for every lead form on the site. `type` is a parameter rather
 * than a constant so the sales and contact forms can reuse this untouched.
 */
export type LeadType = "partner" | "sales" | "contact";

export interface LeadInput {
  type: LeadType;
  name: string;
  email: string;
  /** Already E.164 — a plus and digits only, any country. */
  phone: string;
  message: string;
  consent_personal_data: boolean;
  consent_marketing: boolean;
  /** Only the product-page form sends this; omitted everywhere else. */
  product?: number;
}

/**
 * `fieldErrors` is keyed by the API's own field names, so the caller maps them
 * onto its inputs. `detail` carries anything that belongs to no single field.
 */
export type LeadResult =
  | { ok: true }
  | { ok: false; fieldErrors: Record<string, string>; detail?: string };

/**
 * Trailing slash is load-bearing and more so here than on the GETs: Django's
 * APPEND_SLASH answers a slashless POST with a 301, and browsers drop the body
 * when following it — the request would vanish with no error to show for it.
 */
const LEADS_PATH = "/api/v1/leads/";

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
 * Reduces any typed or pasted value to E.164: a plus and digits, nothing else.
 * NO country is assumed — PhoneInput supplies a fully-qualified number and the
 * country comes from its selector. Spaces, dashes and brackets cannot survive.
 */
export function normalisePhone(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/[^\d]/g, "");
  return digits ? `+${digits}` : "";
}

/**
 * Per-country validity, length included, delegated to libphonenumber-js. A UZ
 * number needs 9 digits after +998, a US one 10 after +1, German lengths vary —
 * none of that is expressed here on purpose.
 */
export function isValidPhone(value: string): boolean {
  const e164 = normalisePhone(value);
  if (!e164) return false;
  return isValidPhoneNumber(e164);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/**
 * Flattens DRF's `{"email": ["Enter a valid email."]}` into one message per
 * field. `non_field_errors` and `detail` are hoisted out as form-level text
 * since they match no input.
 */
function parseErrors(body: unknown): {
  fieldErrors: Record<string, string>;
  detail?: string;
} {
  const fieldErrors: Record<string, string> = {};
  let detail: string | undefined;

  if (typeof body !== "object" || body === null) return { fieldErrors };

  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    const message = Array.isArray(value)
      ? value.filter((item) => typeof item === "string").join(" ")
      : typeof value === "string"
        ? value
        : "";
    if (!message) continue;

    if (key === "non_field_errors" || key === "detail") {
      detail = detail ? `${detail} ${message}` : message;
    } else {
      fieldErrors[key] = message;
    }
  }

  return { fieldErrors, detail };
}

/**
 * Builds the outgoing body explicitly rather than spreading the input, so
 * `product` is ABSENT from the JSON unless a real numeric id was supplied —
 * never 0, never null. Only the sales form opened from a product page has one.
 */
function buildBody(input: LeadInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    type: input.type,
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    consent_personal_data: input.consent_personal_data,
    consent_marketing: input.consent_marketing,
  };
  if (typeof input.product === "number" && Number.isFinite(input.product)) {
    body.product = input.product;
  }
  return body;
}

/**
 * Deliberately redacted: field NAMES plus the non-personal values only. The
 * contents of name/email/phone/message never reach the console.
 */
function describeBody(body: Record<string, unknown>): string {
  return JSON.stringify({
    fields: Object.keys(body),
    type: body.type,
    product: "product" in body ? body.product : "(omitted)",
    consent_personal_data: body.consent_personal_data,
    consent_marketing: body.consent_marketing,
  });
}

/**
 * No cache directive anywhere near this: it is a mutation, and `revalidate`
 * would be both meaningless and dangerous here.
 *
 * Nothing personal is ever logged. Only the field names, the non-personal
 * values, and any transport failure with its cause reach the console.
 */
export async function submitLead(input: LeadInput): Promise<LeadResult> {
  const url = `${apiOrigin()}${LEADS_PATH}`;
  const body = buildBody(input);

  console.info(`[submitLead] POST ${url} ${describeBody(body)}`);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    // "fetch failed" on its own says nothing; the reason lives in `cause`.
    console.error(
      "[submitLead] request did not reach the server —",
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
    return { ok: false, fieldErrors: {} };
  }

  if (response.ok) return { ok: true };

  // A validation rejection carries a JSON body worth surfacing; anything else
  // (500, HTML error page) falls back to the form-level message.
  let errorBody: unknown = null;
  try {
    errorBody = await response.json();
  } catch {
    errorBody = null;
  }

  const { fieldErrors, detail } = parseErrors(errorBody);
  console.error(
    `[submitLead] POST ${url} rejected with ${response.status}`,
    Object.keys(fieldErrors).length
      ? `| fields: ${Object.keys(fieldErrors).join(", ")}`
      : "",
  );

  return { ok: false, fieldErrors, detail };
}
