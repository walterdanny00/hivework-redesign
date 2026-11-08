# Session 190 — Hivework

2026-11-07. Four code commits: `a33989a` (backend `/stats` plus the SQL migration, Render), `429e5cb` (`submissionKind.ts`, Vercel), `d8afd2a` (Browse, Post Job and Home go live, Vercel), `00b5711` (comments only, Vercel). All described in Section 223 of `roadmap.md`.

> **Standing rule (top of `roadmap.md`).** Grep the roadmap before proposing any test; **an item logged as "not built" may have shipped in a later section, so grep the feature name across the whole roadmap first (new this session)**; list **every** use of a flag, type or message before changing it; narrowest patch; `tsc` and `git diff --stat` before commit; deliver the **complete** `roadmap.md`, never a section-only file.

## Focus
The owner separated the old unbuilt parked list (Sections 107 and 108) from the current debugging list and chose the unbuilt list, first item: the four disabled categories. Decisions: ship Usability Testing, Content Review and Localization Testing now; hold Survey / Data until a verification method is worked out; Localization Testing uses the feedback form.

## Starting-state check (reported)
`git pull` in `~/Piwork`: up to date. `git status --short | wc -l`: 47. HEAD `d2d413d` (docs, session 189, Section 222) over `0b791b1`. `diff -rq` between the two repo copies silent. Roadmap 11245 lines at session start.

## Work
- **Wrong turn:** the first suggestion (multi-worker Apply gap) had already shipped in Section 113. Section 108's "not built" was not followed forward. Caught by the owner's grep of `jobs.ts`. Rule added to the standing-rule checklist.
- **Sweep:** `jobs_category_check` (init migration line 32; live definition queried in Supabase) allowed three values; `/stats` counted a hardcoded three-key object; `Home.tsx` spread `DEMO_CATEGORY_COUNTS` over real counts (demo numbers would have won); `getSubmissionKind` mapped `localiz` to the translation form; its only callers are `JobDetail.tsx` 316 and `SubmissionReview.tsx` 107; no other file reads `category`.
- **SQL (owner, Supabase SQL editor, before the backend push):** `20261107000000_widen_job_categories.sql` drops and re-adds the constraint with six values; Survey excluded. Owner's check query showed the six-value definition.
- **`a33989a`:** `/stats` gains three keys (+1 / -1) and the SQL file is tracked (2 files, +26 / -1). Script `~/p190a.py`, backup `jobs.ts.bak190a`. Render build passed (live 2026-11-07T20:34:59Z).
- **`429e5cb`:** `getSubmissionKind` no longer maps `localiz` to translation (+1 / -1); script `~/p190c.py`, backup `submissionKind.ts.bak190c`. Vercel completed 21:36:52 (`index-DSTs59bD.js` 405.89 kB).
- **`d8afd2a`:** three `real` flips each in `Jobs.tsx` and `PostJob.tsx`; three demo-count lines removed from `Home.tsx` (+6 / -9; my pre-run estimate of +9 / -12 was an arithmetic slip). Script `~/p190b.py`, backups `.bak190b` x3. Vercel completed 21:41:03 (`index-C_RKiLkJ.js` 405.82 kB).
- **`00b5711`:** six stale "not live" comment blocks rewritten across `Home.tsx`, `Jobs.tsx`, `PostJob.tsx`, `Landing.tsx` (+29 / -28). Script `~/p190d.py` (comment-only guard), backups `.bak190d` x4. Vercel completed 21:59:31 with the identical bundle, confirming no code changed.
- **Live check (owner, screenshots):** Home and Browse show Usability Testing "1 open job", Content Review and Localization 0, Survey / Data "Coming soon"; a worker's form shows What was reviewed / Findings / Verdict / Notes with no Environment field. Owner reported: 1π job posted by `walterdanny00`, opened by `Olawale`. The form screenshot does not show the job's category.
- **Docs:** Section 223 added; Screen Inventory rows for Browse and Post Job corrected in place; update pointers added to Sections 107 and 108; one sentence added to the standing-rule checklist.

## Findings
- Closed: category expansion for three categories; stale comments; stale Screen Inventory rows.
- Held: Survey / Data (rejected by the database, `real: false`, Home shows a demo `0`). To ship it: a migration adding the value, a `/stats` key, two `real` flips, removing Home's last demo line, a form decision. Open product question (owner's): how survey submissions are verified.
- Known limits: Landing shows only the original three categories by design (comment updated).
- Seen, not changed: demo content on Home (ticker, "Recommended for you") and Landing (`DEMO_PAID_OUT_WEEK`), already logged in Sections 40 and 107; no decision taken.
- Still open (unchanged): throw-on-error in the payment path (blocked on Pi's repeat-complete behavior); `my-application` main read at 186 to 190; `workerCall` stale card on a 409; `/stats` zero counts on a failed read; Browse empty list on a 500 (`Jobs.tsx` 169 to 173); attachment fetches ignore errors (`SubmissionReport.tsx`); what `SubmissionReview.tsx` renders when `applications` is null; raw `error.message` in other route files (not swept).

## Not verified
Posting in Content Review or Localization Testing was not run; only the Usability Testing count of 1 was seen. No feedback-form submission for a new category was reported, and the owner-side review of one was not run. Home's top-three ordering was read in code only. `JobDetail.tsx` 857 ("Coming soon" in a comment) was not read.

## Files touched
Code: `backend/src/routes/jobs.ts`, `supabase/migrations/20261107000000_widen_job_categories.sql` (`a33989a`); `frontend/src/lib/submissionKind.ts` (`429e5cb`); `frontend/src/pages/Jobs.tsx`, `PostJob.tsx`, `Home.tsx` (`d8afd2a`); the same plus `Landing.tsx`, comments only (`00b5711`). Docs: `roadmap.md` (Section 223, complete file); `sessions/session-190.md`.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork` (HEAD should be the session 190 docs commit or later; last code commit `00b5711`; 56 untracked files), then `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`. Read the standing rule at the top of `roadmap.md`. Then, owner's choice: work out Survey / Data verification and ship it; or the debugging list (Browse empty-list-on-500: `sed -n '160,200p' ~/Piwork/frontend/src/pages/Jobs.tsx`, then `grep -n "setError\|error\b" ~/Piwork/frontend/src/pages/Jobs.tsx` and every use; or the `/stats` zero counts: `Home.tsx` 81, `Jobs.tsx` 182, `Landing.tsx` 44); or decide about the demo content. Grep the roadmap before proposing any live test or any "not built" item.

Termux notes: untracked, not to be committed: 56 files expected (the 47 from Section 222 plus `jobs.ts.bak190a`, `submissionKind.ts.bak190c`, three `.bak190b`, four `.bak190d`). `~/p190a.py` to `~/p190d.py` are outside the repos. The SQL migration is tracked. Migrations are run by hand in the Supabase SQL editor (SQL first, then backend, then frontend). Run `git show <hash>` from `~/Piwork`, not `~/hivework-redesign`. Use `git --no-pager diff`. Backend deploy logs are Render's, frontend deploy logs are Vercel's.
