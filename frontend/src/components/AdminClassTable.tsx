import type { ClassSummary } from '../types';
import { toBanglaNumber } from '../utils/format';

interface AdminClassTableProps {
  classes: ClassSummary[];
  highlightId: string | null;
}

function AdminClassTable({ classes, highlightId }: AdminClassTableProps) {
  const n = toBanglaNumber;

  return (
    <div className="table-card">
      <table className="app-table admin-table">
        <thead>
          <tr>
            <th scope="col">শ্রেণি</th>
            <th scope="col" className="num">মোট আসন</th>
            <th scope="col" className="num">নিশ্চিত</th>
            <th scope="col" className="num">সংরক্ষিত</th>
            <th scope="col" className="num">খালি</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c.id} className={c.id === highlightId ? 'row-new' : undefined}>
              <td>
                <strong className="cls-name">{c.name}</strong>
              </td>
              <td className="num">{n(c.totalSeats)}</td>
              <td className="num count-confirmed">{n(c.confirmedSeats)}</td>
              <td className="num count-held">{n(c.heldSeats)}</td>
              <td className={`num count-available${c.availableSeats <= 0 ? ' count-full' : ''}`}>
                {n(c.availableSeats)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {classes.length === 0 && <div className="table-empty">এখনো কোনো শ্রেণি যোগ করা হয়নি।</div>}
    </div>
  );
}

export default AdminClassTable;
