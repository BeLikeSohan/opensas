import { listClasses } from '../api';
import { usePolling } from './usePolling';

export const CLASSES_REFRESH_MS = 5000;

/** GET /classes, re-polled every few seconds so seat counts stay current. */
export function useClasses() {
  const { data, error, isLoading, refresh } = usePolling(listClasses, CLASSES_REFRESH_MS);
  return { classes: data, error, isLoading, refresh };
}
