import type { ClassSummary, StudentHold } from '../types';
import ClassCard from './ClassCard';

interface ClassGridProps {
  classes: ClassSummary[];
  holdsByClass: Map<string, StudentHold>;
  applyingClassId: string | null;
  onApply: (schoolClass: ClassSummary) => void;
  onHoldExpire: () => void;
}

function ClassGrid({ classes, holdsByClass, applyingClassId, onApply, onHoldExpire }: ClassGridProps) {
  if (classes.length === 0) {
    return <p className="empty">এখনো কোনো শ্রেণি যোগ করা হয়নি।</p>;
  }

  return (
    <section className="grid" aria-label="শ্রেণিসমূহ">
      {classes.map((c) => (
        <ClassCard
          key={c.id}
          schoolClass={c}
          myHold={holdsByClass.get(c.id)}
          canApply={applyingClassId === null}
          isApplying={applyingClassId === c.id}
          onApply={onApply}
          onHoldExpire={onHoldExpire}
        />
      ))}
    </section>
  );
}

export default ClassGrid;
