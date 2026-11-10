const numberFormat = new Intl.NumberFormat('bn-BD');

const twoDigitFormat = new Intl.NumberFormat('bn-BD', {
  minimumIntegerDigits: 2,
  useGrouping: false,
});

const dateTimeFormat = new Intl.DateTimeFormat('bn-BD', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** 12 -> "১২" */
export function toBanglaNumber(value: number): string {
  return numberFormat.format(value);
}

/** ISO timestamp -> localized Bangla date and time. */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

/** Milliseconds -> "মম:সস" in Bangla digits, e.g. 572000 -> "০৯:৩২". */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${twoDigitFormat.format(minutes)}:${twoDigitFormat.format(seconds)}`;
}
