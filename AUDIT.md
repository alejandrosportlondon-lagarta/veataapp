# VestaApp 3.0 — Project Data Audit

**Date:** 2026-03-21
**Project:** Vesta Room-by-Room Tracker (Next.js 15 full-stack application)

---

## 1. Project Structure Overview

```
VestaApp 3.0/
├── prisma/schema.prisma          # SQLite database schema
├── src/
│   ├── middleware.ts              # Auth route protection
│   ├── app/
│   │   ├── (public)/             # Login, Register, Welcome pages
│   │   ├── (protected)/          # Dashboard, Project detail pages
│   │   └── api/                  # REST API routes
│   ├── components/               # Nav, Sidebar, StatusBadge
│   └── lib/                      # Auth, session, prisma, rate limiter, validation
├── package.json
├── tailwind.config.js
├── vercel.json
└── next.config.mjs
```

**Stack:** Next.js 15, React 18, TypeScript, Prisma (SQLite), Tailwind CSS, TanStack React Query, Zod, bcrypt, JWT

---

## 2. Data Model

```
User (1) ──→ Project (many) ──→ Room (many) ──→ Task (many)
```

| Model   | Fields                                                        |
|---------|---------------------------------------------------------------|
| User    | id (uuid), email (unique), name, passwordHash, createdAt     |
| Project | id (uuid), name, description?, status, dueDate?, userId (FK) |
| Room    | id (uuid), name, notes?, order, projectId (FK)               |
| Task    | id (uuid), title, description?, status, dueDate?, assignee?, order, roomId (FK) |

- Project status: `planning | active | complete`
- Task status: `todo | in-progress | done`
- Cascade deletes: Project → Rooms → Tasks

---

## 3. Security Findings

### CRITICAL

| # | Issue | Location | Detail |
|---|-------|----------|--------|
| 1 | **Hardcoded JWT secret fallback** | `src/lib/auth.ts:5` | `process.env.JWT_SECRET \|\| 'dev-secret-change'` — if the env var is unset, tokens are signed with a publicly known secret, allowing token forgery. |

**Recommendation:** Throw an error at startup if `JWT_SECRET` is not set in production.

### HIGH

| # | Issue | Location | Detail |
|---|-------|----------|--------|
| 2 | **No CSRF protection** | API routes | Relies solely on `SameSite=lax` cookies. No CSRF token is generated or validated. While `SameSite=lax` mitigates most CSRF vectors, state-changing GET requests (if any are added) would be vulnerable. |

### MEDIUM

| # | Issue | Location | Detail |
|---|-------|----------|--------|
| 3 | **In-memory rate limiter** | `src/lib/rateLimiter.ts` | Resets on server restart and does not work across multiple instances. Ineffective in a scaled or serverless (Vercel) deployment. |
| 4 | **No password reset flow** | Login page | "Forgot password? Coming soon" — users with lost credentials have no recovery path. |
| 5 | **Middleware token verification is shallow** | `src/middleware.ts` | Middleware only checks for cookie existence, not token validity. An expired or invalid token passes middleware but fails at the API layer, causing confusing UX (user appears logged in but all API calls fail). |

### LOW

| # | Issue | Location | Detail |
|---|-------|----------|--------|
| 6 | **SQLite in production** | `prisma/schema.prisma` | SQLite is single-writer and file-based. Not suitable for concurrent production workloads or serverless environments like Vercel. |
| 7 | **No pagination on project/room/task lists** | API routes | All queries return full result sets. Will degrade with large data volumes. |
| 8 | **No request body size limits** | API routes | Description and notes fields accept unbounded strings beyond Zod type checks. |

---

## 4. Data Validation Audit

| Endpoint | Validation | Status |
|----------|-----------|--------|
| POST /api/auth/register | Zod: name required, email valid, password ≥8 chars with letter+number | OK |
| POST /api/auth/login | Zod: email valid, password required | OK |
| POST /api/projects | Zod: name required, status enum, dueDate optional | OK |
| PATCH /api/projects/[id] | Zod: partial project schema | OK |
| POST /api/projects/[id]/rooms | Zod: name required, notes optional | OK |
| PATCH /api/rooms/[roomId] | Zod: partial room schema | OK |
| POST /api/rooms/[roomId]/tasks | Zod: title required, status enum, dueDate/assignee optional | OK |
| PATCH /api/tasks/[taskId] | Zod: partial task schema | OK |

All mutation endpoints use Zod validation. No raw user input reaches the database unvalidated. Prisma ORM prevents SQL injection.

---

## 5. Authorization Audit

| Check | Result |
|-------|--------|
| Projects scoped to authenticated user | **PASS** — All project queries filter by `userId` |
| Rooms scoped to user's project | **PASS** — `ensureRoom()` joins through project to verify ownership |
| Tasks scoped to user's project | **PASS** — `ensureTask()` joins through room→project to verify ownership |
| Auth cookies httpOnly | **PASS** |
| Auth cookies secure in production | **PASS** |
| Auth cookies SameSite | **PASS** — `lax` |
| Password hashing | **PASS** — bcrypt with 10 rounds |
| Token expiry | **PASS** — 1 hour TTL |
| Rate limiting on auth endpoints | **PARTIAL** — Applied but in-memory only (see finding #3) |

---

## 6. Environment Variables

| Variable | Required | Fallback | Risk |
|----------|----------|----------|------|
| `JWT_SECRET` | Yes | `'dev-secret-change'` | **CRITICAL** — must be set in production |
| `DATABASE_URL` | Yes | None | Build will fail if missing |
| `NODE_ENV` | No | `development` | Controls secure cookie flag |

No `.env` file is committed to the repository (good practice).

---

## 7. Dependencies

| Package | Version | Notes |
|---------|---------|-------|
| next | 15.0.0 | Check for security patches |
| react | 18.3.1 | Current |
| prisma | 5.9.1 | Current |
| bcrypt | 5.1.1 | Current |
| jsonwebtoken | 9.0.2 | Current |
| zod | 3.22.4 | Current |
| tailwindcss | 3.4.1 | Current |
| @tanstack/react-query | 5.17.19 | Current |

No known critical vulnerabilities at time of audit. Run `npm audit` regularly.

---

## 8. Summary & Recommendations

1. **Fix immediately:** Remove the hardcoded JWT secret fallback — throw on missing `JWT_SECRET` in production.
2. **Before launch:** Replace SQLite with PostgreSQL (or similar) for production use.
3. **Before launch:** Replace in-memory rate limiter with a distributed store (Redis, Upstash).
4. **Before launch:** Validate token in middleware (not just cookie presence) for consistent UX.
5. **Plan for:** Pagination on list endpoints, request body size limits, password reset flow, CSRF tokens for defense-in-depth.
