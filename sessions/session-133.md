# Session 133 — Piwork

## Focus
Single-worker `/complete` live check; read-through of the completion and deadline code paths. No code changes.

## Starting-state check
- `git pull`, `git status --short`, `git log --oneline -3` in `~/Piwork` (HEAD `29293e4`, docs: session 132, clean), `git pull` in `~/hivework-redesign`, and `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git` (silent).

## Code read-through
- Completion paths: `POST /:id/complete` (`jobs.ts:887`, single-worker, `payout_claimed` CAS, credits `job.budget`), `POST /:id/complete-slot` (`jobs.ts:1017`, inline per-slot claim and credit), and `paySubmittedSlot` (`settlement.ts:92`, both single and multi-slot), whose only callers are the deadline checker's auto-pay and admin dispute resolution (`admin.ts:68`). All three completion paths call `recompute_worker_stats`; none checks the RPC result.
- Owner UI: `useCompleteSlot.ts` calls `/complete` for single-worker jobs and `/complete-slot` otherwise. `SubmissionReview.tsx` `canAct` requires `status === 'submitted'` (single-worker) or `slot_status === 'submitted'` (multi-slot), so Complete is not offered before submission or during a revision window.
- Deadline checker: the revision, auto-pay and reminder passes all filter on submitted/active state, so a paid application cannot be picked up even if a deadline column is left set. Stale-deadline hypothesis ruled out.
- Auto-pay and the review-reminder pass are dry-run unless `REVIEW_AUTOPAY_LIVE === 'true'` (`slotDeadlineChecker.ts:629`).

## Verification
- Single-worker job `HkdvwX` (id `a6c83ebb-e1f3-48a7-87b7-b94bebf8a8c2`, budget 1π). `Olawalt` submitted, the client (`walterdanny00`) requested changes once (round 1 of 2; no Complete button during the revision window), `Olawalt` resubmitted, the client paid via `/complete`.
- Before: 87 jobs / 1749π earned / 1059π balance / 0π pending. After: 88 / 1750π / 1060π / 0π pending.
- SQL: one `job_completion` credit of 1.0000 (2026-10-20 06:03:18 UTC); job `completed`, `payout_claimed = true`. Review page showed "Payment released. 1π went to @Olawalt" and "Earlier rounds (1)". **Pass.**

## Not verified
- `paySubmittedSlot` (auto-pay and admin dispute-pay) is unexercised on both its single-worker and multi-slot branches.
- Which path session 132's slot payment took: `/complete-slot` by inference from the callers, not confirmed.
- `REVIEW_AUTOPAY_LIVE` value in the Render environment (not checked), so `review_auto_paid` and `review_reminder` remain unverifiable.
- Everything under Section 145's "Not verified" still applies.

## Observations (not fixed)
- `/complete` does not check that the assigned application is `submitted`; only the UI gates this. Reachable only by a direct API call from the job's own client. Optional hardening.
- The `recompute_worker_stats` RPC result is still not checked in code, so a failure would be silent.
- `useCompleteSlot.ts` comments still describe the pre-ledger on-chain payout flow. Comments only.
- `/complete` and `/complete-slot` leave `review_due_at` and related deadline columns set on a paid application, unlike `paySubmittedSlot`. Harmless (see above); hygiene only.

## Files touched
`roadmap.md`, `sessions/session-133.md`.

## Closed this session
- Single-worker `/complete` live check; the revision-window button check.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork`, then the two-repo drift check. Then work through the Section 145 unverified list (notification naming, `missed`-slot Pending exclusion, Payments page edge cases), the admin dispute-embed check, and the worker `submitted` panel history.

Deliver the **complete, updated `roadmap.md`** as one downloadable file (standing rule at the top of the roadmap) — never a section-only file or a `cat >>` instruction — plus the session brief.
