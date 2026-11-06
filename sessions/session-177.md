# Session 177 — Hivework

2026-11-06. No code commit. Read-only session: the Section 191 "terminal status set then restored" item is closed by code read (Section 192).

> **Standing rule (top of `roadmap.md`).** Grep the roadmap before proposing any test; list **every** use of a flag, type or message before changing it; narrowest patch; `tsc` and `git diff --stat` before commit; deliver the **complete** `roadmap.md`, never a section-only file.

## Focus
The first Not-verified item from Section 191, introduced by session 176 itself: could a job be set to a terminal status and later restored, so that Pass J (`rejectPendingOnClosedJobs`) rejects an applicant who should still be pending? Roadmap grepped first: line 10190 was the only record ("not read").

## Starting-state check (reported)
`git pull` in `~/Piwork`: up to date. HEAD `746ec66` (`docs: session 176, roadmap section 191`), then `a25e43e`, `0f34959`. `git status --short`: the seventeen untracked backup files. `diff -rq` printed nothing. Roadmap sha256 `f5feea198d2c5a66`, 10200 lines, identical in both repos (closes the Section 191 hash gap).

## Work (read-only, `~/Piwork/backend/src` at `746ec66`)
- Every literal job status write, every `jobs` update (multi-line chains included), every `rpc(` call, and the migrations (`create trigger`, `new.status`, `update jobs`).
- Only writes that move a job out of a terminal status would matter. Found none: `payments.ts` 86 acts only on a `draft` job; `jobs.ts` 707 is guarded to `open` (single-slot) or `open` / `in_progress` (multi-slot); `slotDeadlineChecker.ts` 335 writes only `closed`, `expired`, `completed` or `partially_complete`, and skips `cancelled`; every other `jobs` update touches `slots_closed`, `payout_claimed`, `payment_id` or the edit columns.
- RPCs: none writes a job status. Migrations: the only `update jobs` is `applications_count` in `increment_applications`; no `create trigger` and no `new.status`.

## Findings
- Closed: the rollback-window item. Pass J cannot reject an applicant in a rollback window; no code path, RPC or committed SQL function restores a terminal job.
- New: none. Still open as in Section 191.

## Not verified
- Read, not run; a rollback cannot be forced.
- A trigger or function created only in the Supabase SQL editor and never committed would not show in these greps; manual SQL-editor status edits are outside the check.
- Guards on `jobs.ts` 399, 1126 and `settlement.ts` 184, and the early return in `reevaluateOne` (Section 180), were not re-read this session.
- Everything else on the Section 191 Not-verified list stands (100-row bound, live runs of terminal paths other than `cancelled`, declined worker's page on an ended job, deploy hash check, Section 190 list).

## Files touched
None in code. Docs: `roadmap.md` (Section 192, complete file); `sessions/session-177.md`.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork` (HEAD should be the session 177 docs commit or later; last code commit still `a25e43e`), then `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`. Read the standing rule at the top of `roadmap.md`. Then pick from the Still-open list in Section 192, grepping the roadmap before proposing any live test and listing every use of a flag before changing it.

Termux notes: untracked, not to be committed (seventeen, unchanged). No files created or patched on the phone this session.
