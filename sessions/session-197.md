# Session 197 — Hivework

2026-11-19. One code commit: `e571f6f` (`/api/jobs/recommended` ranks by the stems a worker's skills share with the job's title and requirements text, below `skills_required` overlap). Described in Section 230 of `roadmap.md`.

> **Standing rule (top of `roadmap.md`).** Grep the roadmap before proposing any test; an item logged as "not built" may have shipped in a later section, so grep the feature name across the whole roadmap first; list **every** use of a flag, type or message before changing it; narrowest patch; `tsc` and `git diff --stat` before commit; deliver the **complete** `roadmap.md`, never a section-only file.

## Focus
The owner chose option (c) from Section 229's list: v3, matching a worker's skills against the job's own text. Design first, then one narrow backend patch in `/recommended`.

## Starting-state check
Output reported: `git pull` up to date in both repos; HEAD `fa7d849` (Docs: session 196, Section 229), then `4650382`, `355670a`, `af08c17`, `1ace913`, `85b4397`; 74 untracked; `diff -rq` silent; `roadmap.md` 11562 lines (`wc -l`).

## Decisions
- **Owner:** option (c), v3 job-text matching ("C").
- **Owner:** match against title + requirements, not the description.
- **Owner:** weight left to "decide after the sweep"; then "Agreed" to the proposal: text match is a tiebreaker below `skills_required` overlap and above category history, never a filter.

## Work
- **Roadmap grep first:** v3 only as "held, not built" (Sections 227, 228, 229), no design, no test on record. The only ranking test on record (Section 228, `skills_required`) was not repeated; the live test was new.
- **Sweep (owner's Termux output):** `grep` of `skillStems`, `stemWord`, `SKILL_STOP`, `cleanSkills`, `/recommended` and of `description` / `requirements` in `routes/jobs.ts`; `sed -n` 184 to 215, 223 to 300 and 60 to 110; `grep` of `normArr` / `normList`; `REQ_MAX` and `requirements` in `PostJob.tsx`. Findings: `requirements` is a real text column; `skillStems` is used only inside `/recommended` (253, 256); `getApplyableJobs` already hands `title` and `requirements` to the sort; `normArr` would turn a null into the stem `null`, so the patch filters to strings.
- **`e571f6f`** (`backend/src/routes/jobs.ts`, +8 / -1): local `textOverlapOf(j)` after `overlapOf`; sort is now skills overlap, text overlap, category count, newest. Script `~/patch197a.py` (sha not recorded; two exact-match anchors; refuses CRLF, an existing backup or an existing `textOverlapOf`); backup `jobs.ts.bak-s197`; `npx tsc --noEmit` printed `TSC_OK`; full `git diff -U0` read. Pushed `fa7d849..e571f6f`; owner reported "Deployed" (build log not shown).
- **Live checks (pass):** no other open jobs; "Text rank A" (older, requirements "Android testing experience needed") and "Text rank B" (newer, "Translate onboarding copy"), no skills on either; `/recommended` with the worker token (Olawalt, skills `Android tester`) returned A then B, and Home showed the same order. Control: A's requirements set to "Translate onboarding copy" in SQL, the same curl returned B then A, both present. Both test jobs cancelled by the owner.
- **Docs:** Section 230 added; update pointers added above Section 108, to Section 228 and to Section 229.

## Findings
- Closed: v3 job-text matching for title and requirements (the description is not matched, by the owner's decision).
- Limits, seen, not changed: stems match words, not meaning; text is only a tiebreaker, so any `skills_required` overlap wins; common words in requirements can match by chance; stems are recomputed in each sort comparison (like `overlapOf`; not measured); Apply still enforces nothing.
- Still open (unchanged): throw-on-error in the payment path (blocked on Pi's repeat-complete behavior); `my-application` main read in `jobs.ts`; `workerCall` stale card on a 409; `/stats` zero counts on a failed read; Browse empty list on a 500 (`Jobs.tsx` 169 to 173); attachment fetches ignore errors (`SubmissionReport.tsx`); what `SubmissionReview.tsx` renders when `applications` is null; raw `error.message` in other route files (not swept); Help FAQ placeholder copy; free-typed device and language entries that contain a comma. Held: Survey / Data.
- Loose ends (unchanged, not looked at): "Skills draft test" (`e6b81ddf-2306-4574-86e6-d4dade2bbdb2`) still a draft; Olawalt's application to "Rec test match" not rechecked.

## Not verified
The order when a job has both a `skills_required` overlap and a different text overlap (code order only); a worker with several matching stems; the Render build log of `e571f6f`; the sha of `~/patch197a.py`; the refund amounts of the two cancelled test jobs; which account the Home screenshot was taken from.

## Files touched
Code: `backend/src/routes/jobs.ts` (`e571f6f`). Docs: `roadmap.md` (Section 230, complete file, 11604 lines); `sessions/session-197.md`.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork` (HEAD should be the session 197 docs commit or later; last code commit `e571f6f`; 75 untracked files), then `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`, then `wc -l ~/Piwork/hivework-redesign/roadmap.md` (11604). Read the standing rule at the top of `roadmap.md`. Then, owner's choice: (a) the debugging list: Browse empty-list-on-500 (`sed -n '160,200p' ~/Piwork/frontend/src/pages/Jobs.tsx`, then `grep -n "setError\|error\b" ~/Piwork/frontend/src/pages/Jobs.tsx` and every use) or the `/stats` zero counts; (b) revisit Survey / Data; (c) a look at the Onboarding screen itself for the new suggestions. Grep the roadmap before proposing any live test or any "not built" item.

Termux notes: untracked, not to be committed: 75 files expected (the 74 from session 196 plus `jobs.ts.bak-s197`). `~/patch197a.py` is outside the repos. Backend sweeps run from `~/Piwork/backend/src`, frontend sweeps from `~/Piwork/frontend/src`. The backend check is `npx tsc --noEmit` in `backend`; the frontend check is `npm run build` in `frontend`. API base for curl: `BASE=https://hivework-backend.onrender.com`. To get a token: Supabase SQL editor, `select token, expires_at from sessions where username = '<n>' and expires_at > now() order by expires_at desc limit 1;`, then `read -rs WORKER_TOKEN && export WORKER_TOKEN` in Termux; never paste a token into chat; `unset WORKER_TOKEN` afterwards. Use `git --no-pager` for every diff and log. Run `git show <hash>` from `~/Piwork`, not `~/hivework-redesign`.
