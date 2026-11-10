import { HoldStatus, type StudentHold } from '../types';
import { formatCountdown, formatDateTime } from '../utils/format';
import StatusBadge from './StatusBadge';

export type HoldAction = 'confirm' | 'cancel';

interface ApplicationRowProps {
  hold: StudentHold;
  status: HoldStatus;
  now: number;
  /** The action currently running for this row, if any. */
  pendingAction: HoldAction | null;
  /** True while an action runs on any row. */
  busy: boolean;
  onConfirm: (hold: StudentHold) => void;
  onCancel: (hold: StudentHold) => void;
}

function Outcome({ hold, status, now }: Pick<ApplicationRowProps, 'hold' | 'status' | 'now'>) {
  switch (status) {
    case HoldStatus.HELD:
      return (
        <span className="left">
          {formatCountdown(new Date(hold.expiresAt).getTime() - now)} বাকি
        </span>
      );
    case HoldStatus.CONFIRMED:
      return <span className="applied">ভর্তি ফি পরিশোধিত, ভর্তি নিশ্চিত</span>;
    case HoldStatus.EXPIRED:
      return <span className="applied">মেয়াদ শেষ: {formatDateTime(hold.expiresAt)}</span>;
    case HoldStatus.CANCELLED:
      return <span className="applied">আবেদন বাতিল করা হয়েছে</span>;
  }
}

function ApplicationRow({ hold, status, now, pendingAction, busy, onConfirm, onCancel }: ApplicationRowProps) {
  const canAct = status === HoldStatus.HELD;

  return (
    <tr>
      <td>
        <strong className="cls-name">{hold.className}</strong>
      </td>
      <td>
        <StatusBadge status={status} />
      </td>
      <td>
        <Outcome hold={hold} status={status} now={now} />
      </td>
      <td className="actions">
        {canAct && (
          <div className="row-actions">
            <button
              type="button"
              className="btn-green"
              disabled={busy}
              aria-busy={pendingAction === 'confirm'}
              onClick={() => onConfirm(hold)}
            >
              {pendingAction === 'confirm' ? 'পরিশোধ হচ্ছে…' : 'ভর্তি ফি পরিশোধ করুন'}
            </button>
            <button
              type="button"
              className="btn-outline"
              disabled={busy}
              aria-busy={pendingAction === 'cancel'}
              onClick={() => onCancel(hold)}
            >
              {pendingAction === 'cancel' ? 'বাতিল হচ্ছে…' : 'বাতিল করুন'}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default ApplicationRow;
