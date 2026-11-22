/**
 * Keeps the rows `isValid` accepts and reports the rest — once, with counts
 * and the first offender, never once per row and never silently. A row without
 * a numeric id would give a component an undefined React key, so those are
 * counted separately.
 *
 * Pure (no fetch, no `@/` imports), so it runs under `node --test`.
 */
export function keepValidRows<T>(
  rows: readonly unknown[],
  isValid: (row: unknown) => row is T,
  label: string,
): T[] {
  const valid: T[] = [];
  const rejected: unknown[] = [];
  for (const row of rows) {
    if (isValid(row)) valid.push(row);
    else rejected.push(row);
  }

  if (rejected.length) {
    const missingId = rejected.filter(
      (row) =>
        typeof row !== "object" ||
        row === null ||
        typeof (row as Record<string, unknown>).id !== "number",
    ).length;
    console.error(
      `[${label}] dropped ${rejected.length} unusable row(s), ${missingId} of them lacking a numeric id — first offender:`,
      JSON.stringify(rejected[0]),
    );
  }

  return valid;
}
