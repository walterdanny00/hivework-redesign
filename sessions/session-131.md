# Session 131 — Piwork

## Focus
Scope and ship ledger-derived `jobs_completed` / `total_earned`.

## Starting-state check
- `git pull`, `git status --short`, `git log --oneline -3` in `~/Piwork` (HEAD `a953873`, docs: session 130, clean), `git pull` in `~/hivework-redesign`, and `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git` (silent).

## Findings
- Nothing in `backend/src` writes the two `users` columns directly. The only writer is the SQL function `increment_worker_stats(worker_id, earned)` (blind `+1` / `+earned`), called from three places only when the credit insert did not fail: `jobs.ts` `/complete` (:994), `jobs.ts` `/complete-slot` (:1084), `settlement.ts` `paySubmittedSlot` (:144).
- The 07-01 backfill rebuilt the counters from `payouts`. The 07-04 ledger migration never seeded `balance_transactions` from `payouts`. So pre-ledger completions are in the counters but have no `job_completion` credit.
- Credit amount equals the counter amount at all three call sites (`budget`, or `budget / slots` per slot), so no fee mismatch.
- Counter vs ledger comparison: three users drifted, all with counters higher than the ledger: `walterdanny00` (15 / 150π vs 7 / 37π), `Olawalt` (84 / 1731π vs 71 / 1623π), `lizzybeth00` (3 / 18π vs 0 / 0).
- Legacy completed payouts with no ledger row: `lizzybeth00` 3 / 18π (exact match), `Olawalt` 14 / 123π, `walterdanny00` 9 / 123π. The one-job gap for each of the other two is a BUG-100 incident row that never reached the counters: `Olawalt` job `72fcc4a5` (15π, manually corrected 2026-07-02), `walterdanny00` job `fc57ca2f` (10π). Not a live bug.

## Decisions
- Keep `users.jobs_completed` / `users.total_earned` as a cache, always rebuilt from the ledger (same pattern as `recompute_worker_balance`), instead of a view or changing readers.
- Count the two BUG-100 incident payouts as completed jobs.
- Do not backfill the ledger from `payouts` (it would become withdrawable balance).

## Changes
- `supabase/migrations/20261019000000_recompute_worker_stats_fn.sql`: `recompute_worker_stats(p_worker_id)` = ledger `job_completion` credits + completed `payouts` with no ledger row. Applied by hand in the SQL editor, then saved as a migration.
- `backend/src/routes/jobs.ts` (two sites) and `backend/src/lib/settlement.ts` (one site): `increment_worker_stats` calls replaced by `recompute_worker_stats`, `if (!creditError)` guard removed. Scripted patch with anchor check; `tsc --noEmit` clean.
- One-time backfill: `select recompute_worker_stats(id) from users;`.

## Commits
- `78962c3` Stats: rebuild jobs_completed/total_earned from the ledger (recompute_worker_stats) instead of blind increments.
- Docs commit: `roadmap.md` (Section 146) and this brief.

## Verification
- Every user's counters equal ledger + legacy: `Eliza1914` 9 / 10π, `lizzybeth00` 3 / 18π, `Olawalt` 85 / 1746π, `walterdanny00` 16 / 160π, `dannywills00` 0 / 0. Dashboard screenshots match (Total earned and Jobs done). **Pass.**

## Not verified
- **Live completion with the new code.** Backend deploy of `78962c3` not confirmed. Planned check: pay `Olawalt`'s 2π pending slot; expect 86 jobs, 1748π, Pending 0π, balance +2π.
- The two `jobs.ts` completion routes (`/complete`, `/complete-slot`) running the recompute call.
- Carried over from Section 145: `missed` exclusion on a real row; client with no refunds seeing the card; My Jobs empty state; withdrawal refreshing the card in place; dual-role Payments view, empty state, "Load more", tap-through; review page for refunded-after-dispute and missed-deadline slots; the five backfilled jobs' header and card; notice naming (dispute opened, release-declined, release-expired, "Revision deadline passed"); `review_returned`, `review_auto_paid`, `review_reminder`; older GMT notification text; admin dispute-embed check; versions endpoint 403 path; version-insert failure branch.

## Observations (not fixed)
- The `recompute_worker_stats` RPC result is not checked in code (same as the old call), so a failure would be silent.
- `increment_worker_stats` is now unused.

## Files touched
`supabase/migrations/20261019000000_recompute_worker_stats_fn.sql`, `backend/src/routes/jobs.ts`, `backend/src/lib/settlement.ts`, `roadmap.md`, `sessions/session-131.md`.

## Carried forward
- The live completion check above; the remaining unverified checks; drop `increment_worker_stats` in a later migration once the live check passes.
- The worker `submitted` panel history; admin dispute-embed check.
- Worker "dispute this request" link in the changes banner; split outcome for disputes; admin page; approve-during-grace-window; reviewer delegation (`job_reviewers`); dispute chat.
- The round switcher / timeline tabs are set aside, not removed; `.rating-given` / `.rate-widget` 50px margin cleanup (optional).

## Closed this session
- Ledger-derived `jobs_completed` / `total_earned` (code and data; live check pending); the counter drift explained.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork`, then the two-repo drift check. Confirm the `78962c3` backend deploy, then pay `Olawalt`'s 2π pending slot and check the dashboard reads 86 jobs / 1748π / 0π pending.
