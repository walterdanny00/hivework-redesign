# Session 110 — Piwork

## Focus
Single-slot jobs have no deadline: an approved worker who never submits never releases the escrow, and `/cancel` only works from `open`. Carried forward since session 107 as a product decision.

## Decision
Every single-slot job requires a fixed `deadline_at` date. No per-worker days for single-slot jobs. Existing jobs without a deadline are unchanged (the checker only acts on `deadline_mode = 'fixed'`).

## Starting-state check
- `cd ~/Piwork && git pull`: up to date; HEAD `0be183e` (session 109 brief + roadmap Section 124), on `main`, `git status --short` clean.

## Findings before coding
- `complete-slot` rejects single-slot jobs (`slots <= 1` → "Use /complete"), so single-slot has no other exit and no deadline logic in that route.
- Create and `PATCH /draft` stored `deadline_mode: null` for single-slot jobs; the approve-time late-approval block and the `slot_duration_days` write were gated on `slots > 1`.
- `slot_status` defaults to `'active'` (migration `20260706000000`). Single-slot submit sets `status: 'submitted'` and leaves `slot_status` `active`. Pass B only targets `status = 'approved'`, so a submitted worker is never marked missed.
- **Pass C counted only `approved` / `completed` as filled.** A submitted single-slot application would have looked unfilled, so after deadline + grace the job's "empty" slot would be closed and the full budget refunded while the worker's submission sat unreviewed.
- Submitted single-slot work has one exit, `/complete` (no reject path for submitted applications). `/complete` requires `in_progress`.
- `payments.ts`: a draft only flips to `open` in `completePayment`, after Pi has taken the money, so a stale-deadline check there would charge then refuse. The check belongs in `/approve`.

## Changes
- `backend/src/routes/jobs.ts`: `singleSlotDeadlineError()` (required, valid, future). Create and `PATCH /draft` apply it for `slots <= 1`; stored fields become `deadline_mode: 'fixed'`, `deadline_at` kept for single-slot or fixed, `slot_duration_days` only for multi-slot `per_worker`. Approve's late-approval block now covers single-slot jobs (own message pointing at cancel). `submit-work` now refuses (409) when the slot is `missed` or the job is `expired` / `cancelled` / `completed` / `partially_complete`; job select gains `status`, application select gains `slot_status`.
- `backend/src/lib/slotDeadlineChecker.ts`: Pass C counts `submitted` as filled.
- `backend/src/routes/payments.ts`: `/approve` refuses a draft whose fixed deadline has already passed, before any payment is approved.
- `frontend/src/pages/PostJob.tsx`: `minDeadline` (tomorrow, UTC); required deadline field on step 3 for one-worker jobs; `min` on the shared-date input; Deadline card on Review; `goReview` now returns to the first failing step instead of always step 1.
- `frontend/src/pages/JobDetail.tsx`: "Finish by" line for one-worker jobs; `mySlotState` reads `missed` for single-slot workers; "Mark complete" hidden when `slot_status` is `missed`.
- All patches applied with match-exactly-once Python scripts (abort on any mismatch); scripts deleted after use. `tsc --noEmit` clean on backend and frontend after each.

## Verification (testnet, deadlines backdated 26h in SQL)
- Create path: job `ded094fc-...` stored `fixed`, `2026-10-04 00:00:00+00`, one slot.
- **Never approved** (`ded094fc-8451-42f4-a6fb-66389ee980f0`, one pending applicant): job `expired`, `slots_closed = 1`, one 1.0000 refund with `application_id` null; pending application untouched. **Pass.**
- **Approved, never submitted** (`ac35bb37-32c4-46fe-ad95-0c25aa444c51`): job `expired`, `slots_closed = 0`, application `approved` / `missed`, one 1.0000 refund tied to the application, no null-id refund (no double-count). **Pass.**
- **Submitted before deadline** (`2c4b86b2-9ee6-4cc5-9623-f6ed35e92a56`): after 20+ minutes (about four cycles) job still `in_progress`, `slots_closed = 0`, application still `submitted`, no refund. Mark complete then paid one `job_completion` of 1.0000 and the job went `completed`. **Pass** (this is the Pass C fix).
- **Gap found on `ac35bb37`:** the missed worker could still submit (application became `submitted` with `slot_status = missed` on an `expired` job) and the owner saw Mark complete. `/complete` refused it ("Job is not ready to be completed") and no `job_completion` rows were written, so no money moved. A multi-slot missed worker would not have been stopped by that check; fixed by the `submit-work` guard and the UI change above.
- **Checked on device after `8b57d55`:** the `JobDetail` missed-state UI (worker "Deadline passed" panel, no Mark complete for the owner) and the "Job closed" display for the pending applicant in the never-approved test both displayed correctly.
- **Deploy-order finding:** job `fa0d4d5c-...` ("Cichgjifu", 08:10:59 UTC) was created with null deadline fields because Vercel's new form was live before Render's new backend. Render built at 08:03 but the new process only started at 08:16:09 (live 08:18:27), about 13 minutes later.

## Not verified
- `submit-work` guard has not been exercised against a real missed slot (single or multi-slot) after deploy; verified by code read and tsc only.
- `payments.ts` expired-draft refusal and `PATCH /draft` single-slot validation not exercised (no UI for draft edit).

## Commits
`f5c6252` (backend deadline requirement, Pass C, payments check, PostJob, JobDetail), `a5cc13b` (`goReview` routing), `76acd8b` (`submit-work` guard), `8b57d55` (JobDetail missed state). Docs commit follows with roadmap Section 125 and this brief.

## Files touched
`~/Piwork`: `backend/src/routes/jobs.ts`, `backend/src/routes/payments.ts`, `backend/src/lib/slotDeadlineChecker.ts`, `frontend/src/pages/PostJob.tsx`, `frontend/src/pages/JobDetail.tsx`. Docs: `hivework-redesign/roadmap.md` (Section 125), `hivework-redesign/sessions/session-110.md`.

## Notes
- Termux has no `/tmp`; keep patch scripts in `~`.
- The deadline picker sends a bare date, which parses as 00:00 UTC; the minimum offered is tomorrow so it is always future.
- Submissions are still accepted during the 24h grace after the deadline (the slot is `active` until Pass B runs); the deadline is not enforced at submit time.
- Wait for Render's "Your service is live" line before testing backend changes.

## Carried forward
- **Submitted work with no client review:** a single-slot job whose worker submitted but whose client never completes it holds the escrow indefinitely (`/complete` is the only exit). Needs a review-window decision.
- **Legacy single-slot jobs with no deadline** posted before this change keep the old behavior.
- **`per_worker` jobs never auto-close unfilled slots:** product decision whether they need a hiring window.
- Pass D: candidate query needs paging past 1000 rows; optional end-to-end test (testnet job with `slots_closed` set in SQL and no matching refund).
- Live tests owed from session 96: 50–150MB video upload end-to-end; 200MB combined pre-check.
- Watch item: `multer.memoryStorage()` RAM, worst case ~200MB per submit-work request.
- Files from overwritten submissions never deleted from storage.
- Category expansion: pending product decision on the 4 shell-only categories.
- Draft edit/resume-payment UI: `PATCH /:id/draft` exists, no UI; not requested.
- `JobDetail.tsx` token-redeclaration cleanup (parked).
- Standing: spot-check Vercel/Render deploys after pushes.
- Verify `MAX_DAILY_OUT...` cap vs `MAX_PAYOUT_PER_TX` before raising the per-tx limit (100pi left as-is by user decision).
- Cosmetic: if every approved worker misses and the client later closes the empty slots, the job ends `partially_complete` rather than `expired`.
- Session 102's throwaway job: account C's slot is still active (testnet).
- Throwaway jobs (testnet): `6e7e9809-951f-4cc7-8877-7172084827ae` (cancelled, one pending applicant); `fa0d4d5c-...` (no-deadline control, left untouched); `ded094fc-...` (expired, one pending applicant); `ac35bb37-...` (expired, application `submitted` + `missed`); `2c4b86b2-...` (completed).

## Closed this session
- Single-slot jobs have no deadline: required fixed deadline, backend and form.
- Pass C refunding a submitted single-slot job's slot (found before shipping, fixed).
- Missed or closed-job submissions accepted by `submit-work`.

## Next session
Pick from the carried-forward list. The review-window question for submitted-but-uncompleted work and the `per_worker` hiring window are the largest open items and need your call before any code.
