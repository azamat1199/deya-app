import { apiOrigin } from "@/lib/api";

/**
 * POST /api/v1/subscriptions/
 *
 * Deliberately separate from lib/leads.ts: different endpoint, different body,
 * different entity. A newsletter subscriber is not a sales lead, and merging
 * the two would couple an anonymous e-mail capture to the consent-bearing lead
 * payload.
 */
export interface SubscriptionInput {
  email: string;
}

export type SubscriptionResult =
  | { ok: true }
  /** `emailError` is shown on the input; `detail` is form-level text. */
  | { ok: false; emailError?: string; detail?: string };

/**
 * Trailing slash is load-bearing: Django's APPEND_SLASH answers a slashless
 * POST with a 301, and browsers drop the body when following it — the request
 * would disappear with nothing to show for it.
 */
const SUBSCRIPTIONS_PATH = "/api/v1/subscriptions/";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidSubscriptionEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/** Flattens DRF's `{"email": ["..."]}` / `{"detail": "..."}` shapes. */
function parseErrors(body: unknown): { emailError?: string; detail?: string } {
  if (typeof body !== "object" || body === null) return {};
  const candidate = body as Record<string, unknown>;

  const read = (value: unknown): string | undefined => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      const joined = value.filter((item) => typeof item === "string").join(" ");
      return joined || undefined;
    }
    return undefined;
  };

  const emailError = read(candidate.email);
  const detail = read(candidate.detail) ?? read(candidate.non_field_errors);
  return { emailError, detail };
}

/**
 * No cache directive: this is a mutation.
 *
 * The submitted address is never logged — only the transport failure and its
 * cause, or the status and which field the server objected to.
 *
 * A duplicate address comes back as a 400 whose `email` message the backend
 * writes itself ("...already exists" / DRF's unique validator text). That text
 * is surfaced verbatim on the field rather than being replaced with a generic
 * failure, so "you are already subscribed" reads as itself. The exact wording
 * is unverified: probing it would mean sending a real request, and the leads
 * endpoint throttles for an hour after one.
 */
export async function submitSubscription(
  input: SubscriptionInput,
): Promise<SubscriptionResult> {
  const url = `${apiOrigin()}${SUBSCRIPTIONS_PATH}`;

  // Built explicitly, not spread: only `email` may ever go over the wire.
  const body = { email: input.email };

  // Field names only — the address itself is personal data and stays out.
  console.info(`[submitSubscription] POST ${url} fields=${JSON.stringify(Object.keys(body))}`);

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
    // "fetch failed" alone says nothing; the reason lives in `cause`.
    console.error(
      "[submitSubscription] request did not reach the server —",
      error instanceof Error ? error.message : String(error),
      "| cause:",
      error instanceof Error ? (error.cause ?? "(none)") : "(none)",
    );
    return { ok: false };
  }

  if (response.ok) return { ok: true };

  let errorBody: unknown = null;
  try {
    errorBody = await response.json();
  } catch {
    errorBody = null;
  }

  const { emailError, detail } = parseErrors(errorBody);
  console.error(
    `[submitSubscription] POST ${url} rejected with ${response.status}`,
    emailError ? "| server objected to: email" : "",
  );

  return { ok: false, emailError, detail };
}
