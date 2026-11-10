const numberFormat = new Intl.NumberFormat('bn-BD');

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
