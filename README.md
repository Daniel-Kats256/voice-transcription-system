# Project Overview

This project consists of a React frontend and a Node/Express backend with a MySQL database. Recent updates focus on UX improvements for audio capture and clearer error/latency feedback, while preserving the original database schema.

## What Was Added

- Microphone visualizer (live equalizer) during transcription to show sound levels as audio is captured
- Larger, single-page layouts with improved typography and spacing
- Visible loading and error banners, including messages explaining delays (e.g., slow network, permission prompts)
- Safer transcript saving (passes `userId` to backend as required)
- Global request timeout and clearer timeout error message

Databases and schema were not changed.

## Tech Stack
- Frontend: React (react-router), Axios, Bootstrap (classes used)
- Backend: Node.js, Express, MySQL (mysql2)

## Running Locally

1. Backend
   - Create a `.env` in `backend/` with your DB credentials:
     ```
     DB_HOST=localhost
     DB_USER=your_mysql_user
     DB_PASS=your_mysql_password
     DB_NAME=your_db_name
     PORT=5000
     # Optional (see JWT section below)
     JWT_SECRET=change_me
     ```
   - Install and start:
     ```bash
     cd backend
     npm install
     node server.js
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

## New UX Details

- Transcription page now displays:
  - A live microphone equalizer while recording (requires microphone permission)
  - Slow-operation banner if initialization or saving takes more than ~2s
  - Error messages for speech recognition or microphone permission issues

- Login, Dashboard, and Admin pages show:
  - Loading states for network requests
  - "Taking longer than usual" banners for slow responses
  - Clear error banners when requests fail

## JWT Secret (How to Create)

The backend includes the `jsonwebtoken` package, although the current endpoints do not require a token. If you want to enable JWT in the future, create a strong secret and add it to the backend `.env` as `JWT_SECRET`.

- Generate a secure secret:
  ```bash
  # Option A (base64):
  openssl rand -base64 32

  # Option B (hex):
  openssl rand -hex 32
  ```

- Put it in `backend/.env`:
  ```
  JWT_SECRET=paste_generated_secret_here
  ```

- Frontend will automatically attach `Authorization: Bearer <token>` if you store `token` in `localStorage`. If you later update the backend to issue/verify JWTs, ensure the login endpoint returns `{ token, user: { id, role, name } }`.

## Files Touched

- Frontend
  - `src/components/MicVisualizer.js` (new): Web Audio API visualizer
  - `src/styles.css` (new): Layout/typography/visualizer styles
  - `src/App.js`: Import global styles and wrap in root container
  - `src/pages/TranscriptionPage.js`: Visualizer, delay/error banners, send `userId` when saving
  - `src/pages/LoginPage.js`: Loading/slow/error states
  - `src/pages/Dashboard.js`: Loading/slow/error states
  - `src/pages/CreateUserPage.js`: Larger layout, slow/error states
  - `src/pages/AdminPage.js`: Loading/slow/error states for users and transcripts

- Backend
  - No schema changes. Endpoints unchanged.

## Notes
- The visualizer requests microphone permission separately from the Web Speech API to compute audio levels. It is only used for on-device visualization and not uploaded.
- If you deploy over HTTPS, ensure the site has secure context to access the microphone.