import { useState } from 'react';
import { STUDENT_ID_LENGTH } from '../types';

const STORAGE_KEY = 'studentId';

function readStored(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function writeStored(value: string) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode etc.); the ID still works for this session.
  }
}

export function isValidStudentId(value: string): boolean {
  return new RegExp(`^\\d{${STUDENT_ID_LENGTH}}$`).test(value);
}

/** Student ID kept in localStorage so it survives refreshes. */
export function useStudentId() {
  const [studentId, setStudentIdState] = useState(readStored);

  const setStudentId = (value: string) => {
    setStudentIdState(value);
    writeStored(value);
  };

  return { studentId, setStudentId, isValid: isValidStudentId(studentId) };
}
