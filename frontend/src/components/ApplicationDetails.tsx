import { HoldStatus, type HoldDetails } from '../types';
import { formatDateTime } from '../utils/format';

interface ApplicationDetailsProps {
  hold: HoldDetails;
  status: HoldStatus;
}

function ApplicationDetails({ hold, status }: ApplicationDetailsProps) {
  const deadlineLabel = status === HoldStatus.HELD ? 'মেয়াদ শেষ হবে' : 'মেয়াদ শেষের সময়';

  return (
    <section className="class-card">
      <span className="section-label">আবেদনের বিবরণ</span>
      <dl className="details">
        <div>
          <dt>আবেদন নম্বর</dt>
          <dd className="mono">{hold.holdId}</dd>
        </div>
        <div>
          <dt>{deadlineLabel}</dt>
          <dd>{formatDateTime(hold.expiresAt)}</dd>
        </div>
      </dl>
    </section>
  );
}

export default ApplicationDetails;
