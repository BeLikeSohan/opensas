import type { StudentHold } from '../types';
import { formatCountdown } from '../utils/format';

interface HeldBannerProps {
  hold: StudentHold;
  now: number;
}

/** Reminder for the student's active hold, with a live countdown. */
function HeldBanner({ hold, now }: HeldBannerProps) {
  const remaining = new Date(hold.expiresAt).getTime() - now;

  return (
    <div className="banner" role="status">
      <div className="banner__text">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A4F00" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        <span>
          <strong>"{hold.className}"</strong> শ্রেণিতে আপনার জন্য একটি আসন সংরক্ষিত আছে — আসনটি ধরে রাখতে{' '}
          <span className="mono">{formatCountdown(remaining)}</span> এর মধ্যে ভর্তি ফি পরিশোধ করুন।
        </span>
      </div>
    </div>
  );
}

export default HeldBanner;
