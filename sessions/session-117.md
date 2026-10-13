# Session 117 — Piwork

## Focus
Submission versions, so a dispute sees every evidence round. This session built and shipped the backend half. The UI is next.

## Starting-state check
- Session 116's brief and roadmap Section 131 were still uncommitted; the placeholders `HASH_STAMP` and `HASH_NOTICE` were replaced with `cafd7d5` and `32daa13`, then both files were pushed to both repos (`8fea815` on Piwork, `55fa306` on hivework-redesign). `diff -rq` between the two copies printed nothing.
- `~/Piwork`: clean, HEAD `32daa13` equal to `origin/main`.

## Findings before coding
- A (re)submission overwrote `applications.submission` and `attachments` in one update (`submit-work`). Resubmitting while awaiting review is also allowed, so a version is any `submit-work` call.
- Old files were never deleted: uploads use unique paths `<appId>/<timestamp>-name`, only the row's array changed. `attachment-url` authorizes by the app-id path prefix, so old files stay servable once recorded.
- Request-changes kept one `changes_note` on the row; the next round overwrote it.
- Migrations are applied by hand in the Supabase SQL editor (see `20261009000000_disputes_grants.sql`), so the new table carries its own RLS and grants.

## Changes
- Migration `20261013000000_submission_versions.sql`: table `submission_versions`, unique `(application_id, version_no)`, RLS on, `service_role` grants, idempotent backfill of one v1 per existing submission. Applied in the SQL editor; 110 rows backfilled.
- `routes/jobs.ts` `submit-work`: selects `revision_round`, inserts the next version after the conditional update, one retry on `23505`. Failure is logged and the submit still succeeds.
- `routes/jobs.ts` request-changes: writes `changes_note` and `changes_requested_at` onto the latest version after the claim. Failure is logged, never blocks.
- `routes/jobs.ts`: new `GET /:id/applications/:appId/versions` (owner or that worker only).
- `routes/admin.ts`: dispute list embeds `submission_versions` under `applications`, sorted by `version_no`.
- Three Python patch scripts (assert guard, `.bak` backups in `~`), `tsc --noEmit` clean after each.

## Verification (testnet)
- Backfill count: 110. **Pass.**
- Resubmission on job `2bc3ce19-…` saved as version 2 with the new text. **Pass.**

## Not verified
- The request-changes note write (the only existing note was backfilled). Test: Request changes on `2bc3ce19-…` (one left), worker resubmits, rerun the versions query.
- The versions endpoint and the admin embed (neither called). If the admin nested select errors, run `notify pgrst, 'reload schema';`.
- The version-insert failure and `23505` retry branches.

## Commits
`d4c9f52` (migration, submit, request-changes, read endpoint, admin embed). Deployed HEAD: `d4c9f52`.

## Files touched
`~/Piwork`: `supabase/migrations/20261013000000_submission_versions.sql`, `backend/src/routes/jobs.ts`, `backend/src/routes/admin.ts`.

## Notes
- The backfilled v1 on `2bc3ce19-…` shows `revision_round` 1 (copied from the live row) although it was submitted in round 0. The UI must label rounds by `version_no`.
- The app still shows only the current round: the "Earlier rounds" list is not built, which is why the screens showed nothing new.
- Decision: "Earlier rounds" is a folded, read-only list under the current report with the owner's note between rounds. A switcher stays an option after seeing it (needs no backend change; an old round would need a clear "not the current work" label).

## Carried forward
- Submission-versions UI (owner slot card and worker changes banner), then the unverified checks above.
- Three polish items from Session 116: chip reads "Changes requested", GMT versus local time in notifications, neutral chip colour for refunded, released and missed slots.
- Derive `jobs_completed` and `total_earned` from the ledger.
- Shared finalization helper, worker "dispute this request" link in the changes banner, split outcome for disputes, admin page, approve-during-grace-window, reviewer delegation (`job_reviewers`) and dispute chat.

## Closed this session
- Submissions no longer lose history on resubmit or change request (backend).
- Admin dispute data now includes every round (not yet exercised).
- Old "files from overwritten submissions never deleted": the files remain and are now referenced.

## Next session
Sweep then build the "Earlier rounds" UI: `sed -n 414,470p frontend/src/pages/JobDetail.tsx` (`SubmissionReport`), `sed -n 1485,1535p` (owner slot card), `sed -n 1870,1890p` (worker changes banner). Run the unverified checks first. Start with `git pull`, `git log --oneline -5` and `git status --short`.
