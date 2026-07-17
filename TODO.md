# TODO - Fix Vercel API 405 (PUT /api/kv/accessCodes)

- [x] Convert KV API from Next.js-style `route.js` to Vercel serverless format (`api/kv/index.js`, `api/kv/[key].js`).
- [x] Fix service worker to always return a valid Response and skip missing precache assets gracefully.
- [x] Add missing PWA icon (`icon.svg`) and update manifest/HTML references.
- [x] Configure `vercel.json` with `outputDirectory: frontend/public` and CORS headers for `/api/*`.
- [ ] Redeploy to Vercel with `MONGO_URL` env var set.
- [ ] Disable Deployment Protection on preview URLs (or use production domain) to fix CORS/sso-api errors.
