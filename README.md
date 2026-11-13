# UBB Events

An event management application for student organizations at Babeș-Bolyai University (UBB).

## Tech Stack

| Area     | Technologies                                  |
| -------- | --------------------------------------------- |
| Backend  | Java 21, Spring Boot, Maven                   |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Database | PostgreSQL 16                                 |
| Tooling  | Docker Compose                                |

## Repository Structure

```text
ubb-events/
├── backend/             # Spring Boot application
├── frontend/            # Next.js application
├── docker-compose.yml   # Local PostgreSQL database
├── .env.example         # Environment variable reference
└── README.md
```

## Prerequisites

- JDK 21
- Node.js LTS
- Docker Desktop

## Running on Windows

Run each step from the repository root, using a separate PowerShell terminal for the backend and the frontend.

1. Start the database:

   ```powershell
   docker compose up -d
   ```

2. Start the backend:

   ```powershell
   cd backend; .\mvnw.cmd spring-boot:run
   ```

3. Start the frontend:

   ```powershell
   cd frontend; npm install; npm run dev
   ```

## Running the tests

```powershell
cd backend; .\mvnw.cmd test
```

Backend tests start their own PostgreSQL with Testcontainers, so Docker Desktop must be running
(`docker compose up` is not needed).

## Authentication

The API is stateless and uses JWT access tokens (HS256, valid 24 hours by default). Send the token as
`Authorization: Bearer <token>`. Errors are returned as `ProblemDetail` JSON (`application/problem+json`).

| Endpoint                  | Access        | Description                                                                 |
| ------------------------- | ------------- | --------------------------------------------------------------------------- |
| `POST /api/auth/register` | public        | Create an account (UC-01). 201 with the user; 400 invalid data; 409 e-mail taken |
| `POST /api/auth/login`    | public        | Log in (UC-02). 200 with `{ accessToken, tokenType, expiresAt, user }`; 401 wrong credentials; 403 disabled account |
| `GET /api/auth/me`        | authenticated | The user the token belongs to                                               |

- Only institutional e-mails can register (`app.auth.allowed-email-domains`, default `stud.ubbcluj.ro,ubbcluj.ro`).
  Passwords need 8–72 characters, with at least one letter and one digit.
- Public without a token: `GET /api/events`, `GET /api/events/{id}`, `/actuator/health`. `POST /api/users` and
  `PATCH /api/users/{id}/enabled` require the `ADMIN` role. Everything else requires a valid token.
- The signing key comes from the `JWT_SECRET` environment variable (at least 32 characters). The default in
  `application.properties` is for local development only; set a new random secret on every server.

Example (PowerShell):

```powershell
$body = @{ email = "ana.pop@stud.ubbcluj.ro"; password = "Parola123" } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/login `
    -ContentType "application/json" -Body $body
Invoke-RestMethod -Uri http://localhost:8080/api/auth/me `
    -Headers @{ Authorization = "Bearer $($login.accessToken)" }
```

### Postman

A ready-made collection with all the authentication scenarios is in
[`docs/postman/ubb-events-auth.postman_collection.json`](docs/postman/ubb-events-auth.postman_collection.json).
Import it in Postman and, with the backend running, use **Run collection**: every request has tests for the expected
status, and the login request saves the token automatically for the protected requests. Accounts persist in the
database, so change the collection variable `email` before running it again.

## Team

TODO

## Architecture

TODO

## API Documentation

TODO

## GenAI Usage

TODO
