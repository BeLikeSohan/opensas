import { useMemo } from 'react';
import { getClass } from '../api';
import type { ClassSummary } from '../types';
import { usePolling, type Fetcher } from './usePolling';

const CLASS_REFRESH_MS = 5000;

/** GET /classes/{classId}, polled so seat counts stay current. */
export function useClass(classId: string | undefined) {
  const fetcher = useMemo<Fetcher<ClassSummary> | null>(
    () => (classId ? (signal) => getClass(classId, signal) : null),
    [classId],
  );
  const { data, error, refresh } = usePolling(fetcher, CLASS_REFRESH_MS);
  return { schoolClass: data, error, refresh };
}
