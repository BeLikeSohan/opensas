import { useMemo } from 'react';
import { listMyHolds } from '../api';
import { HoldStatus, type StudentHold } from '../types';
import { usePolling, type Fetcher } from './usePolling';

const MY_HOLDS_REFRESH_MS = 5000;

/**
 * GET /me/holds for the current student, polled while the student ID is valid.
 * Also returns, per class, the hold that matters for the class card:
 * a confirmed admission, otherwise an active (HELD) hold.
 */
export function useMyHolds(studentId: string, enabled: boolean) {
  const fetcher = useMemo<Fetcher<StudentHold[]> | null>(
    () => (enabled ? (signal) => listMyHolds(studentId, signal) : null),
    [studentId, enabled],
  );

  const { data, refresh } = usePolling(fetcher, MY_HOLDS_REFRESH_MS);

  const holdsByClass = useMemo(() => {
    const map = new Map<string, StudentHold>();
    for (const hold of data ?? []) {
      if (hold.status === HoldStatus.CONFIRMED) {
        map.set(hold.classId, hold);
      } else if (hold.status === HoldStatus.HELD && map.get(hold.classId)?.status !== HoldStatus.CONFIRMED) {
        map.set(hold.classId, hold);
      }
    }
    return map;
  }, [data]);

  return { holdsByClass, refresh };
}
