import { useMemo } from 'react';
import { getHold } from '../api';
import type { HoldDetails } from '../types';
import { usePolling, type Fetcher } from './usePolling';

const HOLD_REFRESH_MS = 5000;

/** GET /holds/{holdId}, polled so status changes made elsewhere show up. */
export function useHold(holdId: string | undefined) {
  const fetcher = useMemo<Fetcher<HoldDetails> | null>(
    () => (holdId ? (signal) => getHold(holdId, signal) : null),
    [holdId],
  );
  const { data, error, errorStatus, isLoading, refresh } = usePolling(fetcher, HOLD_REFRESH_MS);
  return { hold: data, error, notFound: errorStatus === 404 && data === null, isLoading, refresh };
}
