export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export type RetryOperation = () => Promise<void>;

export type RetryContext = {
  attempt: number;
  retryDelayMs: number;
  error: unknown;
};

export async function runWithRetry(
  operation: RetryOperation,
  onRetry: (context: RetryContext) => void | Promise<void>,
  maxBackoffMs: number,
  initialDelayMs = 1000,
): Promise<void> {
  let attempt = 1;
  let retryDelayMs = initialDelayMs;

  while (true) {
    try {
      await operation();
      return;
    } catch (error: unknown) {
      await onRetry({
        attempt,
        retryDelayMs,
        error,
      });

      await sleep(retryDelayMs);
      retryDelayMs = Math.min(retryDelayMs * 2, maxBackoffMs);
      attempt += 1;
    }
  }
}

export function withTimeout(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}
