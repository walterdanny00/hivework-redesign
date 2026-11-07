# Session 187 — Hivework

2026-11-07 (Render log UTC). Two code commits, both in `backend/src/routes/jobs.ts`: `6c6cc46` (applications list logs a failed `disputes` read; Section 216) and `70922d2` (`my-application` logs failed `disputes` and upheld-disputes reads; Section 217).

> **Standing rule (top of `roadmap.md`).** Grep the roadmap before proposing any test; list **every** use of a flag, type or message before changing it; narrowest patch; `tsc` and `git diff --stat` before commit; deliver the **complete** `roadmap.md`, never a section-only file.

## Focus
The `disputes` read in the owner applications list (`GET /:id/applications`), open since Section 206. Roadmap grepped first (`disputes`, `approvedApp`, `deleteDraft`, the applications-list callers, Sections 206 and 215); no live test proposed.

## Starting-state check (reported)
`git pull` in `~/Piwork`: up to date. HEAD `c9fe589`, `git status --short | wc -l`: 40, `diff -rq` between the two repo copies silent. Roadmap 11007 lines at session start.

## Work
- **Patch 1 (Section 216, `6c6cc46`, +3 / -2):** route 211 to 245 printed; `disputeRows` feeds only the `latestDispute` map and the `dispute` response field. Frontend callers on record (Section 206) treat a 500 as an empty list, and the `JobDetail.tsx` owner fetch (390 to 402) is one-shot, not polled. Owner chose option 1, log only: `error: disputeError` captured, `console.error('Failed to read disputes for applications list.', job id, message)`, empty-ids branch given `error: null`. No behavior change. A 500 (option 2) was not taken. Deploy build 08:12:34Z, live 08:12:57Z. Push `c9fe589..6c6cc46` first try; 41 untracked.
- **Patch 2 (Section 217, `70922d2`, +4 / -2):** worker `my-application` route. Sweep: `dispute_used_this_round` has one live frontend use (`JobDetail.tsx` 1418; `upheld_dispute_count` only a type); `openDispute` (`lib/disputes.ts` 80 to 100) already fails closed (500 on a lookup error, 409 with the same text as the frontend note on a used round); `workerCall` (713 to 730) shows the backend `error` text, so a refused attempt reaches the worker with a clear message. Log only: `disputeError` and `upheldError` captured and logged with job id and application id; the `.single()` main read left alone. Deploy build 08:24:10Z, live 08:24:33Z. Push `19feb2f..70922d2` first try; 42 untracked.
- Scripts: `~/p187a.py`, `~/p187b.py` (anchors matched once each); backups `jobs.ts.bak187a`, `jobs.ts.bak187b` (untracked).

## Findings
- Closed (visibility only): the `disputes` read in the applications list; the `disputes` and upheld-disputes reads in `my-application`.
- Closed (by reading): a worker offered an already-used dispute can only get a refused attempt with a clear message (backend 409, shown through `workerCall`).
- Not swept: other worker-side uses of `myApp.dispute` in `JobDetail.tsx`. The `my-application` main read (`.single()`, `error` unread) left as is.
- Still open: `approvedApp` reads; `deleteDraft` in `Dashboard.tsx` recorded as silent on failure; throw-on-error in the payment path (blocked on Pi's repeat-complete behavior); raw `error.message` returns (applications query, `PATCH /:id/draft`).
- Everything else on the Section 211 list stands.

## Not verified
- The new log branch was not run; `tsc`, the diff and the Render build log only. No happy-path re-run of the owner applications list after the deploy.
- The `hasOpenDispute` guards were not re-read. The two new `my-application` log branches were not run either; no happy-path re-run of that route after its deploy.

## Files touched
Code: `backend/src/routes/jobs.ts` (`6c6cc46`, `70922d2`). Docs: `roadmap.md` (Sections 216 and 217, complete file); `sessions/session-187.md`.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork` (HEAD should be the session 187 docs commit or later; last code commit `70922d2`; 42 untracked files), then `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`. Read the standing rule at the top of `roadmap.md`. Then `grep -n "approvedApp" ~/Piwork/backend/src/routes/*.ts` (sweep every use of what each read feeds before any patch), then re-read `deleteDraft` in `Dashboard.tsx` (around line 235). Grep the roadmap before proposing any live test.

Termux notes: untracked, not to be committed: 42 files expected (the 40 from Section 215 plus `jobs.ts.bak187a` and `.bak187b`). `~/p187a.py` and `~/p187b.py` are outside the repos. Run `git show <hash>` from `~/Piwork`, not `~/hivework-redesign`. Use `git --no-pager diff`.
