/**
 * GET with timeout and retry, for every server-side call to the backend API.
 *
 * Why: the production build prerenders every page and fetches from deya.uz
 * while doing it. A brief API hiccup (seen: connect timeouts for a few
 * seconds) used to fail the whole deploy on the first refused connection.
 *
 * Behaviour:
 * - Up to `retries` retries after the first attempt (default 3), waiting
 *   `delaysMs` between them (default 0.5 s, 1.5 s, 4 s).
 * - Retried: network errors, timeouts, and 5xx responses. NOT retried: 4xx —
 *   those are answers, not failures (a 404 is "no such product").
 * - Every attempt is limited to `timeoutMs` (default 10 s).
 * - After the last attempt a network error/timeout is thrown and a 5xx
 *   response is returned, so callers keep their own error handling: a product
 *   page still fails the build, a page with static fallback content still
 *   falls back.
 * - Each retry is logged with the URL and attempt number.
 *
 * Next.js detail that shapes the code: GET fetches are memoized per render,
 * and a fetch carrying an AbortSignal is NOT memoized. The FIRST attempt
 * therefore goes out without a signal (so layout, metadata and page still
 * share one request) and its timeout is a race, not an abort. RETRIES carry a
 * signal: that makes each one a real new request (the memoized promise of a
 * failed first attempt would otherwise just be handed back) and lets the
 * timeout abort it.
 *
 * Pure apart from the injected fetch/sleep/log, so it runs under node --test.
 */

export interface RetryOptions {
  retries?: number;
  delaysMs?: readonly number[];
  timeoutMs?: number;
  /** Set false where a 5xx is a meaningful answer (see getPost). */
  retryOn5xx?: boolean;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  log?: (message: string) => void;
}

const DEFAULT_DELAYS_MS = [500, 1500, 4000] as const;

class TimeoutError extends Error {
  constructor(ms: number) {
    super(`timed out after ${ms} ms`);
    this.name = "TimeoutError";
  }
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  onTimeout: () => void,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      onTimeout();
      reject(new TimeoutError(ms));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function describe(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause =
    error.cause instanceof Error ? ` (${error.cause.message})` : "";
  return `${error.message}${cause}`;
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  {
    retries = 3,
    delaysMs = DEFAULT_DELAYS_MS,
    timeoutMs = 10_000,
    retryOn5xx = true,
    fetchImpl = fetch,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    log = (message) => console.warn(message),
  }: RetryOptions = {},
): Promise<Response> {
  const total = retries + 1;

  for (let attempt = 1; ; attempt++) {
    const controller = attempt > 1 ? new AbortController() : null;
    const requestInit = controller ? { ...init, signal: controller.signal } : init;
    let failure: string;

    try {
      const response = await withTimeout(
        fetchImpl(url, requestInit),
        timeoutMs,
        () => controller?.abort(),
      );
      if (response.status < 500 || !retryOn5xx || attempt === total) {
        return response;
      }
      failure = `HTTP ${response.status}`;
    } catch (error) {
      if (attempt === total) throw error;
      failure = describe(error);
    }

    const delay = delaysMs[Math.min(attempt - 1, delaysMs.length - 1)] ?? 0;
    log(
      `[api] GET ${url} — attempt ${attempt}/${total} failed (${failure}); retrying in ${delay} ms`,
    );
    await sleep(delay);
  }
}
