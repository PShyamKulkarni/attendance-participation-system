# Attendance & Participation System

verified attendance and participation tracking system designed to reduce manual attendance errors, disputes, and administrative work.

## Problem

Traditional attendance systems often depend on manual recording by instructors. This can result in:

- Incorrect attendance records
- Student disputes
- Accidental changes
- Additional administrative work
- Lack of a reliable audit trail

This project aims to create a stronger source of truth for attendance by recording participation as a verifiable and auditable event.

## Proposed Solution

The system allows an instructor to create a time-limited attendance session.

Students can verify their participation during the active session using a session-specific verification mechanism.

The system validates the request and records the attendance event along with its timestamp.

If an attendance record is disputed, the instructor can review the dispute. Corrections are recorded as separate auditable actions rather than silently overwriting the original record.

## Core Workflow

1. Instructor creates an attendance session.
2. The system creates a temporary verification mechanism.
3. Students verify their participation.
4. The system validates the verification request.
5. A timestamped attendance record is created.
6. Attendance history can be reviewed.
7. Students can raise disputes when necessary.
8. Instructor-approved corrections are recorded in the audit history.

## Key Design Principle

Attendance is treated as a verifiable event rather than simply a manually editable present/absent value.

## Scope

The initial system will focus on:

- Student and instructor roles
- Courses and enrollment
- Attendance sessions
- Student attendance verification
- Attendance records
- Attendance history
- Attendance disputes
- Instructor review and corrections
- Audit logging

## Out of Scope

The initial version will not include:

- Facial recognition
- GPS tracking
- Biometric identification
- Blockchain
- Predictive attendance
- Native mobile applications
- Complex analytics

These features are intentionally excluded so that the core attendance verification and audit workflow remains the primary focus.

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Git and GitHub

## Project Status

Currently in development.

## Assumptions

To be documented as the system is designed and implemented.

## Setup

Setup instructions will be documented after the development environment and database configuration are finalized.

## Testing

Test instructions and test cases will be documented as the system is implemented.

## Deployment

Production deployment instructions and the live application URL will be added before submission.

## Submission

Final submission will use the Git tag:

`submission-v1`