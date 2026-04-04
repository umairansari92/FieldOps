# FieldOps - Field Service Management Platform

A robust, MERN-stack Field Service Management Platform designed for administering field technicians, tracking complex job lifecycles, and providing client visibility.

---

## 🚀 Quick Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on default port (27017)

### 1. Database Setup
Ensure your local MongoDB instance is running:
`mongodb://localhost:27017`

### 2. Backend Setup
Navigate to the server directory and set up the environment:
```bash
cd Server
npm install
```
*(The `.env` file is already configured, but for production you should duplicate `.env.example`)*

**Seed the Database (Required for Demo):**
This command will wipe the existing database and provision demo users, realistic jobs, and activity logs.
```bash
npm run seed
```

**Start the Server:**
```bash
npm run dev
# Starts the server on http://localhost:5000
```

### 3. Frontend Setup
Navigate to the client directory in a new terminal window:
```bash
cd Client
npm install
npm run dev
# Starts Vite on http://localhost:5173
```

---

## 🔐 Demo Accounts

The `npm run seed` command provisions the following roles. All passwords are set to `[name]123`:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@fieldops.com` | `admin123` |
| **Technician 1** | `john@fieldops.com` | `john123` |
| **Client 1** | `acme@client.com` | `acme123` |

---

## 🛠️ Architecture Overview

The system strictly adheres to a standard client-server RESTful architecture:
**React (Vite) ➝ Express REST API ➝ MongoDB**

For deep, component-level architectural decisions, tech stack justification, and ERD logic, please refer to the detailed [Architecture Document](./docs/ARCHITECTURE.md).

---

## 🧠 Assumptions & Design Decisions

Because field service workflows vary greatly across companies, the following strict boundaries were established to maintain scope:

1. **Job Workflow (Admin-Centric):** 
   Clients have the ability to *create* service requests (defaulting to a `PENDING` state), but they cannot assign technicians. Only Admins can assign existing technicians based on availability and skills.
2. **Technician Accountability Flow:** 
   When an admin assigns a technician, the job status moves to `ASSIGNED`. The technician must explicitly click "Accept" in their dashboard (moving status to `ACCEPTED`) before work begins (`IN_PROGRESS`). If rejected, the job returns to `PENDING` for reassignment.
3. **Issue Reporting (Blocked State):**
   Technicians facing on-site issues (e.g., missing parts, client absent) can mark an `IN_PROGRESS` job as `BLOCKED`.
4. **Data Integrity (Audit Logging):** 
   Rather than simple nested arrays inside the `Job` document, an isolated `ActivityLog` collection acts as an immutable audit trail. This ensures historical consistency regardless of human error or document scaling issues.

---

## ⚠️ Trade-offs

*   **Real-time Push Notifications vs. Short-Polling:**
    Implementing WebSockets (`socket.io`) or external providers like Twilio for real-time pushing was avoided to reduce reliance on third-party services and complex port routing for a local test assignment. Instead, a lightweight short-polling HTTP mechanism drives the Notification Bell, keeping the app 100% locally independent.
*   **Backend-for-Frontend (BFF) Omission:**
    A dedicated BFF API gateway could have been introduced to optimize client-server data orchestration. However, to prioritize clean code, readability, and the 6-10 hour time constraint, a standard Express REST API was favored over an overly complex microservice layer.

---

## 🚧 Missing Features (Out of Scope scope)

*   **File Uploads:** Field service often mandates photo proof for completed jobs. Integration with AWS S3 / GridFS was omitted to focus exclusively on solidifying the backend state machine.
*   **Auto-Assignment Logic:** Having the system automatically dispatch technicians based on geolocation and `skills` tag matching is an enterprise feature. Due to time constraints, assignment requires manual Admin intervention.
*   **"Forgot Password" Email Flow:** Standard auth recovery flows requiring SMTP emulation were bypassed to maintain strict focus on the core "Field Service" domain.
