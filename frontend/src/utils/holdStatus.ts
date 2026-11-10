import { isApiError } from '../api';
import { HoldStatus, type StudentHold } from '../types';

export const HOLD_STATUS_LABEL: Record<HoldStatus, string> = {
  HELD: 'সংরক্ষিত',
  CONFIRMED: 'নিশ্চিত',
  EXPIRED: 'মেয়াদোত্তীর্ণ',
  CANCELLED: 'বাতিল',
};

/**
 * The backend expires holds lazily, so a HELD hold can pass its deadline between
 * polls. Treat it as EXPIRED as soon as the clock says so, without waiting for a reload.
 */
export function effectiveStatus(hold: Pick<StudentHold, 'status' | 'expiresAt'>, now: number): HoldStatus {
  if (hold.status === HoldStatus.HELD && new Date(hold.expiresAt).getTime() <= now) {
    return HoldStatus.EXPIRED;
  }
  return hold.status;
}

/** Bangla text for the backend's hold errors (matched on the ProblemDetails title). */
export function holdErrorMessage(err: unknown): string {
  if (!isApiError(err)) return 'অজানা সমস্যা হয়েছে। আবার চেষ্টা করুন।';
  switch (err.title) {
    case 'Application expired':
      return 'আবেদনের মেয়াদ শেষ হয়ে গেছে, আসনটি ছেড়ে দেওয়া হয়েছে।';
    case 'Application cannot be confirmed':
      return 'এই আবেদনটি আর নিশ্চিত করা যাবে না।';
    case 'Application cannot be cancelled':
      return 'এই আবেদনটি আর বাতিল করা যাবে না।';
    case 'Application not found':
      return 'আবেদনটি খুঁজে পাওয়া যায়নি।';
    default:
      return err.message;
  }
}
