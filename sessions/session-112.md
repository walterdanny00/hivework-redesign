# Session 112 — Piwork

## Focus
Build the `per_worker` application deadline (hiring window) decided in session 111, and settle the two product questions that were holding up the review-window work.

## Decisions
- `per_worker` jobs get a required hiring-close date (`jobs.applications_close_at`). After it passes, no one can apply or be approved. Unfilled slots are refunded and pending applicants rejected after the 24h grace period.
- **Review window expiry: pay the worker.** If the owner never reviews inside the window, the submission is paid automatically. Guards agreed: auto-pay pauses while a dispute is open; a request-changes resets the clock.
- **Who sets the window: the owner, once at posting, within platform min/max.** The clock starts at each submission. Shown to the worker before applying. Proposed bounds: 48h minimum, 14 days maximum, presets 48h / 72h / 7d / 14d. Reminders to the owner. Not built yet.

## Starting-state check
- `cd ~/Piwork && git pull`: up to date; HEAD `2bc7a3b` (session 111 brief + roadmap Section 126), `git status --short` clean.

## Findings before coding
- `/apply` checked only job status and free slots; no time check. `per_worker` jobs had no end to hiring at all.
- Pass C (never-filled slots) only ran for `deadline_mode = 'fixed'`; `per_worker` jobs were never auto-closed.
- Approve already blocked late approvals for fixed jobs; `per_worker` had no equivalent.
- `reevaluateJobs` already finalizes after closing slots (no approvals → `expired`, active workers → stays `in_progress`), so it is reused unchanged.
- `PostJob` posts the whole `form` object, so adding a form field is enough to send it.
- `getApplyableJobs` (Jobs list and category counts) did not select the new columns.

## Changes
- `supabase/migrations/20261003010000_jobs_applications_close_at.sql`: `alter table jobs add column if not exists applications_close_at timestamptz`. Nullable; old jobs keep no window. Applied in the Supabase SQL editor and verified (`timestamp with time zone`).
- `backend/src/routes/jobs.ts`: `applicationsCloseError()` (required, valid, future) on create and `PATCH /draft` for `per_worker` multi-slot jobs; the column is written only for them, null otherwise. `/apply` returns 409 "Applications for this job have closed." after the date. Approve returns 409 once the window has passed (message points to close-slots / refund). `getApplyableJobs` hides jobs whose window has closed.
- `backend/src/routes/payments.ts` `/approve`: refuses an unpaid draft whose hiring window already passed, before Pi approves the payment.
- `backend/src/lib/slotDeadlineChecker.ts`: **Pass E** `closeUnfilledPerWorkerSlots` (copy of Pass C for `per_worker` jobs with `applications_close_at` + `GRACE_MS` in the past: same `slots_closed` compare-and-set, same null-`application_id` refund row, same notification, rollback on credit failure). **Pass F** `rejectPendingAfterHiringClose` sets still-pending applications on those jobs to `rejected` (conditional on `pending`) and sends `notifyApplicationRejected`. Order in `checkSlotDeadlines`: A, B, C, E, F, then `reevaluateJobs`.
- `frontend/src/pages/PostJob.tsx`: "Hiring closes" date field (per-worker multi-slot only), validated on step 3, shown on the review card.
- `frontend/src/pages/JobDetail.tsx`: "Hiring closes" line; Apply button reads "Applications closed" after the date; rejected card says "Hiring for this job closed before your application was reviewed" when the window has passed (else the old "chose another applicant" text); slot bar shows closed slots hatched, summary adds "· N closed (refunded)".
- Patches applied with match-exactly-once Node scripts (`patch1`–`patch5`); `tsc --noEmit` clean on backend and frontend after each.

## Verification (testnet, job `0230b2ea-25f7-46bc-8657-05f901529a28`: 2 slots, per-worker, 1 day, budget 2π)
Setup: Olawalt approved (active slot), Eliza1914 pending.
- Create with a close date: saved, shown on Job Detail. **Pass.**
- `applications_close_at` backdated 1h: approving Eliza1914 refused with the hiring-closed message; her application stayed `pending`. **Pass.**
- Backdated 25h: within one cycle `slots_closed = 1`, job still `in_progress`, one `refund` credit of 1.0000 with `application_id` null. **Pass.**
- Pass F: Eliza1914 became `rejected`, Olawalt unchanged (`approved`). Owner side shows "Declined (1) · Job closed"; worker got "You weren't selected for 'Fuffg'". **Pass.**
- Finishing the job: Olawalt's slot completed by the owner in the app. Ledger for the job: the earlier 1.0000 `refund` (null `application_id`) plus one 1.0000 `job_completion` tied to Olawalt's application; no second refund. Job status after the last slot resolved confirmed correct on device. This is the one-completed-one-closed mix that had not been seen finalizing. **Pass.**
- Owner Dashboard card shows "1π refunded". Slot bar after the last deploy: one solid and one hatched segment, "1 of 2 slots filled · 1 closed (refunded)". Checked on device. **Pass.**

## Not verified
- Worker-side Apply button "Applications closed" and the Jobs list hiding a closed job (needs a fresh job; the test job's last slot is already closed).
- The new rejected-card wording on device (screenshot predates that deploy).
- Wizard validation messages for an empty or past close date (no UI test).
- The `payments.ts` expired-hiring-draft refusal (no UI).
- Pass E on a job with zero approvals (job → `expired`), reasoned from `reevaluateJobs`, not run.

## Commits
`cf8778f` (hiring-closed wording and closed-slot display). Earlier: `git log --grep "Session 112"` (hiring window; auto-reject pending applicants). Docs commit follows with roadmap Section 127 and this brief.

## Files touched
`~/Piwork`: `backend/src/routes/jobs.ts`, `backend/src/routes/payments.ts`, `backend/src/lib/slotDeadlineChecker.ts`, `frontend/src/pages/PostJob.tsx`, `frontend/src/pages/JobDetail.tsx`, `supabase/migrations/20261003010000_jobs_applications_close_at.sql`. Docs: `hivework-redesign/roadmap.md` (Section 127), `hivework-redesign/sessions/session-112.md`.

## Notes
- **Deploy order:** run the migration first (new backend selects the column), and avoid backend-before-frontend: a backend that requires the date with the old form returns 400 on every per-worker multi-slot post.
- Pending applicants can no longer be approved after the close date, but they are only rejected after the 24h grace. The owner should review before the window closes.
- The picker sends a bare date, read as 00:00 UTC; the UI check uses the browser clock.
- The rejected-card wording keys off "per_worker job past its window", so an owner's manual decline just before closing would also show the hiring-closed text.
- Old `per_worker` jobs have a null close date and no window.
- The owner Dashboard card stays "In progress" until the remaining active slots resolve; this is correct, now made clearer by the slot bar.
- Termux has no `/tmp`; keep patch scripts in `~`.

## Carried forward
Everything in session 111's list still applies minus the `per_worker` application deadline, plus:
- Disable the Approve button during the grace window (it currently fails on tap with the hiring-closed message).
- Optional: store a rejection reason on the application instead of inferring "hiring closed" from dates.
- Testnet throwaway `0230b2ea-25f7-46bc-8657-05f901529a28`: finished (Olawalt's slot completed and paid). The missed-slot-after-hiring-close path (a worker misses their deadline on a job whose hiring window already closed) is still untested; needs a fresh job.

## Closed this session
- `per_worker` jobs had no end to hiring and never auto-closed unfilled slots.
- Pending applicants on a closed `per_worker` job stayed pending forever.

## Next session
Build the review window: owner-chosen window at posting, auto-pay on expiry, request-changes (capped rounds, resets the clock), pause on dispute. Build order after that: submission versions, disputes, admin flag, reviewer delegation (`job_reviewers`), dispute chat.
