# Session 79 (2026-09-11)

## Context
Continuing from session 78's closed state (Decline/Undo fully real,
JobDetail.tsx token-redeclaration item still parked). Picked from
session 78's queued candidates: real file-upload attachments on
submit-work — chosen as the highest-priority functional gap ahead of
wider release (the other two candidates, the 4 "coming soon" job
categories and `ACTIVITY_TICKER` demo data, are cosmetic/backend-stats
items rather than a trust-affecting functional gap).

## Sweep (standing rule — before designing)
- `applications.submission` is a plain `text` column, built by
  `composeSubmission()` into a single markdown-style string (`### What
  was done\n...`), joined with blank lines. No JSON, no structure.
  Rendered raw on the owner view — no markdown renderer exists anywhere
  in the app, so `###` shows as literal characters (pre-existing,
  unrelated to this session — see Deferred below).
- No Supabase Storage buckets existed yet. `@supabase/supabase-js`
  already in use, backend via **service-role key**, no client-side
  Supabase Auth — auth is a custom `sessions` table + `x-session-token`
  header (`requireAuth` middleware), matching the rest of the app.
- Frontend's `apiFetch` unconditionally forced `Content-Type:
  application/json`, which would break `FormData` uploads.
- No multipart parser installed (`multer`/`formidable`/`busboy` all
  absent from `package.json`).

## Decision
- New `attachments jsonb default '[]'` column on `applications`,
  additive and separate from `submission` — a file list doesn't belong
  woven into prose text, and jsonb lets attachments render as an actual
  list rather than pasted URLs inside a text blob.
- New private Supabase Storage bucket `work-submissions`, path
  convention `{application_id}/{timestamp}-{filename}`.
- Uploads route through the existing Express backend (multipart
  `multer`, memory storage) rather than direct-from-browser to
  Supabase — no Supabase client exists in the frontend, and adding one
  just for this would mean a second auth model alongside the custom
  sessions. Backend uploads with the service-role key and writes paths
  into `attachments`.
- Access control: two `storage.objects` RLS policies were written
  initially (insert scoped to the submitting worker, select scoped to
  worker + job's client) but then **dropped** once the service-role/
  no-client-auth setup was confirmed — `auth.uid()` never resolves for
  any real request here, so the policies were dead weight. Access
  control lives entirely in Express route ownership checks instead,
  consistent with every other route in this app.
- Limits: images (jpg/png/webp) 10MB/file; video (mp4/mov) 50MB/file
  — raised from an initial 10MB-for-everything proposal once the user
  flagged video needs more headroom; up to 4 files, 100MB combined cap
  per submission. Video capped by file size only, no client-side
  duration cap (discussed and explicitly decided against — a duration
  cap needs unreliable client-side metadata reads for little benefit
  over the size cap already in place; revisit only if abuse patterns
  appear in practice).
- Attachment display on the owner view: plain file-name link list, not
  thumbnails — thumbnails are a visual/UX decision that belongs in the
  redesign shell first, per the project's standing "old code informs
  facts, never dictates UX" rule. File-name links are a complete,
  reasonable v1.

## What changed

**Database (Supabase SQL editor, run directly — no migration file in
this project)**
- `alter table applications add column attachments jsonb default
  '[]'::jsonb`
- `insert into storage.buckets (id, name, public) values
  ('work-submissions', 'work-submissions', false)`
- Two RLS policies created then dropped (see Decision above).

**Backend (`backend/package.json`)**
- Added `multer` + `@types/multer`.

**Backend (`backend/src/routes/jobs.ts`)**
- `multer` configured: memory storage, 50MB/file, 4-file max,
  image/video mimetype filter.
- `POST /:id/submit-work` now takes `upload.array('files', 4)`,
  accepts `multipart/form-data`, enforces the 100MB combined cap,
  uploads each file to `work-submissions`, stores `{path, filename,
  size, type}` per file in `attachments`, returns `{ok, attachments}`.
- New `GET /attachment-url` route: issues a 5-minute signed URL, gated
  to the submitting worker or the job's client only.
- Both `applications` SELECT queries (job list + job detail) extended
  to include `attachments` (see Bugs below — missed on first pass).
- `attachment-url` route reordered to sit **above** the generic
  `GET /:id` route (see Bugs below — was being shadowed).

**Frontend (`frontend/src/lib/api.ts`)**
- `apiFetch` now skips the forced JSON `Content-Type` header when the
  request body is `FormData`.

**Frontend (`frontend/src/pages/JobDetail.tsx`)**
- `Application` interface: added `attachments?: {path, filename, size,
  type}[]`.
- Worker-view: real file input (`accept="image/jpeg,image/png,
  image/webp,video/mp4,video/quicktime"`, `multiple`) replaces the
  disabled "Coming soon" stub.
- New `handleFilesSelected` handler: accumulates files across multiple
  picker opens (native `<input multiple>` otherwise replaces the whole
  selection on every click — see Bugs below), dedupes by name+size,
  enforces per-type size caps and the 4-file cap client-side with a
  visible "Skipped: ..." message, resets the input value so re-picking
  works. Per-file remove buttons added to the selected-files list.
- `handleSubmitWork` rewritten to send `FormData` instead of JSON;
  merges the backend's returned `attachments` into local state on
  success.
- Owner-view: renders a clickable file-name list per submission
  (📎 filename); click fetches a signed URL via the new
  `downloadAttachment()` helper and opens it in a new tab.

## Bugs found during live test (three, all fixed same session)
1. **Attachments not appearing on client view.** Root cause: neither
   of the two `applications` SELECT queries included the new
   `attachments` column — files uploaded and wrote to the DB
   correctly, but the client never received them back. Fixed by
   adding `attachments` to both SELECTs.
2. **File picker overwrote prior selections.** Native `<input
   type="file" multiple>` replaces the whole file list on every
   "Choose Files" click rather than appending — selecting images, then
   opening the picker again for a video, silently discarded the
   images. Also, selecting more than 4 files just silently truncated
   with no feedback. Fixed with the `handleFilesSelected` accumulation
   handler described above.
3. **Clicking an attachment did nothing.** Root cause: `GET
   /attachment-url` was registered *after* the generic `GET /:id`
   route, so Express matched `/api/jobs/attachment-url` against
   `/:id` first (treating "attachment-url" as the id param) — the real
   handler never ran, and the frontend's `if (data.url)` check silently
   no-opped on the mismatched response. Fixed by moving
   `attachment-url` above `/:id` in route registration order.

## Verification
- `tsc --noEmit` clean on both backend and frontend after every patch
  round (3 rounds total, across the initial build and the two bug-fix
  passes).
- `vite build` succeeded each time (65 modules, ~356 kB).
- Live-tested in Pi Browser across three rounds:
  - Round 1 (commit `34e6102`): submission with attachments succeeded,
    but client view showed no files (Bug 1) and the file picker
    discarded earlier picks when re-opened (Bug 2).
  - Round 2 (commit `0cfe143`, fixes for Bugs 1 & 2): multi-batch
    picking, 4-file cap rejection messaging, and attachments appearing
    on the client view all confirmed clean. Clicking a file did
    nothing (Bug 3).
  - Round 3 (commit `726954b`, fix for Bug 3): clicking both video and
    image attachments now opens each correctly in a fresh tab (video
    plays via the browser's native handler and offers Download; images
    open as viewable images). All four test cases clean.

## Post-ship investigation: explicit image download

After shipping, live testing surfaced a real gap: video can be
downloaded via the native player's own controls, but images — which
only open/view — had no equivalent. User confirmed native long-press-
to-save on images also does nothing in Pi Browser.

**Attempt 1 (commit `2f7e3d2`):** added a second "Download" button
per attachment, using Supabase's `createSignedUrl(path, ttl, {
download: filename })` option to set a `Content-Disposition:
attachment` header, opened via `window.open`. Live test: video
downloaded (but saved under the raw `{timestamp}-{filename}` storage
path, not the intended clean name — the `download` option's filename
override was not honored), all image downloads failed with "Download
unsuccessful" in the OS download manager.

**Attempt 2 (commit `1852a34`):** switched to a client-side blob
fetch + synthetic `<a download>` click, bypassing server headers
entirely. Live test: completed the full JS flow with no thrown error,
but produced no file and no download-manager entry at all — worse
than attempt 1's visible failure, this failed silently.

**Diagnosis (commits `300d2a3`, `51727e4`, `c8cec08`):** added
`alert()`-based diagnostics first — no alerts appeared at all,
suggesting Pi Browser's embedded WebView may not implement
`window.alert`. Switched to an on-page DOM status line
(`#download-status-line`, updated directly via
`getElementById().textContent`, since `downloadAttachment` is a
module-level function outside React state) to get visible diagnostics
that don't depend on native dialogs.

**Attempt 3 (commit not separately tagged, same patch round):** tried
the Web Share API (`navigator.canShare`/`navigator.share` with a
`File`) as a second, independent download mechanism, falling back to
the attempt-2 blob method if unsupported. Live test: status line
showed the full sequence completing ("Requesting URL..." → "Fetching
file..." → "Got blob..." → "Download triggered for ...") with no
error at any step, but again no file appeared anywhere on the device.
This confirms `navigator.canShare` returned falsy (fell through to
the already-failing blob method) rather than the share sheet ever
opening.

**Conclusion:** two independent, standards-based download mechanisms
(`<a download>` blob URLs and Web Share API) both fail silently in
this WebView, on top of native long-press-save also not working, and
no "open in system browser" option exists in Pi Browser's own menu
(checked directly — the chevron next to the URL bar only shows recent
URLs). This is a Pi Browser WebView sandbox limitation (most likely a
missing native download-listener wired up by the host app), not
something fixable from this app's JavaScript. Video downloads via the
native player worked all along because that path is handled by the
OS's native video player taking over the tab, not by anything this
app's code triggers.

**Resolution (commits `056dce0`, `5530df6`):** reverted cleanly to the
original view-only behavior — single button opens the signed URL in a
new tab; all diagnostic code, the second Download button, and the
now-unused backend `download` query-param handling were removed.
Final frontend bundle hash (`Dh1Y_kg1`) matched byte-for-byte the
build from before this entire detour, confirming a clean revert.
Flagged as a known platform limitation: **images currently have no
working save path in-app**; video remains downloadable via its native
player. Would need Pi Browser itself to add proper WebView download
support — not something to keep chasing from the app side.

## Status
Real file-upload attachments on submit-work fully shipped and
confirmed working end-to-end. Worker can attach up to 4 image/video
files with client-side validation; client can view/open each one via
short-lived signed URLs, and can download video via the native
player. Explicit image download was investigated in depth post-ship
and found to be blocked by a Pi Browser platform limitation — not
fixed, flagged as known and out of this app's control.

## Deferred (not part of this session's scope)
`composeSubmission()`'s raw `### Header` markdown text has no renderer
anywhere in the app — submissions show literal `###` characters on the
owner view. Pre-existing, surfaced during this session's live test but
explicitly not fixed ad hoc, per the standing "old code informs facts,
never dictates UX" rule — flagged as a future redesign-shell candidate.

## Open items (unchanged from session 78)
- `JobDetail.tsx` token-redeclaration removal (commit `bd53c30`,
  reverted `5b13ca8`) — still parked, no retry planned absent a
  concrete symptom.

## Next session
No specific target queued. Candidates raised but not committed: the 4
"coming soon" job categories (backend-only work — extending `/stats`,
the filter buttons, and the `ICONS` map), the `ACTIVITY_TICKER` demo
data, or the deferred submission-text markdown-rendering issue above.
