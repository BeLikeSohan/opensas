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
export function effectiveStatus(hold: StudentHold, now: number): HoldStatus {
  if (hold.status === HoldStatus.HELD && new Date(hold.expiresAt).getTime() <= now) {
    return HoldStatus.EXPIRED;
  }
  return hold.status;
}
