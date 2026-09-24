import { NextResponse, type NextRequest } from "next/server";

/**
 * Single intake endpoint for every form on the site (newsletter, contact,
 * partner application, careers...). Validates and acknowledges; swap this body
 * for a real integration (email, CRM, DB) without touching any form component.
 *
 * It deliberately does NOT log the submitted body: that is personal data
 * (name, e-mail, phone, message) and it was going to the server log in plain
 * text on every submission.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body.formName !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (typeof body.company === "string" && body.company.length > 0) {
    // Honeypot field was filled — silently report success to the bot.
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}