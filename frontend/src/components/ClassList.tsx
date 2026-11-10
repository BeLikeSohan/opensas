import type { ClassSummary } from '../types';
import ClassRow from './ClassRow';

interface ClassListProps {
  classes: ClassSummary[];
  canApply: boolean;
  applyingClassId: string | null;
  onApply: (schoolClass: ClassSummary) => void;
}

function ClassList({ classes, canApply, applyingClassId, onApply }: ClassListProps) {
  if (classes.length === 0) {
    return <p className="empty">এখনো কোনো শ্রেণি যোগ করা হয়নি।</p>;
  }

  return (
    <div className="table-wrap">
      <table className="class-table">
        <thead>
          <tr>
            <th>শ্রেণি</th>
            <th className="num">মোট আসন</th>
            <th className="num">নিশ্চিত</th>
            <th className="num">সংরক্ষিত</th>
            <th className="num">খালি আসন</th>
            <th className="action" aria-label="পদক্ষেপ" />
          </tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <ClassRow
              key={c.id}
              schoolClass={c}
              canApply={canApply && applyingClassId === null}
              isApplying={applyingClassId === c.id}
              onApply={onApply}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClassList;
