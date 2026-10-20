# Session 134 — Piwork

## Focus
Admin dispute-embed check; `paySubmittedSlot` single-worker branch via admin dispute resolution; a Pending gap found for single-worker jobs. One backend change.

## Starting-state check
- `git pull`, `git status --short`, `git log --oneline -3` in `~/Piwork` (HEAD `b8b8bcb`, docs: session 133, clean), `git pull` in `~/hivework-redesign`, and `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git` (silent).

## Admin dispute-embed check
- `GET /api/admin/disputes` (`admin.ts:24`, `x-admin-key`). Resolved: no error, 7 disputes, each with one embedded version (`order [1]`). Open: no error, 1 dispute. No schema-cache reload needed.
- SQL for a dispute whose application has 2+ `submission_versions` rows returned none, so the `version_no` sort has only run on single-version rows. **Pass, with that limit.**

## Admin dispute-pay (`paySubmittedSlot`, single-worker)
- Code read first: `admin.ts:49` (resolve handler) and `settlement.ts:92`.
- Dispute `80bfed6a-2e9d-4e86-83e0-b5d8b4f04d46`, job `35tuhfh` (1π, 1 slot), `Olawalt` / `walterdanny00`. Resolved `pay_worker`; response `{"ok":true,"outcome":"pay_worker","amount":1}`.
- Before: application `submitted`, job `in_progress`, `payout_claimed` false, no ledger rows, deadline columns already null (so clearing was not observable), `Olawalt` 88 / 1750π.
- After: application and job `completed`, `payout_claimed` true, dispute `resolved` with note, one `job_completion` credit of 1.0000 (06:46:15 UTC), `Olawalt` 89 / 1751π; dashboard 1751π / 89 / 1061π. `walterdanny00` bell shows the owner notice naming `@Olawalt`; `Olawalt` bell badge 2 (text not read). **Pass.**

## Pending gap fix
- Cause: `dashboard.ts` line 34 filtered `status = 'approved'`; single-worker applications are `submitted` once work is handed in, so Pending read 0π. Multi-slot applications stay `approved`, which is why Section 145 passed.
- Checked first: `refundSubmittedSlot` resets a single-slot application to `approved` + `slot_status = 'missed'`, already excluded. A SQL check found 7 pre-ledger `submitted` applications on `completed` jobs (58π, null deadlines) that a plain widening would have counted.
- Patch (2 lines): select adds `status` and `jobs(status)`; `.in('status', ['approved','submitted'])`; filter counts a row only if `status === 'approved'` or its job is `in_progress`. Backup in `~/pending_patch_bak/`, `tsc --noEmit` clean. Commit `1d731a9`, Render Live.
- Live: fresh 1π single-worker job. Pending 1π when approved, still 1π after submission, 0π after payment; `Olawalt` 90 / 1752π / 1062π. Pending stayed 0π despite the stale rows. **Pass.**

## Not verified
- `paySubmittedSlot` multi-slot branch (admin dispute-pay and auto-pay); the refund outcome through the admin route.
- `REVIEW_AUTOPAY_LIVE` in Render (not checked).
- `version_no` sort with 2+ versions in one dispute.
- Worker-side dispute-pay notice text.
- Which path session 132's slot payment took (inferred `/complete-slot`).
- Everything under Section 145's "Not verified" still applies, plus the versions endpoint 403 path and version-insert failure branch.

## Observations (not fixed)
- 7 pre-ledger `submitted` applications remain on completed jobs; harmless (guarded in Pending, null deadlines).
- A `submitted` application on a job that is neither `in_progress` nor `completed` (for example cancelled) is not counted as pending.

## Files touched
`backend/src/routes/dashboard.ts` (`~/Piwork`, commit `1d731a9`), `roadmap.md`, `sessions/session-134.md`.

## Closed this session
- Admin dispute-embed check; `paySubmittedSlot` single-worker branch via admin dispute-pay; single-worker Pending gap.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork`, then the two-repo drift check. Then check `REVIEW_AUTOPAY_LIVE` in Render, the multi-slot `paySubmittedSlot` branch, the Section 145 unverified list (notification naming, `missed`-slot Pending exclusion, Payments page edge cases) and the worker `submitted` panel history.

Deliver the **complete, updated `roadmap.md`** as one downloadable file (standing rule at the top of the roadmap) — never a section-only file or a `cat >>` instruction — plus the session brief.
