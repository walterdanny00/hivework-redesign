# Session 194 — Hivework

2026-11-14. Two code commits: `edc1e50` (new `GET /api/jobs/recommended`, Render) and `d3866e2` (Home "Recommended for you" reads it, Vercel). Described in Section 227 of `roadmap.md`.

> **Standing rule (top of `roadmap.md`).** Grep the roadmap before proposing any test; an item logged as "not built" may have shipped in a later section, so grep the feature name across the whole roadmap first; list **every** use of a flag, type or message before changing it; narrowest patch; `tsc` and `git diff --stat` before commit; deliver the **complete** `roadmap.md`, never a section-only file.

## Focus
The owner chose option (b) from Section 226's list: design the matching logic for "Recommended for you", then build it.

## Starting-state check
Output reported: `git pull` up to date; HEAD `7309620` (Docs: session 193, Section 226), then `31886f1`, `321f9ba`; 65 untracked; `diff -rq` silent; `roadmap.md` 11415 lines.

## Decisions
- **Owner:** a job that lists several languages needs the worker to speak **all** of them; the matching lives in a **new backend route**. On skills in v1, the owner asked for a suggestion: leave skills for a v2 (nothing technical blocks building it right after); the owner went on without objecting.
- **Proposed, accepted by going ahead:** devices match on any one listed; "Any device" on either side matches all; empty requirements match everyone; a worker with no devices or languages on the profile is not shown jobs that require them; incomplete profile gets nothing; ranking by categories already applied to, then newest; up to 3 jobs; the Home section hides when empty.

## Work
- **Roadmap grep first:** Sections 40, 107, 224, 225, 226. The logic had never been designed or tested; no repeat.
- **Code read (owner's Termux output):** `users.ts` 19, 29 to 45, 55 and `trustscore.ts` 14 to 28 (arrays); `PostJob.tsx` 216 to 220 (device and language stored as a `", "`-joined string); `formOptions.ts` lists shared with `Onboarding.tsx`; `JobDetail.tsx` shows the requirements as chips only; `/:id/apply` does not enforce them; `requireAuth` and `apiFetch` header handling; `getApplyableJobs` select leaves out `client_id`, `device_required` and `language_required`, and it feeds the public `GET /`, `/stats` and `/feed`, so it was **not** widened.
- **`edc1e50`** (`backend/src/routes/jobs.ts`, +69 / -0): `GET /api/jobs/recommended`, placed before `/attachment-url` and `/:id`. Script `~/patch194a.py` (sha256 `e87430baace42cc0…486019`); backup `jobs.ts.bak194a`; `tsc` printed nothing; `--stat` only (full diff not pasted). Pushed `7309620..edc1e50`.
- **`d3866e2`** (`frontend/src/pages/Home.tsx`, +35 / -9): demo card replaced by real cards, hidden when empty, each linking to `/jobs/:id`. Script `~/patch194b.py` (sha256 `5b2d525003aeafc2…95c6c4`); backup `Home.tsx.bak194b`; `tsc` printed nothing; full `git diff -U0` read. Pushed `edc1e50..d3866e2`.
- **Live checks (pass):** curl: no token 401; owner token `{"jobs":[]}` with no open jobs, and again with the three test jobs (own jobs excluded); Olawalt (devices Android and `ios`, languages English, profile complete) gets exactly "Rec test match"; "Rec test device" (Desktop) and "Rec test language" (English plus French) left out. Home screenshots (Olawalt's account) show the real card, and the whole section gone after Olawalt applied.
- **Docs:** Section 227 added; update pointers added to Sections 107 and 226.

## Findings
- Closed: the Home "Recommended for you" demo card. The 0 open jobs seen in session 193: the owner says the earlier test jobs ended after their deadlines (fits `GET /api/jobs` returning an empty list; not checked in the database).
- Seen, not changed: Apply does not enforce device or language requirements, so a worker can still apply to a job the recommendations skip; free-typed combobox entries match only if spelled the same, and a custom entry containing a comma would split wrongly.
- Held, not built: skills matching (v2: skills field on jobs, Supabase migration, the two save routes, a Post Job field, a `JobDetail` chip, one scoring rule); Survey / Data.
- Loose ends: the three test jobs ("Rec test match", "Rec test device", "Rec test language") were still open at the end of the session (they end 11/15/2026 or can be cancelled; what a cancel refunds was not checked); Olawalt's application to "Rec test match" is pending.
- Still open (unchanged): throw-on-error in the payment path (blocked on Pi's repeat-complete behavior); `my-application` main read in `jobs.ts`; `workerCall` stale card on a 409; `/stats` zero counts on a failed read; Browse empty list on a 500 (`Jobs.tsx` 169 to 173); attachment fetches ignore errors (`SubmissionReport.tsx`); what `SubmissionReview.tsx` renders when `applications` is null; raw `error.message` in other route files (not swept); Help FAQ placeholder copy. Old `Home.tsx` and `jobs.ts` line numbers have moved: re-grep.

## Not verified
Vercel and Render build logs; the full backend diff; the category ranking; the incomplete-profile, 500 and logged-out paths; more than one card on Home; the stored requirements of the two other test jobs; the untracked count (67 expected).

## Files touched
Code: `backend/src/routes/jobs.ts` (`edc1e50`), `frontend/src/pages/Home.tsx` (`d3866e2`). Docs: `roadmap.md` (Section 227, complete file); `sessions/session-194.md`.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork` (HEAD should be the session 194 docs commit or later; last code commit `d3866e2`; 67 untracked files), then `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`. Read the standing rule at the top of `roadmap.md`. Then, owner's choice: (a) v2 skills matching: first `select column_name, data_type from information_schema.columns where table_name = 'jobs' order by ordinal_position;` in Supabase and `grep -n "device_required" ~/Piwork/backend/src/routes/jobs.ts ~/Piwork/frontend/src/pages/PostJob.tsx ~/Piwork/frontend/src/pages/JobDetail.tsx`, then decide the storage type and who sets it; (b) the debugging list (Browse empty-list-on-500: `sed -n '160,200p' ~/Piwork/frontend/src/pages/Jobs.tsx`, then `grep -n "setError\|error\b" ~/Piwork/frontend/src/pages/Jobs.tsx` and every use; or the `/stats` zero counts); (c) revisit Survey / Data. Grep the roadmap before proposing any live test or any "not built" item.

Termux notes: untracked, not to be committed: 67 files expected (the 65 from session 193 plus `jobs.ts.bak194a` and `Home.tsx.bak194b`). `~/patch194a.py` and `~/patch194b.py` are outside the repos. API base for curl: `BASE=https://hivework-backend.onrender.com`. To get a token: Supabase SQL editor, `select token, expires_at from sessions where username = '<name>' and expires_at > now() order by expires_at desc limit 1;`, then `read -rs WORKER_TOKEN && export WORKER_TOKEN` in Termux; never paste a token into chat. Use `git --no-pager diff`. Run `git show <hash>` from `~/Piwork`, not `~/hivework-redesign`.
