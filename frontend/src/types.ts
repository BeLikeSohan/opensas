export const HoldStatus = {
  HELD: 'HELD',
  CONFIRMED: 'CONFIRMED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export type HoldStatus = (typeof HoldStatus)[keyof typeof HoldStatus];

export type StudentId = string;

export const STUDENT_ID_LENGTH = 17;

export type IsoDateString = string;

export interface CreateClassRequest {
  name: string;
  totalSeats: number;
}

export interface ClassResponse {
  id: string;
  name: string;
  totalSeats: number;
}

export interface ClassSummary {
  id: string;
  name: string;
  totalSeats: number;
  heldSeats: number;
  confirmedSeats: number;
  availableSeats: number;
}

export interface HoldResponse {
  holdId: string;
  classId: string;
  studentId: StudentId;
  status: HoldStatus;
  expiresAt: IsoDateString;
}

export interface HoldDetails {
  holdId: string;
  classId: string;
  status: HoldStatus;
  expiresAt: IsoDateString;
}

export interface StudentHold {
  holdId: string;
  classId: string;
  className: string;
  status: HoldStatus;
  expiresAt: IsoDateString;
}

export interface ConfirmHoldResponse {
  holdId: string;
  status: HoldStatus;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
