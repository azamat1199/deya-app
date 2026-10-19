/**
 * Cookie-consent state. Read and written in the browser only: the pages are
 * prerendered, so the server never sees the visitor's cookie. The banner is in
 * every page's HTML, and CONSENT_DECIDED_SCRIPT hides it before first paint
 * for a visitor who has already answered — see CookieConsent.
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

/** Set on <html> when the visitor has answered; globals.css hides the banner
 *  (and drops the room the mobile hero reserves for it) while it is present. */
export const CONSENT_DECIDED_ATTRIBUTE = "data-cookie-decided";

const COOKIE_PATTERN = `(?:^|;\\s*)${CONSENT_COOKIE_NAME}=([^;]*)`;

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

export function serializeConsent(value: ConsentRecord): string {
  return encodeURIComponent(JSON.stringify(value));
}

/** True when the visitor has answered the CURRENT policy version. */
export function hasDecision(value: ConsentRecord | null): boolean {
  return value !== null && value.v === CONSENT_VERSION;
}

/** Client-only read of the raw cookie value, for parseConsent. */
export function readConsentCookie(): string | null {
  const match = document.cookie.match(new RegExp(COOKIE_PATTERN));
  return match ? match[1] : null;
}

/**
 * Runs inline in <head>, synchronously, before the body is parsed: marks <html>
 * when the cookie holds a decision for the current policy version, so a
 * returning visitor's banner is hidden by CSS before the first paint rather
 * than after hydration. Mirrors parseConsent + hasDecision; CookieConsent
 * re-checks with those after hydration and corrects the attribute either way,
 * so the two cannot leave the banner stuck hidden.
 */
export const CONSENT_DECIDED_SCRIPT =
  `(function(){try{` +
  `var m=document.cookie.match(new RegExp(${JSON.stringify(COOKIE_PATTERN)}));` +
  `if(!m)return;` +
  `var r=JSON.parse(decodeURIComponent(m[1]));` +
  `if(r&&r.v===${CONSENT_VERSION}&&typeof r.at==="string"&&` +
  `(r.status==="accepted"||r.status==="rejected")&&r.categories&&` +
  `typeof r.categories.necessary==="boolean")` +
  `document.documentElement.setAttribute(${JSON.stringify(CONSENT_DECIDED_ATTRIBUTE)},"")` +
  `}catch(e){}})()`;

/**
 * Client-only write. Not HttpOnly on purpose — the banner itself has to set it
 * from the browser — but SameSite=Lax and Secure (outside localhost) still
 * apply. Read back by readConsentCookie and CONSENT_DECIDED_SCRIPT.
 */
export function writeConsentCookie(value: ConsentRecord): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${CONSENT_COOKIE_NAME}=${serializeConsent(value)}` +
    `; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}
