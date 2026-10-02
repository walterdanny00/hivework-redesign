# Session 107 — Piwork

## Focus
`fixed` mode option C: auto-close and refund never-filled slots at deadline + grace.

## Starting-state check
- `cd ~/Piwork && git pull`: already up to date; HEAD `6622044` (session 106 brief + roadmap Section 121); `git status --short` clean.
- Read `backend/src/lib/slotDeadlineChecker.ts` (243 lines), the `close-slots` route (`jobs.ts` ~296-400) and `countFilledSlots` (`jobs.ts` line 36).

## Findings before coding
- Pass A (`per_worker`) and Pass B (`fixed`) only act on approved + active slots: they mark the slot `missed`, refund its share (per-slot, `application_id` set, idempotent via `uq_baltx_slot_refund`) and `reevaluateJobs` finalizes the job.
- Slots nobody was ever approved into had no automatic path. On a `fixed` job with no approvals the job sat `open` forever; nothing outside the checker ever sets `expired`.
- `countFilledSlots` counts `approved` + `completed`, and missed slots keep status `approved`, so a missed slot counts as filled and cannot be refunded twice by the new pass.
- Only multi-slot `fixed` jobs have `deadline_at` (`jobs.ts` ~173-198, 211-235). Single-slot jobs and `per_worker` jobs have none.

## Decisions
- Option C applies to `fixed` jobs only, status `open` or `in_progress`, `deadline_at` + 24h grace passed (same cutoff as Pass B).
- Same atomic claim as `close-slots`: update `slots_closed` with a compare-and-swap on its old value. The refund is job-level (`application_id` null), so there is no unique index; the CAS is the only guard. If the credit insert fails, `slots_closed` is rolled back so the next 5-minute cycle retries.
- Pass C runs after Pass B in `checkSlotDeadlines`, and its job ids go into the same `reevaluateJobs` call, so finalization (`expired` / `completed` / `partially_complete`) is unchanged.
- Pending (never approved or declined) applicants are left untouched; see Carried forward.

## Changes
`backend/src/lib/slotDeadlineChecker.ts` (+63 / -1): new `closeUnfilledFixedDeadlineSlots()` (Pass C), and `checkSlotDeadlines` now runs passes `a`, `b`, `c` into `reevaluateJobs`. Applied with a Python match-exactly-once patch script (aborts if an anchor matches other than once, or if Pass C already exists).

## Verification
- `tsc --noEmit` clean; `git diff --stat`: one file, +63 / -1.
- The first live test showed no change because the commit had not been pushed yet; after the push and Render deploy (the checker also runs once at startup) both scenarios passed. Testnet, 2-slot `fixed` jobs with budget 2, `deadline_at` backdated 26h in SQL:
  - **Scenario 1, no approvals** (`25f0fc08-ec71-485c-91f3-5fc2e4a66bb6`): job went `expired`, `slots_closed = 2`, exactly one `refund` of 2.0000 with `application_id` null. Pass.
  - **Scenario 2, one approved worker who never submitted** (`5eb5cb01-82aa-452c-96d5-e60436c042b5`): approved slot went `missed` with a 1.0000 refund tied to its application (Pass B), then Pass C refunded the empty slot 1.0000 with `application_id` null; `slots_closed = 1`, job `expired`. Total 2.0000 = full budget, each slot refunded once, no double-count. Pass.

## Commits
`51fb4ba` (Slot checker: Pass C closes and refunds never-filled slots on fixed-deadline jobs past deadline + grace). Docs commit follows with roadmap Section 122 and this brief.

## Files touched
`~/Piwork`: `backend/src/lib/slotDeadlineChecker.ts`. Docs: `hivework-redesign/roadmap.md` (Section 122), `hivework-redesign/sessions/session-107.md`.

## Notes
- Known risk: if the server dies between the `slots_closed` update and the refund insert, slots stay closed with no refund and nothing retries it. Milliseconds-wide window; `close-slots` has the same exposure. Accepted for now.
- Pass C does not cover `per_worker` jobs (no job-level deadline) or single-slot jobs (no deadline at all).
- Throwaway jobs `25f0fc08-...` and `5eb5cb01-...` are both `expired` and fully refunded (testnet). Harmless.

## Carried forward
- **Pending applicants on closed jobs (new):** after a job goes `expired` / `partially_complete` / `completed`, or after the owner closes slots, applicants who were never approved still show Approve & Assign / Decline on the owner side and "pending" on the worker side (seen in screenshots). Proposed fix: frontend only, hide the controls and show "Job closed"; check `JobDetail.tsx` and `ApplicationCard.tsx`. Applies to both deadline modes.
- **No cancel-job UI (new):** backend `/cancel` exists (`jobs.ts` ~252; open job with zero slots filled only) but there is no button, so an owner with no applicants cannot recover the escrow from the app.
- **Single-slot jobs have no deadline (new):** from the code read this session, an approved worker who never submits on a single-slot job never releases the escrow, and `/cancel` only works with zero slots filled. Not checked: whether another exit exists in `complete-slot`. Likely fix: let single-slot jobs use `fixed` + `deadline_at` (post-job validation lines ~173-235, the post-job form, the `slots > 1` gate in `approve-application`). Product decision.
- **`per_worker` jobs never auto-close unfilled slots (new):** no job-level deadline, so only a manual close-slots does it. Product decision whether they need a hiring window.
- **Crash window (new):** see Notes; consider a reconcile pass for job-level refunds.
- Live tests owed from session 96: 50–150MB video upload end-to-end; 200MB combined pre-check.
- Watch item: `multer.memoryStorage()` RAM, worst case ~200MB per submit-work request.
- Files from overwritten submissions never deleted from storage.
- Category expansion: pending product decision on the 4 shell-only categories.
- Draft edit/resume-payment UI: `PATCH /:id/draft` exists, no UI; not requested.
- `JobDetail.tsx` token-redeclaration cleanup (parked).
- Standing: spot-check Vercel/Render deploys after pushes (this session's first test ran before the deploy).
- Verify `MAX_DAILY_OUT...` cap vs `MAX_PAYOUT_PER_TX` before raising the per-tx limit (100pi left as-is by user decision).
- Cosmetic: if every approved worker misses and the client later closes the empty slots, the job ends `partially_complete` rather than `expired`.
- Remove the stray `frontend/src/pages/HistoryJobs.tsx.bak`.
- Session 102's throwaway job: account C's slot is still active (testnet).
- Session 105's throwaway job `4ca119ab-...`: one approved worker (testnet); after `2026-10-03 00:00 UTC` + 24h grace the checker marks that slot `missed` and refunds it; with Pass C it also refunds the empty slot and the job ends `expired`. A free live check of Pass C on real data.

## Closed this session
- `fixed`-mode option C (auto-close and refund empty slots at deadline + grace): shipped and verified.

## Next session
Pick from the carried-forward list. Quick wins: the `.bak` removal; the pending-applicant "Job closed" display and the cancel-job button are both small frontend changes.
