# Session 128 — Piwork

## Focus
The worker history date on a paid job ("Papakqlak" showing 10/11/2026), which became a Payments history page and a consistency pass on the dashboard wallet card.

## Starting-state check
- `git pull`, `git status --short`, `git log --oneline -3` in `~/Piwork` (HEAD `c492091`, clean, up to date), `git pull` in `~/hivework-redesign`, and `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git` (silent).

## Findings
- The history date is `applications.created_at` (the application date), rendered by `ApplicationCard.tsx`. `/api/history/work` sends only `created_at`; `paid` is derived from `status === 'completed'`. No paid timestamp exists on that route.
- The ledger (`balance_transactions`) has its own `created_at` per credit, `application_id`, `job_id` and `kind`. Owner refunds are `kind = 'refund'` rows keyed by the client's user id.
- `POST /api/withdrawals` takes `kind` only as a label; the balance check is a single `withdrawable_balance` RPC. The dashboard's "Refunded balance" (My Jobs) and "Available balance" (My Work) were the same pool (57.3334π on both).

## Decisions
- Keep the work card's date as the application date (stable start of the engagement; for deadline disputes the evidence is `submitted_at` vs `deadline_at`).
- Give payments their own history, built on the ledger, covering `job_completion` and `refund` credits for both roles.
- One shared balance label, one withdrawal history (My Work only); no separate refund history on My Jobs.

## Changes
- `backend/src/routes/history.ts`: `GET /api/history/payments` (current user's credits of kind `job_completion` / `refund`, with job title, cursor-paginated). Commit `6e7ffe7`.
- `frontend/src/pages/HistoryPayments.tsx`, `frontend/src/components/PaymentRow.tsx`, route `history/payments` in `App.tsx`. Commit `6e7ffe7`.
- `frontend/src/components/WithdrawPanel.tsx`: "Payment history →" link in the balance card (`b71fe58`); then "Available balance" label and unified footer on both tabs, link on both, unfiltered withdrawal list on My Work only (`17e169d`).

## Verification (testnet)
- Worker account: Payments shows "Papakqlak" as "Payment received · 10/17/2026" +1π. **Pass.**
- Owner account: Payments shows refund rows dated 10/17/2026. **Pass.**
- Dashboard My Work: "Available balance", link, full Withdrawal history including the 4π made from My Jobs. **Pass.**
- Dashboard My Jobs: "Available balance", link, no list under the card, tracker directly below. **Pass.**
- `tsc --noEmit` clean for frontend and backend before each commit.

## Not verified
- Dual-role account view, the Payments empty state, "Load more" past 20 rows, tap-through to the job.
- Review page for a refunded-after-dispute slot and the missed-deadline slot; bottom of a released slot's review page.
- The five backfilled jobs' header and card in the app.
- Naming in the dispute opened, release-declined and release-expired notices, and "Revision deadline passed".
- `review_returned`, `review_auto_paid`, `review_reminder`; an older changes-requested notification still showing GMT text.
- Carried over: admin dispute-embed check, the versions endpoint's 403 path, the version-insert failure branch.

## Observations (not fixed)
- Two `WithdrawPanel` cards (one per dashboard tab); a single wallet section above the tab switch would remove the duplicate but touches `Dashboard.tsx`.
- "Total earned" and "Jobs done" still come from stats counters, not the ledger.
- Payments page marks no nav pill active (assumed same as other history pages).
- Section 140's observations still apply.

## Commits
`6e7ffe7` Payments history page and `/api/history/payments`. `b71fe58` payment history link on the balance card. `17e169d` shared balance label and withdrawal history on one tab. Docs: `roadmap.md` (Section 143) and this brief.

## Files touched
`backend/src/routes/history.ts`, `frontend/src/App.tsx`, `frontend/src/pages/HistoryPayments.tsx`, `frontend/src/components/PaymentRow.tsx`, `frontend/src/components/WithdrawPanel.tsx`, `roadmap.md`, `sessions/session-128.md`.

## Carried forward
- The unverified checks above; the worker `submitted` panel history; admin dispute-embed check.
- Derive `jobs_completed` and `total_earned` from the ledger; optional single wallet section above the dashboard tabs; worker "dispute this request" link in the changes banner; split outcome for disputes; admin page; approve-during-grace-window; reviewer delegation (`job_reviewers`); dispute chat.
- The round switcher / timeline tabs are set aside, not removed; `.rating-given` / `.rate-widget` 50px margin cleanup (optional).

## Closed this session
- The history date question; the Payments history gap; the "Available vs Refunded balance" inconsistency.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork`, then the two-repo drift check (`diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`). Then the remaining unverified checks, or the single wallet section above the dashboard tabs.
