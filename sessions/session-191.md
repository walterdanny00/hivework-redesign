# Session 191 — Hivework

2026-11-08. Two code commits, both Vercel: `c1db2e6` (Landing trust row) and `5e4e4c2` (Landing ticker placeholders). Described in Section 224 of `roadmap.md`.

> **Standing rule (top of `roadmap.md`).** Grep the roadmap before proposing any test; an item logged as "not built" may have shipped in a later section, so grep the feature name across the whole roadmap first; list **every** use of a flag, type or message before changing it; narrowest patch; `tsc` and `git diff --stat` before commit; deliver the **complete** `roadmap.md`, never a section-only file.

## Focus
The owner chose Survey / Data verification from Section 223's list, decided to keep it held back, then chose the demo content on Home and Landing.

## Starting-state check (reported)
`git pull` in `~/Piwork`: up to date. `git status --short | wc -l`: 56. HEAD `e7047bd` (docs, session 190, Section 223) over `00b5711`. `diff -rq` between the two repo copies silent. Roadmap 11292 lines at session start.

## Work
- **Survey / Data verification (analysis only):** options were screenshot only, completion code, code plus Hivework username, owner reads exports. Weakness found when the owner asked how a code is generated and authenticated: under those methods Hivework never sees or checks the code, and a fixed code can be shared. `PostJob.tsx` has no survey link or code field, and the submit endpoint takes one plain-text `submission` field. A stronger design (a per-worker HMAC token appended to the survey link, matched by the owner by hand) proves which worker a response belongs to, not honest completion; automatic proof needs a survey builder inside Hivework or per-platform callbacks. **Owner decision: keep Survey / Data held back.**
- **Demo content decisions (owner):** Landing "116π paid out this week" replaced with a true product fact; Home "Happening now" ticker and "Recommended for you" to be built into real features when possible, kept as they are until then (the suggested retitle was declined); Landing ticker placeholders yes, "Example" label no.
- **Sweeps:** `DEMO_PAID_OUT_WEEK` only in `Landing.tsx` (17 to 20, 82) plus `.bak190d`; `Olawalt` and `GB33VY` in `src` only in `Landing.tsx` 23 and 24.
- **`c1db2e6`:** the constant and its comment mention removed; first trust item now `Escrow` / `held until approved` (+4 / -5). Script `~/patch191a.py`, backup `Landing.tsx.bak191a`; `tsc` clean.
- **`5e4e4c2`:** ticker uses `@worker · report submitted` and `G…XXXX` (+2 / -2). Script `~/patch191b.py`, backup `Landing.tsx.bak191b`; `tsc` clean.
- **Live check (owner, screenshots):** trust row on one line on a phone; ticker shows the placeholders. Vercel logs not pasted.
- **Docs:** Section 224 added; update pointers added to Sections 107 and 223.

## Findings
- Closed: the invented Landing figure; real-looking handle and wallet in the Landing ticker; Survey / Data verification analysed and decided (held).
- Held, not built: Survey / Data (migration, `/stats` key, two `real` flips, Home demo line removal, a form, a verification design, a survey-link field on Post Job); a real activity feed (new anonymized read-only route); real "Recommended for you" (skills column on jobs and the matching logic, never designed).
- Left on purpose: Home ticker and "Recommended for you" still invented and shown as live; Landing ticker is sample data without a label.
- Still open (unchanged): throw-on-error in the payment path (blocked on Pi's repeat-complete behavior); `my-application` main read at `jobs.ts` 186 to 190; `workerCall` stale card on a 409; `/stats` zero counts on a failed read (`Home.tsx` 81, `Jobs.tsx` 182, `Landing.tsx` 44); Browse empty list on a 500 (`Jobs.tsx` 169 to 173); attachment fetches ignore errors (`SubmissionReport.tsx`); what `SubmissionReview.tsx` renders when `applications` is null; raw `error.message` in other route files (not swept); Help FAQ placeholder copy.

## Not verified
The 7% and the 10π to 9.3π step were read as consistent from screenshots, not checked against `PLATFORM_FEE_RATE`. Landing was seen on one phone width. Home was not changed or re-checked. No sweep for placeholder data on other screens.

## Files touched
Code: `frontend/src/pages/Landing.tsx` (`c1db2e6`, `5e4e4c2`). Docs: `roadmap.md` (Section 224, complete file); `sessions/session-191.md`.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork` (HEAD should be the session 191 docs commit or later; last code commit `5e4e4c2`; 58 untracked files), then `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`. Read the standing rule at the top of `roadmap.md`. Then, owner's choice: the debugging list (Browse empty-list-on-500: `sed -n '160,200p' ~/Piwork/frontend/src/pages/Jobs.tsx`, then `grep -n "setError\|error\b" ~/Piwork/frontend/src/pages/Jobs.tsx` and every use; or the `/stats` zero counts); or start a real Home feature (the activity feed route, or the recommendation logic design); or revisit Survey / Data with the token flow or a survey builder. Grep the roadmap before proposing any live test or any "not built" item.

Termux notes: untracked, not to be committed: 58 files expected (the 56 from Section 223 plus `Landing.tsx.bak191a` and `Landing.tsx.bak191b`). `~/patch191a.py` and `~/patch191b.py` are outside the repos. Run `git show <hash>` from `~/Piwork`, not `~/hivework-redesign`. Use `git --no-pager diff`. Frontend deploy logs are Vercel's.
