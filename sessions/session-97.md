# Session 97 — Piwork

## Context carried in from Session 96
- Session 96 shipped the submit-work cap raise (video 150MB/file, 200MB combined), the client-side combined-size pre-check, friendlier network-error text, and multer error handling.
- Residual from the "try/catch hardening" item: only the multer/upload layer was hardened. The rest of the `submit-work` route body (storage upload and DB write, past ~line 484) had not been read, so its error handling was unexamined.

## Task: submit-work route hardening

**Sweep first (standing rule).** `grep -n` on `backend/src/routes/jobs.ts`: wrapper `handleSubmitWorkUpload` at line 19, handler at line 459. `express` is `^4.19.2` (checked in `backend/package.json`), so an async throw inside a handler never reaches error middleware: the request hangs, and the unhandled rejection can crash the process on modern Node unless a global handler exists.

**Findings from reading the real handler (lines 459 to the end of the route):**
1. **No try/catch** around the handler body (the neighbouring `/complete` route has one).
2. **`jobs` fetch error ignored.** If the lookup failed, `isMultiSlot` silently became `false`, so a multi-slot submission would write `status: 'submitted'` instead of `slot_status: 'submitted'`. A silent wrong write, not just an ugly error.
3. **Orphaned files.** A failed upload part-way (e.g. 3 of 4), or a failed DB update after all uploads, left the already-uploaded files in the `work-submissions` bucket. Each retry uploaded fresh copies under new timestamped paths.
4. **Notify lookup awaited after the save.** The `jobForNotify` query ran after the DB write; if it threw, the client would see a failure or a hang even though the submission had saved.
5. **No status gate.** `app.status` was selected but never checked, and `findError` was unused. `requireAuth` only proves login, so any applicant (pending, rejected, or on a completed job) could submit at the server level, whatever the UI hides.

**Status vocabulary established (from `grep -n "status: '"` plus reading approve / decline / undo-decline / complete-slot):**
- Applications: `pending`, `approved`, `rejected`, `submitted`, `completed`.
- Jobs: `draft`, `cancelled`, `in_progress`, `completed`.
- Multi-slot applications keep `status: 'approved'` until their slot completes, and track progress through a parallel `slot_status` (`submitted`, `completed`). Complete-slot sets both to `completed` and counts `status = 'approved'` rows as in-progress.
- Line 455 is undo-decline (`rejected` to `pending`); lines 708 and 743 are claim-releases inside complete-slot. None is a worker-resubmission flow, and no "request revision" route was seen.

**Fix** (commit: "fix: harden submit-work (try/catch, DB error checks, orphan cleanup, approved-only gate)"), `backend/src/routes/jobs.ts` only:
- Whole handler body wrapped in try/catch; any throw returns a clean 500 ("Could not submit your work. Please try again.").
- `jobs` and `applications` lookup errors are checked. Only PGRST116 ("no rows") is treated as not-found (404 for the job, existing 403 for the application); any other error is a logged 500.
- Cleanup: paths uploaded during the request are tracked and removed (`storage.remove`) if an upload or the DB update fails. A `saved` flag ensures the catch block never deletes files the DB row already references. Cleanup failures are logged, not thrown.
- Storage/DB failures log the raw message server-side and return plain text to the user (previously the raw Supabase message was returned).
- Notify now reuses the job row fetched at the top (select widened to `worker_slots, title, client_id`), removing the second lookup that could fail after the save.
- **New server-side gate:** only applications with status `approved` or `submitted` can submit; others get a 400. `submitted` is allowed so behaviour for an already-submitted worker is unchanged. Multi-slot rows stay `approved` until completion, so the same gate covers both modes.
- Applied via an exact-match Python script (`patch_submit_work.py`): aborts, writing nothing, unless the start and end markers each match once and the old block passes sanity checks. Tested first against a reconstruction of the handler (applied once, refused a second run); new handler typechecked in isolation under `--strict --noImplicitReturns`. On the real repo: patch replaced 68 lines with 112, `git diff --stat` showed 92 insertions / 47 deletions in one file, `tsc --noEmit` clean in `backend/`.

**Resubmit behaviour (discussed, no change made).** There is no resubmit UI. If a second submit does reach the server (double-tap, two tabs, retry after a lost response, direct API call), it overwrites `submission` and `attachments` on the same application row; there is no history. Consequences: the earlier submission's files stay in the bucket, unreferenced; the employer is notified again; on multi-slot jobs the gate cannot tell a first submit from a resubmit. Left as-is; a later patch could block accidental double submits (accept only `approved`, plus an unset `slot_status` on multi-slot) if wanted. Not requested.

**Status:** committed, pushed, user reports tested. Which specific checks were run was not itemised. Not separately confirmed in this record: the new 400 gate, the multi-slot `slot_status` path, and how `JobDetail.tsx` displays the new server error messages versus its generic network-failure text.

## Carried forward
- Live tests still owed from session 96: 50-150MB video upload succeeding end-to-end; 200MB combined pre-check tripping.
- Watch item (unchanged): `multer.memoryStorage()` holds uploads in server RAM, worst case ~200MB per submit-work request. If it shows up, move to disk/streaming or direct-to-storage upload.
- Not fixed here: files from an overwritten (re)submission are never deleted from storage.
- Multi-worker Apply gap: Option A assessed, no go-ahead given.
- Category expansion: pending product decision on the 4 shell-only categories.
- Draft edit/resume-payment UI: backend supports `PATCH /:id/draft`, no UI yet; not requested.
- `JobDetail.tsx` token-redeclaration cleanup (parked, not urgent).
- Standing note: spot-check Vercel deploy status after frontend pushes for a while.
- Verify the `MAX_DAILY_OUT...` cap's value and relationship to `MAX_PAYOUT_PER_TX` before ever raising the per-tx limit (100pi left as-is by user decision).

Closed this session: session-96 residual "try/catch hardening" (whole `submit-work` route now covered).
