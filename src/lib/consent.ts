/**
 * Cookie-consent state, shared by the server (which reads the cookie to decide
 * whether the banner renders at all) and the client (which writes it).
 *
 * DELIBERATELY NOT modelled as a boolean. The Figma banner offers only
 * "accept", but an accept-only banner is the older implied-consent pattern and
 * does not satisfy GDPR — refusing has to be as easy as accepting, and
 * non-essential cookies must not fire beforehand. Deya exports
 * internationally, so that may well become a requirement. The record below
 * therefore stores an explicit `status` plus a per-category map, so adding a
 * Reject button or a category picker is new UI over the same shape rather than
 * a migration of everyone's stored value.
 */

/** Bump when the cookie policy changes: a stored record from an older version
 *  no longer counts as a decision, so the banner asks again. */
export const CONSENT_VERSION = 1;

export const CONSENT_COOKIE_NAME = "deya_cookie_consent";

/** A year, the usual ceiling for a consent record. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/** `necessary` is what the site cannot run without and is never opt-out.
 *  The other two are placeholders for gating: nothing sets them today. */
export type ConsentCategory = "necessary" | "analytics" | "marketing";

/** Only "accepted" is reachable from the current UI. "rejected" exists so the
 *  reader and the storage format already understand it. */
export type ConsentStatus = "accepted" | "rejected";

export interface ConsentRecord {
  /** Policy version this decision was made against. */
  v: number;
  /** ISO timestamp of the decision. */
  at: string;
  status: ConsentStatus;
  categories: Record<ConsentCategory, boolean>;
}

export const NON_ESSENTIAL_CATEGORIES: readonly ConsentCategory[] = [
  "analytics",
  "marketing",
];

function record(status: ConsentStatus, nonEssential: boolean): ConsentRecord {
  return {
    v: CONSENT_VERSION,
    at: new Date().toISOString(),
    status,
    categories: {
      necessary: true,
      analytics: nonEssential,
      marketing: nonEssential,
    },
  };
}

export function acceptAll(): ConsentRecord {
  return record("accepted", true);
}

/**
 * Unused by the current banner — the design has no Reject button. Kept so the
 * "reject" path is defined in one place the day that button is added, instead
 * of being invented then.
 */
export function rejectAll(): ConsentRecord {
  return record("rejected", false);
}

function isConsentRecord(value: unknown): value is ConsentRecord {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const categories = candidate.categories;
  return (
    typeof candidate.v === "number" &&
    typeof candidate.at === "string" &&
    (candidate.status === "accepted" || candidate.status === "rejected") &&
    typeof categories === "object" &&
    categories !== null &&
    typeof (categories as Record<string, unknown>).necessary === "boolean"
  );
}

/**
 * Returns null for anything that is not a usable decision: absent, malformed,
 * or made against an older policy version. Never throws — a corrupted cookie
 * must degrade to "ask again", not break the page that reads it.
 */
export function parseConsent(raw: string | undefined | null): ConsentRecord | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }

  if (!isConsentRecord(parsed)) return null;
  if (parsed.v !== CONSENT_VERSION) return null;
  return parsed;
}

export function serializeConsent(value: ConsentRecord): string {
  return encodeURIComponent(JSON.stringify(value));
}

/** True when the visitor has answered the CURRENT policy version. */
export function hasDecision(value: ConsentRecord | null): boolean {
  return value !== null && value.v === CONSENT_VERSION;
}

/**
 * The gate for any future tracking script. No analytics, tag manager or pixel
 * exists in this project today — this is what one would have to pass through
 * when it does, rather than being wired to `window` on load.
 */
export function allows(
  value: ConsentRecord | null,
  category: ConsentCategory,
): boolean {
  if (category === "necessary") return true;
  if (!hasDecision(value)) return false;
  return value?.categories[category] === true;
}

/**
 * Client-only write. Not HttpOnly on purpose — the banner itself has to set it
 * from the browser — but SameSite=Lax and Secure (outside localhost) still
 * apply. Reading happens server-side via next/headers `cookies()`.
 */
export function writeConsentCookie(value: ConsentRecord): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${CONSENT_COOKIE_NAME}=${serializeConsent(value)}` +
    `; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}
