import type {
  ClassResponse,
  ClassSummary,
  ConfirmHoldResponse,
  CreateClassRequest,
  HoldDetails,
  HoldResponse,
  ProblemDetails,
  StudentHold,
  StudentId,
} from './types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'localhost:5070').replace(/\/+$/, '');

const STUDENT_ID_HEADER = 'X-Student-Id';

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;

  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  studentId?: StudentId;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, studentId, signal } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (studentId !== undefined) headers[STUDENT_ID_HEADER] = studentId;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  if (!response.ok) throw await toApiError(response);

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function toApiError(response: Response): Promise<ApiError> {
  let problem: ProblemDetails = {};
  try {
    problem = (await response.json()) as ProblemDetails;
  } catch {
    // Body was empty or not JSON; fall back to the status code.
  }

  const fieldErrors = problem.errors ?? {};
  const validationMessages = Object.values(fieldErrors).flat();

  const message =
    problem.detail ||
    (validationMessages.length > 0 ? validationMessages.join(' ') : undefined) ||
    problem.title ||
    defaultMessage(response.status);

  return new ApiError(response.status, message, fieldErrors);
}

function defaultMessage(status: number): string {
  switch (status) {
    case 400:
      return 'The request was invalid.';
    case 404:
      return 'Not found.';
    case 409:
      return 'The request conflicts with the current state. Please refresh and try again.';
    default:
      return status >= 500
        ? 'The server ran into a problem. Please try again.'
        : `Request failed (${status}).`;
  }
}

const seg = encodeURIComponent;

// ---- Classes ----

export function listClasses(signal?: AbortSignal): Promise<ClassSummary[]> {
  return request('/classes', { signal });
}

export function getClass(classId: string, signal?: AbortSignal): Promise<ClassSummary> {
  return request(`/classes/${seg(classId)}`, { signal });
}

export function createClass(input: CreateClassRequest): Promise<ClassResponse> {
  return request('/classes', { method: 'POST', body: input });
}

// ---- Holds ----

export function createHold(classId: string, studentId: StudentId): Promise<HoldResponse> {
  return request(`/classes/${seg(classId)}/holds`, { method: 'POST', studentId });
}

export function getHold(holdId: string, signal?: AbortSignal): Promise<HoldDetails> {
  return request(`/holds/${seg(holdId)}`, { signal });
}

export function listMyHolds(studentId: StudentId, signal?: AbortSignal): Promise<StudentHold[]> {
  return request('/me/holds', { studentId, signal });
}

export function confirmHold(holdId: string, studentId: StudentId): Promise<ConfirmHoldResponse> {
  return request(`/holds/${seg(holdId)}/confirm`, { method: 'POST', studentId });
}

export function cancelHold(holdId: string, studentId: StudentId): Promise<void> {
  return request(`/holds/${seg(holdId)}`, { method: 'DELETE', studentId });
}
