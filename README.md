# Project Overview

This project consists of a React frontend and a Node/Express backend with a MySQL database. It now includes role-based access control (RBAC), an Admin sidebar layout, an Officer workspace, and transcript viewing via modals.

## What Was Added

- Admin Panel with left sidebar showing logged-in admin name and navigation:
  - Add User
  - View Users
  - Add Transcript
  - View Transcripts
- Officer Page with enhanced transcript list (search, date filters, sorting)
- Dashboard transcript list with search and a modal viewer
- JWT-based authentication and authorization on the backend
  - All protected API routes now require `Authorization: Bearer <token>`
  - Admin-only routes guard user management and cross-user transcript access

## Tech Stack
- Frontend: React (react-router), Axios, Bootstrap, React-Bootstrap (Modal)
- Backend: Node.js, Express, MySQL (mysql2), jsonwebtoken

## Running Locally

1. Backend
   - Create a `.env` in `backend/` with your DB credentials and JWT secret:
     ```
     DB_HOST=localhost
     DB_USER=your_mysql_user
     DB_PASS=your_mysql_password
     DB_NAME=your_db_name
     PORT=5000
     JWT_SECRET=change_me_to_a_strong_secret
     ```
   - Install and start:
     ```bash
     cd backend
     npm install
     npm run dev # or: npm start
     ```

2. Frontend
   - Create a `.env` in `frontend/` (optional if using defaults):
     ```
     REACT_APP_API_BASE_URL=http://localhost:5000
     ```
   - Install and start:
     ```bash
     cd frontend
     npm install
     npm start
     ```

## Roles and Permissions

- Admin
  - Can add, view, and delete users
  - Can add transcripts for any user
  - Can view transcripts for any user
- Officer
  - Can only view their own transcripts
- Deaf/User
  - Can only view their own transcripts

The UI enforces these constraints and the backend verifies them.

## Endpoints (Summary)

- Auth
  - `POST /login` → `{ token, user: { id, name, role } }`
  - `GET /me` (auth) → `{ user }`
- Transcripts
  - `POST /transcripts` (auth) → save for self; admins may pass `userId` to save for others
  - `POST /admin/transcripts` (admin) → save for specified `userId`
  - `GET /transcripts/:userId` (auth) → self-only; admin can access any
- Users (admin)
  - `GET /admin/users`
  - `POST /admin/users`
  - `DELETE /admin/users/:id`

## Frontend Navigation

- Login stores token, `userId`, `role`, and `name` in `localStorage`
- Redirects:
  - Admin → `/admin`
  - Officer → `/officer`
  - Others → `/dashboard`

## Transcript Modal

- Reusable component at `src/components/TranscriptModal.js`
- Used on Dashboard, Officer page, and inside Admin pages

## Notes

- Ensure the database has `users` and `transcripts` tables. Expected fields:
  - `users(id, name, username, password, role)`
  - `transcripts(id, userId, content, createdAt)`
- For production, use hashed passwords and HTTPS. Current code compares plaintext passwords and is intended for demo/dev.
- Generate a strong JWT secret:
  ```bash
  openssl rand -base64 32
  ```