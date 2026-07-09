export type FormPayload = {
  formName: string;
  locale: string;
} & Record<string, unknown>;

export type SubmitFormResult = { ok: boolean };

/**
 * Single chokepoint every form calls. Swap the fetch target for a real
 * backend later without touching any form component.
 */
export async function submitForm(payload: FormPayload): Promise<SubmitFormResult> {
  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return { ok: false };
    return { ok: true };
  } catch {
    return { ok: false };
  }
}