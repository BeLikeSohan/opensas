import type { ClassSummary } from '../types';
import { toBanglaNumber } from '../utils/format';
import SeatBar from './SeatBar';

interface ApplicationClassCardProps {
  schoolClass: ClassSummary | null;
}

/** Class name and live seat availability for the class applied to. */
function ApplicationClassCard({ schoolClass }: ApplicationClassCardProps) {
  return (
    <section className="class-card">
      <span className="section-label">শ্রেণির তথ্য</span>
      {schoolClass ? (
        <>
          <div className="class-card__head">
            <h2>{schoolClass.name}</h2>
            <span className="chip">{toBanglaNumber(schoolClass.totalSeats)} আসন</span>
          </div>
          <SeatBar schoolClass={schoolClass} />
        </>
      ) : (
        <p className="empty">লোড হচ্ছে...</p>
      )}
    </section>
  );
}

export default ApplicationClassCard;
