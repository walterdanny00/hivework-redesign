# Session 164 — Hivework

Live checks run 2026-11-04. No code, migration or frontend change.

## Focus
Live-check the two owner-facing notices patched in session 163 (`60b2ef7`) that were left not run live: the Pass I owner notice and the admin `uphold_changes` owner notice.

## Starting-state check
`git pull` in both repos up to date; `~/Piwork` HEAD `257a3ef` (docs: session 163, roadmap section 178) on top of `60b2ef7`; `diff -rq` between the two docs copies silent; only the two `.bak163` files untracked. Roadmap grepped before proposing tests: Pass I and `/release-slot` on a multi-slot job were already verified in Section 171, so they were not repeated; the naming checks are new evidence on patched code.

## Work
- **Job:** `f55755be-530a-4318-b250-615392d3eae1` ("Naming test 2", 2 slots, budget 2.0). Olawalt `f9f8ce25-855a-4043-90d5-2b2820c32669`, Eliza1914 `5ed2daba-f259-4f6b-be36-785b43e53b49`, both approved and submitted.
- **Pass I (Eliza1914):** Request refund, guarded backdate of `release_offer_expires_at` returned one row, one poll later `approved` / `missed` / `no_response`, Olawalt unchanged. Owner "Slot refunded": "@Eliza1914 did not answer your refund request ... so the slot was refunded to you."; worker notice still "You ...". Pass.
- **`uphold_changes` (Olawalt):** Request changes (24h), worker dispute `78e3d307-e078-4773-87f8-bad45cbd271d` opened in the app, admin resolve HTTP 200 `{"ok":true,"outcome":"uphold_changes","amount":0}`. Owner notice: "... @Olawalt has 24 hours to resubmit ..."; worker notice unchanged. Pass.

## Findings
- None new. Still open: unchanged from Section 178.

## Not verified
- Application and job rows after the `uphold_changes` resolve were not read back (new `revision_due_at`, `revision_round`, job status).
- Everything else on the Section 177 and Section 178 Not-verified lists.

## Files touched
Code: none. Docs: `roadmap.md` (Section 179, complete file); `sessions/session-164.md`.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork` (HEAD should be the session 164 docs commit or later; last code commit `60b2ef7`), then `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`. Then:
1. Grep `roadmap.md` before proposing any live test.
2. Pick from the Still-open list: a failed `/close-slots` refund with no retry; `/close-slots` 403 / 409 mapping; terminal status for an all-closed job with no deliveries.

Termux and SQL reminders: unchanged from session 163. Test job `f55755be-...` is left with Olawalt in a 24h revision window; Pass H refunds that slot if nobody acts.
