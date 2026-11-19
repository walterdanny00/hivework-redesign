# Session 198 — Hivework

2026-11-19. No code commit. Described in Section 231 of `roadmap.md`.

> **Standing rule (top of `roadmap.md`).** Grep the roadmap before proposing any test; an item logged as "not built" may have shipped in a later section, so grep the feature name across the whole roadmap first; list **every** use of a flag, type or message before changing it; narrowest patch; `tsc` and `git diff --stat` before commit; deliver the **complete** `roadmap.md`, never a section-only file.

## Focus
The owner chose option (c) from Section 230's list: a look at the Onboarding screen itself for the new skill suggestions.

## Starting-state check
Output reported: `git pull` up to date; HEAD `a505e95` (Docs: session 197, Section 230), then `e571f6f`, `fa7d849`; 75 untracked; `diff -rq` silent; `roadmap.md` 11604 lines.

## Decisions
- **Owner:** option (c), the Onboarding screen itself.
- **Owner:** cannot sign in as `lizzybeth00` (the only incomplete account), so the screen was reached by temporarily clearing the owner's own `walterdanny00`; the owner ran the clear and the restore.

## Work
- **Roadmap grep first:** the Profile edit-mode check is on record (Section 229) and was not repeated; the Onboarding screen was logged only as Not verified.
- **Sweep (owner's Termux output):** every `Onboarding` / `profile_complete` / `/onboarding` use in `frontend/src`; the `Onboarding.tsx` grep; `sed -n 270,360p`; `grep -rn profile_complete` in `backend/src`; `sed -n 15,75p routes/users.ts`. Findings: the page redirects to `returnTo` when `profile_complete === true` (306 to 307), so only an incomplete account sees it; the only write of `profile_complete` is `users.ts` 44 (`skills.length > 0`); reads at `jobs.ts` 230 to 232 (`/recommended` empty) and 808 to 809 (Apply `profile_incomplete`).
- **Supabase:** user list (five users; only `lizzybeth00` incomplete); the owner's row read first; clear returned empty skills and false; restore (skills, `profile_complete`, devices, languages) and a read-back that matched the original, with the bio intact.
- **Live checks (pass, owner's screenshots):** empty state (header, empty Skills, Devices, Languages, Bio 0 / 200, greyed Save Profile); typing `A` gave six rows over the Devices and Languages fields, above the keyboard, last row clipped; picking `Android Testing` gave one chip, Save Profile enabled, Skip button visible; the owner reported "Skipped".
- **Docs:** Section 231 added; update pointers added to Section 229 and Section 230.

## Findings
- Closed: the Onboarding screen itself with the skill suggestions (Not verified in Section 229).
- Seen, not changed: the skills chip (grey pill, small ×) differs from the Devices and Languages chips (violet outline, bold ×), not in the roadmap and not investigated; the open suggestion list covers the Devices and Languages inputs.
- Still open (unchanged): throw-on-error in the payment path (blocked on Pi's repeat-complete behavior); `my-application` main read in `jobs.ts`; `workerCall` stale card on a 409; `/stats` zero counts on a failed read; Browse empty list on a 500 (`Jobs.tsx` 169 to 173); attachment fetches ignore errors (`SubmissionReport.tsx`); what `SubmissionReview.tsx` renders when `applications` is null; raw `error.message` in other route files (not swept); Help FAQ placeholder copy; free-typed device and language entries that contain a comma. Held: Survey / Data.
- Loose ends (unchanged, not looked at): "Skills draft test" (`e6b81ddf-2306-4574-86e6-d4dade2bbdb2`) still a draft; Olawalt's application to "Rec test match" not rechecked. `lizzybeth00` is incomplete (0 skills); the owner cannot sign in as it.

## Not verified
The Connect-wallet step of `/onboarding`; the redirect for a complete profile (code only); where Skip landed; the Dashboard "Set up →" and JobDetail nudges; the trust score while the profile was cleared; the default of `profile_complete` on a new user row; whether the profile screenshot was taken before or after the restore.

## Files touched
Code: none. Docs: `roadmap.md` (Section 231, complete file, 11643 lines); `sessions/session-198.md`.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork` (HEAD should be the session 198 docs commit or later; last code commit `e571f6f`; 75 untracked files), then `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`, then `wc -l ~/Piwork/hivework-redesign/roadmap.md` (11643). Read the standing rule at the top of `roadmap.md`. Then, owner's choice: (a) the debugging list: Browse empty-list-on-500 (`sed -n '160,200p' ~/Piwork/frontend/src/pages/Jobs.tsx`, then `grep -n "setError\|error\b" ~/Piwork/frontend/src/pages/Jobs.tsx` and every use) or the `/stats` zero counts; (b) revisit Survey / Data. Grep the roadmap before proposing any live test or any "not built" item.

Termux notes: untracked, not to be committed: 75 files expected (no change this session). Backend sweeps run from `~/Piwork/backend/src`, frontend sweeps from `~/Piwork/frontend/src`. The backend check is `npx tsc --noEmit` in `backend`; the frontend check is `npm run build` in `frontend`. API base for curl: `BASE=https://hivework-backend.onrender.com`. To get a token: Supabase SQL editor, `select token, expires_at from sessions where username = '<n>' and expires_at > now() order by expires_at desc limit 1;`, then `read -rs WORKER_TOKEN && export WORKER_TOKEN` in Termux; never paste a token into chat; `unset WORKER_TOKEN` afterwards. Use `git --no-pager` for every diff and log. Run `git show <hash>` from `~/Piwork`, not `~/hivework-redesign`.
