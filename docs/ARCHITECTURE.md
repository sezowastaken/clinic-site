# ARCHITECTURE.md

## 1. Purpose

This document defines the technical architecture of the clinic website and appointment management system.

The system is intentionally small.

It should remain easy to understand, run, debug, and deploy.

The architecture consists of:

- One React frontend
- One Node.js API
- One PostgreSQL database
- One Docker Compose stack

The system should not evolve into a microservice architecture without a clear product requirement.

---

## 2. High-Level Architecture

```text
Browser
   │
   ▼
web container
   ├── Serves the React application
   ├── Serves the admin panel
   └── Proxies /api requests
            │
            ▼
       api container
       ├── Public API
       ├── Admin API
       ├── Authentication
       ├── Availability logic
       └── Appointment management
            │
            ▼
       db container
       └── PostgreSQL
```

The public website and admin panel are part of the same frontend application.

The backend is a single modular Node.js application.

PostgreSQL is the source of truth.

---

## 3. Docker Compose Services

The intended Compose services are:

```text
web
api
db
```

Do not add more services unless there is a concrete requirement.

## 3.1 Web Service

Responsibilities:

- Build the React application
- Serve static frontend files
- Serve public and admin routes
- Proxy `/api` requests to the API service
- Support client-side routing fallback

Development may use the Vite development server inside the container.

Production should use a static build served by Nginx.

Expected internal port:

```text
80
```

Suggested local development port:

```text
8080
```

Example local URL:

```text
http://localhost:8080
```

The final host port may be changed through Compose configuration.

## 3.2 API Service

Responsibilities:

- Expose HTTP API endpoints
- Validate external input
- Authenticate admin users
- Calculate appointment availability
- Create and manage appointments
- Manage calendar blocks
- Read and write PostgreSQL data
- Run or support SQL migrations
- Provide health status

Expected internal port:

```text
3000
```

The API should normally be accessed through the web service proxy.

Direct host exposure is optional in development.

## 3.3 Database Service

Technology:

```text
PostgreSQL
```

Responsibilities:

- Store admin users
- Store services
- Store appointments
- Store calendar blocks
- Enforce important constraints
- Persist data through a Docker volume

The database should not be publicly exposed in production.

A host port may be exposed in development only when necessary.

---

## 4. Repository Structure

The repository uses a service-oriented layout.

The frontend lives under `apps/web/`.

The backend lives under `apps/api/`.

Shared infrastructure configuration lives under `infra/`.

Expected structure:

```text
clinic-site/
├── apps/
│   ├── web/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── content/
│   │   │   ├── layout/
│   │   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   ├── App.jsx
│   │   │   ├── index.css
│   │   │   └── main.jsx
│   │   ├── Dockerfile
│   │   ├── index.html
│   │   ├── eslint.config.js
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   └── vite.config.js
│   │
│   └── api/
│       ├── src/
│       │   ├── app.js
│       │   ├── config.js
│       │   ├── db.js
│       │   ├── server.js
│       │   ├── middleware/
│       │   │   ├── error-handler.js
│       │   │   └── require-auth.js
│       │   ├── routes/
│       │   │   ├── auth.js
│       │   │   ├── services.js
│       │   │   ├── availability.js
│       │   │   ├── appointments.js
│       │   │   ├── admin-appointments.js
│       │   │   └── calendar-blocks.js
│       │   └── utils/
│       ├── migrations/
│       ├── scripts/
│       ├── Dockerfile
│       ├── package.json
│       └── package-lock.json
│
├── infra/
│   ├── nginx/
│   └── postgres/
│
├── docs/
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   └── ROADMAP.md
│
├── CLAUDE.md
├── README.md
├── compose.yaml
└── .env.example
```

This is a target structure, not a requirement to create empty folders prematurely.

Only create folders when they are needed.

`infra/nginx/` will hold the production Nginx configuration (previously planned as a root-level `nginx.conf`). `infra/postgres/` will hold database-related files such as backup or initialization scripts. Both are placeholders until Phase 1 and Phase 8 introduce their contents.

---

## 5. Frontend Architecture

## 5.1 Technology

The frontend uses:

- React
- Vite
- React Router
- Tailwind CSS
- React Hook Form

Do not migrate to another frontend framework without an explicit decision.

## 5.2 Application Areas

The frontend has two route groups:

```text
Public website
Admin panel
```

Both live in the same React application.

## 5.3 Public Routes

Expected public routes:

```text
/
/hakkinda
/hizmetler
/hizmetler/:slug
/sonuclar
/videolar
/iletisim
/randevu
/kvkk
/kullanim-sartlari
```

## 5.4 Admin Routes

Expected admin routes:

```text
/admin/giris
/admin
/admin/takvim
/admin/randevular
/admin/randevular/yeni
/admin/randevular/:id
```

Protected admin routes must check the authenticated session.

The frontend route guard improves user experience but is not a security boundary.

The API must independently protect admin endpoints.

## 5.5 Suggested Frontend Folders

```text
apps/web/src/
├── api/
│   ├── client.js
│   ├── public-api.js
│   └── admin-api.js
├── components/
│   ├── ui/
│   ├── public/
│   └── admin/
├── content/
├── layout/
├── pages/
├── admin/
│   ├── components/
│   ├── pages/
│   └── routes/
├── hooks/
└── utils/
```

Do not create a separate component for every small JSX fragment.

Create shared components when there is meaningful reuse.

## 5.6 API Communication

All frontend API requests should use relative URLs:

```text
/api/...
```

Example:

```text
GET /api/services
POST /api/appointments
```

The frontend should not hardcode container hostnames.

The browser communicates with the web service.

The web service proxies API requests to the API container.

## 5.7 Authentication State

The admin session should use an HTTP-only cookie.

The frontend may call:

```text
GET /api/auth/me
```

to determine whether the admin is authenticated.

Do not store authentication tokens in:

- localStorage
- sessionStorage
- JavaScript-readable cookies

---

## 6. Backend Architecture

## 6.1 Technology

The backend uses:

- Node.js
- Express
- PostgreSQL
- `pg`
- A small schema validation library such as Zod

Do not add an ORM unless explicitly requested.

## 6.2 Application Style

The backend is a modular monolith.

Small route modules may directly contain:

- Validation
- Database queries
- Response formatting

When a route module becomes difficult to understand, it may be split into:

```text
appointments.routes.js
appointments.schemas.js
appointments.service.js
```

Do not create service, repository, controller, factory, mapper, and domain layers for every feature by default.

## 6.3 Suggested Startup Files

```text
apps/api/src/config.js
```

Reads and validates environment variables.

```text
apps/api/src/db.js
```

Creates the PostgreSQL connection pool.

```text
apps/api/src/app.js
```

Creates the Express application and registers middleware and routes.

```text
apps/api/src/server.js
```

Starts the HTTP server and handles shutdown signals.

## 6.4 Middleware

Initial middleware may include:

- JSON body parsing
- Request size limit
- Security headers
- Cookie parsing
- Authentication
- Rate limiting for public forms
- Central error handling

Do not log full request bodies because they may contain patient information.

## 6.5 Error Response Shape

API errors should use a consistent shape.

Example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is invalid.",
    "fields": {
      "phone": "Phone number is required."
    }
  }
}
```

Unexpected errors should not expose stack traces or database details to the client.

## 6.6 Success Response Shape

Simple resources may be returned directly.

Example:

```json
{
  "appointment": {
    "id": "..."
  }
}
```

Lists may use:

```json
{
  "items": [],
  "total": 0
}
```

Avoid complex response envelopes unless they are useful.

---

## 7. API Boundaries

The API is divided into:

```text
Public endpoints
Authenticated admin endpoints
```

## 7.1 Health

```text
GET /api/health
```

Purpose:

- Container health checks
- Deployment verification

Example response:

```json
{
  "status": "ok"
}
```

## 7.2 Authentication

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Login

Input:

```json
{
  "email": "assistant@example.com",
  "password": "..."
}
```

Behavior:

- Validate credentials
- Create an authenticated session
- Set a secure HTTP-only cookie
- Return safe user information

### Logout

Behavior:

- Invalidate the session
- Clear the authentication cookie

### Current User

Behavior:

- Return the authenticated admin user
- Return `401` if unauthenticated

## 7.3 Services

```text
GET /api/services
```

Public endpoint.

Returns active appointment service options.

Possible admin management endpoints may be added later if required.

## 7.4 Availability

```text
GET /api/availability?date=YYYY-MM-DD&serviceId=...
```

Public endpoint.

Responsibilities:

- Validate the requested date
- Load service duration
- Load clinic working hours
- Load active appointments
- Load calendar blocks
- Generate available slots
- Exclude past times
- Exclude overlaps

The response should not contain patient information.

Example:

```json
{
  "date": "2026-07-20",
  "timezone": "Europe/Istanbul",
  "slots": [
    {
      "startsAt": "2026-07-20T09:00:00+03:00",
      "endsAt": "2026-07-20T09:30:00+03:00"
    }
  ]
}
```

## 7.5 Public Appointments

```text
POST /api/appointments
```

Public endpoint.

Creates an appointment request.

Input may include:

```json
{
  "patientName": "Example Patient",
  "phone": "+90...",
  "email": "patient@example.com",
  "serviceId": "...",
  "startsAt": "2026-07-20T09:00:00+03:00",
  "patientNote": "Optional note",
  "kvkkAccepted": true
}
```

Server responsibilities:

- Validate all fields
- Verify KVKK acceptance
- Calculate the end time
- Recheck availability
- Prevent double-booking
- Set source to `website`
- Set status to `pending`
- Store the request
- Return a safe result

The public response must not include internal notes.

## 7.6 Admin Appointments

```text
GET    /api/admin/appointments
GET    /api/admin/appointments/:id
POST   /api/admin/appointments
PATCH  /api/admin/appointments/:id
DELETE /api/admin/appointments/:id
```

All endpoints require authentication.

### Appointment List

Possible query parameters:

```text
dateFrom
dateTo
status
source
search
page
pageSize
```

### Manual Appointment Creation

The assistant may select:

- Source
- Status
- Service
- Start time
- Patient details
- Patient note
- Internal note

### Appointment Update

Allowed changes may include:

- Patient details
- Service
- Date and time
- Status
- Source
- Patient note
- Internal note

The API must recheck schedule conflicts when date, time, service, or duration changes.

### Appointment Delete

The preferred behavior should normally be cancellation rather than permanent deletion.

Permanent deletion should be used only when there is a clear operational need.

The final behavior must be documented before implementation.

## 7.7 Calendar Blocks

```text
GET    /api/admin/calendar-blocks
POST   /api/admin/calendar-blocks
PATCH  /api/admin/calendar-blocks/:id
DELETE /api/admin/calendar-blocks/:id
```

All endpoints require authentication.

A calendar block should include:

- Start time
- End time
- Reason
- Creator
- Creation date

Calendar blocks must affect public availability.

---

## 8. Database Architecture

## 8.1 General Rules

PostgreSQL is the source of truth.

Use:

- Primary keys
- Foreign keys
- Check constraints
- Unique constraints where appropriate
- Timestamps
- Transactions for scheduling operations
- Parameterized queries

All schema changes must use versioned SQL migrations.

## 8.2 ID Strategy

Recommended ID type:

```text
UUID
```

UUID generation may use PostgreSQL facilities.

Do not expose sequential record counts unnecessarily.

## 8.3 Timestamps

Store appointment timestamps using:

```text
TIMESTAMPTZ
```

The clinic timezone is:

```text
Europe/Istanbul
```

Backend scheduling logic must use the clinic timezone explicitly.

Do not rely on the host machine timezone.

## 8.4 Initial Tables

Initial tables:

```text
admin_users
services
appointments
calendar_blocks
```

A sessions table may also be added if server-side database sessions are used.

---

## 9. Table Definitions

The following structures describe the intended model.

Exact SQL may differ slightly during implementation.

## 9.1 admin_users

Purpose:

- Store authenticated clinic admin users

Suggested columns:

```text
id
name
email
password_hash
role
is_active
created_at
updated_at
```

Suggested role values:

```text
assistant
admin
```

The first version does not need a complex permission model.

Suggested constraints:

- Email must be unique
- Role must be valid
- Password hash must not be null

## 9.2 services

Purpose:

- Store selectable appointment services or consultation types

Suggested columns:

```text
id
slug
name
short_description
duration_minutes
is_active
display_order
created_at
updated_at
```

Suggested constraints:

- Slug must be unique
- Duration must be greater than zero

The public website content may remain file-based.

This table primarily supports appointment scheduling.

Do not create a full content management system unless requested.

## 9.3 appointments

Purpose:

- Store public appointment requests
- Store confirmed appointments
- Store manually created appointments

Suggested columns:

```text
id
patient_name
phone
email
service_id
starts_at
ends_at
status
source
patient_note
internal_note
created_by
created_at
updated_at
cancelled_at
```

Suggested status values:

```text
pending
confirmed
completed
cancelled
rejected
no_show
```

Suggested source values:

```text
website
phone
whatsapp
email
instagram
referral
other
```

Suggested foreign keys:

```text
service_id -> services.id
created_by -> admin_users.id
```

`created_by` may be null for public website submissions.

Suggested checks:

- End time must be later than start time
- Status must be valid
- Source must be valid
- Patient name must not be empty
- Phone must not be empty

## 9.4 calendar_blocks

Purpose:

- Store periods where appointments cannot be scheduled

Suggested columns:

```text
id
starts_at
ends_at
reason
created_by
created_at
updated_at
```

Suggested checks:

- End time must be later than start time

Suggested foreign key:

```text
created_by -> admin_users.id
```

## 9.5 sessions

A sessions table may be used for server-side sessions.

Suggested columns:

```text
id
admin_user_id
token_hash
expires_at
created_at
last_used_at
revoked_at
```

The raw session token must not be stored in the database.

Store a secure hash of the token.

---

## 10. Double-Booking Prevention

Double-booking prevention is a critical backend responsibility.

The frontend availability view is not enough.

The backend must recheck availability when an appointment is created or moved.

An appointment conflicts when:

```text
existing.starts_at < requested.ends_at
AND
existing.ends_at > requested.starts_at
```

Appointments with these statuses should normally block time:

```text
pending
confirmed
```

The final blocking policy may be adjusted, but it must be documented.

Appointments with these statuses should not block time:

```text
cancelled
rejected
```

Completed and no-show appointments remain historical records.

Scheduling writes should use a database transaction.

The implementation should use one of these approaches:

1. PostgreSQL exclusion constraint
2. Transaction with appropriate locking
3. Another database-enforced conflict strategy

Do not rely only on:

- A frontend disabled button
- A prior availability API response
- An in-memory lock

Calendar blocks must also be checked during appointment creation and rescheduling.

---

## 11. Working Hours

Initial working hours may be defined in configuration.

Example:

```text
Monday    09:00-18:00
Tuesday   09:00-18:00
Wednesday 09:00-18:00
Thursday  09:00-18:00
Friday    09:00-18:00
Saturday  Closed
Sunday    Closed
```

These are example values only.

Do not treat them as real clinic hours until confirmed.

Future versions may move working hours into database tables.

The MVP does not require a full staff scheduling system.

---

## 12. Appointment Slot Generation

Slot generation should occur in the API.

Inputs:

- Requested date
- Service duration
- Clinic working hours
- Slot interval
- Existing blocking appointments
- Calendar blocks
- Current time
- Minimum booking notice

Example slot interval:

```text
30 minutes
```

The service duration and slot interval may differ.

Example:

- Slot interval: 30 minutes
- Consultation duration: 30 minutes
- Longer consultation duration: 60 minutes

A generated slot is available only when its entire duration fits inside working hours and does not overlap another blocking record.

---

## 13. Authentication Architecture

The admin authentication model should remain simple.

Recommended flow:

1. Admin submits email and password.
2. API validates credentials.
3. API creates a random session token.
4. API stores a hash of the token or uses a secure server-side session mechanism.
5. API sets the raw token in an HTTP-only cookie.
6. Browser sends the cookie automatically.
7. Admin middleware validates the session.
8. Logout revokes the session and clears the cookie.

Cookie requirements in production:

```text
HttpOnly
Secure
SameSite=Lax or stricter where compatible
Path=/
```

Password requirements:

- Use a modern password hashing algorithm
- Never store plaintext passwords
- Never log submitted passwords

The first admin user should be created using a controlled seed or CLI command.

Do not hardcode admin credentials in source code.

---

## 14. Security Boundaries

Public users may access:

- Clinic content
- Active service options
- Public availability
- Public appointment creation

Authenticated admins may access:

- Patient contact information
- Appointment lists
- Internal notes
- Appointment management
- Calendar blocks

Public responses must never include:

- Password hashes
- Session data
- Internal notes
- Other patients' information
- Admin-only metadata

The API must validate authorization independently from the frontend.

---

## 15. Validation Rules

Validation must exist on both frontend and backend.

Backend validation is authoritative.

Examples:

### Patient Name

- Required
- Trim whitespace
- Reasonable maximum length

### Phone

- Required
- Normalize where practical
- Reasonable maximum length

### Email

- Optional
- Must be valid when present

### Notes

- Optional
- Must have a maximum length

### Appointment Time

- Must be in the future for public requests
- Must fit working hours
- Must not overlap an appointment
- Must not overlap a calendar block
- Must have a valid service duration

### Status

- Must be one of the documented values

### Source

- Must be one of the documented values

---

## 16. Logging

Application logs should support debugging without exposing patient information.

Recommended log fields:

- Timestamp
- Log level
- Request method
- Request path
- Response status
- Request identifier
- Error code

Avoid logging:

- Full appointment request bodies
- Phone numbers
- Email addresses
- Patient notes
- Internal notes
- Passwords
- Session tokens
- Cookies

Errors may include record IDs when useful, but should avoid unnecessary personal data.

---

## 17. Environment Variables

The project should provide:

```text
.env.example
```

Expected variables may include:

```text
NODE_ENV
WEB_PORT
API_PORT

POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
DATABASE_URL

SESSION_COOKIE_NAME
SESSION_SECRET
SESSION_TTL_HOURS

CLINIC_TIMEZONE
PUBLIC_BASE_URL
```

Possible development-only values should be clearly marked.

Never commit real secrets.

The API should fail clearly at startup when required variables are missing.

---

## 18. Docker Volumes

PostgreSQL data must use a named volume.

Example:

```text
clinic_db_data
```

The database must survive:

```bash
docker compose down
```

The database will not survive if the volume is explicitly deleted.

Document destructive commands such as:

```bash
docker compose down -v
```

Do not use bind mounts for production database storage unless deployment requirements specifically call for them.

---

## 19. Development Workflow

The host computer is not assumed to have Node.js or npm.

Primary commands:

```bash
docker compose up --build
docker compose up -d
docker compose down
docker compose logs -f
```

Targeted logs:

```bash
docker compose logs -f web
docker compose logs -f api
docker compose logs -f db
```

Container commands:

```bash
docker compose exec web npm run lint
docker compose exec web npm run build
docker compose exec api npm run lint
docker compose exec api npm test
```

Database access may use:

```bash
docker compose exec db psql -U <user> -d <database>
```

Exact commands must be documented in `README.md` after implementation.

---

## 20. Migrations

Migration files should live under:

```text
apps/api/migrations/
```

Suggested naming:

```text
001_create_admin_users.sql
002_create_services.sql
003_create_appointments.sql
004_create_calendar_blocks.sql
```

Migrations should be:

- Ordered
- Versioned
- Repeatably applied to a fresh database
- Committed with the application code

Do not modify an already applied migration casually.

Create a new migration for later schema changes.

A migration runner may be:

- A small Node.js script
- A lightweight migration package
- A controlled startup command

Avoid adding a heavy ORM solely for migrations.

---

## 21. Seed Data

Seed behavior should remain explicit.

Possible seed data:

- Initial admin user
- Initial appointment service options

Do not automatically recreate or overwrite admin users on every container startup.

Initial admin creation should use:

- Environment variables
- An explicit CLI command
- A one-time seed process

Production credentials must not use repository defaults.

---

## 22. Health Checks

Each service should have an appropriate health signal.

### Web

Check that the HTTP server responds.

### API

Use:

```text
GET /api/health
```

The health endpoint may verify basic database connectivity.

### Database

Use PostgreSQL readiness checks.

Compose startup order should use health conditions where supported.

Do not assume that container startup means the application is ready.

---

## 23. Production Serving

Recommended production request flow:

```text
Internet
   │
   ▼
web container / reverse proxy
   ├── static React application
   └── /api -> api container
                  │
                  ▼
             PostgreSQL
```

Client-side routes must fall back to:

```text
/index.html
```

Examples that must work on direct refresh:

```text
/hakkinda
/randevu
/admin/takvim
```

Admin API routes must never be handled by the frontend fallback.

---

## 24. Deployment Assumptions

The initial deployment may run on one server.

Expected requirements:

- Docker
- Docker Compose
- Persistent PostgreSQL volume
- HTTPS termination
- Environment file
- Backup process
- Restricted server access

The system does not require:

- Kubernetes
- Separate database cluster
- Load balancer
- Horizontal scaling
- CDN configuration beyond normal static asset delivery

These may be considered only if real usage requires them.

---

## 25. Backup and Restore

A PostgreSQL backup process must be documented before production use.

Minimum expected capability:

- Create a database dump
- Store it outside the active database volume
- Restore the dump into a clean database
- Verify the restore procedure

The system should not claim to have backups merely because Docker uses a persistent volume.

A volume is persistence, not backup.

---

## 26. Content Storage

Clinic marketing content should initially remain in source-controlled files under:

```text
apps/web/src/content/
```

Examples:

```text
clinic.js
doctor.js
services.js
videos.js
results.js
```

Avoid duplicating the same data inside multiple page components.

The appointment service table is not automatically a full CMS.

A future CMS should only be introduced if clinic staff need to edit content frequently without developer support.

---

## 27. Media Storage

Initial static media may remain under:

```text
apps/web/public/assets/
```

Examples:

- Doctor photos
- Clinic photos
- Service images
- Approved result images
- Logos

Avoid duplicate asset copies under both:

```text
apps/web/public/assets/
apps/web/src/assets/
```

Before-and-after media must be authorized for publication.

The MVP does not require cloud object storage unless media upload becomes an admin feature.

---

## 28. Admin Calendar UI

The initial admin calendar may use a custom implementation.

It should support:

- Daily view
- Weekly view
- Clear status distinction
- Appointment selection
- Blocked time display
- Mobile-safe fallback

A third-party calendar library may be introduced only when it clearly reduces complexity.

Do not add a large scheduling library solely because calendars are available as packages.

---

## 29. Date and Time Rules

All API timestamps should use ISO 8601.

Example:

```text
2026-07-20T09:00:00+03:00
```

The clinic timezone is:

```text
Europe/Istanbul
```

Rules:

- Database timestamps use `TIMESTAMPTZ`
- The API returns explicit timezone information
- The browser displays times in the clinic timezone
- Public booking must not depend on the visitor's device timezone
- Daylight-saving and timezone behavior should be handled by reliable date utilities or PostgreSQL

Do not manually calculate timezone offsets with hardcoded arithmetic.

---

## 30. Status Transition Guidance

Expected status transitions:

```text
pending -> confirmed
pending -> rejected
pending -> cancelled

confirmed -> completed
confirmed -> cancelled
confirmed -> no_show
```

Not every transition must be blocked at database level in the first version.

However, the UI and API should avoid nonsensical transitions.

Examples:

- Completed appointments should not return to pending without an explicit reason.
- Rejected requests should not block future availability.
- Cancelled appointments should remain in history.

---

## 31. Deletion Policy

Appointments are operational records.

The default action should be:

```text
Cancel
```

rather than permanent deletion.

Permanent deletion may be reserved for:

- Accidental duplicate entries
- Test data
- Incorrect records with no operational value

If permanent deletion is implemented, it should require a deliberate admin action.

The exact policy should be finalized before production.

---

## 32. Rate Limiting and Abuse Protection

Public appointment creation should have basic abuse protection.

Possible controls:

- IP-based rate limiting
- Request body size limits
- Server-side validation
- Honeypot field
- Minimum form completion time
- CAPTCHA only if actual abuse requires it

Do not add complex anti-bot systems preemptively.

Admin login should also have basic brute-force protection.

---

## 33. Accessibility

The frontend should support:

- Keyboard navigation
- Visible focus states
- Form labels
- Error descriptions
- Sufficient contrast
- Semantic headings
- Accessible buttons and links
- Meaningful image alternative text

Calendar interactions must not be mouse-only.

---

## 34. Performance

The initial expected traffic is low.

Priorities:

- Optimized images
- Reasonable bundle size
- Lazy loading where appropriate
- Efficient database queries
- Pagination for appointment lists
- Avoiding unnecessary API requests

Do not introduce caching infrastructure before a real performance problem exists.

---

## 35. Observability

Initial observability may include:

- Container logs
- API health endpoint
- Database health check
- Request identifiers
- Clear startup errors

The MVP does not require:

- Prometheus
- Grafana
- Distributed tracing
- Centralized log aggregation

These may be added later if deployment operations require them.

---

## 36. Architecture Decision Rules

When choosing between two implementations:

1. Prefer the simpler complete solution.
2. Prefer fewer moving parts.
3. Prefer explicit behavior.
4. Prefer database-backed correctness.
5. Prefer solutions that work through Docker Compose.
6. Avoid adding infrastructure for hypothetical future scale.
7. Avoid refactoring unrelated working code.
8. Document material changes in this file.

---

## 37. Current Architecture Decisions

The following decisions are active:

```text
ADR-001: Keep React and Vite.
ADR-002: Keep public and admin UI in one frontend application.
ADR-003: Use one Node.js and Express backend.
ADR-004: Use PostgreSQL.
ADR-005: Use Docker Compose with web, api, and db services.
ADR-006: Use SQL migrations.
ADR-007: Use HTTP-only cookie authentication.
ADR-008: Public bookings are pending requests by default.
ADR-009: The backend calculates availability.
ADR-010: The database must participate in double-booking prevention.
ADR-011: Keep marketing content in source files initially.
ADR-012: Do not introduce an ORM unless explicitly requested.
```

Do not create separate ADR files for every small decision.

Update this section when a major architectural decision changes.

---

## 38. Definition of Architectural Compliance

An implementation follows this architecture when:

- It runs through the three-service Docker Compose stack.
- The frontend remains React and Vite.
- The admin panel remains in the same frontend.
- The backend remains a single Express application.
- PostgreSQL is the source of truth.
- Database changes use migrations.
- Admin endpoints require authentication.
- Public endpoints do not expose private data.
- Availability is calculated by the backend.
- Double-booking is prevented beyond the frontend layer.
- The project does not introduce unnecessary services or abstractions.
- Material technical changes are documented here.
