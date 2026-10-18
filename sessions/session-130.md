# Session 130 — Piwork

## Focus
Verify the Pending query from session 129 on a real multi-slot account, then start scoping ledger-derived `jobs_completed` / `total_earned`.

## Starting-state check
- `git pull`, `git status --short`, `git log --oneline -3` in `~/Piwork` (HEAD `558c564`, clean, up to date), `git pull` in `~/hivework-redesign`, and `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git` (silent).

## Findings
- The Pending query in `backend/src/routes/dashboard.ts` is correct as written: `approved` only, `missed` excluded, `budget / worker_slots`, 4 decimals.
- Suspected double-count of paid multi-slot applications is not real: both completion paths (`settlement.ts:105`, `jobs.ts:1045`) set `status: 'completed'` with `slot_status: 'completed'`.
- Slot status values: `active`, `submitted`, `completed`, `missed`. `missed` is the single "closed and refunded" state; `closed_reason` (`released`, `dispute_refund`) records why.

## Decisions
- No code change to Pending.
- Ledger-derived counters: compare counter vs ledger per user before switching the source.

## Changes
None. No commits, no migration.

## Verification (testnet, worker `Olawalt`)
- Approved non-missed row: one multi-slot application, budget 10, 5 slots, `submitted` → expected 2π. Dashboard shows 2π. **Pass.**
- One wallet card above the toggle, withdrawal history on both tabs, no flicker on tab switch. **Pass.**

## Not verified
- `missed` exclusion on a real row; client with no refunds seeing the card; My Jobs empty state with the card above.
- A withdrawal from either tab refreshing the card in place.
- Dual-role Payments view, Payments empty state, "Load more" past 20 rows, tap-through to the job.
- Review page for a refunded-after-dispute slot and the missed-deadline slot; bottom of a released slot's review page.
- The five backfilled jobs' header and card in the app.
- Naming in the dispute opened, release-declined and release-expired notices, and "Revision deadline passed".
- `review_returned`, `review_auto_paid`, `review_reminder`; an older changes-requested notification still showing GMT text.
- Carried over: admin dispute-embed check, the versions endpoint's 403 path, the version-insert failure branch.

## Observations (not fixed)
- "Total earned" (1730π) and "Jobs done" (83) for `Olawalt` still come from stats counters, not the ledger.
- Section 140's observations still apply.

## Commits
None. Docs: `roadmap.md` (Section 145) and this brief.

## Files touched
`roadmap.md`, `sessions/session-130.md`.

## Carried forward
- Ledger-derived `jobs_completed` / `total_earned`: grep every writer of the two `users` columns, find the ledger table holding `job_completion` credits, and compare counter vs ledger per user.
- The unverified checks above; the worker `submitted` panel history; admin dispute-embed check.
- Worker "dispute this request" link in the changes banner; split outcome for disputes; admin page; approve-during-grace-window; reviewer delegation (`job_reviewers`); dispute chat.
- The round switcher / timeline tabs are set aside, not removed; `.rating-given` / `.rate-widget` 50px margin cleanup (optional).

## Closed this session
- Pending with a non-zero multi-slot value; tab-switch flicker; the suspected paid-slot double-count (ruled out).

## Next session
Start with `git pull` and `git status --short` in `~/Piwork`, then the two-repo drift check. Then run, one block at a time:
`grep -rn "total_earned\|jobs_completed" backend/src | grep -v "^backend/src/routes/dashboard.ts"`
`grep -rln "job_completion" backend/src`
`ls backend/migrations backend/sql supabase 2>/dev/null`
and paste the output to continue the ledger work.
