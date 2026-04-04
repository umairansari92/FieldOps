# FieldOps – Architecture Document

## 1. System Overview

FieldOps is a simplified Field Service Management Platform designed to manage service jobs between clients, administrators, and field technicians.

The system revolves around a central **Job entity**, which represents a service request created by a client. Admins are responsible for assigning jobs to technicians, while technicians update job progress. Clients can view the status of their jobs.

This architecture focuses on simplicity, clarity, and maintainability while meeting the core requirements of the system.

---

## 2. High-Level System Design

```txt
Client / Admin / Technician
↓
Frontend (React - Role-Based UI)
↓
Backend API (Node.js + Express)
↓
Service Layer (Business Logic)
↓
Database (MongoDB)
```

### Flow Explanation

- Users interact with the frontend based on their roles
- Frontend communicates with backend via REST APIs
- Backend processes business logic (job assignment, updates, validation)
- Data is stored and retrieved from MongoDB

---

## 3. Core Components

### Frontend (React)

- Role-based dashboards (Admin, Technician, Client)
- Job listing and filtering UI
- Job creation and assignment interface (Admin)
- Status update and notes system (Technician)

### Backend (Node.js + Express)

- RESTful API for job and user management
- Role-based authorization middleware
- Centralized error handling
- Business logic for job lifecycle and assignment

### Service Layer

- Handles core logic such as:
  - Job assignment
  - Status transitions
  - Notes handling
  - Validation rules

---

## 4. Technology Stack (with Justification)

### Frontend: React

React was chosen for its component-based architecture, enabling reusable UI components and efficient state management for dynamic dashboards.

### Backend: Node.js + Express

Node.js was selected due to its non-blocking, event-driven architecture, making it suitable for handling multiple concurrent job updates and API requests efficiently.

### Database: MongoDB

MongoDB was chosen for its flexible schema, which is ideal for handling dynamic job notes and evolving data structures without strict schema constraints.

---

## 5. Database Design

### Collections

#### Users
- id
- name
- email
- password
- role (Admin, Technician, Client)

#### Jobs
- id
- title
- description
- status
- clientId
- technicianId
- scheduledAt
- createdAt

#### Notes / ActivityLog
- id
- jobId
- technicianId
- content
- createdAt

---

### Relationships

- One Client → Many Jobs
- One Technician → Many Jobs
- One Job → Many Notes

---

### Indexing Strategy

To improve performance:

- Index on `status` for filtering jobs
- Index on `technicianId` for technician dashboards
- Index on `clientId` for client job views

---

## 6. Job Lifecycle

The system follows a defined job lifecycle:

- `pending` → Job created by client
- `assigned` → Admin assigns technician
- `in_progress` → Technician accepts and starts work
- `blocked` → Issue encountered during job
- `completed` → Job successfully completed
- `cancelled` → Job cancelled

This lifecycle ensures clear tracking of job progress.

---

## 7. Role-Based Access Control (RBAC)

| Role       | Permissions |
|------------|------------|
| Admin      | Create jobs, assign/reassign technicians, view all jobs |
| Technician | View assigned jobs, update status, add notes |
| Client     | View their own jobs only |

Authorization is enforced using middleware at the backend level.

---

## 8. Authentication Strategy

- JWT-based authentication is used
- Tokens are issued upon login
- JWT payload includes `userId` and `role`
- Role-based access is enforced using middleware

This ensures secure and scalable authentication for all user types.

---

## 9. Data Integrity & Failure Handling

To handle system failures and ensure data integrity:

- Mongoose schema validation prevents invalid data
- Centralized error handling middleware ensures consistent API responses
- Jobs and related data are not hard-deleted to preserve history (Soft Deletes)
- Failures (e.g., API crash) are handled gracefully with error responses

---

## 10. Assumptions

Due to incomplete requirements, the following decisions were made:

- Admin is responsible for assigning technicians manually
- Technicians must accept jobs before starting work
- Clients have read-only access to their jobs
- No automatic technician matching system is implemented

---

## 11. Trade-offs

- Monolithic architecture used instead of microservices for simplicity
- No real-time updates (e.g., WebSockets) implemented
- Notifications simplified (no email or queue system)
- Focus placed on core job flow instead of advanced features

---

## 12. What Was Not Implemented

The following features were intentionally not included:

- Auto-assignment of technicians
- Real-time event queues
- Background job queues
- Advanced fine-grained sub-permissions
- Formal email integration

These were excluded to maintain focus on core functionality within the given time constraints.

---

## 13. Future Improvements

- Real-time updates using WebSockets
- Notification system (email)
- Advanced role permissions
- Pagination and filtering for large datasets
- Docker setup for easier deployment

---

## 14. Architectural Decisions

A Backend-for-Frontend (BFF) layer could be introduced in the future to optimize communication between frontend and backend. However, it was not implemented to keep the system simple and focused for this assignment.

---

## 15. Conclusion

This architecture prioritizes clarity, simplicity, and maintainability while fulfilling the core requirements of a field service management system. The design ensures scalability for future enhancements while keeping the current implementation practical and efficient.
