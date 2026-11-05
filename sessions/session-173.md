# Session 173 — Hivework

2026-11-05. One code change: the worker's "pending" panel now reads "Job closed" on a filled single-slot job (`bcaaefd`, frontend only, display only). Two Still-open items closed by code read; the Section 184 test jobs checked.

> **LESSON — also the first rule at the top of `roadmap.md`.** Before changing any existing flag, variable, status list or helper, list **every** use of it (`grep -n "<name>" <file>`, then `sed -n 'X,Yp'` over each use). This session's first patch widened `jobClosedToApplicants` after reading only the pending-row lines and would have turned the owner's "Slot filled" rows into "Job closed". The grep caught it before commit. Change only the consumer that is wrong. Also: grep the roadmap before proposing any test, and deliver the **complete** `roadmap.md`, never a section-only file.

## Focus
Continue from the Section 187 Still-open list. Roadmap grepped before each proposal.

## Starting-state check (reported)
Both repos up to date. `~/Piwork` HEAD `37dbb14` (`docs: session 172, roadmap section 187`), then `72bddf8`, `551aeab`. `git status --short` showed only the nine `.bak` files. `diff -rq` printed nothing.

## Work
- **Section 184 test jobs:** `57d726f9-...` `closed`; `9665ddae-...` `completed` (slots_closed 1); `6999ed26-...` `open` (slots_closed 1, cancel in-app); `f55755be-...` `closed`, both slots `missed` / `no_response`. Pass H fired as predicted. Ledger: two `refund` rows of 1.0000, one per application (Pass I 2026-11-04 15:15:50, Pass H 2026-11-05 15:38:23), no other rows. Pass.
- **`paySubmittedSlot` single-slot update guard:** closed as by design (read). Atomic claim on `status = 'submitted'`; credit idempotent through `uq_baltx_slot_settlement`; the job write setting `completed` is the right end state for a paid job; its error is queued.
- **Single-slot retry through `reevaluateOne`:** traced; a paid single-slot application (`completed` / `active`) finalizes the job to `completed`. Informational: a single-slot job under review is left alone only because `everFilled` excludes `submitted`.
- **Lost-race loser left `pending` on a filled job:** the owner view was already correct ("Slot filled", Approve disabled). The worker panel read "Awaiting client review" on a filled single-slot `in_progress` job. Fixed with a two-line patch on the worker panel only (`bcaaefd`; `tsc` clean; 2 insertions, 2 deletions).
- **First patch withdrawn before commit:** `~/p173a.py` widened `jobClosedToApplicants` and would have changed the owner's "Slot filled" rows. Restored with `cp` from `JobDetail.tsx.bak173`; nothing reached the repo.

## Findings
- Closed: the three items above.
- New: none (one informational: the `everFilled` dependency).
- Still open as in Section 188 (the leftover `pending` row's database state and missing notice is a product decision).

## Not verified
- The worker "Job closed" panel on a real leftover (a SQL lookup returned no rows; none recreated), and the Vercel deploy of `bcaaefd`.
- Pass H notices for the `f55755be-...` lapse; the rows right after the Section 179 `uphold_changes` resolve.
- Missed-slot `/complete-slot` finalization through the Section 187 call; the `reevaluateOne` failure branch from that route; `mptlx1hgg` creation time; who opened `are3dozsc` on Android.
- Everything on the Section 177-184 Not-verified lists otherwise.

## Files touched
`frontend/src/pages/JobDetail.tsx` (`bcaaefd`). Docs: `roadmap.md` (Section 188 and the new top standing rule, complete file); `sessions/session-173.md`.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork` (HEAD should be the session 173 docs commit or later; last code commit `bcaaefd`), then `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`. Read the standing rule at the top of `roadmap.md`. Then pick from the Still-open list in Section 188, grepping the roadmap before proposing any live test and listing every use of a flag before changing it. Optional: the missed-slot `/complete-slot` check; cancel `6999ed26-...` in-app.

Termux notes: untracked, not to be committed: the nine `.bak` files from session 172 plus `JobDetail.tsx.bak173` (ten). `~/p173a.py` ran once and was undone; `~/p173b.py` ran once.
