import { useCallback, useEffect, useState } from 'react';
import { isApiError } from '../api';

export type Fetcher<T> = (signal: AbortSignal) => Promise<T>;

interface PollResult<T> {
  source: Fetcher<T> | null;
  data: T | null;
  error: string | null;
  /** HTTP status of the last failure (0 = network error), null when none. */
  errorStatus: number | null;
}

/**
 * Calls `fetcher` now and then every `intervalMs`. The next call is scheduled only
 * after the previous one finishes, so slow responses never overlap.
 * Pass `null` to stop polling. `fetcher` must be memoized by the caller.
 */
export function usePolling<T>(fetcher: Fetcher<T> | null, intervalMs: number) {
  const [result, setResult] = useState<PollResult<T>>({
    source: null,
    data: null,
    error: null,
    errorStatus: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!fetcher) return;

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const data = await fetcher(controller.signal);
        setResult({ source: fetcher, data, error: null, errorStatus: null });
      } catch (err) {
        if (controller.signal.aborted) return;
        const error = isApiError(err) ? err.message : 'অজানা সমস্যা হয়েছে।';
        const errorStatus = isApiError(err) ? err.status : null;
        // Keep the last good data when a refresh fails.
        setResult((prev) => ({
          source: fetcher,
          data: prev.source === fetcher ? prev.data : null,
          error,
          errorStatus,
        }));
      }
      if (!controller.signal.aborted) timer = setTimeout(load, intervalMs);
    };

    void load();

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [fetcher, intervalMs, reloadKey]);

  // Ignore results that belong to a previous fetcher (e.g. a different student ID).
  const isCurrent = fetcher !== null && result.source === fetcher;
  const data = isCurrent ? result.data : null;
  const error = isCurrent ? result.error : null;
  const errorStatus = isCurrent ? result.errorStatus : null;

  return {
    data,
    error,
    errorStatus,
    isLoading: fetcher !== null && data === null && error === null,
    refresh,
  };
}
