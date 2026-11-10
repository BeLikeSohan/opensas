import { STUDENT_ID_LENGTH } from '../types';
import { toBanglaNumber } from '../utils/format';

interface StudentIdInputProps {
  value: string;
  isValid: boolean;
  onChange: (value: string) => void;
}

function StudentIdInput({ value, isValid, onChange }: StudentIdInputProps) {
  const showError = value.length > 0 && !isValid;
  const length = toBanglaNumber(STUDENT_ID_LENGTH);

  return (
    <section className="card">
      <div className="field">
        <label htmlFor="student-id">শিক্ষার্থীর জন্ম নিবন্ধন নম্বর</label>
        <input
          id="student-id"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={STUDENT_ID_LENGTH}
          placeholder={`${length} সংখ্যার জন্ম নিবন্ধন নম্বর লিখুন`}
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          aria-invalid={showError}
          aria-describedby="student-id-help"
        />
        <span id="student-id-help" className={showError ? 'field-error' : 'hint'}>
          {showError
            ? `জন্ম নিবন্ধন নম্বর অবশ্যই ${length} সংখ্যার হতে হবে।`
            : 'আবেদন করতে আপনার জন্ম নিবন্ধন নম্বর দিন।'}
        </span>
      </div>
    </section>
  );
}

export default StudentIdInput;
