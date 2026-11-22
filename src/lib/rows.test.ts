import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

import { keepValidRows } from "./rows.ts";

interface Row {
  id: number;
  name: string;
}
const isRow = (value: unknown): value is Row =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as Row).id === "number" &&
  typeof (value as Row).name === "string";

describe("keepValidRows", () => {
  it("keeps valid rows in order and logs nothing when all are valid", () => {
    const error = mock.method(console, "error", () => {});
    const rows = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
    ];
    assert.deepEqual(keepValidRows(rows, isRow, "test"), rows);
    assert.equal(error.mock.callCount(), 0);
    error.mock.restore();
  });

  it("drops invalid rows and reports them once, with counts and the first offender", () => {
    const error = mock.method(console, "error", () => {});
    const rows = [{ id: 1, name: "a" }, { name: "no id" }, null, { id: 3 }];
    assert.deepEqual(keepValidRows(rows, isRow, "getThings"), [
      { id: 1, name: "a" },
    ]);
    assert.equal(error.mock.callCount(), 1);
    const [message, offender] = error.mock.calls[0].arguments as [
      string,
      string,
    ];
    assert.match(
      message,
      /^\[getThings\] dropped 3 unusable row\(s\), 2 of them lacking a numeric id/,
    );
    assert.equal(offender, JSON.stringify({ name: "no id" }));
    error.mock.restore();
  });
});
