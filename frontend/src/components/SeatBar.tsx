import type { ClassSummary } from '../types';
import { toBanglaNumber } from '../utils/format';

interface SeatBarProps {
  schoolClass: ClassSummary;
}

function percent(part: number, total: number): string {
  return total > 0 ? `${((part / total) * 100).toFixed(1)}%` : '0%';
}

function availableColor(available: number): string {
  if (available <= 0) return 'var(--red)';
  if (available <= 5) return 'var(--amber-ink)';
  return 'var(--green-ink)';
}

/** Stacked bar (confirmed + held) with the three counts underneath. */
function SeatBar({ schoolClass }: SeatBarProps) {
  const { totalSeats, confirmedSeats, heldSeats, availableSeats } = schoolClass;
  const n = toBanglaNumber;

  return (
    <div>
      <div
        className="bar"
        role="img"
        aria-label={`মোট ${n(totalSeats)} আসনের মধ্যে ${n(confirmedSeats)} নিশ্চিত, ${n(heldSeats)} সংরক্ষিত, ${n(availableSeats)} খালি`}
      >
        <div className="bar__conf" style={{ width: percent(confirmedSeats, totalSeats) }} />
        <div className="bar__held" style={{ width: percent(heldSeats, totalSeats) }} />
      </div>
      <div className="counts">
        <div>
          <span>নিশ্চিত</span>
          <strong>{n(confirmedSeats)}</strong>
        </div>
        <div>
          <span>সংরক্ষিত</span>
          <strong>{n(heldSeats)}</strong>
        </div>
        <div>
          <span>খালি</span>
          <strong style={{ color: availableColor(availableSeats), fontWeight: 700 }}>
            {n(availableSeats)}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default SeatBar;
