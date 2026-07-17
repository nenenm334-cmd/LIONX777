# Minbar — Advanced Arabic Learning Platform

## Original Problem Statement
> "Resolve all issues and perform all app updates."

User provided a single-page HTML app (`index.html`) called Minbar — an advanced flashcard platform for learning Arabic with spaced repetition (SRS), quizzes, exams, achievements, streak tracking, announcements, resources, and a leaderboard. The app talked to a `/api/kv` REST backend (originally described as Express + SQLite) that didn't exist in this repo, producing the error toast **"Save failed, please check your connection"** on every action and blocking login.

## Architecture
- **Frontend**: The provided Minbar HTML is served as `/app/frontend/public/index.html` (single-page, vanilla JS, no build step needed for its logic). The CRA React app mounts to a hidden `<div id="root">` and renders `null` (see `App.js`) so it never interferes with the Minbar UI.
- **Backend**: FastAPI (`/app/backend/server.py`) exposes the KV contract the frontend expects: `GET /api/kv?prefix=…`, `GET /api/kv/{key}`, `PUT /api/kv/{key}`, `DELETE /api/kv/{key}`.
- **Storage**: MongoDB collection `kv_store` (`{key, value, created_at, updated_at}`), single shared classroom database (matches the "shared" semantics from the frontend shim).

## User Personas
- **Teacher** — signs in with access code `2580`. Adds flashcards individually or in bulk, adds resources, publishes announcements, creates exams, views student dashboard & leaderboard, changes access codes in Settings.
- **Student** — signs in with name + access code `1234`. Sees announcements, reviews due cards (SRS), takes quizzes and exams, browses resources, tracks progress, competes on the leaderboard.

## Core Requirements (static)
1. Teacher/Student role gate with access codes.
2. Every action persists via a shared, real backend so "teacher adds card → student sees it" works across users/devices.
3. All existing Minbar features function unchanged (SRS, quizzes, exams, achievements, streak, listening/speaking timers, favorites, announcements, resources, leaderboard, dark mode).

## What's Been Implemented
### 2026-01-16
- Added `/api/kv` FastAPI endpoints (GET/PUT/DELETE/LIST) backed by MongoDB — full drop-in replacement for the SQLite backend the HTML originally referenced.
- Served the Minbar single-page HTML from `frontend/public/index.html` (kept a hidden `#root` for React so CRA still builds/runs cleanly).
- Simplified `App.js` to `return null;` so React does not interfere with the standalone app.
- Verified end-to-end: teacher login (2580) → add flashcard "مرحبا / Hello" → student "Layla" login (1234) → card visible on the Review screen with correct SRS counters.
- Preserved default codes (`teacher=2580`, `student=1234`) and existing status-check endpoints.
- **Mobile polish**: comprehensive mobile CSS layer, zero horizontal overflow on 320–768px screens, 16px inputs (no iOS auto-zoom), 44px+ touch targets, safe-area insets, landscape orientation handling.

### 2026-01-16 (major update — PWA + Notifications + Q&A)
- **📩 Student ↔ Teacher Q&A inbox**
  - Student `📩 Ask Teacher` tab: write a question, see all past questions and teacher replies in a threaded list.
  - Teacher `📩 Questions` tab: open questions on top with `⏳ Open` status; reply inline with a rich textarea; answered questions archived below.
  - Unread badges on both sides: teacher sees a count of unanswered questions; student sees a count of new teacher replies.
  - Real-time propagation via the existing 15-second polling loop (verified E2E in Playwright).
- **🔔 Study reminder notifications** — full `Notification` API integration + service-worker bridge for persistence:
  - "N cards ready to review" (after 10am, once per day)
  - Streak-at-risk alert (after 7pm if student had activity yesterday but not today)
  - Evening study reminder (8pm, once per day)
  - Teacher: "N student questions awaiting reply"
  - Also fires push-style browser notifications on new content while the app is open (student-side new content, teacher-side new question).
  - Preference panel with `Enable / Test notification` buttons (shown in Settings for teacher, in My Progress for student).
- **📲 PWA — install to home screen + instant load**
  - `manifest.json` with brand colors, standalone display, portrait orientation, categories.
  - Custom icons generated with PIL (192, 512, 512-maskable, 180 Apple touch icon).
  - `sw.js` service worker: precaches app shell on install; stale-while-revalidate for navigations, cache-first for cross-origin fonts, network-only for `/api/*` (data stays fresh & shared).
  - `beforeinstallprompt` captured and exposed via an "📲 Install now" button in the App Preferences panel.
  - Confirmed installed apps launch instantly (verified in E2E).

### 2026-01-16 (performance — snappy, zero-lag UI)
- **Optimistic UI everywhere** — every user action now updates the DOM instantly and saves to the server in the background:
  - Introduced `safeSetBg(key, value, shared)` (fire-and-forget) and `saveProgressBg()` alongside the awaited versions used only for initial load.
  - Refactored 20+ handlers (add/delete flashcards, resources, announcements, exams, questions/replies, quiz answers, "I Know It" / "Needs Review", favorites, timer stop, tab switches, exam submit) to render first, save later.
  - Tab clicks no longer block on `loadShared` — polling keeps data fresh every 15s in the background; only manual "Refresh" awaits.
- **Instant tap feedback** — added `:active { transform:scale(.97); opacity:.88 }` to every interactive element so pressing a button feels responsive even during the ~50 ms render.
- **Verified on emulated slow 3G** (400 ms extra RTT):
  - Card add: ~180 ms (previously ~500-1500 ms with awaits).
  - "I Know It" tap: ~100-300 ms.
  - Ask send: ~160 ms.
  - Tab switch: essentially instant (was awaiting a full shared-data fetch before).

## Prioritized Backlog
- **P1**: None blocking — app is fully functional end-to-end.
- **P2**: Optional per-classroom namespacing of KV keys if the platform ever needs to host multiple classrooms in the same DB.
- **P2**: Rate limiting / auth on the KV endpoints if this ever leaves a trusted classroom setting (currently anyone with the URL can read/write, matching the original app's design).

## Next Tasks
- Await user feedback after they try the full flow (add cards in bulk, create an exam, invite a real student, etc.).
