# Syncup_backend

Backend for the Syncup full stack assignment.

## Stack

- Node.js, Express, TypeScript
- Prisma with SQLite by default for local development
- JWT access token plus rotating refresh token in an `httpOnly` cookie
- Groq for AI resume matching
- Upstash Redis for job search caching
- Cloudinary as the free S3 alternative for resume uploads
- WebSocket notifications at `/ws/notifications`

## Setup

```bash
npm install
npm run prisma:migrate
npm run dev
```

Copy `.env.example` to `.env` and fill the JWT secrets. Groq and Upstash are optional for local development; the backend still runs with local matching and no cache. Cloudinary credentials are required for resume uploads.

## Main APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/jobs`
- `POST /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/resumes` with multipart field `resume`
- `POST /api/resumes/:resumeId/match/:jobId`
- `POST /api/applications`
- `GET /api/applications`
- `PATCH /api/applications/:id/status`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

Connect notifications with:

```text
ws://localhost:5000/ws/notifications?token=<accessToken>
```
