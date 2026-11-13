# Session 193 — Hivework

2026-11-13. One code commit: `31886f1` (Landing and Home trust rows show the live category count, Vercel). Described in Section 226 of `roadmap.md`.

> **Standing rule (top of `roadmap.md`).** Grep the roadmap before proposing any test; an item logged as "not built" may have shipped in a later section, so grep the feature name across the whole roadmap first; list **every** use of a flag, type or message before changing it; narrowest patch; `tsc` and `git diff --stat` before commit; deliver the **complete** `roadmap.md`, never a section-only file.

## Focus
The owner chose option (a) from Section 225's list: check the Landing "3 job categories" figure against the live categories.

## Starting-state check
Offered at the start; output not reported. Known: roadmap 11384 lines at session start; remote head before the push `321f9ba`.

## Decisions (owner)
- Landing trust row says 6; the grid keeps its three cards (Bug testing, UI feedback, Translation).
- Home's "7 Categories" (it counted held-back Survey / Data) corrected in the same patch; the owner ran the script that includes it.

## Work
- **Sweep:** Landing `REAL_CATEGORIES` used at its definition, trust row (83) and card grid (102). Home `CATEGORY_OPTIONS` used at 19, 72, 136, 178, 237; only 178 was wrong. `counts` on both pages starts with three keys and is replaced only if `/stats` answers, so counting its keys would have read 3 (or stayed 3 on a failed fetch). `PostJob.tsx` `CATEGORIES` (line 18) was not exported; uses at 84 and 434 (`real` read at 437, 438, 443); `App.tsx` is the only importer of the default export; no circular import.
- **`31886f1`** (3 files, +5 / -5): `export` added to `PostJob.tsx` `CATEGORIES`; `Landing.tsx` (line 83) and `Home.tsx` (line 178) trust-row number is `CATEGORIES.filter(c => c.real).length`, with `CATEGORIES` added to the existing `PLATFORM_FEE_RATE` import. Script `~/patch193a.py`; backups `Landing.tsx.bak193a`, `Home.tsx.bak193a`, `PostJob.tsx.bak193a`; `tsc` clean; diff read. Pushed `321f9ba..31886f1`.
- **Live checks:** screenshots pass: Home "6 Categories" (list and "+4 more categories" unchanged); Landing "6 job categories" (three cards unchanged). Vercel log not pasted.
- **Docs:** Section 226 added; update pointers added to Sections 223 and 225.

## Findings
- Closed: Landing "3 job categories"; Home "7 Categories". Both now follow the `real` flags, so shipping Survey / Data later updates them automatically.
- Left on purpose: Landing's three cards stay hardcoded; Home's "+4 more categories" row still counts Survey / Data.
- Seen, not changed: every category shows 0 open jobs on both pages (Section 223 had Bug Testing 1 and Usability Testing 1), reason not investigated; Home shows no "Happening now" block, consistent with the empty feed (payouts from 2026-11-05 now outside the 7-day window), not curled; "Recommended for you" and the Landing ticker are still demo content.
- Held, not built: "Recommended for you"; Survey / Data.
- Still open (unchanged): throw-on-error in the payment path (blocked on Pi's repeat-complete behavior); `my-application` main read at `jobs.ts` 186 to 190; `workerCall` stale card on a 409; `/stats` zero counts on a failed read (`Home.tsx` 81, `Jobs.tsx` 182, `Landing.tsx` 44); Browse empty list on a 500 (`Jobs.tsx` 169 to 173); attachment fetches ignore errors (`SubmissionReport.tsx`); what `SubmissionReview.tsx` renders when `applications` is null; raw `error.message` in other route files (not swept); Help FAQ placeholder copy.

## Not verified
Vercel build log; starting-state check; untracked count after the commit (65 expected); live `/stats` response; why open-job counts are 0; the feed's current state.

## Files touched
Code: `frontend/src/pages/PostJob.tsx`, `Landing.tsx`, `Home.tsx` (`31886f1`). Docs: `roadmap.md` (Section 226, complete file); `sessions/session-193.md`.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork` (HEAD should be the session 193 docs commit or later; last code commit `31886f1`; 65 untracked files), then `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`. Read the standing rule at the top of `roadmap.md`. Then, owner's choice: the debugging list (Browse empty-list-on-500: `sed -n '160,200p' ~/Piwork/frontend/src/pages/Jobs.tsx`, then `grep -n "setError\|error\b" ~/Piwork/frontend/src/pages/Jobs.tsx` and every use; or the `/stats` zero counts); design the recommendation logic; or revisit Survey / Data. Grep the roadmap before proposing any live test or any "not built" item.

Termux notes: untracked, not to be committed: 65 files expected (the 62 from Section 225 plus `Landing.tsx.bak193a`, `Home.tsx.bak193a`, `PostJob.tsx.bak193a`). `~/patch193a.py` is outside the repos. API base for curl: `BASE=https://hivework-backend.onrender.com` (see the "Standing reference" near the top of `roadmap.md`). Use `git --no-pager diff`. Run `git show <hash>` from `~/Piwork`, not `~/hivework-redesign`.
