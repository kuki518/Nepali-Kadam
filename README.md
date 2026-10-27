# Nepali Kadam

A responsive website that tracks walks and runs and shows distance (km), pace, steps, calories burned and time.
Second Year Project (SYP) – Itahari International College.

## Tech stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js + Express (JavaScript)
- **Database:** PostgreSQL
- **Auth:** bcrypt password hashing, JWT in an httpOnly cookie, role-based access control

## Project structure
```
backend/    Express API (routes, controllers, middleware, tests)
database/   schema.sql (tables + seed roles/permissions)
frontend/   Static pages, CSS and JS
docs/       Proposal, diagrams (use case, ERD, Gantt), WBS
```

## Getting started
1. Install Node.js 20+ and PostgreSQL.
2. Create a database: `createdb nepali_kadam`
3. Load the schema: `psql nepali_kadam -f database/schema.sql`
4. Backend setup:
   ```
   cd backend
   cp .env.example .env     # then edit the values
   npm install
   npm run dev
   ```
5. The API runs on http://localhost:3000 and also serves the frontend from `/frontend`.

## API (auth)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | /api/auth/register | Create account | Public |
| POST | /api/auth/login | Log in (sets cookie) | Public |
| POST | /api/auth/logout | Log out (clears cookie) | Logged in |
| GET | /api/auth/me | Current user | Logged in |
| PUT | /api/auth/password | Change password | Logged in |
| POST | /api/auth/forgot-password | Request reset token | Public |
| POST | /api/auth/reset-password | Reset with token | Public |
| GET | /api/admin/users | List users | Admin |
| PATCH | /api/admin/users/:id/status | Activate / deactivate | Admin |

## Status
Initial structure and authentication skeleton. Tracker, metrics and history are in progress (see docs/ for the Gantt chart and WBS).
