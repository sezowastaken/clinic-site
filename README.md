# Clinic Site

Website and appointment management system for a single-doctor aesthetic surgery clinic.

The project runs entirely through Docker Compose. The host machine does not need Node.js or npm installed.

## Prerequisites

- Docker
- Docker Compose

## Setup

Copy the environment example and adjust values if needed:

```bash
cp .env.example .env
```

## Start the stack

```bash
docker compose up --build
```

- Frontend: [http://localhost:8080](http://localhost:8080)
- API health check (through the frontend proxy): [http://localhost:8080/api/health](http://localhost:8080/api/health)

## Stop the stack

```bash
docker compose down
```

Data in PostgreSQL persists in a named volume and survives `docker compose down`. It is only removed by the destructive `docker compose down -v`.

## Other useful commands

```bash
docker compose up -d
docker compose logs -f
docker compose logs -f web
docker compose logs -f api
docker compose logs -f db
docker compose exec db psql -U clinic -d clinic
```

## Current scope

- `web`: React/Vite frontend with hot reload, proxying `/api` to the API service.
- `api`: minimal Express API exposing `GET /api/health`, which also checks PostgreSQL connectivity.
- `db`: PostgreSQL with a named volume.

No migrations, database tables, authentication, appointment logic, admin UI, or production deployment exist yet.
