import { Link } from 'react-router';
import { HoldStatus, type StudentHold } from '../types';
import { formatCountdown, formatDateTime } from '../utils/format';
import StatusBadge from './StatusBadge';

interface ApplicationRowProps {
  hold: StudentHold;
  status: HoldStatus;
  now: number;
}

function Outcome({ hold, status, now }: ApplicationRowProps) {
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

function ApplicationRow({ hold, status, now }: ApplicationRowProps) {
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
        {status === HoldStatus.HELD && (
          <Link
            className="btn-green btn-link"
            to={`/applications/${hold.holdId}`}
            aria-label={`"${hold.className}" শ্রেণির আবেদন খুলুন`}
          >
            আবেদন খুলুন
          </Link>
        )}
      </td>
    </tr>
  );
}

export default ApplicationRow;
