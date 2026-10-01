# Attendance & Participation System

A verified attendance and participation tracking system designed to reduce manual attendance errors, disputes, unauthorized changes, and administrative work.

The system provides role-based access for administrators, instructors, and students. Attendance is recorded through instructor-created sessions and verified by students using time-limited session codes.

---

## 1. Problem Statement

Traditional attendance systems often depend on manual registers, spreadsheets, or loosely controlled digital records.

This can result in:

- Incorrect attendance records
- Manual data-entry errors
- Attendance disputes
- Unauthorized modifications
- Difficulty tracking attendance history
- Additional administrative work
- Lack of a clear source of truth

The goal of this project is to provide a centralized and verified attendance workflow where attendance records are created through controlled sessions and can be audited when corrections are required.

---

## 2. Proposed Solution

The system introduces a role-based attendance platform with three primary roles:

- **Admin**
- **Instructor**
- **Student**

An instructor creates an attendance session for a course. The session generates a verification code that students use to mark their attendance.

The system verifies:

1. The user is authenticated.
2. The user belongs to the correct organization.
3. The student is enrolled in the course.
4. The attendance session is valid.
5. The verification code is correct.
6. The student has not already marked attendance for that session.

Attendance corrections are handled through a dispute workflow and recorded in an audit log.

---

## 3. Key Features

### Authentication

- Clerk-based authentication
- Sign-in and sign-up
- Protected application routes
- User identity synchronization with the application database

### Role-Based Access Control

The system supports:

- `ADMIN`
- `INSTRUCTOR`
- `STUDENT`

Access to application operations is controlled according to the user's role and account status.

### Admin Organization Management

Each administrator represents an independent organization.

An organization has a unique administrator-generated organization code.

Users can join an organization using the appropriate organization code.

This prevents users belonging to one organization from accessing courses, sessions, or attendance records belonging to another organization.

### Course Management

Administrators can:

- Create courses
- Assign instructors
- View course information
- Manage course-related access

### Student Enrollment

Students can enroll in courses belonging to their organization.

Enrollment is stored in the database and is checked before attendance can be recorded.

### Attendance Sessions

Instructors can create attendance sessions for their courses.

Each session contains:

- Course
- Instructor
- Start time
- End time
- Verification code hash
- Code expiration time
- Session status

The actual verification code is not stored directly in the database.

### Attendance Verification

Students verify attendance by entering the session code.

The system checks:

- Authentication
- Organization membership
- Course enrollment
- Session validity
- Code validity
- Code expiration
- Existing attendance records

A student can only have one attendance record for a particular session.

### Attendance History

Students can view their previous attendance records, including:

- Course
- Course code
- Verification time
- Verification method

### Attendance Disputes

Students can raise attendance disputes when their attendance record requires correction.

Instructors can review disputes and apply appropriate corrections.

### Audit Logging

Important attendance corrections are recorded in an audit log.

The audit record stores:

- Actor
- Action
- Entity type
- Entity ID
- Metadata
- Timestamp

This provides a traceable record of attendance modifications.

---

## 4. User Roles

### Admin

The administrator manages the organization and its users.

Responsibilities include:

- Managing organization access
- Managing courses
- Assigning instructors
- Managing student enrollment
- Verifying users
- Viewing organization-level information

### Instructor

The instructor manages attendance sessions for assigned courses.

Responsibilities include:

- Viewing assigned courses
- Creating attendance sessions
- Reviewing attendance
- Handling attendance disputes
- Applying attendance corrections where appropriate

### Student

Students can:

- Join their organization
- Enroll in courses
- View active attendance sessions
- Submit attendance verification codes
- View attendance history
- Raise attendance disputes

---

## 5. Attendance Verification Flow

```text
Instructor
    |
    v
Select Course
    |
    v
Create Attendance Session
    |
    v
Generate Verification Code
    |
    v
Student Opens Attendance Page
    |
    v
Student Enters Code
    |
    v
System Validates
    |
    +--> Authentication
    |
    +--> Organization Membership
    |
    +--> Course Enrollment
    |
    +--> Session Status
    |
    +--> Code Validity
    |
    +--> Code Expiration
    |
    +--> Duplicate Attendance
    |
    v
Attendance Record Created
    |
    v
Attendance History Updated