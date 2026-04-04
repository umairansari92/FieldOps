# System Architecture & Design Document

## 1. System Design Overview
The FieldOps platform follows a classic REST-ful Client-Server architecture utilizing the **MERN** stack (MongoDB, Express, React, Node.js). 

The system relies on strong separation of concerns:
*   **The Client (React)** is responsible only for UI rendering, local state management, and API communication, while all critical business logic resides on the backend.
*   **The Server (Node/Express)** acts as the sole source of truth. It validates roles via middleware, executes business logic, manages data persistence, and logs activity.
*   **The Database (MongoDB)** stores documents.

## 2. Tech Stack Justification

| Layer | Chosen Technology | Explicit Justification |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | Chosen for its component-based architecture. For an internal tool with complex, repeating UI patterns (Job Cards, Status Badges, Timelines), React's state management and component reusability is significantly faster to develop with than vanilla JS. Vite provides instantaneous HMR. |
| **Styling** | Vanilla CSS (Variables) | Standardizing via CSS classes and variables rather than heavy frameworks (MUI/Tailwind) keeps the build size minimal and demonstrates fundamental styling competency. |
| **Backend** | Node.js + Express | Event-driven, non-blocking I/O is perfect for applications focused on I/O operations (fetching jobs, logging statuses) rather than heavy CPU computation. Express provides minimal and flexible routing. |
| **Database** | MongoDB + Mongoose | Selected over SQL due to the flexibility required for the "Jobs" entity. A job's metadata (location, requirements, client details) and its "Activity Timeline" can scale naturally in nested structures or document references without rigid schema migrations during early iterative development. |
| **Auth** | JSON Web Tokens (JWT) | Stateless authentication strategy that scales perfectly for REST APIs. Prevents database lookups on every request just to verify session state. The token carries the user's `role`, enabling instant frontend rendering decisions. |

## 3. Database Design Rationale

### Entity Relationship & Schema Logic
1.  **Users** (`name`, `email`, `password`, `role`, `isActive`, `fields`): Central auth entity. Rather than having separate tables for Technicians, Clients, and Admins, they are unified under `Users` with a `role` enum. The `fields` array stores professional specializations for technicians (e.g., HVAC, Electrical). This simplifies authentication middleware significantly.
2.  **Jobs (One-to-Many Focus):** The system relies on a **One-to-Many** relationship (One Client can have Many Jobs, One Technician can have Many Jobs). We use Mongoose references (`ObjectId`) pointing back to the `User` collection. This prevents data duplication and keeps the Job documents lean.
3.  **ActivityLog (Audit Trail)**: *Crucial for Data Integrity.* Instead of just keeping a nested array of notes inside the Job document, a dedicated collection is used. This prevents the Job document from exceeding BSON size limits over years of updates, and allows for global audit-log queries.
4.  **Notifications (Task Carriers)**: Standalone collection for communication. Each notification tracks the `recipient`, a `sender` (the actor who triggered the event), and an optional `job` reference. This enables the frontend to render "Action Cards" where admins can approve technicians or view job details directly from the notification bell.

### Data Integrity & Future Growth
* **Soft Deletes Strategy:** High-maturity data systems rarely use `DELETE` operations. Instead, data integrity is maintained using "Soft Deletes" (e.g., setting a `status` to `CANCELLED` or an `isActive` flag on Users). This ensures historical records are permanently preserved "even if something goes wrong".
* **Example Failure Handling:** If a technician attempts to update a job they do not own, the API returns a `403 Forbidden` response, ensuring strict access control and data integrity even during failure scenarios.
* **Modular Separation:** The backend is deeply decoupled (Routes ➝ Controllers ➝ Models). This explicit separation of concerns guarantees that handling future business expansions (like adding a `Payments` or `Invoicing` module) will simply require a new Controller/Model pair without rewriting core routing logic.

### Indexing Thoughts
To handle massive growth, indexes were placed on frequently queried fields:
*   `Job`: Compound indices on `{ client: 1, status: 1 }` and `{ technician: 1, status: 1 }` since Dashboards continually fetch "My Jobs filtered by Status" to keep search queries ultra-fast.
*   `User`: Unique index on `email`.
*   `Notification`: Compound index on `{ recipient: 1, read: 1 }` for rapid badge counting.
## 4. Auth & Security Strategy
Tokens are generated via `jsonwebtoken` and expire after 7 days. This stateless authentication is suitable for Admin, Tech, and Client roles.

*   **Hashing:** Passwords are never stored in plain text. They are hashed using **`bcrypt`** (12 salt rounds) before hitting the disk.
*   **Registration Flow (Approval-Based):** 
    *   **Admins:** Strictly blocked from public registration. Only one initial admin is seeded; further admin creation is handled via internal database access to prevent unauthorized escalations.
    *   **Technicians:** Can register publicly but remain in an `isActive: false` state. They are prohibited from logging in until an **Admin** reviews their registration and approves them via the Team Management portal.
    *   **Clients:** Open registration; accounts are active immediately to ensure a low-friction service request experience.

The backend utilizes standard Express Request Middleware:
1.  `auth.middleware.js`: Mounts the user object onto `req.user` if the JWT is valid.
2.  `role.middleware.js`: Higher-order function that restricts access. (e.g., `role('ADMIN', 'TECHNICIAN')` returns `403 Forbidden` if a Client tries to hit an internal endpoint).
## 5. Deliberate Omissions (What I Chose NOT to Build)

### Backend-For-Frontend (BFF) Layer
> A Backend-for-Frontend layer could be introduced for better separation of concerns and optimized client-server communication, but it was intentionally not implemented due to time constraints and project scope.

Instead, the frontend optimization is handled via logical API hooks and the backend uses efficient REST endpoints.

### In-App Notification Center
I explicitly chose **not to build an automated email notification system (e.g., Nodemailer / SendGrid)**. 
**Why?** The requirements stated the system must "run locally without paid services." Instead, I built a robust **Actionable Notification System**:
- **Task Carriers:** Notifications are not just text; they carry context (e.g., `sender`, `jobId`).
- **Quick Action UI:** Clicking a notification opens an "Action Card" (Modal) allowing Admins to approve technicians or jump to job details without navigating away from their current view.
- **Auto-Read Logic:** To ensure UX fluidity, notifications are marked as read the moment they are interacted with, reducing dashboard clutter.

## 6. Core Workflows (Visualized)

### Job Lifecycle State Machine

```txt
[ CLIENT / ADMIN ] 
       │ (Creates Request)
       ▼
   PENDING
       │
       ├────────────────┐ (No available tech)
       │                ▼
       │             CANCELLED
    [ADMIN]
   (Assigns)
       │
       ▼
   ASSIGNED
       │
    [TECH]
   (Accepts)
       │
       ▼
  IN_PROGRESS ────────┐ (Issue Occurs)
       │              ▼
       │           BLOCKED
    [TECH]            │ (Issue Resolved)
 (Marks Done)         │
       │  ◀───────────┘
       ▼
    COMPLETED

### Technician Onboarding Flow
```txt
 [ TECHNICIAN ] 
        │ (Public Registration)
        ▼
   PENDING APPROVAL (isActive: false)
        │
   [ ADMIN NOTIFIED ]
        │
   [ ADMIN REVIEWS ] ──┐ (Rejection/Deactivation)
        │              ▼
   (Approves)       INACTIVE
        │
        ▼
     ACTIVE (Can Log In)
```

## 7. Role Permissions Matrix

| Action / Capability | Admin | Technician | Client |
| :--- | :---: | :---: | :---: |
| **Create New Job** | ✅ | ❌ | ✅ |
| **Assign Technician** | ✅ | ❌ | ❌ |
| **Reassign / Cancel Job** | ✅ | ❌ | ❌ |
| **Update Status** | ✅ | ✅ (If Assigned) | ❌ |
| **Add Job Notes** | ✅ | ✅ (If Assigned) | ❌ |
| **Approve Technicians**| ✅ | ❌ | ❌ |
| **View Team Dashboard**| ✅ | ❌ | ❌ |
| **View Internal Audit Logs**| ✅ | ✅ (Own Jobs) | ❌ |
| **View Job Status** | ✅ | ✅ (Own Jobs) | ✅ (Own Requests)|

## 8. API Design Sample

The API follows strict standard RESTful conventions using plural nouns and HTTP semantics.

**`PATCH /api/jobs/:id/status`**
- **Purpose:** Updates the state of the job.
- **Middleware:** `auth()`, `role('ADMIN', 'TECHNICIAN')`
- **Controller Logic:** Validates that the Technician executing the request actually owns the Job. Converts the new status, throws `400 Bad Request` on invalid state transitions.
- **Side Effects:** Automatically generates an `ActivityLog` document linking the `actorId` to the status transition.

**`PATCH /api/users/:id/status`**
- **Purpose:** Admin-only endpoint to toggle the `isActive` flag.
- **Business Rule:** Used to approve technicians. Once `isActive` is true, the user is notified (via the next login attempt success) and can access the platform.

---

## 9. Assumptions

Due to incomplete requirements, the following decisions were made:

- Admin is responsible for assigning technicians manually
- Technicians must accept jobs before starting work
- Clients have read-only access to their jobs
- No automatic technician matching system is implemented

---

## 10. Trade-offs

- Monolithic architecture used instead of microservices for simplicity
- No real-time updates (e.g., WebSockets) implemented
- Notifications simplified (no email or queue system)
- Focus placed on core job flow instead of advanced features

---

## 11. What Was Not Implemented

The following features were intentionally not included:

- Auto-assignment of technicians
- Real-time event queues
- Background job queues
- Advanced fine-grained sub-permissions
- Formal email integration

These were excluded to maintain focus on core functionality within the given time constraints.

---

## 12. Future Improvements

- Real-time updates using WebSockets
- Notification system (email format)
- Advanced role permissions
- Pagination and filtering for large datasets
- Docker setup for easier deployment

---

## 13. Conclusion

This system was designed with a **"clarity over complexity"** approach, prioritizing maintainability and explicit business logic over premature optimization. The architecture prioritizes clarity, simplicity, and maintainability while fulfilling the core requirements of a field service management system. The design ensures scalability for future enhancements while keeping the current implementation practical and efficient.
