# Session 95 — Piwork

## Context carried in from Session 94
- Upload progress on submit-work shipped (commit `8554b5f`), live-tested working.
- Vercel's GitHub integration had silently disconnected, blocking frontend deploys with no error surfaced anywhere; reconnected.
- Queued/open items going into this session: multi-worker Apply gap, submit-work error-text friendliness, submit-work try/catch hardening, category expansion decision, JobDetail.tsx token-redeclaration cleanup (parked), standing note to spot-check Vercel deploy status after pushes.

## Bug 1: Failed-payment draft jobs shown as "Open" on Dashboard

**Reported:** User posted a job, payment failed (insufficient balance), and the job still showed as "Open" in Dashboard's "Jobs you've posted," with 0 applicants, while Browse correctly showed nothing.

**Root cause, traced via code (not assumed):**
- `/api/jobs/draft` creates the job as `status: 'draft'`. Status only flips to `'open'` in `payments/complete`, gated on `payments/approve` having first stamped a `payment_id` on a job still in `'draft'`. So a failed payment correctly leaves the job as `'draft'` in the DB — the bug wasn't in the payment flow.
- The actual bug: `JobCard.tsx`'s `statusPillClass`/`statusLabel` functions had no case for `'draft'` (or anything besides `completed`/`in_progress`) and fell through to `'open'`/`"Open"` for any unrecognized status.
- Compounding issue found while investigating: `dashboard.ts`'s client-tab query pulled every job for the client with no status filter, so drafts were being shown at all, and `totalPosted` summed `budget` across *all* jobs including unpaid drafts — inflating the "Posted" stat on the escrow ticker.
- Also surfaced: no UI existed to edit or delete a draft job, even though the backend already supports it (`PATCH`/`DELETE /:id/draft`).

**Fix shipped** (commit: "fix: mislabeled draft jobs shown as Open on Dashboard; add draft delete + exclude drafts from budget/job-posted totals"):
- `JobCard.tsx`: added a real `'draft'` case → gold pill, "Draft (unpaid)" label; non-clickable into job detail (unlike real jobs); shows a "Delete draft" button when a `onDeleteDraft` callback is passed.
- `dashboard.ts`: client-tab query now excludes `status: 'draft'` from the main jobs list, `totalPosted`, and `jobs_posted_count`; drafts are now returned separately as their own `drafts` array (up to 20, no strict pagination needed at that volume).
- `Dashboard.tsx` `ClientView`: renders an "Unpaid drafts" section above "Jobs you've posted" when any exist, wired to a `deleteDraft` handler that calls `DELETE /api/jobs/:id/draft` and triggers a refresh via `onRefresh` (passed down as `retryLoad` from the parent `Dashboard` component).

**Status:** Live-tested by user — drafts now show correctly labeled with delete buttons, deletion confirmed working, "Posted" stat dropped as expected.

**Not done / explicitly out of scope this session:** editing/resuming a draft's payment from the UI. Backend already supports `PATCH /:id/draft`; only delete was requested/built. Worth a follow-up if the user wants to resume payment on a draft instead of only deleting it.

## Bug 2: Withdrawal failures at 500π ("This withdrawal didn't complete")

**Reported:** Two 500π withdrawal attempts failed with a generic error; user wasn't sure if their balance was actually restored.

**Investigation path (SQL against the app's Supabase, via Termux/SQL editor):**
- Ruled out fund loss first: `withdrawalDrainer.ts`'s `failAndReverse` function does write a compensating `withdrawal_reversal` credit and calls `recompute_worker_balance` for clean, pre-broadcast failures — confirmed this is what actually ran.
- Pulled the real `notes` column on the failed rows (initial username-based query missed them — turned out `worker_id` belonged to a different account, `Olawalt`, not `walterdanny00`, resolved and confirmed by the user; unrelated account, no issue).
- Actual failed rows' notes: `"Signing failed: {"error":"Exceeds per-tx limit of 100"}"` — a real, deliberate limit, not a bug in the reversal logic.
- Traced the limit's source: `callSigningService` in `piPayments.ts` calls an external `${SIGNING_SERVICE_URL}/payout` — a **separate service from Pi's own API** (which is only used read-only, via `getPayment`). Confirmed `SIGNING_SERVICE_URL` is `https://piwork.onrender.com` — the user's own Render-hosted signing service, not third-party custodial infra.
- Found the actual cap on that service's Render Environment tab: `MAX_PAYOUT_PER_TX` (approx. name, truncated in UI) = `100`. Also noted a separate `MAX_DAILY_OUT...` env var exists — a daily cap distinct from the per-tx cap, worth checking before raising the per-tx limit in the future so they don't conflict.
- **User decision: leave the 100π cap as-is for now.**

**Fix shipped** (commit: "fix: validate withdrawal amount against signing service's 100pi per-tx cap up front, instead of a false processing/failed round trip; cap quick-fill button and surface real max in placeholder"):
- `withdrawals.ts`: added `MAX_WITHDRAWAL` (env: `MAX_WITHDRAWAL_PI`, defaults `100`, mirroring the existing `MIN_WITHDRAWAL` pattern), validated up front in `POST /` with an honest `"Maximum withdrawal is 100 Pi per request."` error before any processing/drainer round trip. `GET /` now also returns `maxWithdrawal` so the frontend never hardcodes/guesses it.
- `WithdrawPanel.tsx`: reads `maxWithdrawal`, adds `amt <= max` to `canSubmit`, updates the input placeholder to show both min and max, and changes the quick-fill button from "Withdraw all" (which could silently queue a doomed amount) to "Withdraw max" — capped at `min(balance, max)` — whenever balance exceeds the limit.

**Status:** Committed and pushed. **Not yet live-tested** — next session (or immediately) should confirm: (1) a >100π request now fails fast with the new message instead of the old processing/failed cycle, and (2) the quick-fill button correctly shows "Withdraw max" when balance > 100π.

## Carried forward, untouched this session
- Multi-worker Apply gap — Option A assessed, no go-ahead given.
- Friendlier submit-work network-error text + clearer file-cap message (frontend only).
- Try/catch hardening on `submit-work`.
- Category expansion — pending product decision on the 4 shell-only categories.
- (Parked, not urgent) `JobDetail.tsx` token-redeclaration cleanup.
- Standing note: spot-check Vercel deploy status after frontend pushes for a while (the earlier silent-auth-disconnect issue).
- New from this session: draft edit/resume UI (backend already supports it, no UI yet) — not requested/built, just flagged as a gap.
- New from this session: verify the two commits from today (`fix: mislabeled draft jobs...` and `fix: validate withdrawal amount...`) actually deployed cleanly on Vercel/Render and are live-tested for the withdrawal cap specifically.
