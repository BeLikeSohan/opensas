import { STUDENT_ID_LENGTH } from '../types';
import { toBanglaNumber } from './format';

/** Birth registration number: exactly 17 characters (same rule as the backend). */
export function isValidStudentId(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.length === STUDENT_ID_LENGTH;
}

/** Bangla validation message for a missing or malformed student ID, or null if valid. */
export function studentIdError(value: string | null | undefined): string | null {
  if (!value) return 'আবেদন করতে আগে জন্ম নিবন্ধন নম্বর দিন।';
  if (!isValidStudentId(value)) {
    return `জন্ম নিবন্ধন নম্বর অবশ্যই ${toBanglaNumber(STUDENT_ID_LENGTH)} অক্ষরের হতে হবে।`;
  }
  return null;
}
