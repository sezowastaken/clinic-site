# PRODUCT.md

## Product Summary

This product is a website and lightweight appointment management system for a single-doctor aesthetic/plastic surgery clinic.

The product has three main goals:

1. Present the doctor and clinic in a modern, trustworthy, and premium way.
2. Allow visitors to submit appointment requests through a simple calendar flow.
3. Allow the clinic assistant to manage all appointments from one small admin panel.

The product is intentionally limited in scope.

It is not a hospital information system, electronic medical record system, or advanced CRM.

---

## Target Users

### Website Visitor

A visitor may be:

- A potential patient researching the doctor.
- A person comparing aesthetic surgery services.
- A person looking for clinic contact information.
- A person who wants to request an appointment.
- A person who wants to review the doctor’s background, services, results, or videos.

The visitor should be able to use the public website without creating an account.

### Clinic Assistant

The assistant is the primary admin user.

The assistant should be able to:

- Sign in securely.
- View daily and weekly appointments.
- View upcoming appointment requests.
- Create appointments manually.
- Record appointments received outside the website.
- Update appointment details.
- Change appointment date and time.
- Add internal notes.
- Update appointment status.
- Cancel or reject appointments.
- Mark appointments as completed or no-show.
- Block unavailable dates or time periods.

### Doctor

The doctor is not expected to use a separate complex interface in the first version.

The doctor may use the same admin account model if needed, but no doctor-specific workflow is required for the MVP.

---

## Product Areas

## 1. Public Clinic Website

The public website should communicate:

- Trust
- Professionalism
- Clinical quality
- Clear information
- A calm and premium visual identity
- Easy access to appointment and contact actions

The public website should include:

- Home page
- Doctor profile
- Clinic information
- Services overview
- Service detail pages
- Before and after results
- Videos
- Contact information
- Appointment request page
- KVKK and legal pages

The website should be responsive and usable on mobile devices.

---

## 2. Public Appointment Request Flow

The public appointment feature should remain simple.

The intended flow is:

1. The visitor opens the appointment page.
2. The visitor selects a service or consultation type.
3. The visitor selects a date.
4. The system shows available time slots.
5. The visitor selects a time.
6. The visitor enters contact information.
7. The visitor enters an optional note.
8. The visitor accepts the required KVKK consent.
9. The visitor submits the appointment request.
10. The system displays a success or error result.

A public appointment submission should create a request with the `pending` status.

The appointment should not become confirmed automatically.

The assistant should review and confirm the request.

---

## 3. Admin Appointment Management

The admin panel should be optimized for the clinic assistant.

It should prioritize speed, clarity, and easy daily use.

The admin area should include:

- Login screen
- Dashboard
- Daily calendar
- Weekly calendar
- Appointment list
- Appointment detail view
- Manual appointment creation
- Appointment editing
- Appointment status controls
- Internal notes
- Calendar blocking

The admin panel does not need complex analytics in the MVP.

---

## Appointment Sources

Appointments may come from different channels.

The system should support at least these sources:

```text
website
phone
whatsapp
email
instagram
referral
other
```

When the assistant creates an appointment manually, the source should be selectable.

Public appointment requests should use:

```text
website
```

---

## Appointment Statuses

The system should support the following statuses:

```text
pending
confirmed
completed
cancelled
rejected
no_show
```

### Pending

The visitor submitted a request, but the clinic has not confirmed it yet.

### Confirmed

The clinic reviewed and approved the appointment.

### Completed

The appointment took place.

### Cancelled

The appointment was cancelled after being created.

### Rejected

The clinic did not accept the appointment request.

### No Show

The appointment was confirmed, but the patient did not attend.

Do not introduce additional statuses unless a clear workflow requires them.

---

## Core Appointment Data

Each appointment should support:

- Patient name
- Phone number
- Optional email
- Service or consultation type
- Start date and time
- End date and time
- Appointment status
- Appointment source
- Optional note written by the visitor or patient
- Optional internal note written by the assistant
- Creation date
- Update date
- Creator information where relevant

The system should avoid collecting unnecessary medical data.

---

## Public Website Pages

## Home

The home page should include:

- Strong doctor and clinic introduction
- Primary appointment call to action
- Key services
- Doctor trust indicators
- Selected results or work
- Clinic approach
- Contact call to action

## About

The about page should include:

- Doctor biography
- Education
- Professional experience
- Verified memberships
- Verified certifications
- Clinical approach
- Doctor photo

Do not publish unverified qualifications or memberships.

## Services

The services page should include:

- Service categories
- Short service summaries
- Links to service detail pages
- Appointment call to action

## Service Detail

Each service detail page may include:

- Service summary
- Who it may be suitable for
- General process
- General recovery information
- Frequently asked questions
- Appointment call to action

Content must not guarantee outcomes.

## Results

The results page may include approved before-and-after images.

Requirements:

- Use only authorized media.
- Include an appropriate disclaimer.
- Do not imply identical results for every patient.
- Do not use fake patient results.

## Videos

The videos page may include:

- Doctor introduction videos
- Procedure information videos
- Clinic videos
- Educational content

## Contact

The contact page should include:

- Clinic phone
- Email
- Address
- Map
- Working hours
- Contact form or callback request
- Appointment call to action

## Appointment

The appointment page should include:

- Service selection
- Date selection
- Available time selection
- Contact information form
- Optional note
- Required consent
- Submission result

## KVKK and Legal Pages

The website should include:

- KVKK notice
- Explicit consent where legally required
- Cookie information if applicable
- Terms of use
- Medical disclaimer where appropriate

Legal text must be provided or reviewed by the clinic or a qualified legal professional.

---

## Admin Screens

## Admin Login

The assistant should sign in with:

- Email
- Password

The page should show clear errors for invalid credentials.

## Dashboard

The dashboard should show a simple daily summary:

- Today’s confirmed appointments
- Pending appointment requests
- Upcoming appointments
- Cancelled or changed appointments when relevant

Do not add large analytics dashboards in the MVP.

## Daily Calendar

The daily calendar should show:

- Appointment start and end times
- Patient name
- Service
- Status
- Source where useful
- Blocked time periods

## Weekly Calendar

The weekly calendar should show:

- Working days
- Appointment slots
- Confirmed appointments
- Pending requests
- Blocked times

The first version may use a simple custom calendar layout.

A large calendar library is not required unless it clearly reduces implementation complexity.

## Appointment List

The appointment list should support:

- Date filtering
- Status filtering
- Source filtering
- Patient name or phone search
- Sorting by date and time

## Appointment Detail

The assistant should be able to view:

- Patient contact information
- Service
- Date and time
- Status
- Source
- Patient note
- Internal note
- Creation and update information

## Manual Appointment Creation

The assistant should be able to create an appointment received from:

- Phone
- WhatsApp
- Email
- Instagram
- Referral
- Other external sources

The assistant should be able to select:

- Patient
- Contact information
- Service
- Date
- Time
- Status
- Source
- Notes

## Appointment Editing

The assistant should be able to:

- Change date and time
- Change service
- Change patient contact details
- Change status
- Add or update internal notes
- Cancel the appointment

## Calendar Blocking

The assistant should be able to block:

- A specific time range
- A full day
- Multiple hours
- Doctor leave
- Surgery time
- Meeting time
- Clinic closure
- Other unavailable periods

Blocked periods should not appear as available public appointment slots.

---

## Availability Rules

The public availability system should follow these rules:

- Only future times may be booked.
- Existing active appointments must block overlapping time slots.
- Calendar blocks must block overlapping time slots.
- Cancelled and rejected appointments should not block availability.
- The system must prevent double-booking.
- Availability must be calculated by the backend.
- The frontend must not be the only source of availability validation.

Working hours should be configurable.

The initial version may use fixed weekly working hours stored in configuration or the database.

---

## MVP Scope

The MVP includes:

### Public

- Responsive clinic website
- Doctor profile
- Services
- Service details
- Results
- Videos
- Contact
- Appointment request flow
- KVKK and legal pages

### Admin

- Secure login
- Daily and weekly appointment views
- Appointment list
- Appointment detail
- Manual appointment creation
- Appointment editing
- Status management
- Internal notes
- Calendar blocking

### Backend

- Appointment API
- Availability API
- Admin authentication
- PostgreSQL storage
- SQL migrations
- Docker Compose runtime

---

## Explicitly Out of Scope

The following features are not part of the first version:

- Online payments
- Patient user accounts
- Patient login
- Multiple doctors
- Multiple clinics or branches
- Electronic medical records
- Surgery planning
- Prescription management
- Laboratory results
- Imaging results
- File uploads for medical documents
- Insurance workflows
- SMS integration
- WhatsApp Business API
- Automated marketing email
- Complex CRM
- Sales pipeline
- Loyalty program
- Native iOS application
- Native Android application
- Multilingual content management system
- Advanced analytics
- Revenue reporting
- Staff scheduling
- Inventory management
- Video consultation
- AI diagnosis or medical recommendation

Do not implement out-of-scope features unless the product scope is explicitly updated.

---

## UX Principles

### Public Website

The public experience should feel:

- Modern
- Calm
- Professional
- Premium
- Trustworthy
- Easy to navigate

Avoid:

- Aggressive sales language
- Excessive animations
- Crowded layouts
- Cheap-looking gradients
- Overuse of cards
- Medical claims without evidence
- Guaranteed result language

### Admin Panel

The admin experience should feel:

- Fast
- Clear
- Practical
- Low-friction
- Easy to learn

Avoid:

- Decorative complexity
- Hidden actions
- Unnecessary confirmation steps
- Dense analytics
- Multiple screens for simple edits

---

## Content Principles

All clinic content must be factual.

Do not invent:

- Doctor credentials
- Education history
- Certificates
- Memberships
- Clinic address
- Contact details
- Patient testimonials
- Patient results
- Success rates
- Treatment guarantees

Medical service content should be informative but not diagnostic.

The website must not present the appointment form as emergency care.

---

## Privacy Principles

The system should collect only the information needed to manage appointments.

Public forms should not request detailed medical history in the MVP.

Patient information should not be:

- Logged to the browser console
- Included in public API responses
- Exposed to unauthenticated users
- Stored in frontend local storage
- Included in analytics tools without explicit review

Internal notes are private to authenticated admin users.

---

## Success Criteria

The product is successful when:

- Visitors can understand who the doctor is and what services are offered.
- Visitors can submit appointment requests without confusion.
- The assistant can see new appointment requests quickly.
- The assistant can manage all appointment sources in one calendar.
- The assistant can create external appointments manually.
- Double-booking is prevented.
- The interface works well on mobile and desktop.
- The project remains simple to operate through Docker Compose.
- The product does not expand into an unnecessary hospital management system.

---

## Future Considerations

Possible future additions may include:

- Email confirmation
- SMS reminders
- WhatsApp notification integration
- Multiple languages
- Simple appointment statistics
- Additional admin accounts
- Patient document upload
- Online consultation
- Payment integration

These are future options, not current requirements.

They should only be implemented after the MVP is stable and the clinic confirms a real need.
