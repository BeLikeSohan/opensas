import { useCallback, useEffect, useRef, useState } from 'react';

export interface ToastData {
  variant: 'ok' | 'err';
  title: string;
  message: string;
}

const AUTO_HIDE_MS = 6000;

/** A single toast that hides itself after a few seconds. */
export function useToast() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const dismiss = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback((next: ToastData) => {
    clearTimeout(timer.current);
    setToast(next);
    timer.current = setTimeout(() => setToast(null), AUTO_HIDE_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, show, dismiss };
}
