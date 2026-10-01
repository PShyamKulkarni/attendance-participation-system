# Attendance & Participation System

A verified attendance and participation tracking system designed to reduce manual attendance errors, disputes, unauthorized changes, and administrative work.

## Problem

Traditional attendance systems often depend on manual recording by instructors. This can result in:

- Incorrect attendance records
- Student disputes
- Accidental or unauthorized changes
- Additional administrative work
- Lack of a reliable audit trail
- Difficulty establishing a trustworthy source of truth

This project treats attendance as a verifiable and auditable event rather than simply a manually editable present/absent value.

## Proposed Solution

The system provides role-based attendance management for administrators, instructors, and students.

An administrator manages an organization and provides a unique organization code. Students and instructors must belong to the same organization before they can participate in that organization's courses and attendance workflow.

Instructors create time-limited attendance sessions for their courses. Each session generates a temporary six-digit verification code.

Students who are enrolled in the course can verify their attendance while the session is active by submitting the session code.

The server validates:

- Authentication
- Application account status
- User role
- Organization membership
- Course ownership
- Student enrollment
- Session status and time window
- Verification-code format and expiration
- Duplicate attendance attempts

Successful attendance is stored with a timestamp and verification method.

If an attendance record is disputed, the instructor can review the dispute. Approved corrections are recorded as separate audit events instead of silently overwriting the original history.

## Core Workflow

1. An administrator manages an organization.
2. The administrator has a unique organization access code.
3. Students and instructors join the organization using the organization code.
4. The administrator creates courses and assigns verified instructors.
5. Students are enrolled in courses.
6. An instructor creates an attendance session.
7. The system generates a temporary six-digit verification code.
8. The student submits the code during the active session.
9. The server verifies organization membership, enrollment, session validity, and code validity.
10. A timestamped attendance record is created.
11. Students can review their attendance history.
12. Students can raise attendance disputes.
13. Instructors can review disputes.
14. Approved corrections are recorded in the audit history.

## Key Design Principle

> Attendance is treated as a verifiable event rather than simply a manually editable present/absent value.

The system therefore preserves evidence of verification and subsequent corrections through audit logging.

## Roles

### Administrator

Administrators can:

- Manage users
- Verify users
- Manage courses
- Assign instructors
- Manage organization membership
- View organization-level information

### Instructor

Instructors can:

- View assigned courses
- Create attendance sessions
- Generate temporary session verification codes
- Review attendance-related disputes
- Approve or reject disputes
- Perform authorized attendance corrections

### Student

Students can:

- Join an administrator's organization
- View enrolled courses
- View active attendance sessions
- Submit session verification codes
- View attendance history
- Raise attendance disputes

## Organization Access Control

Each administrator has a unique organization code.

The system stores the organization code as a SHA-256 hash rather than storing the plaintext code in the database.

Students and instructors are associated with an administrator organization.

Organization membership is enforced at important application boundaries:

- Course creation
- Course enrollment
- Attendance-session creation
- Attendance verification

This prevents users from one organization from accessing or participating in another organization's attendance workflow.

## Attendance Verification

Attendance sessions have:

- A start time
- An end time
- A temporary six-digit verification code
- A code expiration time
- An active/ended/cancelled status

The verification code is never stored directly. Its SHA-256 hash is stored instead.

A successful attendance verification records:

- Student
- Attendance session
- Verification timestamp
- Verification method

Duplicate attendance attempts are rejected and recorded in the audit trail.

## Audit Logging

Important security and attendance events are recorded in the audit log.

Examples include:

- User verification
- User suspension
- Attendance verification attempts
- Successful attendance verification
- Duplicate attendance attempts
- Attendance disputes
- Approved disputes
- Rejected disputes
- Attendance corrections

Corrections are recorded as audit events rather than silently replacing historical actions.

## Security Model

Clerk is used for authentication and identity management.

The application's PostgreSQL database stores application-specific:

- Roles
- Account status
- Organization membership
- Courses
- Enrollment
- Attendance sessions
- Attendance records
- Disputes
- Audit logs

The frontend is not treated as a security boundary.

Authorization and business-rule validation are performed on the server through protected API routes.

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Authentication

- Clerk

### Backend

- Next.js server-side API routes
- TypeScript

### Database

- PostgreSQL
- Prisma ORM
- Prisma PostgreSQL adapter

### Development and Version Control

- Node.js
- npm
- Git
- GitHub
- VS Code

## Project Structure

```text
attendance-participation-system/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── scripts/
│   ├── bootstrap-admin-code.ts
│   └── link-user-to-admin.ts
├── src/
│   └── app/
│       ├── api/
│       │   ├── admin/
│       │   ├── instructor/
│       │   ├── student/
│       │   └── organization/
│       ├── admin/
│       ├── instructor/
│       ├── student/
│       ├── organization/
│       ├── components/
│       ├── calendar/
│       ├── profile/
│       └── dashboard/
├── .env
├── .env.local
├── package.json
├── prisma7.config.ts
└── README.md