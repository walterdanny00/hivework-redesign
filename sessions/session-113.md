# Session 113 — Piwork

## Focus
Build the review window decided in sessions 111 and 112: owner-chosen window at posting, request-changes with capped rounds, a dispute path with an admin decision, release offers, and auto-pay when the window runs out.

## Decisions
- **Review window applies to every new job**, single-slot included. Owner picks it once at posting: presets 48h / 72h / 7d / 14d, 72h preselected, backend accepts 48–336h and defaults a missing value to 72h. Clock starts at each submission and restarts on a resubmission. Shown to the worker before applying.
- **Request changes:** owner sends a note (10–1000 chars) and gives 24h–7d (default 48h); at most 2 rounds per slot. The slot goes back to in-progress, the review clock stops, the worker resubmits and the clock restarts. No grace on the revision deadline. If the worker never resubmits, the work goes back to the owner as submitted with a fresh review window (never a refund).
- **No final "reject and refund" by the owner alone.** **Reject** opens a dispute with a required reason (20–1000 chars); an admin decides. Reject is available any time work is submitted, including while change rounds remain (kept on purpose).
- **Offer release:** owner offers to cancel the slot with a refund; worker has 48h to accept (refund, no admin) or decline (dispute). **An ignored offer becomes a dispute automatically** (source `offer_expired`, opened by the system); silence never auto-refunds and never auto-pays. The review clock is paused while an offer is pending.
- **Disputes:** worker can open one too and add a response note. A dispute freezes the slot: no payment, no resubmission, no auto-pay. Only an admin resolves it: **pay worker** or **refund owner** (no split in v1). The project owner is admin; the first admin tool is a curl endpoint protected by a shared key header, no admin page yet.
- **Expiry pays the worker** (auto-pay), skipping any slot with an open dispute, a pending offer or a live revision. Ships dry-run by default; real payments only when `REVIEW_AUTOPAY_LIVE=true`.
- A slot closed by release or dispute refund reuses the existing closed-and-refunded state (`slot_status = 'missed'`) with a new `applications.closed_reason` (`released` / `dispute_refund`; null means deadline) so labels differ but every existing refund and finalization path still works.

## Starting-state check
- `cd ~/Piwork && git pull`: up to date; HEAD `80f2a60` (Session 112 brief + roadmap Section 127); `git status --short` printed nothing.

## Findings before coding
- The only mention of disputes in the repo was two comments about a future hold feature; nothing existed.
- `payments.ts` `/complete` is the Pi payment completion. Job completion is `jobs.ts` `/:id/complete` (job-level `payout_claimed` claim; its comments say it is deliberately untouched after BUG-100 to BUG-110) and `/:id/complete-slot` (per-application claim). The payout sequence is duplicated in both.
- `submit-work` stored no timestamps and allows resubmission while `submitted`. `GET /:id` already returns `select('*')`, so new job columns reach workers with no change; the two applications endpoints needed the new columns added.
- `public.users` has no `role` column (the earlier list was merged with Supabase's auth table), and no admin code existed.
- `applications.slot_status` CHECK allows only `active, submitted, completed, missed`; `applications.status` CHECK has no new values; `jobs.status` allows `expired`. Hence the `closed_reason` approach instead of new states.
- `uq_baltx_job_completion` is not live (index list shows only `uq_baltx_slot_refund` and `uq_baltx_slot_settlement`); it was dropped by hand. The one-credit-per-slot guarantee rests on `uq_baltx_slot_settlement`, which only covers credits that carry `application_id`.
- Pass D (job-level refund reconcile) is driven by `slots_closed` and `status = 'cancelled'` and counts only refunds with null `application_id`. Per-slot refunds never touch either, so it cannot double-count them.
- `reevaluateJobs` counted only `active` slots as in flight, so a job could be marked finished while another worker's submitted work still awaited review. Fixed: submitted slots now keep the job open.
- The project compiles without strict null checks, so `{ ok: true } | { ok: false }` unions do not narrow after `if (!result.ok)`. Result types are one flat shape.
- A new table created in the SQL editor is not usable by the backend until `service_role` is granted on it (see Verification).

## Changes
- `supabase/migrations/20261004000000_review_window_and_disputes.sql`: `jobs.review_window_hours` (CHECK 48–336); `applications.submitted_at, review_due_at, revision_round (default 0), revision_due_at, changes_note, release_offer_at, release_offer_expires_at`; partial indexes; `disputes` table (one open dispute per application via unique partial index, CHECKs on role/source/status/outcome). All nullable or defaulted, applied before the backend.
- `supabase/migrations/20261005000000_settlement_and_dispute_response.sql`: `applications.closed_reason` (CHECK `deadline | released | dispute_refund`), `disputes.worker_response`, `disputes.worker_responded_at`.
- **Manual SQL, not in a migration file yet:** `grant select, insert, update, delete on table public.disputes to service_role;`. Without it every dispute write failed with `permission denied for table disputes`.
- `backend/src/routes/jobs.ts`:
  - create and `PATCH /draft` validate and save `review_window_hours`.
  - `submit-work` writes `submitted_at` and `review_due_at` in the same conditional update, clears `revision_due_at` and any release offer, returns the clock to the client, and refuses while a dispute is open.
  - `POST /:id/request-changes` (owner, `MAX_REVISION_ROUNDS = 2`, compare-and-set on `revision_round` and the submitted state).
  - `POST /:id/reject`, `POST /:id/offer-release` (48h, compare-and-set), `POST /:id/respond-release` (worker: accept refunds, decline opens a dispute), `POST /:id/open-dispute` and `POST /:id/dispute-response` (worker).
  - `/complete` and `/complete-slot` return 409 while a dispute is open.
  - owner applications list and `my-application` return the review fields, `closed_reason` and the latest dispute.
- `backend/src/lib/disputes.ts`: `openDispute` (inserts the dispute, then freezes the slot back to its submitted state with every timer and offer cleared; deletes the dispute row if the slot was settled meanwhile) and `hasOpenDispute` (fails closed: a lookup error counts as "in dispute").
- `backend/src/lib/settlement.ts`: `refundSubmittedSlot` and `paySubmittedSlot`. Both claim the slot with a compare-and-set on the submitted state; the one-settlement-per-slot index makes pay-and-refund impossible. They are used by admin resolve, accepted releases and auto-pay. `/complete` and `/complete-slot` are not changed; the payout logic is intentionally duplicated for now.
- `backend/src/routes/admin.ts` (mounted at `/api/admin`): `GET /disputes` (open by default; both sides and the submission) and `POST /disputes/:id/resolve` (`pay_worker` or `refund_owner`, note required, money moves first and the dispute row closes after). Protected by header `x-admin-key` against env `ADMIN_API_KEY` (timing-safe); answers 503 if the variable is unset. try/catch on both routes.
- `backend/src/lib/notifications.ts`: types `changes_requested, review_returned, dispute_opened, dispute_resolved, release_offered, release_accepted, review_auto_paid`; helpers `notifyChangesRequested`, `notifyReviewReturned`, generic `notifyUser`.
- `backend/src/lib/slotDeadlineChecker.ts`: exports `creditRefundForSlot` and `reevaluateJobs`; Passes A and B skip slots with `revision_due_at`; `reevaluateJobs` waits while a slot is submitted; **Pass H** `returnLapsedRevisions`; **Pass I** `escalateExpiredReleaseOffers`; **Pass G** `autoPayExpiredReviews` (selects overdue `review_due_at` with no revision and no pending offer, skips open disputes, pays through `paySubmittedSlot`, notifies the owner; dry-run unless `REVIEW_AUTOPAY_LIVE === 'true'`, logging each application once per process). Run order: A, B, C, E, F, H, I, G, `reevaluateJobs`, `reconcileMissingRefunds`, `reconcileJobLevelRefunds`.
- `frontend/src/pages/PostJob.tsx`: review-window chips (48h / 72h / 7d / 14d, 72h preselected) at the end of step 3, and a line on the review card.
- `frontend/src/pages/JobDetail.tsx`:
  - worker header shows the deadlines (finish-by, hiring-closes, days per worker, shared deadline); owner header shows the review window; apply panel tells the worker the window.
  - countdowns on both sides ("Review by …" for the owner, "paid automatically on …" for the worker), applied immediately after a submit.
  - owner: Request changes (note and time picker), Offer release, Reject (reason), dispute and pending-offer banners, Mark complete hidden during a dispute, labels "Released" / "Refunded after dispute" / "In dispute".
  - worker: changes-requested banner with the owner's note and countdown, release-offer panel (accept / decline), "Open a dispute", dispute response box, closed-slot explanations by `closed_reason`.
- Patches applied with match-exactly-once Node scripts `p113a`–`p113j`; `tsc --noEmit` clean on backend and frontend after each (one fix needed: `p113h` flattened the result types).

## Verification (testnet)
- **Review window at posting** (job `e768318c-0af3-4520-af68-077fd803a3ac`): 48h chip saved; review card shows it; worker apply panel shows the window; SQL: `review_due_at` exactly 48h after `submitted_at`. Owner "Review by … (1d 23h left)" and worker "paid automatically on …" lines checked on device. **Pass.**
- **Worker header deadline** ("Finish by …") shown on the worker view. **Pass.**
- **Request changes** (jobs `66b6a530-1604-4b79-994a-684b6eebc786` and a second one): composer, round 1 and round 2 (24h) with the owner's note on the worker banner, owner banner "Changes requested (round N of 2)", resubmit restarts the clock and the button count drops to "(1 left)", worker notification. **Pass.**
- **Pass H:** with `revision_due_at` backdated, within one cycle the slot returned to `submitted`, `revision_due_at` null, `revision_round` still 2, `review_due_at` about 48h out; owner got "Revision deadline passed". **Pass.**
- **Offer release accepted by the worker:** reported working on device. (Ledger and label details were not captured.)
- **Reject:** first failed with `permission denied for table disputes` (missing grant, fixed by the `service_role` grant above). After that: dispute row created with the owner's reason, worker response saved, admin list shows both sides and the submission. **Pass.**
- **Admin resolve `refund_owner`** (job `cf5a7956-d801-4825-8ec9-64db3646c0fa`): application `approved` / `missed` / `dispute_refund`, job `expired`, exactly one 1.0000 `refund` credit to the owner, dispute `resolved` with the note. **Pass.**
- **Admin resolve `pay_worker`** (job `ed90c54f-07d1-435b-bc2b-fcf24d45b455`): application `completed`, job `completed`, exactly one 1.0000 `job_completion` credit to the worker, no refund row. (A single-slot application keeps `slot_status` `active`, the same as `/complete`.) **Pass.**
- **Pass I** (job `6cf69c92-2012-4344-bf27-5ed7f4653bda`): an unanswered offer, once expired, became a dispute with source `offer_expired`, role `system`, status `open`; the slot stayed `submitted` with the offer cleared; no money moved. Resolving that dispute as `refund_owner` produced exactly one 1.0000 `refund` credit. **Pass.**
- **Auto-pay dry-run** (job `84254299-46c1-45c8-b97c-ed968251c1be`): with `review_due_at` backdated, the log showed `Review auto-pay [DRY-RUN]: would pay.` once; slot unchanged and no ledger rows. **Pass.**
- **Auto-pay live:** after setting `REVIEW_AUTOPAY_LIVE=true`, six seconds after startup the log showed `Review auto-pay: paid.` for that application only; application `completed`, job `completed`, exactly one 1.0000 `job_completion` credit; after another checker cycle still exactly one row. **Pass.**
- **Auto-pay never pays a disputed slot** (job `6cf69c92-…`): `review_due_at` left overdue for 1h57m (about 23 cycles) with an open dispute: still `submitted`, ledger empty. **Pass.**
- **Auto-pay never pays a slot with a pending offer** (job `e9db14bf-49fe-4287-9e36-e6949d162a3d`): overdue for 8 minutes (at least one full cycle) with the offer pending: still `submitted`, offer intact, ledger empty. **Pass.**

## Not verified
- A second `resolve` call on an already-resolved dispute returning 409 (never run).
- On-device labels "Refunded after dispute" and "Dispute decided", the "Dispute resolved" notifications, and the "Payment sent" / "Review window ended" notifications after auto-pay.
- Worker-side "Open a dispute" button, declining a release offer, requesting changes while an offer is pending (route clears the offer).
- Everything above was run on single-slot jobs only. The multi-slot branches (refund, pay, `reevaluateJobs` with a submitted slot beside a completed or refunded one, auto-pay) were read in code and type-checked only.
- The immediate countdown after a submit without a reload (patch E) was not separately confirmed.
- `hasOpenDispute` failing closed and the admin routes' try/catch were not exercised.
- Whether `anon` and `authenticated` were revoked on `disputes` (they hold `REFERENCES`, `TRIGGER`, `TRUNCATE` only; not confirmed removed).

## Commits
`faddb5f` (worker header deadlines, review window on owner header, countdown after submit), `c887d77` (request changes), `ad9ee70` (disputes, reject, offer release, settlement helpers, admin resolve, Pass I). Deployed HEAD when auto-pay went live: `584c8a6`. Earlier and later ones: `git log --grep "Session 113"`. Docs commit follows with roadmap Section 128 and this brief.

## Files touched
`~/Piwork`: `backend/src/routes/jobs.ts`, `backend/src/routes/admin.ts`, `backend/src/index.ts`, `backend/src/lib/disputes.ts`, `backend/src/lib/settlement.ts`, `backend/src/lib/notifications.ts`, `backend/src/lib/slotDeadlineChecker.ts`, `frontend/src/pages/PostJob.tsx`, `frontend/src/pages/JobDetail.tsx`, `supabase/migrations/20261004000000_review_window_and_disputes.sql`, `supabase/migrations/20261005000000_settlement_and_dispute_response.sql`. Docs: `roadmap.md` (Section 128), `sessions/session-113.md`.

## Notes
- **Render environment:** `ADMIN_API_KEY` (admin endpoints) and `REVIEW_AUTOPAY_LIVE=true` (auto-pay) are set on Render. Auto-pay is live on testnet.
- **Admin resolve from Termux:** `curl -sS -i -X POST -H "x-admin-key: $KEY" -H "content-type: application/json" -d '{"outcome":"refund_owner","note":"…"}' https://hivework-backend.onrender.com/api/admin/disputes/<id>/resolve`; list with `GET /api/admin/disputes`. `$KEY` is empty in a new Termux session: `read -s KEY`, paste, `export KEY`.
- **Deploy order:** run both migrations first, then the grant on `disputes`, then push; the checker already tolerates old rows (null timers).
- Refunds return the budget share only, so the 7% platform fee is kept, same as missed-deadline refunds.
- Jobs and submissions from before this session have no review window and no `review_due_at`, so they are never auto-paid and still hold forever if the owner never reviews.
- Dispute resolution moves money first and closes the dispute row after. If the second step fails the API says so and the row must be closed by hand in SQL.
- Notification text shows deadlines in GMT while the pages show local time (cosmetic).
- Stale cache after a redeploy is a recurring problem (clear cache and refresh). There is no service worker; `vercel.json` uses the old `routes` format. A `Cache-Control: no-cache` header on `index.html` is the likely fix but was not checked against Vercel's docs.
- Download each patch file to `~/storage/downloads` before running `cp`; the first `p113g.js` run failed only because that was skipped.
- Termux has no `/tmp`; keep patch scripts in `~`.

## Carried forward
Everything in session 112's list still applies, plus:
- **Reminders to the owner** at 24h and 6h before auto-pay: not built (needs per-application reminder tracking so the 5-minute checker does not repeat them).
- **Catch-up migration:** the `service_role` grant on `disputes` (and a revoke from `anon` / `authenticated`), and the `applications.status` values added by hand earlier.
- **Shared finalization helper:** job finalization is now copied in `complete-slot`, `reevaluateJobs` and the settlement helpers; `/complete` and `/complete-slot` still carry their own payout code.
- **Worker "dispute this request" link** inside the changes-requested banner (backend already allows a worker dispute during a revision).
- **Split outcome** for disputes: the `disputes` table allows it but the one-credit-per-slot index does not; needs new ledger kinds.
- **Admin page** instead of curl; `resolved_by` is null for key-based resolves.
- Submissions are still overwritten on resubmit (no versions), so a dispute sees only the latest evidence.
- Disable Approve during the hiring grace window (from session 112).
- Testnet jobs from this session: `e768318c-…`, `66b6a530-…`, `cf5a7956-…` (refunded), `ed90c54f-…` (paid), `84254299-…` (auto-paid), `6cf69c92-…` (refunded), `e9db14bf-…` (pending offer, still open).

## Closed this session
- Submitted work could be held forever by an owner who never reviewed (single-slot and multi-slot): the review window and auto-pay now end it.
- The owner had only "Mark complete" on a submission: now Request changes, Offer release and Reject.
- There was no dispute record, no admin path and no way to stop a payment: disputes, the admin resolve endpoint and the dispute guards now exist.
- `hasOpenDispute` (new) would have failed open on a database error: fixed to fail closed before auto-pay shipped.
- `reevaluateJobs` could finalize a job while a submitted slot was unpaid: fixed.

## Next session
Run the unverified items above (starting with the multi-slot paths and the notification and label checks on device), then reminders, the catch-up migration, submission versions (evidence for disputes), an admin page, reviewer delegation (`job_reviewers`), dispute chat.
