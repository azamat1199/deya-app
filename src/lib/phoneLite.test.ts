// The phone field renders from these constants before libphonenumber-js is
// loaded, so they must equal what the library produces for the default
// country — otherwise the field would change under the user's cursor.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getCountryCallingCode, getExampleNumber } from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";

import {
  DEFAULT_CALLING_CODE,
  DEFAULT_COUNTRY,
  DEFAULT_PLACEHOLDER,
  flagEmoji,
  matchesQuery,
} from "./phoneLite.ts";

describe("phoneLite constants match libphonenumber-js", () => {
  it("calling code", () => {
    assert.equal(DEFAULT_CALLING_CODE, getCountryCallingCode(DEFAULT_COUNTRY));
  });

  it("placeholder (same formatting as lib/phone examplePlaceholder)", () => {
    const example = getExampleNumber(DEFAULT_COUNTRY, examples);
    assert.ok(example);
    assert.equal(
      DEFAULT_PLACEHOLDER,
      example.formatNational().replace(/^0+\s*/, ""),
    );
  });
});

describe("phoneLite helpers", () => {
  it("flagEmoji builds regional indicators", () => {
    assert.equal(flagEmoji("uz"), "🇺🇿");
  });

  it("matchesQuery on name, dial code and ISO code", () => {
    const option = { code: "DE" as const, name: "Germany", callingCode: "49" };
    assert.ok(matchesQuery(option, "germ"));
    assert.ok(matchesQuery(option, "+49"));
    assert.ok(matchesQuery(option, "de"));
    assert.ok(!matchesQuery(option, "fra"));
  });
});
