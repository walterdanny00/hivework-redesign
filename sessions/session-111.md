# Session 111 — Piwork

## Focus
Open product questions from session 110 (review window for submitted work, hiring window for `per_worker` jobs). Before designing them, read the real schema and money code to find a model that does not conflict with what exists.

## Decisions
- `per_worker` jobs get an application deadline (hiring window).
- Review window, reject/dispute, reviewer delegation and chat: direction agreed in principle, details **not yet decided** (see Next session).

## Starting-state check
- `cd ~/Piwork && git pull`: up to date; HEAD `35bbc2d` (session 110 brief + roadmap Section 125), `git status --short` clean.

## Findings before coding
- Money already moves only through the `balance_transactions` ledger; Pi moves at withdrawal. Unique indexes block a double completion credit (`uq_baltx_job_completion`) and a double slot refund (`uq_baltx_slot_refund`).
- `closeSlotAndRefund` in the checker already claims the slot with a conditional update. The race was entirely on the `submit-work` side.
- `submit-work` checked slot state, uploaded files, then wrote unconditionally, so a slot closed mid-upload could flip from `missed` back to `submitted` (multi-slot).
- Worker credits did not store `application_id`, so the database could not tell a paid slot from a refunded one.
- The 23505 "already credited" shortcut in `/complete` and `/complete-slot` would misread an "already refunded" conflict as success once the new index exists.
- Multi-slot `submit-work` changes only `slot_status`; the worker lists sent `status` and a `missed` flag, so the worker saw "approved" after submitting.
- Live `applications.status` allows `submitted`, but no repo migration adds it (hand-edited database).
- Pass D is dry-run unless `JOB_REFUND_RECONCILE_LIVE === 'true'` and needs a repeated shortfall; a unique index there would be wrong (job-level refunds repeat).
- Submitted multi-slot work is invisible to the checker (only `active` slots), same hold-forever risk as single-slot.

## Changes
- `backend/src/routes/jobs.ts`: `submit-work` final write is conditional (`status in approved/submitted`, `slot_status in active/submitted`, zero rows → delete uploads, 409). `/complete` and `/complete-slot` write `application_id` on the `job_completion` credit and call new `slotAlreadyRefunded()` so a duplicate-key error on a refunded slot is a real failure.
- `supabase/migrations/20261003000000_slot_settlement_unique.sql`: `uq_baltx_slot_settlement` unique on `application_id` where `kind in ('job_completion','refund')` and `application_id is not null`. Run in the Supabase SQL editor.
- `backend/src/routes/dashboard.ts`, `backend/src/routes/history.ts`: worker lists send `slot_status`.
- `frontend/src/components/ApplicationCard.tsx`: shows "submitted" when `slot_status === 'submitted'`.
- Patches applied with match-exactly-once Python scripts; `tsc --noEmit` clean on backend and frontend.

## Verification (testnet)
- Index pre-check: no slot had both a refund row and a completed status. Index created without error.
- `submit-work` normal submit after the conditional write: saved. **Pass.**
- `/complete` on single-slot job `fe84ba63-eb25-41b8-9cc4-24afa2459a94`: credit written with `application_id`. **Pass.**
- `/complete-slot` on multi-slot job `685d4fe5-90d0-4581-8f41-8ce9fe34ac2e`: credit written with `application_id`. **Pass.**
- Worker Dashboard card showed "submitted" for the multi-slot application, checked on device. **Pass.**

## Not verified
- The race itself (needs a slow upload colliding with the checker): code read and `tsc` only.
- The `slotAlreadyRefunded` branch: unreachable now that the guards exist; code read and `tsc` only.
- Resubmission while `submitted`: allowed by the route, no UI to exercise it.

## Commits
`4cd6b68` (ledger index migration + completion routes), `1224a87` (`slot_status` in worker lists), `ab39485` (card label). The `submit-work` conditional-write commit: `git log --grep "submit-work: conditional write"`. Docs commit follows with roadmap Section 126 and this brief.

## Files touched
`~/Piwork`: `backend/src/routes/jobs.ts`, `backend/src/routes/dashboard.ts`, `backend/src/routes/history.ts`, `frontend/src/components/ApplicationCard.tsx`, `supabase/migrations/20261003000000_slot_settlement_unique.sql`. Docs: `hivework-redesign/roadmap.md` (Section 126), `hivework-redesign/sessions/session-111.md`.

## Notes
- Old `job_completion` rows have `application_id` null and are not covered by the new index.
- If the new index ever blocks a payment on a refunded slot, `/complete-slot` puts the slot back to `submitted` through its existing failure path; this should be unreachable.
- If the checker tried to refund an already-paid slot, the insert would fail and log every cycle; no money moves.
- Resubmit-while-`submitted` has no UI yet.
- Termux has no `/tmp`; keep patch scripts in `~`.

## Design agreed as principles
Compare-and-set transitions; ledger-only money; one absolute-timestamp column per wait; additions only (no status rewrite); read-only `slotState()` helper for new code. Old jobs get no new timers.

## Carried forward
Everything in session 110's list still applies, plus:
- **Product decisions needed:** what happens when a review window expires (proposed: pay the worker); who sets the window (proposed: the owner at posting, per submission); reject = request changes (capped rounds) or dispute, never refund-on-reject.
- **Build order (proposed):** `per_worker` application deadline → review window, request-changes, submission versions, disputes, admin flag → reviewer delegation (`job_reviewers`) → dispute chat.
- `finalizeJobIfDone()` shared helper (finalization logic is duplicated in `complete-slot` and the checker).
- Catch-up migration for `applications.status` including `submitted`.
- Check `JOB_REFUND_RECONCILE_LIVE` on Render.
- Multi-slot submitted work has no exit if the owner never reviews (same issue as single-slot).
- Testnet throwaways: `fe84ba63-eb25-41b8-9cc4-24afa2459a94` (completed), `685d4fe5-90d0-4581-8f41-8ce9fe34ac2e` (multi-slot, one slot completed).

## Closed this session
- Multi-slot `submit-work` write could reopen a missed slot.
- A slot could be both paid and refunded (database now blocks it).
- Multi-slot worker saw "approved" after submitting.

## Next session
Build the `per_worker` application deadline. Needs your call first: the review-window expiry default (pay the worker or refund the owner) and the timeout owner-choice rule above.
