# Session 114 — Piwork

## Focus
Run the items session 113 left unverified (multi-slot paths first, then labels, notifications and the remaining dispute paths on device), close the catch-up migration, and fix whatever the checks turned up.

## Decisions
- **Requesting changes cancels a pending release offer.** The route clears both offer columns and the review clock as part of the same claim. The owner UI still shows Request changes while an offer is pending, and that is intended: it is how an owner withdraws an offer.
- **A worker-opened dispute (button) and a declined offer both pause auto-pay.** `review_due_at` is set to null when either opens a dispute, and the slot stays `submitted`.
- **The worker's work list labels a closed slot by `closed_reason`:** `released` shows "released", `dispute_refund` shows "refunded after dispute", null or `deadline` still shows "missed deadline".

## Starting-state check
- `cd ~/Piwork && git pull`: up to date; HEAD `5da6d00` (Session 113 brief + roadmap Section 128); `git status --short` printed nothing.

## Findings before coding
- `settlement.ts` claims each slot with a compare-and-set before any money moves (`slot_status = 'submitted'` for multi-slot, `status = 'submitted'` for single-slot). Pay and refund are mutually exclusive through `uq_baltx_slot_settlement`.
- `submit-work` marks a multi-slot submission as `status = 'approved'` + `slot_status = 'submitted'`, which is what `reevaluateJobs` and the credit-failure reopen in `paySubmittedSlot` assume.
- `paySubmittedSlot` treats a duplicate-key credit error as success, so in an odd state `increment_worker_stats` could run twice for one slot. Low priority, not changed.
- The worker "Your work" list printed "missed deadline" for every `missed` slot because `dashboard.ts` and `history.ts` returned only `missed` and not `closed_reason`. `JobDetail.tsx` already used `closed_reason`, which is why the job page was correct and the list was not.

## Changes
- `backend/src/routes/dashboard.ts` and `backend/src/routes/history.ts`: select and return `closed_reason` next to `missed`.
- `frontend/src/components/ApplicationCard.tsx`: `closed_reason` added to the type; the label now distinguishes released, refunded after dispute, and missed deadline.
- `supabase/migrations/20261009000000_disputes_grants.sql` (new, idempotent): row-level security on `disputes`, revoke from `anon` and `authenticated`, grant to `service_role`, and the `applications_status_check` constraint with `pending, approved, rejected, submitted, completed`. Run once in the SQL editor ("Success, no rows"), then committed.

## Verification (testnet)
- **Multi-slot, auto-pay one slot then dispute-refund the other** (job `a5dec4fb-807b-439b-8400-7fa224a3e059`, 2 slots, 1π each): backdating one clock paid only that slot (one `job_completion` credit, job still `in_progress`, the other slot untouched). Rejecting the other opened a dispute; admin `refund_owner` returned 200; slot `approved` / `missed` / `dispute_refund`, job `partially_complete`, exactly one 1.0000 `refund` credit with that application id. **Pass.**
- **Second resolve on the same dispute:** 409 "This dispute is already resolved." No money moved. **Pass.**
- **Both slots auto-paid in the same cycle** (job `e328b8a9-1a38-4e51-a484-1d63f19eea31`): both clocks backdated together; log showed two `Review auto-pay: paid.` lines 7 seconds apart; both applications `completed` / `completed`, job `completed`, exactly two 1.0000 `job_completion` credits, no refund rows. **Pass.**
- **`disputes` lockdown:** `anon` and `authenticated` hold no privileges (`has_table_privilege` false for both), `relrowsecurity` true. **Pass.**
- **On-device labels and notifications** (job `a5dec4fb-…`): owner Slots tab "Refunded after dispute" with "Dispute resolved: the slot was refunded to you"; worker timeline "Dispute decided"; owner notifications "Dispute resolved", "Refund available" (1.00π) and "Review window ended"; worker notifications "Work rejected" and "Dispute resolved"; worker "Payment sent" for the auto-paid job. **Pass.** Bug found and fixed: the worker work list said "missed deadline" for the refunded slot. After deploy it reads "refunded after dispute · 10/9/2026".
- **Worker declines a release offer** (job `f4788a7d-f256-47e4-be37-e81b8928ecc4`, single-slot): offer columns cleared, `review_due_at` null, slot still `submitted`, dispute opened with role `worker`, source `offer_declined`, and the worker's reason saved. **Pass.**
- **Admin resolve `pay_worker` on that dispute:** 200; application `completed`, job `completed` with `payout_claimed = true`, exactly one 1.0000 `job_completion` credit, no refund row. **Pass.**
- **Request changes while an offer is pending** (job `722fb8d7-9616-453c-ac45-f558e71786e5`): the button is visible and works; application `approved`, `revision_round` 1, `revision_due_at` set, note saved, both offer columns and `review_due_at` null. Worker page replaced the offer card with the changes banner and countdown. **Pass.**
- **Countdown after submit without a reload:** the worker's countdown appeared immediately after resubmitting; `status` `submitted`, `revision_due_at` null, `review_due_at` restarted. **Pass.**
- **Worker "Open a dispute" button** (same job): `review_due_at` null, slot still `submitted`, dispute with role `worker`, source `worker_opened`; worker sees "An admin is reviewing this submission" plus the response box, owner sees "In dispute" and the action buttons are gone. **Pass.**

## Not verified
- Two settlements racing in parallel (for example an admin resolve and an auto-pay on sibling slots at the same instant). Cycles settled slots one at a time, so this was not exercised; the compare-and-set claims and `uq_baltx_slot_settlement` are expected to make it safe.
- `hasOpenDispute` failing closed and the admin routes' try/catch (database-error paths).
- Olawalt's own notifications for auto-pay on the multi-slot jobs were not looked at; the same path paid and notified the other worker correctly.

## Commits
`cfa5b1c` (catch-up migration), `386c36b` (worker work list label). Deployed HEAD: `386c36b`.

## Files touched
`~/Piwork`: `supabase/migrations/20261009000000_disputes_grants.sql`, `backend/src/routes/dashboard.ts`, `backend/src/routes/history.ts`, `frontend/src/components/ApplicationCard.tsx`.

## Notes
- Open testnet state: job `722fb8d7-…` has an open worker-opened dispute (source `worker_opened`) on a submitted slot. Resolve it from Termux or leave it as a fixture for the admin page.
- Termux: `read -s KEY`, paste, then `export KEY` before any admin curl; the key is lost when the session ends. If curl says "Could not resolve host", it is the phone's connection, not the server.
- Admin outcomes are `pay_worker` and `refund_owner` (anything else returns 400).
- The same-cycle test settles slots one at a time (7 seconds apart in the log), so it confirms the job finalizes only after the last slot, not true concurrency.

## Carried forward
Everything in session 113's list still applies, minus the catch-up migration (done), plus a polish list from this session:
- **Owner message after auto-pay names no worker** ("Review window ended" cannot tell the owner which worker on a multi-slot job was paid).
- **"Changes requested" notification does not say a pending release offer was withdrawn.**
- **Owner card still shows the green "Submitted" pill next to the "Refunded after dispute" badge.**
- **Countdown rounding differs between owner ("1d 23h left") and worker ("2d 0h left") for the same deadline;** one shared helper would fix it.
- `paySubmittedSlot` runs `increment_worker_stats` even when the credit insert hit a duplicate key (low priority).
- Reminders to the owner at 24h and 6h before auto-pay, shared finalization helper, worker "dispute this request" link in the changes banner, split outcome for disputes, admin page, submission versions, approve-during-grace-window, reviewer delegation (`job_reviewers`) and dispute chat are all still open.

## Closed this session
- Every item on session 113's "Not verified" list except the database-error paths.
- The catch-up migration for `disputes` and `applications.status`.
- The worker work list mislabelling released and dispute-refunded slots as missed deadlines.

## Next session
Reminders to the owner before auto-pay (needs per-application reminder tracking), then the polish list above, submission versions so a dispute sees every evidence round, an admin page instead of curl, reviewer delegation (`job_reviewers`) and dispute chat. Start with `git pull`, `git log --oneline -5` and `git status --short`.
