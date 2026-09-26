# Session 94 — 2026-09-25

Built and shipped queued candidate (3) from session 93: upload progress on
the submit-work file upload, explicitly requested by the user. Along the way,
uncovered and fixed a Vercel deploy issue unrelated to the code itself.

## Repo state at start

`~/Piwork` at `ac3f3dd` (session 93 docs commit), `git pull` clean in both
`~/Piwork` and `~/hivework-redesign`, `diff -rq` between the two docs copies
silent. Clean going in.

## Upload progress on submit-work: built, pushed, deploy-blocked, then confirmed live

`fetch` can't report upload progress, so `handleSubmitWork`
(`frontend/src/pages/JobDetail.tsx`) needed to move to `XMLHttpRequest` for
just the submit-work call, while everything else keeps using `apiFetch`.

**Patch, three files:**
- `frontend/src/lib/api.ts` — new `apiFetchWithProgress(path, formData,
  onProgress)`. Matches `apiFetch`'s URL base and `x-session-token` auth
  header, but built on `XMLHttpRequest` so `xhr.upload.onprogress` can report
  percent complete. Returns a `fetch`-`Response`-shaped object
  (`{ ok, status, json() }`) so `handleSubmitWork`'s existing `res.ok` /
  `res.json()` logic needed no restructuring.
- `frontend/src/pages/JobDetail.tsx` — new `uploadProgress` state, reset to 0
  on submit start and in the `finally` block; `handleSubmitWork` now calls
  `apiFetchWithProgress(...)` instead of `apiFetch(...)`; a progress bar
  renders while `submitting` is true; the button label shows
  `Submitting... X%`.
- `frontend/src/index.css` — `.attach-progress-track` /
  `.attach-progress-fill` added. These classes already existed in the design
  shell (`hivework-redesign/screens/HiveworkJobDetailWorker.jsx` and the
  compiled `.html`/`HiveworkApp.jsx`) as a fixed `width:64%` decoration — per
  session 48's notes, a pure visual motif, never wired to real data. The real
  app had no `.attach-progress-*` classes at all (confirmed via grep). This
  session ports the class names but drops the fixed width in favor of an
  inline `style={{ width: '${uploadProgress}%' }}`, and adds the theme-aware
  `--violet`/`--line` variables (confirmed present in both light and dark
  blocks of `index.css`) plus a transition.

Applied with the same scripted-replace-with-abort-on-mismatch pattern as
`e919ce7`. All 6 matches hit on the first try. `npx tsc --noEmit` clean, diff
reviewed file-by-file (`api.ts`, `JobDetail.tsx`, `index.css`) before
committing. Commit `8554b5f`, pushed to `origin/main`.

**Deploy blocked, cause found, resolved.** Vercel's dashboard showed the
deployment for `8554b5f` as **Blocked**: "the commit author did not have
contributing access to the project on Vercel... Hobby Plan does not support
collaboration for private repos." The user owns both the GitHub account
(`walterdanny00`) and the Vercel project, and no prior deployment had ever
been blocked — `git config user.name`/`user.email` matched the account
correctly, ruling out a local misconfiguration. `e919ce7` (session 93) was
backend-only and `ac3f3dd` was docs-only, so `8554b5f` was the first
frontend-touching push in some time to actually trigger a Vercel build,
meaning a stale connection could have gone unnoticed for a while. The user
had rotated their GitHub personal access token a few weeks prior; while that
token isn't the one Vercel's GitHub App integration uses internally, the
timing lined up. **Fix:** reconnected/reauthorized the GitHub integration
under Vercel Project Settings → Git. Deploy then went through.

**Live-tested and confirmed working.** User tested a real submit-work upload
(3 attachments: 2 `.mp4` + 1 `.jpg`, some via mobile Pi Browser). Screenshots
show the progress bar filling and the button reading "Submitting... 32%",
"... 93%", "... 100%" in sequence, matching expected behavior exactly.

## Files

`frontend/src/lib/api.ts`, `frontend/src/pages/JobDetail.tsx`,
`frontend/src/index.css` (`~/Piwork`, commit `8554b5f`). Docs:
`hivework-redesign/roadmap.md` (Section 109 added) and
`sessions/session-94.md`.

## Status

Code shipped, deployed, and live-confirmed. Open items after this session:

- `JobDetail.tsx` token-redeclaration removal: parked, unchanged.
- Queued candidates from session 93, **upload progress now done**; remaining,
  none started: (1) Option A for the multi-worker Apply gap (fix shape
  assessed, no go-ahead given); (2) friendlier submit-work network-error text
  and a clearer file-cap message (frontend only); (3) try/catch hardening on
  `submit-work`; (4) the category expansion, pending the product decision
  (whether the 4 shell-only categories are wanted at all).
- Worth a general note for future sessions: since this Vercel auth issue was
  silent until a frontend-touching commit finally triggered a build, it's
  worth spot-checking deploy status after any frontend push for a while, not
  just assuming autodeploy succeeded.
