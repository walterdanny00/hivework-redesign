# Session 21 — 2026-08-13

**Focus:** closed the first of the three Section 22 gaps — History rows
have no click-through to Job Detail, while the real `ApplicationCard.tsx`
(History → Work) and `JobCard.tsx` (History → Jobs) are both fully
clickable to `/jobs/:id`.

## Scope confirmation before building

Pulled `HistoryJobs.tsx`, `HistoryWork.tsx`, and `JobCard.tsx` (not yet
seen in full before this session). Confirmed `HistoryJobs.tsx` renders via
`JobCard`, same pattern as `HistoryWork.tsx`/`ApplicationCard`, and that
`JobCard.tsx` navigates to `/jobs/${job.id}` on click exactly like
`ApplicationCard.tsx` — so the fix covers both History → Work and
History → Jobs. History → Withdrawals stays untouched: it already renders
via its own `WithdrawalRow`, and a withdrawal is a payment record, not a
job — no real click-through fact applies there.

## Fix — click-through, both shells

**Data-set limitation, not a gap:** both shells' Job Detail screens are
backed by a fixed 3-entry demo set (`JOB_DATA`/`jobData`: `mine`,
`translate`, `bug`), not real IDs. Only History rows with a matching demo
job could be wired live:
- History → Jobs: "Test payment flow on Android" → `mine`, "Localize
  onboarding copy" → `translate` (identical titles to the existing demo
  jobs). The other 3 rows (closed/completed) have no matching demo job —
  left non-clickable.
- History → Work: "Test flow on hivework multi worker job post" → `bug`
  (closest thematic match, worker-view job). The other 5 rows — no match,
  left non-clickable.
- Also wired the Dashboard "Your work" preview's matching row (both
  shells reuse the same row component/markup there) — the real
  `ApplicationCard.tsx` doc explicitly says it's shared by Dashboard
  summary and `HistoryWork.tsx`, same clickable behavior in both places.

This is a demo-data-set ceiling, not a shipped limitation — every row
would be clickable against a real backend/IDs.

**Back-navigation:** no changes needed. Both shells' `goBack()` already
returns to `lastScreen`, tracked generically by `goTo()`/`showScreen()`
before every screen switch, and Job Detail's back button already calls
`goBack()` rather than a hardcoded target. Opening Job Detail from a
History screen already returns to that same History screen.

**`HiveworkApp.jsx`:** added `jobKey` to the two matching `WORK_HISTORY`
and `JOBS_HISTORY` rows. `HistoryRow` now takes an optional `onClick`;
`HistoryList` takes an optional `onRowClick` and only wires a row's click
handler when both `onRowClick` and `row.jobKey` are present. Both
History → Work and History → Jobs pass `onRowClick={openDetail}`; History
→ Withdrawals untouched (already uses a custom `renderRow`). Dashboard's
"Your work" preview (`WORK_HISTORY.slice(0, 2)`) wired the same way.
`.hw-app .hist-row.clickable{cursor:pointer;}` added — matches the
shell's existing minimal convention for clickable rows (`.rec-item`,
`.ticket`), no added hover/elevation.

**`hivework-app-v4-3.html`:** mirrors the JSX. Added `jobKey` to the same
two `HW_WORK_HISTORY`/`HW_JOBS_HISTORY` rows. `renderHistList()` now
takes an optional `onRowClickFn` (function name string, since rows render
as `onclick="..."` HTML strings) and only adds the `clickable` class +
`onclick` when a row has `jobKey`. Both History screens' render calls
pass `'openDetail'`; Withdrawals untouched. The static Dashboard "Your
work" preview row matching `bug` got `class="hist-row clickable"
onclick="openDetail('bug')"` added directly — `.clickable` as a class
name already matches this file's existing convention (`notif-row unread
clickable`). `.hist-row.clickable{cursor:pointer;}` added to the CSS
block.

**Verification:** brace/paren/bracket-balance check (Python, net-zero) on
`HiveworkApp.jsx`; `hivework-app-v4-3.html`'s inline `<script>` extracted
and passed `node --check`. No headless-browser run — same standing
sandbox limitation as every prior session (no network access to install
one).

## Follow-up — closed/completed Job Detail rendering, both shells

User asked directly: does the demo-data-set limit mean closed/completed
jobs simply have no detail screen? No — in the real app `/jobs/:id` is
the same route regardless of status; the limitation was purely that our
3-entry demo `JOB_DATA`/`jobData` set had zero closed/completed entries
to point the remaining History rows at.

Pulled the real `JobDetail.tsx` (single component, not split Owner/
Worker like our shell — an already-established shell architecture
choice, not revisited) to confirm how closed/completed actually renders:
same page, sections conditionally hidden/shown by `job.status` — no
separate screen.

**Found the shell's simulations were already far more complete than
expected.** Both `JobDetailOwner`/`JobDetailOwner`-equivalent already let
you interactively close all slots, mark submissions complete, and rate
every worker, live, inside the existing "mine" job. The actual gap was
narrower: the header status text was hardcoded to `"in progress"`,
never derived from the resolved state, so even a fully-closed job still
said "in progress." Similarly, `JobDetailWorker`'s already-built
`state`/`HW_JDW_STATE_META` stage pipeline (with a `completed_rated`,
stage-4/paid end-state) was being force-started at `state="ready"`
every time, hardcoded, regardless of the clicked job.

**Fix, both shells:**
- `JobDetailOwner` (React) / `initOwnerState`+`renderOwnerDetail`
  (vanilla) now accept optional per-job overrides —
  `initialApplicants`/`initialSlots`/`initialClosedCount`/`totalSlots` —
  so a job can mount already-resolved instead of always the canonical
  "mine" live-simulation seed. Falls back to the existing globals when a
  job doesn't override them (no change to `mine`/`translate`/`bug`).
- Header status text is now derived (`isFullyClosed`), not hardcoded:
  "closed" once every slot is completed or refunded-closed with nothing
  open/in-progress/awaiting-review, else "in progress" — matches the
  real app's own status-driven gating logic rather than inventing new UX.
  Added `.status-chip.closed` CSS (reusing the closed-state color already
  used by `.status-pill.closed`).
- The Job Detail render call for Worker view now passes
  `state={job.state || "ready"}` (JSX) / seeds `currentState: job.state
  || 'ready'` in `initWorkerState()` (vanilla) instead of a hardcoded
  `"ready"`.
- Added two new demo jobs to `JOB_DATA`/`jobData`: `closedJob` (owner
  view — 3 completed+rated workers, 2 refunded-closed, 0 open, so
  `openCount` naturally resolves to 0 and the header now reads "closed")
  and `completedWork` (worker view — `state: "completed_rated"`, renders
  the existing SETTLED paid-strip + "Thanks for the feedback" panel on
  mount).
- Remapped the remaining unmapped History rows: History → Jobs' 3 closed
  rows → `closedJob`; History → Work's 5 remaining completed/paid rows →
  `completedWork` (the 1 already mapped to `bug` in the base fix stays
  as-is). Every History row now clicks through to something real.

**Verification:** JSX — brace/paren/bracket balance (net-zero) plus a
manual arithmetic check confirming `closedJob`'s `openCount` resolves to
0. HTML — built a Node `vm`-sandboxed DOM stub (`document`/`window`
stubs, `setTimeout` synchronous) and actually executed `initOwnerState`/
`renderOwnerDetail`/`initWorkerState`/`renderWorkerDetail` for all 5 demo
jobs (`mine`, `bug`, `translate`, `closedJob`, `completedWork`) with no
exceptions; confirmed in the rendered HTML that `closedJob` shows
"closed" while `mine` still shows "in progress" (unaffected), and that
`completedWork` renders the SETTLED strip and rating-given panel. Still
no real headless browser — same standing sandbox limitation — but this
is a meaningfully stronger check than the syntax-only pass used for the
base fix.

## Roadmap changes

Section 23 added, closing out "Next" item 1 from Section 22.

## Files touched

`HiveworkApp.jsx`, `hivework-app-v4-3.html`, `roadmap.md`, this session
brief (`session-21.md`).

## Next session

- Two Section 22 tasks remain, not yet started: Home's real content set
  (stats row, categories, trust-badge concept, how-it-works — currently
  missing from the shell entirely, not merely mis-styled), and deciding
  under our own design language whether/how a global support access
  point belongs outside the profile menu (informed by the real BUG-106
  gap, not by copying the real app's literal footer).
## Correction (added in session 22, 2026-08-13)

**This session's verification was insufficient — not pushed as a result.**
User tested the click-through fix directly and found the header status
was still wrong: closed/completed jobs opened showing "in progress" on
client view, and the HTML shell's worker-view completed job wasn't
clickable at all. The `openDetail()`/per-job override mechanism itself
was correct (confirmed in session 22 via a switch-sequence DOM check
this session's syntax-only + single-job verification didn't cover), but
two other surfaces were still broken: Dashboard's separate closed-job
refund-demo preview was hardcoded to `openDetail("mine")` in both
shells (predates this session's `closedJob` entry), and HTML's static
"Your work" preview second row was never wired at all. Both fixed in
session 22 — see `session-22.md` and roadmap Section 24. This file's
`## Fix` and `## Verification` sections above describe what was
*attempted* this session, not the final working state — treat
`session-22.md` as the source of truth for the actual fix.

