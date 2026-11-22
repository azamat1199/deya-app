import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fetchWithRetry, type RetryOptions } from "./fetchWithRetry.ts";

const URL = "https://api.example/x/";

/** A fetch stub that plays back one outcome per call. */
function scripted(outcomes: (number | Error | "hang")[]) {
  const calls: RequestInit[] = [];
  const impl = (async (_url: string, init: RequestInit = {}) => {
    calls.push(init);
    const next = outcomes[calls.length - 1];
    if (next instanceof Error) throw next;
    if (next === "hang") return new Promise<Response>(() => {});
    return new Response(null, { status: next });
  }) as typeof fetch;
  return { impl, calls };
}

function harness(outcomes: (number | Error | "hang")[], extra: RetryOptions = {}) {
  const { impl, calls } = scripted(outcomes);
  const slept: number[] = [];
  const logs: string[] = [];
  const options: RetryOptions = {
    fetchImpl: impl,
    sleep: async (ms) => {
      slept.push(ms);
    },
    log: (message) => logs.push(message),
    ...extra,
  };
  return { calls, slept, logs, run: () => fetchWithRetry(URL, { headers: { a: "b" } }, options) };
}

describe("fetchWithRetry", () => {
  it("returns the first response when it succeeds, with no retry and no signal", async () => {
    const h = harness([200]);
    const response = await h.run();
    assert.equal(response.status, 200);
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0].signal, undefined, "first attempt must stay memoizable");
    assert.deepEqual(h.logs, []);
  });

  it("retries a network error and a 5xx, then succeeds", async () => {
    const h = harness([new TypeError("fetch failed"), 503, 200]);
    const response = await h.run();
    assert.equal(response.status, 200);
    assert.equal(h.calls.length, 3);
    assert.deepEqual(h.slept, [500, 1500]);
    assert.ok(h.calls[1].signal instanceof AbortSignal, "retries carry a signal");
    assert.equal(h.logs.length, 2);
    assert.match(h.logs[0], /GET https:\/\/api\.example\/x\/ — attempt 1\/4 failed \(fetch failed\); retrying in 500 ms/);
    assert.match(h.logs[1], /attempt 2\/4 failed \(HTTP 503\)/);
  });

  it("does not retry a 4xx", async () => {
    const h = harness([404, 200]);
    const response = await h.run();
    assert.equal(response.status, 404);
    assert.equal(h.calls.length, 1);
    assert.deepEqual(h.logs, []);
  });

  it("throws the last network error after all attempts", async () => {
    const h = harness([1, 2, 3, 4].map((n) => new TypeError(`fetch failed ${n}`)));
    await assert.rejects(h.run(), /fetch failed 4/);
    assert.equal(h.calls.length, 4);
    assert.deepEqual(h.slept, [500, 1500, 4000]);
  });

  it("returns the last 5xx after all attempts, so callers handle it as before", async () => {
    const h = harness([500, 502, 503, 504]);
    const response = await h.run();
    assert.equal(response.status, 504);
    assert.equal(h.calls.length, 4);
  });

  it("treats a hung request as a timeout and retries it", async () => {
    const h = harness(["hang", 200], { timeoutMs: 20 });
    const response = await h.run();
    assert.equal(response.status, 200);
    assert.match(h.logs[0], /timed out after 20 ms/);
  });

  it("aborts a retry that times out", async () => {
    const h = harness([503, "hang", 200], { timeoutMs: 20 });
    await h.run();
    assert.equal(h.calls[1].signal?.aborted, true);
  });

  it("with retryOn5xx false, returns a 5xx immediately", async () => {
    const h = harness([500, 200], { retryOn5xx: false });
    const response = await h.run();
    assert.equal(response.status, 500);
    assert.equal(h.calls.length, 1);
  });
});
