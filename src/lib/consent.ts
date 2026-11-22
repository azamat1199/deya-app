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
const CONSENT_VERSION = 1;

const CONSENT_COOKIE_NAME = "deya_cookie_consent";

/** A year, the usual ceiling for a consent record. */
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

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

function serializeConsent(value: ConsentRecord): string {
  return encodeURIComponent(JSON.stringify(value));
}

/** True when the visitor has answered the CURRENT policy version. */
export function hasDecision(value: ConsentRecord | null): boolean {
  return value !== null && value.v === CONSENT_VERSION;
}

/**
 * Client-only read of the raw cookie value; "" when absent.
 *
 * Reading is CLIENT-side on purpose. It used to be `cookies()` in the locale
 * layout, which made every page on the site dynamically rendered — no static
 * HTML, no ISR — just to decide whether to show this banner.
 */
export function readConsentCookie(): string {
  const prefix = `${CONSENT_COOKIE_NAME}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) return trimmed.slice(prefix.length);
  }
  return "";
}

/**
 * Set on <html> by CONSENT_BOOT_SCRIPT before first paint when a consent
 * cookie exists. The static HTML always contains the banner; this attribute is
 * what hides it (and stops the hero reserving room for it — see globals.css)
 * for returning visitors, without waiting for React and without a flash.
 */
export const CONSENT_DECIDED_ATTRIBUTE = "data-cookie-consent";

/**
 * Inline <head> script. Deliberately only checks that the cookie EXISTS — the
 * full validity check (version, shape) runs in CookieConsent after hydration,
 * which removes the attribute again if the stored decision is stale, so a
 * policy-version bump still re-asks.
 */
export const CONSENT_BOOT_SCRIPT = `try{if(("; "+document.cookie).indexOf("; ${CONSENT_COOKIE_NAME}=")>-1)document.documentElement.setAttribute("${CONSENT_DECIDED_ATTRIBUTE}","")}catch(e){}`;

/**
 * Client-only write. Not HttpOnly on purpose — the banner itself has to set it
 * from the browser — but SameSite=Lax and Secure (outside localhost) still
 * apply.
 */
export function writeConsentCookie(value: ConsentRecord): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${CONSENT_COOKIE_NAME}=${serializeConsent(value)}` +
    `; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}
