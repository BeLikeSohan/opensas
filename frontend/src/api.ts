const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export type SchoolClass = {
  id: string;
  name: string;
  totalSeats: number;
  heldSeats: number;
  confirmedSeats: number;
  availableSeats: number;
};

export type HoldStatus = 'HELD' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';

export type Hold = {
  holdId: string;
  classId: string;
  className: string;
  status: HoldStatus;
  expiresAt: string;
};

export function isValidStudentId(studentId: string): boolean {
  return /^[0-9]{17}$/.test(studentId);
}

async function request(method: string, path: string, studentId?: string, body?: object) {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (studentId) headers['X-Student-Id'] = studentId;

  let response: Response;
  try {
    response = await fetch(API_URL + path, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('সার্ভারের সাথে সংযোগ করা যায়নি।');
  }

  if (!response.ok) {
    let message = 'Request failed (' + response.status + ')';
    try {
      const problem = await response.json();
      if (problem.errors) {
        message = Object.values(problem.errors).join(' ');
      } else {
        message = problem.detail || problem.title || message;
      }
    } catch {
      message = 'Request failed (' + response.status + ')';
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function getClasses(): Promise<SchoolClass[]> {
  return request('GET', '/classes');
}

export function createClass(name: string, totalSeats: number): Promise<SchoolClass> {
  return request('POST', '/classes', undefined, { name: name, totalSeats: totalSeats });
}

export function createHold(classId: string, studentId: string): Promise<Hold> {
  return request('POST', '/classes/' + classId + '/holds', studentId);
}

export function getMyHolds(studentId: string): Promise<Hold[]> {
  return request('GET', '/me/holds', studentId);
}

export function confirmHold(holdId: string, studentId: string) {
  return request('POST', '/holds/' + holdId + '/confirm', studentId);
}

export function cancelHold(holdId: string, studentId: string) {
  return request('DELETE', '/holds/' + holdId, studentId);
}
