# FieldOps - Field Service Management Platform

A simplified Field Service Management Platform built for administering field technicians, tracking jobs, and providing client visibility.

## 🚀 Quick Setup Instructions

Make sure you have Node.js and MongoDB installed and running locally.

### 1. Database Setup
Ensure your local MongoDB instance is running on `mongodb://localhost:27017`.

### 2. Backend Setup
```bash
cd Server
npm install
# The .env file is already provided, but you can copy .env.example
npm run seed  # This will wipe the DB and create 5 demo users and 4 demo jobs
npm run dev   # Starts the server on http://localhost:5000
```

### 3. Frontend Setup
```bash
# In a new terminal
cd Client
npm install
npm run dev   # Starts the React app on http://localhost:5173
```

### 4. Demo Accounts
The `npm run seed` command provisions the following roles (password is all lowercase `name123`):
*   **Admin**: `admin@fieldops.com` / `admin123`
*   **Technician**: `john@fieldops.com` / `john123`
*   **Client**: `acme@client.com` / `acme123`

---

## 🏗️ Architecture & Decisions

For detailed design choices, database schema, and ERD logic, please check the [Architecture Document](./docs/ARCHITECTURE.md).

### General Assumptions Made
1.  **Job Workflow**: I assumed a rigid, professional flow. Clients cannot assign technicians; they can only request work (Client role creates an implicit pending job—though for this demo, only admins create jobs). Admins create jobs and assign them. Technicians can only change the status of jobs they have been explicitly assigned.
2.  **Notification Strategy**: Real-time push notifications or emails require third-party services (SendGrid/WebSockets) which violates the "local only" constraint or takes too much time. I opted for a highly functional in-app polling notification bell that queries a `Notification` collection.
3.  **Authentication**: I assumed a standard stateless JWT approach is sufficient. The token handles roles natively on the frontend via Context API.

### Trade-offs
*   **Image Uploads**: Field technicians usually upload photos of their completed work. I omitted file uploads (AWS S3 / GridFS) to keep the backend lean and focus strictly on the status lifecycle.
*   **Real-time WebSockets**: I used short-polling (30 seconds) for the notification bell. In a production MERN app, I would use `socket.io` for instant updates without HTTP overhead, but Polling was chosen here for rapid development and guaranteed local stability without extra port configuration.
*   **No Redux**: Used standard React Context for Auth state. For a larger app with complex caching, I would introduce Redux Toolkit or React Query.

### What's Missing?
*   **User Management UI**: The API supports activating/deactivating accounts, but the Frontend UI for this was skipped to prioritize the core "Job Flow" quality.
*   **Forgot Password flow**: Omitted entirely to focus on core domain.
*   **Technician Declines**: Currently, a technician is assigned dictatorial style. A feature allowing a tech to "Decline" a job back to the pool is missing.

---

## 🏆 Bonus Tasks Implemented

*   ✅ **Audit Log**: The `ActivityLog` model meticulously records who changed what and when. This is visible in the Job Details timeline.
*   ✅ **Fine-grained RBAC**: Beyond simple routes, the backend verifies if a Technician *actually owns* the job before allowing a status update.
