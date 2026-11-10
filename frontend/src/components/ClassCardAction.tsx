import { HoldStatus, type StudentHold } from '../types';
import HoldCountdown from './HoldCountdown';

interface ClassCardActionProps {
  myHold: StudentHold | undefined;
  availableSeats: number;
  /** False while another application is in flight. */
  canApply: boolean;
  isApplying: boolean;
  onApply: () => void;
  onHoldExpire: () => void;
}

/** Bottom of a class card: admitted / held countdown / apply / no seats. */
function ClassCardAction({
  myHold,
  availableSeats,
  canApply,
  isApplying,
  onApply,
  onHoldExpire,
}: ClassCardActionProps) {
  if (myHold?.status === HoldStatus.CONFIRMED) {
    return (
      <div className="admitted">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
        <span>এই শ্রেণিতে আপনার ভর্তি নিশ্চিত হয়েছে</span>
      </div>
    );
  }

  if (myHold?.status === HoldStatus.HELD) {
    return <HoldCountdown expiresAt={myHold.expiresAt} onExpire={onHoldExpire} />;
  }

  if (availableSeats <= 0) {
    return (
      <button type="button" className="btn-full" disabled>
        কোনো আসন খালি নেই
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn-primary"
      disabled={!canApply || isApplying}
      aria-busy={isApplying}
      onClick={onApply}
    >
      {isApplying ? 'আসন সংরক্ষণ হচ্ছে…' : 'আবেদন করুন'}
    </button>
  );
}

export default ClassCardAction;
