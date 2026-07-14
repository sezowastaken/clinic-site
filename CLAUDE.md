# CLAUDE.md

## Project Overview

This repository contains a website and appointment management system for a single-doctor aesthetic surgery clinic.

The product has three main areas:

1. A public clinic website that presents the doctor, clinic, services, results, videos, and contact information.
2. A public appointment flow where visitors can select an available date and time and submit an appointment request.
3. A small admin panel where the clinic assistant can view, create, update, reschedule, cancel, and annotate appointments.

This is intentionally a small and focused project. Prefer simple, explicit solutions over highly abstract or enterprise-style architecture.

---

## Current Technology

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- React Hook Form

The public website and admin panel must remain in the same React application.

### Backend

- Node.js
- Express
- PostgreSQL
- `pg` for database access
- SQL migration files

Do not introduce an ORM unless explicitly requested.

### Runtime

The application must run through Docker Compose.

The host computer must not be assumed to have Node.js or npm installed.

The intended Compose services are:

- `web`
- `api`
- `db`

Do not split the system into additional services unless there is a clear, documented requirement.

---

## Repository Direction

The repository uses a service-oriented layout.

The frontend lives under:

```text
apps/web/
```

The backend lives under:

```text
apps/api/
```

Shared infrastructure configuration lives under:

```text
infra/
```

Expected high-level structure:

```text
clinic-site/
├── apps/
│   ├── web/
│   │   ├── public/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── vite.config.js
│   └── api/
│       ├── src/
│       ├── migrations/
│       ├── Dockerfile
│       └── package.json
├── infra/
│   ├── nginx/
│   └── postgres/
├── docs/
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   └── ROADMAP.md
├── CLAUDE.md
├── README.md
├── compose.yaml
└── .env.example
```

Do not reorganize the entire repository without an explicit task requiring it.

---

## Product Scope

### Public Website

The public website may contain:

- Home page
- Doctor profile
- Clinic information
- Services list
- Service detail pages
- Before and after results
- Videos
- Contact page
- Appointment page
- KVKK and legal pages

### Public Appointment Flow

A visitor should be able to:

1. Select a service or consultation type.
2. Select a date.
3. View available time slots.
4. Select a time slot.
5. Enter contact information and an optional note.
6. Accept the required KVKK consent.
7. Submit an appointment request.
8. See a clear success or error result.

Public submissions should create appointment requests. They should not automatically become confirmed appointments unless the product documentation is explicitly changed.

### Admin Panel

The assistant should be able to:

- Sign in securely.
- View daily and weekly appointments.
- View an appointment list.
- Open appointment details.
- Create appointments manually.
- Record appointments received by phone, WhatsApp, email, Instagram, referral, or another external source.
- Update appointment date and time.
- Update appointment status.
- Add internal notes.
- Cancel appointments.
- Block unavailable dates or time ranges.

### Out of Scope for the Initial Product

Do not add the following unless explicitly requested:

- Online payment
- Patient accounts
- Multiple doctors
- Multiple clinic branches
- Electronic medical records
- Prescription management
- Laboratory or imaging records
- Surgery management
- SMS integration
- WhatsApp API integration
- Automated email campaigns
- Advanced CRM features
- Native mobile applications
- Analytics warehouse
- Complex role and permission systems

---

## Architecture Constraints

Keep the system as a small modular monolith.

Use one frontend application, one backend application, and one PostgreSQL database.

Do not introduce:

- Microservices
- Redis
- Kafka
- RabbitMQ
- GraphQL
- Kubernetes
- Event-driven infrastructure
- Separate admin frontend
- Separate authentication service
- Generic repository layers for every table
- Factory patterns without a concrete need
- Large state-management libraries for local UI state
- Premature caching
- Premature performance abstractions

A new dependency must solve a concrete requirement and should not duplicate functionality already available in the project.

---

## Docker Rules

All development and runtime commands must work through Docker.

Do not assume that these commands can run directly on the host:

```bash
npm install
npm run dev
npm run build
npm run lint
node
```

Use Docker Compose equivalents instead.

Examples:

```bash
docker compose up --build
docker compose up -d
docker compose down
docker compose logs -f
docker compose logs -f web
docker compose logs -f api
docker compose exec web npm run lint
docker compose exec api npm run lint
```

When adding packages, update the relevant `package.json` and lock file through the appropriate container or Docker build workflow.

Do not create undocumented local-only setup steps.

---

## Coding Principles

- Prefer readable code over clever code.
- Keep functions focused.
- Use explicit names.
- Avoid speculative abstractions.
- Avoid creating helper functions used only once unless they materially improve clarity.
- Reuse existing components where appropriate.
- Do not refactor unrelated files during a focused task.
- Do not rewrite working areas solely for stylistic preference.
- Preserve existing behavior unless the task explicitly changes it.
- Keep public and admin concerns clearly separated by folders, routes, and API permissions.
- Avoid large files, but do not split small files into unnecessary layers.
- Add comments only where the intent is not clear from the code itself.
- Do not leave dead code, commented-out implementations, or unused imports.

---

## Frontend Rules

- Keep React and Vite.
- Keep the public website and admin panel in the same application.
- Use React Router for route handling.
- Prefer existing Tailwind CSS conventions.
- Create shared components only when there is real reuse.
- Forms should provide visible validation and error states.
- Loading, empty, success, and error states must be handled.
- Appointment forms must work on mobile screens.
- Admin screens should prioritize clarity and speed over decorative effects.
- Public pages should prioritize trust, readability, and a premium clinical appearance.
- Do not expose internal appointment notes in public UI or public API responses.
- Do not log patient form data to the browser console.
- Do not store authentication tokens in `localStorage`.

Suggested route groups:

```text
Public:
/ 
/hakkinda
/hizmetler
/hizmetler/:slug
/sonuclar
/videolar
/iletisim
/randevu
/kvkk

Admin:
/admin/giris
/admin
/admin/takvim
/admin/randevular
/admin/randevular/yeni
/admin/randevular/:id
```

---

## Backend Rules

- Use Express for the HTTP API.
- Use PostgreSQL as the source of truth.
- Use parameterized SQL queries.
- Validate all external input.
- Return consistent HTTP status codes and error shapes.
- Keep public and admin endpoints separated.
- Protect all admin endpoints with authentication middleware.
- Never trust appointment duration, status, source, or timestamps received from the frontend without validation.
- Prevent double-booking at the database or transaction level, not only in the UI.
- Store dates and times consistently.
- Use the clinic timezone explicitly where scheduling logic requires it.
- Do not return password hashes, session secrets, or internal notes in inappropriate responses.
- Do not silently ignore database errors.

A route file may contain its own focused logic while it remains small. Split it into route, schema, and service files only when complexity justifies the separation.

---

## Database Rules

All schema changes must be implemented through versioned migration files.

Do not manually alter the production database without a corresponding migration.

Initial core tables are expected to include:

- `admin_users`
- `services`
- `appointments`
- `calendar_blocks`

Appointment records should support at least:

- Patient name
- Phone
- Optional email
- Service or consultation type
- Start time
- End time
- Status
- Source
- Optional patient note
- Optional internal note
- Creation metadata
- Update metadata

Expected appointment statuses:

```text
pending
confirmed
completed
cancelled
rejected
no_show
```

Expected appointment sources:

```text
website
phone
whatsapp
email
instagram
referral
other
```

Do not rename statuses or sources casually after they are in use. Treat such changes as data migrations.

---

## Authentication and Security

The admin panel is private.

Requirements:

- Passwords must be securely hashed.
- Authentication should use secure HTTP-only cookies.
- Authentication tokens must not be stored in browser `localStorage`.
- Admin routes must require authentication.
- Public appointment endpoints should have basic abuse protection.
- Sensitive configuration must come from environment variables.
- Secrets must never be committed.
- `.env.example` must contain only safe example values.
- Patient data must not appear in application logs unless deliberately redacted.
- Internal notes must never be exposed through public endpoints.
- Public forms must include the required consent flow.
- Do not invent medical claims, certifications, memberships, success rates, or guarantees.

This system is an appointment manager, not an electronic medical record system. Avoid collecting unnecessary medical information.

---

## Content Rules

Clinic information should be centralized under `apps/web/src/content` where practical.

Avoid defining separate copies of the same services or clinic details in multiple page components.

Do not invent or assume:

- Doctor qualifications
- Board certifications
- Professional memberships
- Clinic address
- Phone number
- Treatment claims
- Before-and-after results
- Patient testimonials
- Legal text

Use placeholders only when clearly marked, and report remaining placeholders at the end of the task.

---

## Testing and Verification

Use targeted verification.

Do not run every available test or rebuild every service after every small change.

Examples:

- A text-only frontend change does not require backend tests.
- A backend route change does not require unrelated visual checks.
- A CSS adjustment does not require rebuilding the database container.
- A migration change does require migration verification against a disposable or development database.
- Scheduling changes require tests for double-booking and invalid time ranges.
- Authentication changes require verification of protected and unauthenticated access.

Do not add an E2E framework, large test suite, or complex CI setup unless explicitly requested.

For each completed task, report:

1. Files changed.
2. What behavior changed.
3. Commands or checks run.
4. Checks not run.
5. Known limitations or follow-up items.

Never claim a test passed if it was not actually run.

---

## Task Workflow

Before making changes:

1. Read this file.
2. Read the relevant sections of `docs/PRODUCT.md`.
3. Read the relevant sections of `docs/ARCHITECTURE.md`.
4. Check the active phase and task in `docs/ROADMAP.md`.
5. Inspect the existing implementation before proposing a replacement.

During implementation:

- Stay within the requested task.
- Prefer the smallest complete change.
- Do not expand scope without a concrete blocker.
- Preserve unrelated behavior.
- Update documentation when architecture, API behavior, database structure, setup steps, or product scope changes.

After implementation:

- Run only the relevant checks.
- Summarize the result clearly.
- Mark a roadmap item complete only when its acceptance criteria are satisfied.
- Do not mark partially completed work as complete.

---

## Documentation Responsibilities

Update `docs/PRODUCT.md` when:

- User-facing behavior changes.
- Product scope changes.
- A new role or workflow is introduced.
- A feature moves into or out of the MVP.

Update `docs/ARCHITECTURE.md` when:

- Service boundaries change.
- Routes or API contracts change materially.
- Database structure changes.
- Authentication design changes.
- Runtime or deployment behavior changes.

Update `docs/ROADMAP.md` when:

- A task is completed.
- A task is intentionally deferred.
- A new required task is discovered.
- The order of implementation changes.

Update `README.md` when:

- Setup commands change.
- Environment variables change.
- Docker commands change.
- Deployment or backup instructions change.

Do not create additional guide files when an existing canonical document can be updated.

---

## Definition of Done

A task is complete when:

- The requested behavior is implemented.
- The implementation follows the project constraints.
- Relevant validation and error handling exist.
- Relevant security boundaries are preserved.
- Required migrations or configuration are included.
- Targeted checks have been run.
- Documentation is updated where necessary.
- No unrelated changes are included.
- Remaining limitations are explicitly reported.

When there is a conflict between an implementation idea and this document, follow this document unless the user explicitly changes the project direction.
