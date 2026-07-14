# ROADMAP.md

## Purpose

This roadmap divides the clinic website and appointment system into small, reviewable implementation phases.

The roadmap is designed for incremental development with Claude Code.

Each task should be completed independently where possible.

Do not implement an entire phase in one large change unless the phase is explicitly requested.

---

## Status Legend

```text
[ ] Not started
[-] In progress
[x] Completed
[!] Blocked
[~] Deferred
```

A task may be marked complete only when:

- The requested behavior is implemented.
- Relevant validation exists.
- Relevant checks were run.
- Documentation was updated when needed.
- Known limitations were reported.

---

## Working Rules

Before starting a task:

1. Read `/CLAUDE.md`.
2. Read the relevant section of `/docs/PRODUCT.md`.
3. Read the relevant section of `/docs/ARCHITECTURE.md`.
4. Read this roadmap.
5. Inspect the current implementation.
6. Work only on the requested task.

After completing a task:

1. List changed files.
2. Explain the behavior change.
3. List commands and checks run.
4. List checks not run.
5. Report known limitations.
6. Update the task status only when acceptance criteria are satisfied.

Do not complete unrelated roadmap items during a focused task.

---

# Phase 0 — Repository Cleanup and Baseline

## Goal

Prepare the existing frontend for continued development without changing the product architecture.

---

## Task 0.1 — Audit Existing Assets

Status:

```text
[ ]
```

Scope:

- Identify which files under `apps/web/public/assets` are used.
- Identify which files under `apps/web/src/assets` are used.
- Detect duplicate images.
- Remove only confirmed unused duplicates.
- Preserve all assets whose usage is uncertain.

Acceptance criteria:

- No used image is removed.
- Duplicate asset locations are documented or cleaned.
- Frontend routes still render.
- No unrelated visual redesign is included.

Suggested verification:

```bash
docker compose exec web npm run build
```

If Docker has not been added yet, perform static code inspection and defer the build check.

---

## Task 0.2 — Centralize Clinic Content

Status:

```text
[ ]
```

Scope:

- Review content currently duplicated in page components.
- Centralize reusable clinic information under `apps/web/src/content`.
- Centralize service data.
- Remove conflicting duplicate service lists.
- Keep page-specific presentation inside page components.

Expected files may include:

```text
apps/web/src/content/clinic.js
apps/web/src/content/doctor.js
apps/web/src/content/services.js
apps/web/src/content/videos.js
apps/web/src/content/results.js
```

Acceptance criteria:

- The same service data is not manually duplicated across multiple pages.
- Existing pages continue to display their content.
- No unverified clinic information is invented.
- Placeholder content remains clearly identifiable.

---

## Task 0.3 — Add Missing Appointment Route Placeholder

Status:

```text
[ ]
```

Scope:

- Add `/randevu` to the React Router configuration.
- Create a temporary appointment page.
- Ensure existing appointment buttons navigate correctly.
- Do not implement the real appointment flow yet.

Acceptance criteria:

- `/randevu` loads directly.
- Refreshing `/randevu` works in development.
- Existing appointment links no longer redirect to the home page.
- The page clearly states that the appointment feature is under development.

---

## Task 0.4 — Add Mobile Navigation

Status:

```text
[ ]
```

Scope:

- Add a mobile menu to the existing public layout.
- Reuse existing navigation items.
- Preserve keyboard accessibility.
- Close the menu after navigation.

Acceptance criteria:

- Navigation is usable below the desktop breakpoint.
- Menu controls have accessible labels.
- Focus states remain visible.
- Desktop navigation continues to work.

---

## Task 0.5 — Replace Default README

Status:

```text
[ ]
```

Scope:

- Replace the default Vite README.
- Document the current project purpose.
- Document the current technology.
- Document Docker-based commands after Phase 1 is complete.
- Avoid documenting commands that do not exist yet.

Acceptance criteria:

- README describes this project rather than the Vite template.
- Setup steps match the repository.
- No host-installed Node.js requirement is stated.

---

# Phase 1 — Docker Runtime

## Goal

Run the frontend, API, and PostgreSQL through one Docker Compose stack.

Target services:

```text
web
api
db
```

---

## Task 1.1 — Create Frontend Development Dockerfile

Status:

```text
[x]
```

Scope:

- Add a Dockerfile for the existing Vite frontend.
- Install dependencies inside the image or container.
- Run the Vite development server inside Docker.
- Bind Vite to an address reachable outside the container.
- Support source-code bind mounts for development.

Acceptance criteria:

- The frontend starts without host Node.js or npm.
- The browser can access the frontend.
- Source changes are reflected during development.
- `node_modules` is not incorrectly replaced by an empty host directory.

---

## Task 1.2 — Create API Skeleton

Status:

```text
[x]
```

Scope:

- Use `apps/api/` (already scaffolded as an empty directory).
- Add a minimal Node.js and Express application.
- Add `GET /api/health`.
- Add API package and lock files.
- Add API Dockerfile.
- Add graceful shutdown handling.
- Do not add appointment logic yet.

Acceptance criteria:

- API starts inside Docker.
- `/api/health` returns a successful response.
- Startup errors are clear.
- No ORM is introduced.
- No authentication implementation is included yet.

---

## Task 1.3 — Add PostgreSQL Service

Status:

```text
[x]
```

Scope:

- Add PostgreSQL to Compose.
- Add a named volume.
- Add a health check.
- Configure credentials through environment variables.
- Do not commit real credentials.

Acceptance criteria:

- PostgreSQL starts successfully.
- Data survives `docker compose down`.
- The database health check becomes healthy.
- `docker compose down -v` is documented as destructive.

---

## Task 1.4 — Create Compose Stack

Status:

```text
[x]
```

Scope:

- Create `compose.yaml`.
- Add `web`, `api`, and `db`.
- Add service dependencies using health conditions where useful.
- Add development ports.
- Add required volumes.
- Add one shared internal network only if needed.

Acceptance criteria:

- `docker compose up --build` starts all three services.
- Frontend is reachable from the host.
- API is reachable through the intended development path.
- Database state persists.
- No fourth service is added.

---

## Task 1.5 — Add Development API Proxy

Status:

```text
[x]
```

Scope:

- Configure Vite to proxy `/api` requests to the API container.
- Keep frontend API calls relative.
- Avoid hardcoded localhost API URLs in React code.

Acceptance criteria:

- Browser requests to `/api/health` reach the API.
- Frontend code does not know the Docker service hostname.
- Development CORS configuration remains minimal.

---

## Task 1.6 — Add Environment Example

Status:

```text
[-]
```

`.env.example`, database/API/web port variables, and the `.gitignore` update are done. Clinic timezone and session-related placeholders are intentionally deferred until timezone-aware scheduling (Phase 6) and session auth (Phase 3) are implemented, to avoid unused configuration.

Scope:

- Create `.env.example`.
- Document safe example values.
- Add database variables.
- Add API and web port variables.
- Add clinic timezone.
- Add future session-related placeholders where appropriate.
- Update `.gitignore` for real environment files.

Acceptance criteria:

- `.env.example` contains no real secret.
- `.env` is ignored.
- Required variables are documented.
- Compose can be configured from environment values.

---

## Task 1.7 — Document Docker Commands

Status:

```text
[ ]
```

Scope:

- Update README with Docker commands.
- Document startup.
- Document shutdown.
- Document rebuild.
- Document logs.
- Document container-based lint and build commands.
- Document database persistence.

Acceptance criteria:

- A developer without Node.js installed can start the project.
- Commands match actual service names.
- Destructive commands are clearly labeled.

---

# Phase 2 — Database and Migration Foundation

## Goal

Create a controlled PostgreSQL schema and migration workflow.

---

## Task 2.1 — Add Database Configuration

Status:

```text
[ ]
```

Scope:

- Add validated API environment configuration.
- Add PostgreSQL connection pool.
- Handle connection failures clearly.
- Do not log database passwords.

Acceptance criteria:

- API connects to PostgreSQL.
- Missing required variables cause a clear startup failure.
- Pool shuts down during graceful shutdown.
- Health endpoint can optionally verify database connectivity.

---

## Task 2.2 — Add Migration Runner

Status:

```text
[ ]
```

Scope:

- Create a lightweight SQL migration system.
- Store migrations under `apps/api/migrations`.
- Track applied migrations.
- Add an explicit migration command.
- Do not introduce an ORM solely for migrations.

Acceptance criteria:

- A fresh database can apply all migrations in order.
- Applied migrations are tracked.
- Running the migration command again is safe.
- A failed migration stops with a clear error.

---

## Task 2.3 — Create Admin Users Table

Status:

```text
[ ]
```

Scope:

Create the `admin_users` table with:

- UUID primary key
- Name
- Unique email
- Password hash
- Role
- Active flag
- Created timestamp
- Updated timestamp

Acceptance criteria:

- Role values are constrained.
- Email uniqueness is enforced.
- Plaintext passwords are never stored.
- Migration is reversible only if the migration strategy supports safe rollback.

---

## Task 2.4 — Create Services Table

Status:

```text
[ ]
```

Scope:

Create the `services` table with:

- UUID primary key
- Slug
- Name
- Short description
- Duration in minutes
- Active flag
- Display order
- Timestamps

Acceptance criteria:

- Slug is unique.
- Duration must be greater than zero.
- Public scheduling can distinguish active and inactive services.

---

## Task 2.5 — Create Appointments Table

Status:

```text
[ ]
```

Scope:

Create the `appointments` table with:

- Patient name
- Phone
- Optional email
- Service relation
- Start time
- End time
- Status
- Source
- Patient note
- Internal note
- Optional creator relation
- Created and updated timestamps
- Optional cancellation timestamp

Acceptance criteria:

- Status values are constrained.
- Source values are constrained.
- End time must be later than start time.
- Required patient fields cannot be empty.
- Appointment timestamps use `TIMESTAMPTZ`.

---

## Task 2.6 — Create Calendar Blocks Table

Status:

```text
[ ]
```

Scope:

Create the `calendar_blocks` table with:

- Start time
- End time
- Reason
- Creator
- Timestamps

Acceptance criteria:

- End time must be later than start time.
- Creator relation is valid.
- Blocks can be queried by overlapping time range.

---

## Task 2.7 — Add Double-Booking Protection

Status:

```text
[ ]
```

Scope:

- Implement database-backed conflict prevention.
- Cover active appointments.
- Define which statuses block time.
- Preserve historical cancelled and rejected records.
- Document the chosen database strategy.

Acceptance criteria:

- Two concurrent requests cannot create overlapping blocking appointments.
- Cancelled and rejected records do not block new appointments.
- Conflict errors are distinguishable from generic database errors.
- Targeted concurrency or conflict verification is performed.

---

## Task 2.8 — Add Initial Service Seed

Status:

```text
[ ]
```

Scope:

- Add an explicit seed mechanism for appointment service options.
- Do not overwrite manually changed production data on startup.
- Use placeholder or verified clinic services only.

Acceptance criteria:

- Seed runs only when explicitly requested.
- Existing records are not duplicated.
- Duration values are documented as provisional until confirmed.

---

## Task 2.9 — Add Initial Admin Creation Command

Status:

```text
[ ]
```

Scope:

- Add an explicit CLI command for creating the first admin.
- Read credentials safely.
- Hash the password.
- Avoid hardcoded production credentials.
- Do not recreate the admin on every startup.

Acceptance criteria:

- First admin can be created through Docker.
- Duplicate email handling is clear.
- Plaintext password is not logged or stored.
- README includes the command without real credentials.

---

# Phase 3 — Admin Authentication

## Goal

Secure the admin area using a simple server-side session model.

---

## Task 3.1 — Create Session Storage

Status:

```text
[ ]
```

Scope:

- Add session persistence.
- Store only a secure hash of the session token.
- Add expiry.
- Add revocation.
- Associate sessions with admin users.

Acceptance criteria:

- Raw session tokens are not stored in PostgreSQL.
- Expired or revoked sessions are rejected.
- Session lookup is efficient.

---

## Task 3.2 — Implement Login API

Status:

```text
[ ]
```

Scope:

Add:

```text
POST /api/auth/login
```

Acceptance criteria:

- Credentials are validated.
- Inactive users cannot log in.
- Invalid login uses a generic error.
- Successful login sets an HTTP-only cookie.
- Passwords and tokens are not logged.
- Basic brute-force protection exists.

---

## Task 3.3 — Implement Current User API

Status:

```text
[ ]
```

Scope:

Add:

```text
GET /api/auth/me
```

Acceptance criteria:

- Authenticated user receives safe profile data.
- Unauthenticated user receives `401`.
- Password and session internals are never returned.

---

## Task 3.4 — Implement Logout API

Status:

```text
[ ]
```

Scope:

Add:

```text
POST /api/auth/logout
```

Acceptance criteria:

- Current session is revoked.
- Cookie is cleared.
- Repeated logout remains safe.

---

## Task 3.5 — Add Admin Authentication Middleware

Status:

```text
[ ]
```

Scope:

- Create reusable Express authentication middleware.
- Attach the authenticated admin to the request.
- Protect all `/api/admin/*` routes.

Acceptance criteria:

- Public routes remain public.
- Admin routes return `401` without a valid session.
- Inactive or deleted users cannot continue using an old session.

---

## Task 3.6 — Create Admin Login Page

Status:

```text
[ ]
```

Scope:

- Add `/admin/giris`.
- Add email and password form.
- Show loading and validation states.
- Show generic invalid credential error.
- Redirect authenticated users to the admin dashboard.

Acceptance criteria:

- Login works without storing tokens in browser storage.
- Keyboard and mobile use are supported.
- Patient-facing navigation is not mixed into the admin login UI.

---

## Task 3.7 — Add Protected Admin Routes

Status:

```text
[ ]
```

Scope:

- Add an authentication check for admin pages.
- Handle loading state.
- Redirect unauthenticated users.
- Preserve API-side protection.

Acceptance criteria:

- Direct navigation to admin routes is handled correctly.
- Refreshing a protected page works.
- Route guard is not treated as the only security layer.

---

# Phase 4 — Admin Appointment Management API

## Goal

Provide authenticated appointment management operations for the assistant.

---

## Task 4.1 — Appointment List API

Status:

```text
[ ]
```

Scope:

Add:

```text
GET /api/admin/appointments
```

Support:

- Date range
- Status
- Source
- Search
- Pagination
- Date sorting

Acceptance criteria:

- Endpoint requires authentication.
- Search covers patient name and phone.
- Internal notes are returned only to authenticated admin users.
- Pagination has sensible limits.

---

## Task 4.2 — Appointment Detail API

Status:

```text
[ ]
```

Scope:

Add:

```text
GET /api/admin/appointments/:id
```

Acceptance criteria:

- Endpoint requires authentication.
- Missing records return `404`.
- Full admin-safe details are returned.
- Sensitive authentication data is never included.

---

## Task 4.3 — Manual Appointment Creation API

Status:

```text
[ ]
```

Scope:

Add:

```text
POST /api/admin/appointments
```

Acceptance criteria:

- Assistant can select source and status.
- Time conflicts are prevented.
- End time is calculated or validated safely.
- Creator is recorded.
- Invalid dates and sources are rejected.

---

## Task 4.4 — Appointment Update API

Status:

```text
[ ]
```

Scope:

Add:

```text
PATCH /api/admin/appointments/:id
```

Support:

- Patient details
- Service
- Start time
- Status
- Source
- Patient note
- Internal note

Acceptance criteria:

- Partial updates are validated.
- Rescheduling rechecks conflicts.
- Invalid status values are rejected.
- Updated timestamp changes.

---

## Task 4.5 — Appointment Cancellation Policy

Status:

```text
[ ]
```

Scope:

- Implement cancellation as the normal removal behavior.
- Record cancellation time.
- Preserve appointment history.
- Define whether permanent delete is needed.

Acceptance criteria:

- Cancelled appointments stop blocking time.
- Cancellation is visible in history.
- Permanent deletion is not exposed casually.

---

## Task 4.6 — Calendar Block CRUD API

Status:

```text
[ ]
```

Scope:

Add authenticated endpoints for:

- Listing blocks
- Creating blocks
- Updating blocks
- Deleting blocks

Acceptance criteria:

- Invalid ranges are rejected.
- Blocks affect availability.
- Overlapping blocks are handled predictably.
- Creator and timestamps are recorded.

---

# Phase 5 — Admin Interface

## Goal

Give the assistant a clear, fast interface for daily appointment work.

---

## Task 5.1 — Admin Layout

Status:

```text
[ ]
```

Scope:

- Create admin navigation.
- Separate admin visual structure from public layout.
- Add logout action.
- Add mobile-safe navigation.

Acceptance criteria:

- Admin routes do not display the public website navbar.
- Current page is visible.
- Logout is accessible.
- Layout works on desktop and mobile.

---

## Task 5.2 — Admin Dashboard

Status:

```text
[ ]
```

Scope:

Show:

- Today’s appointments
- Pending requests
- Next upcoming appointments
- Relevant cancelled or changed items

Acceptance criteria:

- Dashboard uses real API data.
- Empty states are clear.
- No unnecessary analytics library is added.

---

## Task 5.3 — Daily Calendar

Status:

```text
[ ]
```

Scope:

- Show one day’s timeline.
- Show appointments by time.
- Show status.
- Show calendar blocks.
- Allow opening appointment details.

Acceptance criteria:

- Overlapping records are represented clearly.
- Empty day is understandable.
- Calendar remains usable on smaller screens.

---

## Task 5.4 — Weekly Calendar

Status:

```text
[ ]
```

Scope:

- Show a seven-day or working-week view.
- Display appointments and blocks.
- Allow previous and next week navigation.
- Reuse daily calendar data where practical.

Acceptance criteria:

- Week boundaries are correct in clinic timezone.
- Statuses are distinguishable.
- No large calendar package is added without justification.

---

## Task 5.5 — Appointment List Page

Status:

```text
[ ]
```

Scope:

- Add searchable appointment table or list.
- Add date filter.
- Add status filter.
- Add source filter.
- Add pagination.

Acceptance criteria:

- Filters map to API parameters.
- Loading, empty, and error states exist.
- Phone and patient name are readable but not exposed outside admin.

---

## Task 5.6 — Appointment Detail View

Status:

```text
[ ]
```

Scope:

Display:

- Patient details
- Contact information
- Service
- Date and time
- Status
- Source
- Patient note
- Internal note
- Record metadata

Acceptance criteria:

- Detail view loads directly by URL.
- Missing appointment is handled.
- Internal notes remain admin-only.

---

## Task 5.7 — Manual Appointment Form

Status:

```text
[ ]
```

Scope:

- Add `/admin/randevular/yeni`.
- Support all manual sources.
- Support service, date, time, status, and notes.
- Show conflict errors clearly.

Acceptance criteria:

- Form validates required fields.
- Successful creation returns to a useful admin view.
- Double-booking is reported without losing all entered data.

---

## Task 5.8 — Appointment Editing

Status:

```text
[ ]
```

Scope:

- Edit appointment data.
- Reschedule.
- Change status.
- Update notes.
- Cancel appointment.

Acceptance criteria:

- Existing values load correctly.
- Conflicting time changes are rejected.
- Successful updates refresh the displayed record.
- Destructive actions require deliberate confirmation.

---

## Task 5.9 — Calendar Block Management UI

Status:

```text
[ ]
```

Scope:

- Create blocks from admin calendar or a focused form.
- Edit reason and time.
- Remove blocks.

Acceptance criteria:

- Full-day and timed blocks are understandable.
- Blocks appear in calendar views.
- Public availability updates accordingly.

---

# Phase 6 — Public Availability and Appointment Requests

## Goal

Allow visitors to submit appointment requests through a simple calendar flow.

---

## Task 6.1 — Public Services API

Status:

```text
[ ]
```

Scope:

Add:

```text
GET /api/services
```

Acceptance criteria:

- Only active services are returned.
- Services are ordered predictably.
- Internal database fields are not exposed unnecessarily.

---

## Task 6.2 — Working Hours Configuration

Status:

```text
[ ]
```

Scope:

- Add explicit clinic timezone.
- Add provisional weekly working hours.
- Add slot interval.
- Add minimum booking notice.
- Clearly mark example values until clinic confirms them.

Acceptance criteria:

- Configuration is validated.
- Availability does not depend on host timezone.
- Closed days return no slots.

---

## Task 6.3 — Availability API

Status:

```text
[ ]
```

Scope:

Add:

```text
GET /api/availability
```

Acceptance criteria:

- Date and service are validated.
- Past slots are excluded.
- Existing blocking appointments are excluded.
- Calendar blocks are excluded.
- Entire service duration fits.
- No patient information is returned.

---

## Task 6.4 — Public Appointment Creation API

Status:

```text
[ ]
```

Scope:

Add:

```text
POST /api/appointments
```

Acceptance criteria:

- Source is forced to `website`.
- Status is forced to `pending`.
- KVKK acceptance is required.
- Availability is rechecked transactionally.
- Conflict returns a clear response.
- Internal notes cannot be submitted publicly.
- Public response contains no private data.

---

## Task 6.5 — Appointment Page Structure

Status:

```text
[ ]
```

Scope:

Create the real `/randevu` page with steps:

1. Service
2. Date
3. Time
4. Contact information
5. Consent and submit

Acceptance criteria:

- Current selection is clear.
- User can move backward without losing valid data.
- Page works on mobile.
- Loading and errors are visible.

---

## Task 6.6 — Service Selection

Status:

```text
[ ]
```

Scope:

- Load active services from API.
- Show duration when useful.
- Handle no available services.

Acceptance criteria:

- Selection is keyboard accessible.
- API failure is handled.
- No duplicate static scheduling service list is added.

---

## Task 6.7 — Date Selection

Status:

```text
[ ]
```

Scope:

- Allow future date selection.
- Prevent obvious invalid dates.
- Request availability from the API.

Acceptance criteria:

- Date behavior uses clinic timezone.
- Closed days are handled.
- Changing service refreshes availability.

---

## Task 6.8 — Time Selection

Status:

```text
[ ]
```

Scope:

- Display slots returned by the API.
- Show an empty state when no time exists.
- Preserve selected time only while valid.

Acceptance criteria:

- Times are shown in clinic timezone.
- Selected slot is visually clear.
- Stale selection is cleared when date or service changes.

---

## Task 6.9 — Patient Information Form

Status:

```text
[ ]
```

Scope:

Collect:

- Name
- Phone
- Optional email
- Optional note

Acceptance criteria:

- Validation errors are visible.
- Reasonable maximum lengths exist.
- Patient data is not logged to console.
- Form supports mobile keyboards and autofill.

---

## Task 6.10 — Consent and Submission

Status:

```text
[ ]
```

Scope:

- Add required KVKK consent.
- Link to the relevant notice.
- Submit the request.
- Handle success, validation failure, and slot conflict.

Acceptance criteria:

- Request cannot submit without required consent.
- Double-submit is prevented.
- A slot conflict prompts the visitor to choose another time.
- Success page does not reveal sensitive internal data.

---

## Task 6.11 — Basic Abuse Protection

Status:

```text
[ ]
```

Scope:

- Add request size limits.
- Add public appointment rate limiting.
- Consider a honeypot field.
- Avoid CAPTCHA unless needed.

Acceptance criteria:

- Normal users are not blocked unnecessarily.
- Abuse controls do not replace backend validation.
- Patient data is not written into rate-limit logs.

---

# Phase 7 — Public Website Redesign and Content Completion

## Goal

Turn the existing prototype into a trustworthy and premium clinic website.

This phase should not begin with invented content.

---

## Task 7.1 — Define Design Tokens

Status:

```text
[ ]
```

Scope:

Define:

- Colors
- Typography
- Spacing
- Radius
- Shadows
- Container widths
- Button styles
- Form styles

Acceptance criteria:

- Tokens are reused.
- Public and admin interfaces remain visually related but functionally distinct.
- Contrast remains accessible.

---

## Task 7.2 — Rebuild Public Header and Footer

Status:

```text
[ ]
```

Scope:

- Improve desktop navigation.
- Preserve mobile navigation.
- Add strong appointment CTA.
- Add real contact and legal links when provided.
- Improve footer structure.

Acceptance criteria:

- No placeholder `href="#"` remains in production-ready navigation.
- Direct routes work.
- Header does not overwhelm mobile screens.

---

## Task 7.3 — Improve Home Page

Status:

```text
[ ]
```

Scope:

- Improve hero.
- Add trust indicators.
- Improve service presentation.
- Add doctor introduction.
- Add results or media section.
- Add clear appointment CTA.

Acceptance criteria:

- Content is not duplicated unnecessarily.
- Medical claims are factual.
- Page remains fast and responsive.

---

## Task 7.4 — Complete Doctor Page

Status:

```text
[ ]
```

Scope:

- Replace placeholders with verified information.
- Improve biography structure.
- Display verified education and memberships.
- Use approved media.

Acceptance criteria:

- No unverified board or association claim remains.
- Doctor information is sourced from centralized content.

---

## Task 7.5 — Complete Services and Detail Pages

Status:

```text
[ ]
```

Scope:

- Finalize service list.
- Add service detail routes.
- Add informative, non-guaranteed descriptions.
- Add relevant appointment CTA.

Acceptance criteria:

- Every active public service has a valid detail route or intentionally no detail page.
- Scheduling service mapping is documented.
- No treatment outcome is guaranteed.

---

## Task 7.6 — Complete Results Page

Status:

```text
[ ]
```

Scope:

- Replace gray placeholders.
- Use only approved result media.
- Add disclaimer.
- Add consent-aware handling of patient media.

Acceptance criteria:

- No fake results.
- No unauthorized patient media.
- Images are optimized.
- Disclaimer is visible.

---

## Task 7.7 — Complete Videos Page

Status:

```text
[ ]
```

Scope:

- Add real approved videos or clear placeholders.
- Use accessible embeds.
- Avoid excessive page weight.

Acceptance criteria:

- Video titles are meaningful.
- Embeds work responsively.
- No fabricated media is published.

---

## Task 7.8 — Complete Contact Page

Status:

```text
[ ]
```

Scope:

- Add verified phone, email, address, map, and working hours.
- Separate callback/contact request from appointment scheduling.
- Add clear emergency disclaimer if appropriate.

Acceptance criteria:

- Contact information is verified.
- Contact form behavior is real or clearly disabled.
- Appointment CTA leads to `/randevu`.

---

## Task 7.9 — Complete KVKK and Legal Pages

Status:

```text
[ ]
```

Scope:

- Replace placeholder legal text.
- Add terms of use.
- Add privacy and cookie information where applicable.
- Ensure appointment consent links are correct.

Acceptance criteria:

- Legal text is supplied or approved by the clinic or qualified professional.
- Placeholder text is removed before production.
- Consent records match the final legal flow.

---

## Task 7.10 — Accessibility and Responsive Review

Status:

```text
[ ]
```

Scope:

- Keyboard review
- Focus review
- Form label review
- Contrast review
- Mobile layout review
- Direct route refresh review

Acceptance criteria:

- Critical flows work without a mouse.
- No horizontal overflow on common mobile widths.
- Public appointment and admin login forms are accessible.

---

# Phase 8 — Production Preparation

## Goal

Prepare the application for safe deployment and operation.

---

## Task 8.1 — Production Frontend Image

Status:

```text
[ ]
```

Scope:

- Add multi-stage frontend build.
- Serve static files through Nginx.
- Add SPA fallback.
- Proxy `/api` to API.

Acceptance criteria:

- Production image does not run the Vite dev server.
- Direct route refresh works.
- API requests are not captured by SPA fallback.

---

## Task 8.2 — Production Compose Configuration

Status:

```text
[ ]
```

Scope:

- Define production-safe service configuration.
- Remove unnecessary host port exposure.
- Add restart policies.
- Preserve database volume.
- Separate safe defaults from real secrets.

Acceptance criteria:

- Only necessary services are publicly reachable.
- Database is not publicly exposed.
- Environment requirements are documented.

---

## Task 8.3 — Security Review

Status:

```text
[ ]
```

Scope:

Review:

- Cookie security
- Password hashing
- Session expiry
- Rate limits
- Request size limits
- Admin authorization
- Public response privacy
- Secret handling
- Log redaction

Acceptance criteria:

- No known authentication bypass.
- No patient data is exposed publicly.
- No real secret is committed.
- Security limitations are documented honestly.

---

## Task 8.4 — Database Backup Script

Status:

```text
[ ]
```

Scope:

- Add a documented PostgreSQL dump command or script.
- Store backups outside the active database volume.
- Include timestamped filenames.
- Document retention responsibility.

Acceptance criteria:

- Backup can be created through Docker.
- Backup output is not written only inside an ephemeral container.
- README explains where backup files are stored.

---

## Task 8.5 — Database Restore Procedure

Status:

```text
[ ]
```

Scope:

- Document restore into a clean database.
- Test restore using non-production data.
- Document destructive warnings.

Acceptance criteria:

- Restore procedure is actually verified.
- The documentation distinguishes persistence from backup.
- No claim of successful restore is made without a test.

---

## Task 8.6 — Production Health Verification

Status:

```text
[ ]
```

Scope:

Verify:

- Web health
- API health
- Database health
- Login
- Public appointment request
- Admin appointment visibility
- Cancellation and rescheduling
- Double-booking protection
- Direct route refresh

Acceptance criteria:

- Checks are documented.
- Failed checks are not hidden.
- Test records are removed or clearly labeled.

---

## Task 8.7 — Final Placeholder Audit

Status:

```text
[ ]
```

Scope:

Search for:

- Placeholder text
- Mock alerts
- Console logs
- Fake clinic data
- Empty legal text
- `href="#"`
- Unused assets
- TODO comments
- Example credentials
- Hardcoded localhost URLs

Acceptance criteria:

- Production-facing placeholders are removed.
- Remaining development TODOs are documented.
- No example credential is active in production.

---

# Deferred Features

These features are intentionally deferred until after the MVP is stable.

```text
[~] Automated email confirmation
[~] SMS reminders
[~] WhatsApp Business API
[~] Multiple languages
[~] Multiple admin roles with detailed permissions
[~] Multiple doctors
[~] Online payments
[~] Patient accounts
[~] Medical document uploads
[~] Appointment analytics
[~] CMS
[~] Cloud media storage
[~] Video consultations
```

Deferred features must not be implemented incidentally during MVP work.

---

# Recommended Implementation Order

Use this order unless a blocker requires a documented change:

```text
Phase 0
Phase 1
Phase 2
Phase 3
Phase 4
Phase 5
Phase 6
Phase 7
Phase 8
```

Admin appointment management is implemented before the public booking flow so public requests have a usable destination.

---

# Recommended Claude Code Prompt Format

Use one task per prompt.

Example:

```text
Read CLAUDE.md, docs/PRODUCT.md, docs/ARCHITECTURE.md, and docs/ROADMAP.md.

Implement only Task 1.2 — Create API Skeleton.

Do not start any other roadmap task.
Do not add appointment routes, authentication, migrations, or database tables yet.
The host computer does not have Node.js or npm, so all verification must use Docker.

At the end, report:
1. Files changed
2. Behavior implemented
3. Commands and checks run
4. Checks not run
5. Remaining limitations
```

For a bug fix:

```text
Read the project documentation first.

Fix only the described bug.
Do not perform unrelated refactoring.
Use targeted verification.
Do not mark a roadmap task complete unless all of its acceptance criteria are satisfied.
```

For a review:

```text
Review the implementation of Task X.Y against its acceptance criteria.

Do not change code yet.
List:
- Missing requirements
- Incorrect behavior
- Security concerns
- Unnecessary complexity
- Recommended smallest fixes
```

---

# Progress Summary

Current known state:

```text
Frontend prototype exists (apps/web).
React and Vite are configured.
Public routes exist for several clinic pages.
Appointment links exist.
The real /randevu route is missing.
Contact form is mock-only.
Admin panel does not exist.
Minimal API skeleton exists (apps/api) with GET /api/health only.
PostgreSQL runs via Docker Compose with a named volume; no tables or migrations exist yet.
Docker Compose runs web, api, and db for local development (docker compose up --build).
Authentication does not exist.
```

Update this summary only when a phase produces a meaningful change in the overall project state.
