# Session 115 — Piwork

## Focus
Owner reminders at 24h and 6h before review auto-pay (the first item on Session 114's next-session list), plus the first polish item: name the worker in the auto-pay notice.

## Design
- **Tracking.** Two nullable `timestamptz` columns on `applications`: `review_reminded_24h_for` and `review_reminded_6h_for`. Each stores the `review_due_at` value the reminder was sent for. A reminder is due only when its column differs from the current `review_due_at`, so a resubmit or a return from changes re-arms both reminders without touching the places that set `review_due_at`.
- **New pass.** `remindOwnersBeforeAutoPay()` runs just before `autoPayExpiredReviews()` in `checkSlotDeadlines`. It selects submitted slots with a live review clock less than 24h away, no live revision and no pending release offer, skips any slot with an open dispute (`hasOpenDispute`, fails closed), and sends only the tightest crossed threshold (6h if 6h or less remains, otherwise 24h). After a checker outage the owner gets one reminder, not two.
- **Order and failure.** The sent-state column is written before the notification is queued, so a failed notification is never repeated every cycle (accepted: it is also never retried).
- **Dry-run.** When `REVIEW_AUTOPAY_LIVE` is not `true` the pass only logs once per application, tier and window, since a reminder would promise a payment that will not happen.
- **Notification.** New type `review_reminder`, title "Review window closing", names the worker and says they are paid automatically if the owner does nothing. The hours figure rounds up ("about N hours").

## Starting-state check
- `cd ~/Piwork && git pull`: up to date; HEAD `cdeeb2a` (Session 114 brief + roadmap Section 129); `git status --short` printed nothing.

## Findings before coding
- Pass G in `slotDeadlineChecker.ts` is the only auto-pay code; the checker polls every 5 minutes.
- The live `notifications` table has no check constraint on `type` (only the primary key and two foreign keys), so a new type inserts without a migration.
- The frontend has no per-type mapping of notification types, so this change is backend-only.
- The review window is at least 48 hours (default 72), so a 24h reminder can never fire right after a submit.

## Changes
- `supabase/migrations/20261011000000_review_reminders.sql` (new, idempotent): the two columns. Run once in the SQL editor ("Success, no rows"); both columns confirmed in `information_schema`.
- `backend/src/lib/notifications.ts`: `review_reminder` added to `NotificationType`.
- `backend/src/lib/slotDeadlineChecker.ts`: the new pass; Pass G now selects `worker_username` and the "Review window ended" body names the worker.

## Verification (testnet)
Job `c645b230-2a06-4916-a254-b710623d1ce9` (single slot, 1π, 48h window), application `67790a12-2024-4dec-b8da-433743eaab14`, worker Olawalt.
- **24h tier.** `review_due_at` set to now + 20h: log line `Review reminder: sent ... tier: 24h`; `review_reminded_24h_for` equal to `review_due_at`; one owner notification naming `@Olawalt` and "about 20 hours", also shown in the app. **Pass.**
- **No repeat.** About 8 further cycles later still exactly one notification. **Pass.**
- **6h tier.** `review_due_at` set to now + 5h: log line `tier: 6h`; `review_reminded_6h_for` equal to `review_due_at`; second notification "about 5 hours". **Pass.**
- **Re-arm and outage case.** Owner requested changes, worker resubmitted (new `review_due_at` 48h out, `revision_round` 1, `revision_due_at` null, both reminder columns still holding the old window's values). Jumping straight to now + 5h gave a 6h reminder only; `review_reminded_24h_for` kept its old value. **Pass.**
- **Same backdate run twice.** The second run stored a different `review_due_at` (now() had moved), so a second 6h reminder went out. Expected: the reminder is keyed to the exact window value, which in normal use only changes on a resubmit.
- **Auto-pay names the worker.** The window was left to run out: `Review auto-pay: paid.` logged about 3 minutes after `review_due_at`; owner notice "…so @Olawalt was paid automatically"; worker "Payment sent 1π"; application and job `completed`, `payout_claimed = true`, exactly one 1.0000 `job_completion` credit. **Pass.**

## Not verified
- Multi-slot jobs (code read and `tsc` only; the pass uses the same submitted-slot test as Pass G).
- The dry-run branch (`REVIEW_AUTOPAY_LIVE` is `true` on testnet, so it never ran).
- Exclusions for a live revision, pending release offer and open dispute: the first two are query filters and a disputed slot has a null `review_due_at`, so none of them reaches the pass; none was exercised against a real row. `hasOpenDispute` failing closed inside this pass was not exercised.
- The `markError` path (the sent-state write failing).

## Commits
`d53393a` (migration, `notifications.ts`, `slotDeadlineChecker.ts`). Deployed HEAD: `d53393a`.

## Files touched
`~/Piwork`: `supabase/migrations/20261011000000_review_reminders.sql`, `backend/src/lib/notifications.ts`, `backend/src/lib/slotDeadlineChecker.ts`.

## Notes
- Open testnet state: job `722fb8d7-…` has an open worker-opened dispute (fixture); job `e9db14bf-…` has a pending release offer; job `c645b230-…` is completed.
- Jobs and submissions from before Section 128 have no review window, so they get no reminders (same as no auto-pay).
- The reminder text carries no link; the owner finds the job from the notification's job reference.

## Carried forward
Everything in Session 114's list still applies, minus the first polish item (closed) and the owner reminders (done), plus one new item: the reminder's "about N hours" is a third countdown rounding rule next to the owner's and worker's labels, so the shared countdown helper now has three call sites to cover. Still open:
- "Changes requested" notification does not say a pending release offer was withdrawn.
- Owner card still shows the green "Submitted" pill next to the "Refunded after dispute" badge.
- Owner and worker countdowns round the same deadline differently (and now the reminder text too); one shared helper would fix it.
- `paySubmittedSlot` runs `increment_worker_stats` even when the credit insert hit a duplicate key (low priority).
- Shared finalization helper, worker "dispute this request" link in the changes banner, split outcome for disputes, admin page, submission versions, approve-during-grace-window, reviewer delegation (`job_reviewers`) and dispute chat.

## Closed this session
- Owner reminders at 24h and 6h before auto-pay.
- The "Review window ended" notice now names the worker.

## Next session
The polish list above (shared countdown helper first), then submission versions so a dispute sees every evidence round, an admin page instead of curl, reviewer delegation (`job_reviewers`) and dispute chat. Start with `git pull`, `git log --oneline -5` and `git status --short`.
