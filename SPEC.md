# SPEC

## What's this file is about
As I go through the provided requirement doc I will note my findings and constraints here.

## Backend
Backend Port: 8080
ORM: Entity Framework Core 10
DB Driver: Npgsql

Issues:
1. the count query isn't a seat lock. When holds are created later, the "seats must never be exceeded" rule needs its own transactional check there.

- `HELD` — Seat temporarily reserved.
- `CONFIRMED` — Admission confirmed.
- `EXPIRED` — Hold expired without confirmation.
- `CANCELLED` — Application cancelled.

API requirements:
- Use `X-Student-Id` to identify the student for student-specific operations.
- Return `409 Conflict` when no seats are available.
- Return `204 No Content` when cancellation succeeds.
- Use the status values defined above.

Configuration
- Hold duration must be configurable through `HOLD_DURATION_SECONDS`.
- Default hold duration: `600` seconds.
- Database connection must be configurable through environment variables.
- Frontend backend URL must be configurable through an environment variable.

## Frontend
Frontend Port: 3000