# Session 170 — Hivework

2026-11-05. One backend change (log-only). The `Not allowed by CORS` finding traced as far as the logs allow; origin logging is live and verified.

## Focus
The read-only look at the `Not allowed by CORS` origin from Section 184's Next line. Roadmap grepped first: `cors` appears only in Section 184; no other origin or port is recorded.

## Starting-state check
The Section 184 starting-state commands were not reported at the start of this session. The Piwork push at the end went from `82a2731` to `ee58c25`.

## Work
- **Code read (`backend/src/index.ts`):** `allowedOrigins` is `http://localhost:3000` and `https://piwork-frontend.vercel.app`. Requests with no `Origin` pass; any other origin gets `new Error('Not allowed by CORS')`, which Express turns into a 500. The rejected origin was never logged.
- **Frontend sweep:** grep of `vite.config.ts`, `.env*` and `src` found only `VITE_BACKEND_URL` (`api.ts:1`) and `VITE_PI_SANDBOX` (`usePi.ts:7`, `:9`). No other host or port hardcoded. `piwork-frontend.vercel.app` is the only Vercel domain (owner confirmed).
- **Render log read:** bursts of about 3-5 errors within a second at 2026-11-04 ~07:51, 14:46, 15:54, 16:33, 17:05, 20:45, 20:59, 21:19 UTC and 2026-11-05 05:56 UTC. Every trace ends inside `corsMiddleware` with no route or checker frame: rejected before any route, so no job, refund or balance is touched. Not aligned with the 5-minute checker; no consistent tie to deploys.
- **Patch (`ee58c25`):** `~/p170a.py` (anchor matched once) added a middleware before `cors(...)` that logs `CORS rejected:` with origin, method, `req.path` and user-agent for any present-but-unlisted origin, then always calls `next()`. Backup `index.ts.bak170` (untracked). `npx tsc --noEmit` printed `TSC OK`. Pushed to Piwork `main`.
- **Live check:** Render live 06:13:29Z. `curl /api/health`: no Origin 200, allowed origin 200, `https://example.test` 500. Log showed `CORS rejected: https://example.test GET /api/health curl/8.21.0` (06:17:05Z); stack now `index.js:41:22` with the middleware frame at `index.js:33:5`. Pi Browser: app loads, Dashboard shows data (owner confirmed).

## Findings
- The origin behind the bursts is still unknown. The 05:56:22Z burst predates the deploy, so it logged no origin.
- Still-open list as in Section 184; the CORS item is now "logging live, origin unread" (full list in Section 185).

## Not verified
- Who sends the rejected requests (candidates left unconfirmed: Pi Browser, a Vercel deployment-specific URL, another localhost port, a bot or script).
- A real burst logging as expected (only the `example.test` curl was seen).
- Test-job state from Section 184 was not checked.
- Everything on the Section 177-184 Not-verified lists.

## Files touched
`backend/src/index.ts` (`ee58c25`). Docs: `roadmap.md` (Section 185, complete file); `sessions/session-170.md`.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork` (HEAD should be the session 170 docs commit or later; last code commit `ee58c25`), then `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`. Then:
1. In the Render log, filter for `CORS rejected:` and read the origin and user-agent of any new burst. If it is a legitimate client, decide whether to add it to `allowedOrigins`; otherwise close as informational.
2. Grep `roadmap.md` before proposing any live test, then pick from the Still-open list in Section 185 (e.g. whether `/close-slots` rejects `closed` / `expired` / `partially_complete` jobs with unfilled slots; start with `grep -n "close-slots" src/routes/jobs.ts` in `~/Piwork/backend`).

Termux notes: untracked, not to be committed: the seven `.bak` files from Section 184 plus `backend/src/index.ts.bak170`. Test jobs as left in Section 184 (not checked this session): `6999ed26-...` `open`, `slots_closed` 1; `9665ddae-...` `completed`; `57d726f9-...` `closed`; `f55755be-...` Olawalt revision window (Pass H due about 2026-11-05 15:37 UTC).
