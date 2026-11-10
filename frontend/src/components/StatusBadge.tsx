import type { HoldStatus } from '../types';
import { HOLD_STATUS_LABEL } from '../utils/holdStatus';

interface StatusBadgeProps {
  status: HoldStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`badge badge--${status}`}>{HOLD_STATUS_LABEL[status]}</span>;
}

export default StatusBadge;
