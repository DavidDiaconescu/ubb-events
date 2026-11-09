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

## Team

TODO

## Architecture

TODO

## API Documentation

TODO

## GenAI Usage

TODO
