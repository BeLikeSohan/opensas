import { useCallback, useEffect, useState } from 'react';
import { isApiError, listClasses } from '../api';
import type { ClassSummary } from '../types';

const DEFAULT_REFRESH_MS = 5000;

/**
 * Loads GET /classes and re-polls it every few seconds so seat counts stay current.
 * The next poll is scheduled only after the previous one finishes, so slow
 * responses never overlap.
 */
export function useClasses(refreshMs = DEFAULT_REFRESH_MS) {
  const [classes, setClasses] = useState<ClassSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const data = await listClasses(controller.signal);
        setClasses(data);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(isApiError(err) ? err.message : 'অজানা সমস্যা হয়েছে।');
      }
      if (!controller.signal.aborted) timer = setTimeout(load, refreshMs);
    };

    void load();

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [refreshMs, reloadKey]);

  return { classes, error, isLoading: classes === null && error === null, refresh };
}
