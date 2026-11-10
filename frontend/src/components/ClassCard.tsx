import type { ClassSummary, StudentHold } from '../types';
import { toBanglaNumber } from '../utils/format';
import ClassCardAction from './ClassCardAction';
import SeatBar from './SeatBar';

interface ClassCardProps {
  schoolClass: ClassSummary;
  myHold: StudentHold | undefined;
  canApply: boolean;
  isApplying: boolean;
  onApply: (schoolClass: ClassSummary) => void;
  onHoldExpire: () => void;
}

function ClassCard({ schoolClass, myHold, canApply, isApplying, onApply, onHoldExpire }: ClassCardProps) {
  return (
    <article className="class-card">
      <div className="class-card__head">
        <h2>{schoolClass.name}</h2>
        <span className="chip">{toBanglaNumber(schoolClass.totalSeats)} আসন</span>
      </div>

      <SeatBar schoolClass={schoolClass} />

      <div className="class-card__action">
        <ClassCardAction
          myHold={myHold}
          availableSeats={schoolClass.availableSeats}
          canApply={canApply}
          isApplying={isApplying}
          onApply={() => onApply(schoolClass)}
          onHoldExpire={onHoldExpire}
        />
      </div>
    </article>
  );
}

export default ClassCard;
