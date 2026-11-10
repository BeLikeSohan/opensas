import type { Ref } from 'react';
import { STUDENT_ID_LENGTH } from '../types';
import { toBanglaNumber } from '../utils/format';
import { studentIdError } from '../utils/studentId';

interface StudentIdInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Show the error even while the box is empty (e.g. after an Apply click without an ID). */
  forceError?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}

function StudentIdInput({ value, onChange, forceError = false, inputRef }: StudentIdInputProps) {
  const error = studentIdError(value);
  const showError = error !== null && (value.length > 0 || forceError);
  const length = toBanglaNumber(STUDENT_ID_LENGTH);

  return (
    <section className="card">
      <div className="field">
        <label htmlFor="student-id">শিক্ষার্থীর জন্ম নিবন্ধন নম্বর</label>
        <input
          ref={inputRef}
          id="student-id"
          type="text"
          autoComplete="off"
          required
          maxLength={STUDENT_ID_LENGTH}
          placeholder={`${length} অক্ষরের জন্ম নিবন্ধন নম্বর লিখুন`}
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          aria-invalid={showError}
          aria-describedby="student-id-help"
        />
        <span id="student-id-help" className={showError ? 'field-error' : 'hint'}>
          {showError ? error : 'আবেদন করতে আপনার জন্ম নিবন্ধন নম্বর দিন।'}
        </span>
      </div>
    </section>
  );
}

export default StudentIdInput;
