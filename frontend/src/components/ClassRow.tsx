import type { ClassSummary } from '../types';
import { toBanglaNumber } from '../utils/format';

interface ClassRowProps {
  schoolClass: ClassSummary;
  canApply: boolean;
  isApplying: boolean;
  onApply: (schoolClass: ClassSummary) => void;
}

function ClassRow({ schoolClass, canApply, isApplying, onApply }: ClassRowProps) {
  const soldOut = schoolClass.availableSeats <= 0;

  let label = 'আবেদন করুন';
  if (isApplying) label = 'আবেদন হচ্ছে...';
  else if (soldOut) label = 'আসন নেই';

  return (
    <tr>
      <td>{schoolClass.name}</td>
      <td className="num">{toBanglaNumber(schoolClass.totalSeats)}</td>
      <td className="num count-confirmed">{toBanglaNumber(schoolClass.confirmedSeats)}</td>
      <td className="num count-held">{toBanglaNumber(schoolClass.heldSeats)}</td>
      <td className="num count-available">{toBanglaNumber(schoolClass.availableSeats)}</td>
      <td className="action">
        <button
          type="button"
          className="btn"
          disabled={!canApply || soldOut || isApplying}
          onClick={() => onApply(schoolClass)}
        >
          {label}
        </button>
      </td>
    </tr>
  );
}

export default ClassRow;
