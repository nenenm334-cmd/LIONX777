# Vercel deployment notes (Minbar)

## What changed
- Backend KV API uses Vercel Serverless Functions: `api/kv/index.js` (list) and `api/kv/[key].js` (get/put/delete).
- Static frontend is served from `frontend/public` via `outputDirectory` in `vercel.json`.
- Frontend calls `'/api/kv'` (same origin).

## Required env vars on Vercel
- `MONGO_URL` (MongoDB Atlas connection string)
- `DB_NAME` (optional; defaults to `minbar`)

## Endpoints
- `GET /api/kv?prefix=...`
- `GET /api/kv/<key>`
- `PUT /api/kv/<key>` with JSON body: `{ "value": ... }`
- `DELETE /api/kv/<key>`

## Deployment Protection (important)
If the browser console shows CORS errors to `vercel.com/sso-api`, the preview deployment has **Deployment Protection** enabled. API calls are redirected to Vercel login and will fail.

Fix in Vercel Dashboard → Project → Settings → Deployment Protection:
- Disable protection for Production, or
- Add an exception for `/api/*` routes, or
- Use the production URL (`lionx-777.vercel.app`) instead of preview URLs.

## Deployment
Deploy the root project to Vercel. Ensure `MONGO_URL` is set in Environment Variables.

