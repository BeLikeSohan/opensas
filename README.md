# School Admission

A seat-reservation system for school admissions. Students hold a seat in a class, then confirm it by paying the admission fee. Holds that aren't confirmed in time expire automatically.

- **Backend:** ASP.NET Core 10 Web API, EF Core 10, PostgreSQL ([backend/](backend/))
- **Frontend:** React 19 + Vite, served by nginx in Docker ([frontend/](frontend/))

See [SPEC.md](SPEC.md) for the requirements and [ASSUMPTIONS.md](ASSUMPTIONS.md) for the design decisions.

---

## Quick start (Docker)

You need Docker with Docker Compose.

```bash
docker compose up -d --build
```

This starts three containers. The backend applies database migrations on startup, so no manual DB setup is needed.

| Service  | URL                                    | Notes                                |
| -------- | -------------------------------------- | ------------------------------------ |
| Frontend | http://localhost:3000                  | The web app                          |
| Backend  | http://localhost:8080                  | REST API                             |
| OpenAPI  | http://localhost:8080/openapi/v1.json  | API description (Development only)   |
| Postgres | `localhost:5432`                       | user `postgres` / password `postgres`, db `school_admission` |

To stop the app, run `docker compose down`. To also delete the database, run `docker compose down -v`.

### Configuration

Set these as environment variables or in a `.env` file next to [docker-compose.yaml](docker-compose.yaml):

| Variable                | Default                                       | Purpose                                         |
| ----------------------- | --------------------------------------------- | ----------------------------------------------- |
| `HOLD_DURATION_SECONDS` | `600`                                         | How long a seat hold lasts before it expires   |
| `POSTGRES_USER`         | `postgres`                                    | Database user                                   |
| `POSTGRES_PASSWORD`     | `postgres`                                    | Database password                               |
| `POSTGRES_DB`           | `school_admission`                            | Database name                                   |
| `CORS_ALLOWED_ORIGINS`  | `http://localhost:3000,http://localhost:5173` | Comma-separated origins allowed to call the API |
| `VITE_API_BASE_URL`     | `http://localhost:8080`                       | Backend URL the frontend calls                  |

`VITE_API_BASE_URL` is baked into the frontend at build time, so after changing it you need to rebuild: `docker compose up --build`.

Example: try expiry quickly with 30-second holds:

```bash
HOLD_DURATION_SECONDS=30 docker compose up --build
```

---

## Running locally without Docker

Requirements: [.NET 10 SDK](https://dotnet.microsoft.com/download), Node.js 22+, and a PostgreSQL server.

### 1. Database

The easiest way is to start only the database container:

```bash
docker compose up db
```

The backend's default connection string ([appsettings.Development.json](backend/src/SchoolAdmission.Api/appsettings.Development.json)) points to `localhost:5432` with `postgres`/`postgres`. To use another database, set `ConnectionStrings__Default`.

### 2. Backend

```bash
cd backend
dotnet run --project src/SchoolAdmission.Api --launch-profile http
```

The API runs at http://localhost:8080.

### 3. Frontend

```bash
cd frontend
cp .env.example .env     # sets VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev
```

The app runs at http://localhost:5173.

---

## Using the app

Open http://localhost:3000 (Docker) or http://localhost:5173 (Vite dev server). The UI is in Bangla and has three tabs:

1. **অ্যাডমিন (Admin)**: create a class with a name and number of seats.
2. **শ্রেণিসমূহ (Classes)**: enter a student ID and hold a seat in a class.
3. **আমার আবেদন (My applications)**: see your holds with a countdown, then confirm (pay the fee) or cancel.

The student ID is a birth registration number of **exactly 17 digits**, e.g. `20101234567890123`.

---

## API

Student-specific endpoints identify the student with the `X-Student-Id` header (17 digits).

| Method   | Path                          | Description                       | Success |
| -------- | ----------------------------- | --------------------------------- | ------- |
| `GET`    | `/classes`                    | List classes with seat counts     | 200     |
| `GET`    | `/classes/{classId}`          | Get one class                     | 200     |
| `POST`   | `/classes`                    | Create a class `{ name, totalSeats }` | 201 |
| `POST`   | `/classes/{classId}/holds`    | Hold a seat (needs `X-Student-Id`) | 201    |
| `GET`    | `/holds/{holdId}`             | Get hold details                  | 200     |
| `GET`    | `/me/holds`                   | List my holds (needs `X-Student-Id`) | 200  |
| `POST`   | `/holds/{holdId}/confirm`     | Confirm a hold (needs `X-Student-Id`) | 200 |
| `DELETE` | `/holds/{holdId}`             | Cancel a hold (needs `X-Student-Id`) | 204  |

Hold statuses are `HELD`, `CONFIRMED`, `EXPIRED`, and `CANCELLED`. Errors use the ASP.NET Core ProblemDetails format: `400` for invalid input, `404` for not found, and `409` for conflicts such as no seats left, a duplicate class name, or a student who already holds a seat.

### Example with curl

```bash
# Create a class
curl -X POST http://localhost:8080/classes \
  -H "Content-Type: application/json" \
  -d '{"name": "Class 6 - Morning Shift", "totalSeats": 2}'

# Hold a seat (use the class id from the response above)
curl -X POST http://localhost:8080/classes/<classId>/holds \
  -H "X-Student-Id: 20101234567890123"

# Confirm the hold
curl -X POST http://localhost:8080/holds/<holdId>/confirm \
  -H "X-Student-Id: 20101234567890123"

# List my holds
curl http://localhost:8080/me/holds -H "X-Student-Id: 20101234567890123"
```

---

## Testing

### Automated tests

The integration tests in [backend/tests/SchoolAdmission.Tests/](backend/tests/SchoolAdmission.Tests/) start the real API in memory against a throwaway PostgreSQL container ([Testcontainers](https://testcontainers.com/)). **Docker must be running.** No database setup is needed.

```bash
cd backend
dotnet test
```

They cover the concurrency rules:

- Parallel holds never oversell a class.
- Parallel holds by the same student create only one hold.
- A confirm racing a cancel leaves the hold in exactly one final state.
- Parallel creates with the same class name create only one class, and names are unique regardless of case.

### Manual API testing

[backend/src/SchoolAdmission.Api/HttpRequests/](backend/src/SchoolAdmission.Api/HttpRequests/) has ready-made requests for every endpoint, including the error cases:

- [classes.http](backend/src/SchoolAdmission.Api/HttpRequests/classes.http)
- [holds.http](backend/src/SchoolAdmission.Api/HttpRequests/holds.http)

Run them with the VS Code [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension, Rider, or Visual Studio. Replace the sample `classId` and `holdId` values with IDs from your own responses.

### Frontend lint and type-check

```bash
cd frontend
npm run lint
npm run build   # runs the TypeScript compiler, then builds
```
