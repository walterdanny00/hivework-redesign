# Session 76 — Dashboard budget-tracker demo data reconciled with Section 43; Home.tsx sizing item closed (2026-09-10)

Picked up open item 1 from Session 75. Also closed open item 3 at
user's explicit decision.

## Work done

**Item 3 closed — user decision, no code change.** The Home.tsx
welcome heading / "Your standing" hero number sizing fix
(`.hw-page-head h2` → `28px`/`-.7px`; `.hw-hero-num` → `52px`/`-2px`,
applied as `326e035`, reverted as `044d8de` in session 72) is no
longer deferred. User has decided the reverted state is the accepted,
final look. The fix itself is not being reapplied. Item closed.

**Item 1 closed — Dashboard budget-tracker demo data reconciled.**
Swept `hivework-app-v4-3.html`'s Dashboard demo data
(`HW_DASH_BUDGET_TRACKER`, `HW_DASH_JOBS_POSTED_COUNT`) against what
Section 43 actually shipped to real `Dashboard.tsx`. Found:

1. Real code added a worker-tab-only "Pending" stat pill in Section 43
   (`earnings_pending` — sum of approved-status application budgets).
   The shell never had this; `.dash-stat-row` only ever rendered two
   pills. Added a third pill (`#dash-stat3`), gated the same way as
   `HW_DASH_CLOSED_JOB` — visible on My Work, hidden on My Jobs via
   `toggleWork()`. New demo constant: `HW_DASH_EARNINGS_PENDING = 3`.
2. `HW_DASH_JOBS_POSTED_COUNT`'s comment was stale — it said real code
   has no jobs-posted-count field, which was true when Section 34
   wrote it but Section 43 added a real one (`jobs_posted_count`, a
   Supabase count query). The shell's derived count still renders the
   right number, so this was a comment fix only, not a behavior change.

Budget tracker card (Posted/Refunded/"Net committed") checked against
real code and found accurate — no drift, nothing touched there.

**Verification:** diffed the edited file against the original — 3
isolated changes (one markup pill, two data-constant/comment edits,
one `toggleWork()` addition), nothing else touched. Parses clean via
`lxml`. Div open/close count carries the same pre-existing one-line
offset as the original file (from `'</div>'` string literals inside
JS template strings) — confirmed present before this session's edits
too, not something introduced now.

## Files touched

`hivework-redesign/screens/hivework-app-v4-3.html`. Docs:
`session-76.md` (this brief), `roadmap.md`.

## Still open, unresolved

1. `HiveworkApp.jsx` — unconfirmed whether it has the same Dashboard
   budget-tracker drift just fixed in the HTML shell. Not in this
   session's context; needs its own sweep once available.
2. JobDetail token-redeclaration removal (`bd53c30`, reverted
   `5b13ca8`) — investigated session 75, no code-level cause found;
   parked, no retry planned unless a concrete symptom resurfaces.

All items from session 75 and earlier are closed except item 2 above
(carried forward as Section 87).
