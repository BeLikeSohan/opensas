import type { HoldStatus, StudentHold } from '../types';
import ApplicationRow from './ApplicationRow';

export interface ApplicationView {
  hold: StudentHold;
  status: HoldStatus;
}

interface ApplicationsTableProps {
  applications: ApplicationView[];
  now: number;
}

function ApplicationsTable({ applications, now }: ApplicationsTableProps) {
  return (
    <div className="table-card">
      <table className="app-table">
        <thead>
          <tr>
            <th scope="col">শ্রেণি</th>
            <th scope="col">অবস্থা</th>
            <th scope="col">মেয়াদ / ফলাফল</th>
            <th scope="col" className="actions">
              <span className="sr-only">পদক্ষেপ</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map(({ hold, status }) => (
            <ApplicationRow key={hold.holdId} hold={hold} status={status} now={now} />
          ))}
        </tbody>
      </table>
      {applications.length === 0 && <div className="table-empty">এই তালিকায় কোনো আবেদন নেই।</div>}
    </div>
  );
}

export default ApplicationsTable;
