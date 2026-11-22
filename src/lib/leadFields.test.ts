import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { applyFieldErrors } from "./leadFields.ts";

describe("applyFieldErrors", () => {
  it("maps API field names to form fields and reports a match", () => {
    const seen: [string, string][] = [];
    const matched = applyFieldErrors(
      { consent_personal_data: "Required", phone: "Invalid phone" },
      (field, message) => seen.push([field, message]),
    );
    assert.equal(matched, true);
    assert.deepEqual(seen, [
      ["consentPersonalData", "Required"],
      ["phone", "Invalid phone"],
    ]);
  });

  it("ignores unknown API fields and reports no match", () => {
    const seen: string[] = [];
    const matched = applyFieldErrors({ non_field_errors: "Oops" }, (field) =>
      seen.push(field),
    );
    assert.equal(matched, false);
    assert.deepEqual(seen, []);
  });
});
