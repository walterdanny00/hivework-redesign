# Session 192 — Hivework

2026-11-08. Three code commits: `9c97ce4` (Landing ticker amounts, Vercel), `492ffba` (new public `GET /api/jobs/feed`, Render), `8565815` (Home "Happening now" reads the feed, Vercel). Described in Section 225 of `roadmap.md`.

> **Standing rule (top of `roadmap.md`).** Grep the roadmap before proposing any test; an item logged as "not built" may have shipped in a later section, so grep the feature name across the whole roadmap first; list **every** use of a flag, type or message before changing it; narrowest patch; `tsc` and `git diff --stat` before commit; deliver the **complete** `roadmap.md`, never a section-only file.

## Focus
The owner chose the real Home features from Section 224's list and started with the activity feed ("Happening now"). Recommendation logic not started.

## Starting-state check (reported)
`git pull` in `~/Piwork`: up to date. HEAD `45225f5` (docs, session 191, Section 224). `git status --short | wc -l`: 58. `diff -rq` between the two repo copies silent. Roadmap 11335 lines at session start.

## Decisions (owner)
- Feed shows new jobs and payouts; approvals not shown. Also added: closing soon and last slot left (both already public in Browse).
- Open-job cards show the title; payout cards show category and amount only (title considered, then left out because the finished job's owner never agreed to it being shown).
- Empty or failed feed: Home hides the whole block, no invented cards.

## Work
- **Money flow found:** the owner pays budget plus 7% (`PostJob.tsx` `totalEscrow`), the ledger credit to the worker is the full `job.budget` (`settlement.ts`), and no job fee exists in `backend/src`. Landing's ticker "10π locked, 9.3π released" was wrong.
- **`9c97ce4`:** Landing ticker escrow card `10.7π`, released card `10π` (+2 / -2). Script `~/patch192a.py`, backup `Landing.tsx.bak192a`; `tsc` clean.
- **`492ffba`:** `GET /api/jobs/feed` in `jobs.ts` (+47), public, before `/attachment-url` and `/:id`; whitelisted fields only; 7-day window; up to 6 items. Script `~/patch192b.py`, backup `jobs.ts.bak192b`; `tsc` clean. A first payout query that selected the job title (`~/patch192c.py`) was run and then undone by restoring `jobs.ts.bak192c`.
- **`8565815`:** `Home.tsx` (+37 / -14), demo `ACTIVITY_TICKER` removed, feed fetch and card builder added, block hidden when empty. Script `~/patch192d.py`, backup `Home.tsx.bak192d`; `tsc` clean.
- **Live checks:** Landing screenshot pass (10.7π, 10π); `curl $BASE/api/jobs/feed` HTTP 200, four items (one new job, three payouts), no ids, usernames or wallets, no title on payouts; Home screenshots pass (payout card and "Test offline" card, four dots). Render and Vercel logs not pasted.
- **Docs:** Section 225 added; update pointers added to Sections 107 and 224.

## Findings
- Closed: Landing 9.3π; Home demo ticker; Section 224's unverified 7% line.
- Seen, not changed: the three payouts shown are test-account ledger rows from 2026-11-05 (they show until they leave the 7-day window); Home trust row says "7 Categories" while Landing says "3 job categories" (Landing may be stale since Section 223), not swept; four redesign files in `screens/` still show 9.3π.
- Not exercised live: multi-slot per-slot amounts, `closing_soon` cards, the empty list. The feed has no caching or auth (same shape as `/stats`).
- Held, not built: "Recommended for you" (needs a skills column on jobs and matching logic); Survey / Data.
- Still open (unchanged): throw-on-error in the payment path (blocked on Pi's repeat-complete behavior); `my-application` main read at `jobs.ts` 186 to 190; `workerCall` stale card on a 409; `/stats` zero counts on a failed read (`Home.tsx` 81, `Jobs.tsx` 182, `Landing.tsx` 44); Browse empty list on a 500 (`Jobs.tsx` 169 to 173); attachment fetches ignore errors (`SubmissionReport.tsx`); what `SubmissionReview.tsx` renders when `applications` is null; raw `error.message` in other route files (not swept); Help FAQ placeholder copy.

## Not verified
The amount actually charged on the Pi payment was not read in the backend; 10.7π is from `PostJob.tsx`. The feed was not exercised for multi-slot, closing-soon or empty cases. The Landing category count was not checked.

## Files touched
Code: `frontend/src/pages/Landing.tsx` (`9c97ce4`), `backend/src/routes/jobs.ts` (`492ffba`), `frontend/src/pages/Home.tsx` (`8565815`). Docs: `roadmap.md` (Section 225, complete file); `sessions/session-192.md`.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork` (HEAD should be the session 192 docs commit or later; last code commit `8565815`; 62 untracked files), then `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`. Read the standing rule at the top of `roadmap.md`. Then, owner's choice: check the Landing "3 job categories" figure (`grep -n "REAL_CATEGORIES\|job categories" ~/Piwork/frontend/src/pages/Landing.tsx`); the debugging list (Browse empty-list-on-500: `sed -n '160,200p' ~/Piwork/frontend/src/pages/Jobs.tsx`, then `grep -n "setError\|error\b" ~/Piwork/frontend/src/pages/Jobs.tsx` and every use; or the `/stats` zero counts); design the recommendation logic; or revisit Survey / Data. Grep the roadmap before proposing any live test or any "not built" item.

Termux notes: untracked, not to be committed: 62 files expected (the 58 from Section 224 plus `Landing.tsx.bak192a`, `jobs.ts.bak192b`, `jobs.ts.bak192c`, `Home.tsx.bak192d`). `~/patch192a.py` to `~/patch192d.py` are outside the repos. API base for curl: `BASE=https://hivework-backend.onrender.com` (see the "Standing reference" near the top of `roadmap.md`). Use `git --no-pager diff`. Run `git show <hash>` from `~/Piwork`, not `~/hivework-redesign`.
