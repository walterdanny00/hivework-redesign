# Session 189 — Hivework

2026-11-07. One code commit, in `backend/src/routes/jobs.ts`: `b27103c` (Section 221), plus a docs-only sweep (Section 220). Backend deploys on Render.

> **Standing rule (top of `roadmap.md`).** Grep the roadmap before proposing any test; list **every** use of a flag, type or message before changing it; narrowest patch; `tsc` and `git diff --stat` before commit; deliver the **complete** `roadmap.md`, never a section-only file.

## Focus
1. Worker-side `myApp.dispute` uses in `JobDetail.tsx` (carried as "not swept" since Sections 217 and 218). Roadmap grepped first; only the `dispute_used_this_round` use (1418) was on record. No live test proposed.
2. The raw `error.message` returns in `jobs.ts`. Roadmap grepped first; three sites on record, no test on record.

## Starting-state check (reported)
`git pull` in `~/Piwork`: up to date. `git status --short | wc -l`: 45. HEAD `038e344` over `0b986a2`. `diff -rq` between the two repo copies silent. Roadmap 11144 lines at session start.

## Work
- **Section 220 (docs only):** `myApp.dispute` is read at 1418, 1525, 1532 to 1545 only; `grep -n "dispute"` found no alias. All reads inside the dispute panel are behind the open-status check; a dispute nulls `review_due_at` (on record), so the auto-pay text cannot clash. `myApp` is replaced whole at 443 and 709 only when `d.application` exists; 691 spreads `prev`; no polling. Known limit, left on purpose by the owner: a failed `disputes` read at load gives `dispute: null`, so the worker sees "No action needed" and no response box until a reload (logged on Render since Section 217).
- **Section 221 (code):** 12 `error.message` uses in `jobs.ts`; 5 log-only, 7 returned to a client (75, 139, 226, 314, 379, 395, 627, four more than the three on record). Every client caller read: none shows or matches the text (`PATCH /:id/draft` has no frontend caller; the `GET /` and `/stats` callers read only `jobs` and `counts`). Patch: failure branch of each site only, `console.error` with route and ids plus a fixed generic message. Script `~/p189a.py` (writes only if all seven anchors match once; dry-tested on a stand-in file first); backup `jobs.ts.bak189a` (untracked). `tsc --noEmit` clean; diff read hunk by hunk. Commit `b27103c`, push `038e344..b27103c` first try, 46 untracked. Render build passed (live 18:21:54Z). Owner reported Browse opened properly.

## Findings
- Closed: the `myApp.dispute` sweep (by reading); the raw `error.message` returns in `jobs.ts`.
- New, by reading only: `apply` fails silently for the worker on any non-ok response (`JobDetail.tsx` 489); `/stats` returns zero counts on a failed read; Browse shows an empty list instead of its error state on a 500 from `GET /`; attachment fetches ignore errors in both `SubmissionReport.tsx` callers.
- Still open: throw-on-error in the payment path (blocked on Pi's repeat-complete behavior); `my-application` main read at 186 to 190; `workerCall` stale card on a 409; the four new frontend items; what `SubmissionReview.tsx` renders when `applications` is null; raw `error.message` in other route files (not swept).

## Not verified
None of the seven new log branches was run (they need failing reads or writes). Only `GET /` had a post-deploy happy-path check. Nothing in Section 220 was run.

## Files touched
Code: `backend/src/routes/jobs.ts` (`b27103c`). Docs: `roadmap.md` (Sections 220 and 221, complete file); `sessions/session-189.md`.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork` (HEAD should be the session 189 docs commit or later; last code commit `b27103c`; 46 untracked files), then `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`. Read the standing rule at the top of `roadmap.md`. Then, owner's choice: the silent `apply` (`sed -n '480,500p' ~/Piwork/frontend/src/pages/JobDetail.tsx`, then `grep -n "applying\|setApplied\|showApplyForm"` and every use) or the Browse empty-list-on-500 (`Jobs.tsx` 169 to 173 plus every use of `error` and `setError`). Grep the roadmap before proposing any live test.

Termux notes: untracked, not to be committed: 46 files expected (the 45 from Section 219 plus `jobs.ts.bak189a`). `~/p189a.py` is outside the repos. Run `git show <hash>` from `~/Piwork`, not `~/hivework-redesign`. Use `git --no-pager diff`. Backend deploy logs are Render's.
