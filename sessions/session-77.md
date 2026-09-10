# Session 77 — Dashboard budget-tracker drift also fixed in HiveworkApp.jsx (2026-09-10)

Picked up the JSX follow-up flagged at the end of session 76.

## Work done

`HiveworkApp.jsx` was uploaded into context and swept against the same
Section 43 facts used for the HTML shell fix (session 76). Found the
identical drift:

1. `.dash-stat-row` had the same two static pills, no worker-tab
   "Pending" pill. Fixed by adding a third `stat-pill`, conditionally
   rendered only when `workView === "mywork"` — the React equivalent
   of the HTML shell's `#dash-stat3` display toggle inside
   `toggleWork()`. New constant `DASH_EARNINGS_PENDING = 3`, matching
   the HTML shell's value exactly.
2. `DASH_JOBS_POSTED_COUNT`'s comment had the identical stale claim
   that real code lacks a jobs-posted-count field. Corrected with the
   same wording used in the HTML shell's fix — Section 43 added a
   real `jobs_posted_count` backend field.

`DASH_BUDGET_TRACKER` checked and matches the already-verified-accurate
HTML shell version — no drift, untouched.

**Verification:** diffed edited file against original — same 3-part
change shape as the HTML shell fix (markup, two data/comment edits,
one conditional render), nothing else touched. Brace/paren counts
balanced before and after (1914→1918 braces, 1993→2005 parens,
consistent with the added code).

## Files touched

`hivework-redesign/screens/HiveworkApp.jsx`. Docs: `session-77.md`
(this brief), `roadmap.md`.

## Still open, unresolved

1. JobDetail token-redeclaration removal (`bd53c30`, reverted
   `5b13ca8`) — investigated session 75, no code-level cause found;
   parked, no retry planned unless a concrete symptom resurfaces.

Both shell canonicals (`hivework-app-v4-3.html` and `HiveworkApp.jsx`)
are now in sync on the Dashboard budget-tracker point. All items from
session 76 and earlier are closed except item 1 above.
