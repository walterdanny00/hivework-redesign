# Session 96 — Piwork

## Context carried in from Session 95
- Two fixes shipped in session 95: failed-payment draft jobs mislabeled "Open" on Dashboard (JobCard.tsx / dashboard.ts / Dashboard.tsx), and withdrawals failing at 500π because of the signing service's 100π per-tx cap (withdrawals.ts / WithdrawPanel.tsx).
- Session 95 ended with two verification gaps: (1) confirm both commits deployed cleanly on Vercel/Render, (2) live-test the "Withdraw max" quick-fill button.
- Open items going into this session: multi-worker Apply gap, submit-work error-text friendliness + file-cap message, submit-work try/catch hardening, category expansion decision, JobDetail.tsx token-redeclaration cleanup (parked), Vercel deploy spot-check note, draft edit/resume UI gap, `MAX_DAILY_OUT...` cap check.

## Session 95 verification: closed
- Both session-95 commits confirmed deployed cleanly on Vercel and Render.
- "Withdraw max" quick-fill live-verified: fills exactly 100 (not the full balance), placeholder shows both min and max.

## Task: submit-work polish (file caps, combined-size check, error text)

**Sweep first (standing rule).** No file has "submit-work" in its name; a content grep for the route string found only `frontend/src/pages/JobDetail.tsx` (submission is embedded in the job detail page, not its own component) and `backend/src/routes/jobs.ts` (`POST /:id/submit-work`).

**Findings from reading the real code:**
1. **No combined-size check on the client.** `handleFilesSelected` enforced per-file size (10MB image / 50MB video) and the 4-file count, but never the combined total. The server's 100MB combined check runs only after the whole upload finishes, so a doomed batch was rejected at the very end of a slow upload.
2. **Raw error text.** The `handleSubmitWork` catch block showed `err.message` directly, so a real network failure surfaced as a low-level string like "Failed to fetch".
3. **Multer errors unhandled.** multer's per-file limit (50MB, `files: 4`) had no dedicated error handling on the route, so its rejection codes had no clean JSON response.

**Cap decision.** User asked whether 100MB combined is enough for a detailed submission. First answer (mostly text + screenshots, so fine) was incomplete: video size depends heavily on device and recording quality, and iOS screen recordings at default quality can be much larger than Android's for the same duration — meaning a normal short iOS repro could exceed the old 50MB per-file cap by itself. Options weighed: raise caps; add an in-UI tip to lower recording quality; client-side video compression (real engineering, its own failure modes). **User decision: raise the caps alongside the fixes.** Chosen numbers: video per-file **50 → 150MB**, combined **100 → 200MB**, images unchanged at 10MB.

**Fix shipped** (commit: "feat: raise submit-work caps to 150MB/file (video), 200MB combined; add client-side combined-size pre-check; friendlier network-error text; proper multer error handling"):
- `backend/src/routes/jobs.ts`: multer `fileSize` 50MB → 150MB; new `handleSubmitWorkUpload` wrapper around `upload.array('files', 4)` that maps `LIMIT_FILE_SIZE`, `LIMIT_FILE_COUNT`, and any other multer error to a clean 400 JSON message; route now uses the wrapper; manual combined-total check 100MB → 200MB (message updated).
- `frontend/src/pages/JobDetail.tsx`: `handleFilesSelected` video limit 150MB plus a running combined-total check (200MB, counting both loose attachments and inline figure attachments); `handleFieldAttachClick` gained the same combined check; the catch block now shows "Upload failed — check your connection and try again." instead of raw `err.message`.
- Applied via an exact-match Python patch script (errors out unless each block matches exactly once); `tsc --noEmit` clean on backend and frontend; diff reviewed before commit.

**Follow-up fix, caught during live test** (commit: "fix: update attachments label to match new upload limits"): the label above the file picker still read "(optional, up to 4, 50MB each)". Grepped for stale limit strings (only that one was stale — the other hits were the new "150MB" values). Now reads "(optional, up to 4 files · images 10MB, videos 150MB · 200MB total)"; verified on phone that it wraps cleanly onto two lines.

**Status:** committed, pushed, deployed. Live-confirmed by the user: an over-150MB video is skipped with the new "(over 150MB)" message, and the updated label renders cleanly. **Not separately confirmed:** a 50–150MB video actually uploading end-to-end, and the 200MB combined-size pre-check tripping.

## New watch item from this session
- `multer.memoryStorage()` buffers uploaded files in server RAM, so worst-case memory for one submit-work request is now ~200MB (was ~100MB). On a small instance, several concurrent large submissions could pressure memory. Not observed or tested — flagging only. If it ever shows up: move to disk/streaming or upload directly to storage.

## Carried forward
- Multi-worker Apply gap — Option A assessed, no go-ahead given.
- Category expansion — pending product decision on the 4 shell-only categories.
- Draft edit/resume-payment UI — backend already supports `PATCH /:id/draft`, no UI yet; not requested.
- `JobDetail.tsx` token-redeclaration cleanup (parked, not urgent).
- Standing note: spot-check Vercel deploy status after frontend pushes for a while.
- Verify the `MAX_DAILY_OUT...` cap's value and relationship to `MAX_PAYOUT_PER_TX` before ever raising the per-tx limit (user decided to leave 100π as-is).
- **Residual from "try/catch hardening":** only the multer/upload layer was hardened. The rest of the `submit-work` route body (storage upload and DB write, past ~line 484) was not read this session, so its error handling is still unexamined.
- Live tests still owed for this session's change: 50–150MB video upload succeeding; 200MB combined pre-check.
