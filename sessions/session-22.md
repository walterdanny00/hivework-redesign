# Session 22 — 2026-08-13

**Focus:** user tested Section 23's History → Job Detail click-through fix
directly and found it incomplete. This session finds root cause and fixes
both shells, before starting either of Session 20's remaining Section 22
tasks (Home content, support access point).

## User's report

- JSX: worker view correctly shows the completion detail screen. Client
  (owner) view is broken — clicking into a closed/completed job from
  History still opens the "in progress" Job Detail screen.
- HTML: worker view has no completion detail screen at all — not even
  clickable. Client view has the same "in progress" bug as JSX.

## Investigation

Confirmed the Section 23 mechanism itself (`openDetail()`, per-job
`JOB_DATA`/`jobData` overrides, `isFullyClosed` derivation) is not the
bug — re-ran the DOM-stub simulation including a `mine` → `closedJob`
navigation sequence, which still renders "closed" correctly, ruling out
a stale-state-on-navigation theory.

Root cause was in two surfaces Section 23 never touched:

1. **Dashboard's closed-job refund-demo preview** (`DASH_CLOSED_JOB` /
   `HW_DASH_CLOSED_JOB`) — a separate, older demo card for the refund
   badge, unrelated to `JOB_DATA`'s `closedJob`. Its "View details →"
   button was hardcoded to `openDetail("mine")` in both shells, a
   leftover from before `closedJob` existed. This is almost certainly
   what the user hit for "client view."
2. **HTML's static "Your work" Dashboard preview** — unlike the JSX
   version (which maps live over `WORK_HISTORY.slice(0,2)` and so
   auto-wires clickability), the HTML version is hardcoded markup.
   Section 23 only wired the first row (`bug`); the second row
   (matching `completedWork`'s title) was left as plain, non-clickable
   markup — this is the "not even clickable" worker-view gap in HTML.

## Fixes

- `HiveworkApp.jsx`: `DASH_CLOSED_JOB`'s "View details →" button now
  calls `openDetail("closedJob")` instead of `openDetail("mine")`.
- `hivework-app-v4-3.html`: same fix for `HW_DASH_CLOSED_JOB`'s "View
  details →" (`openDetail('closedJob')`), plus added
  `class="hist-row clickable" onclick="openDetail('completedWork')"`
  to the second static "Your work" preview row.

## Verification

- JSX: brace/paren/bracket balance (net-zero).
- HTML: `node --check` on the extracted inline script, plus a Node DOM
  stub actually invoking `openDetail('closedJob')`,
  `openDetail('mine')` → `openDetail('closedJob')` (sequence check),
  and `openDetail('completedWork')` — confirmed rendered HTML shows
  "closed" (never "in progress") for the closed job and a settled/paid
  marker for the completed worker job. Still no real headless browser
  (standing sandbox limitation, no network access).

## Follow-up, same session — completed vs closed split

User asked directly: in a multi-slot job, if some slots were closed
(refunded) and some finished, what status does it show? Answer at the
time: just "closed" — `isFullyClosed` collapsed both outcomes into one
label. User also noted jobs aren't always multi-slot; the real
`PostJob.tsx` supports single-worker jobs, where this distinction
matters most.

**Fix, both shells:** split the header into three states — `completed`
(every slot finished, zero refunded), `closed` (at least one slot
refunded, even if others completed — mixed/all-refunded), `in progress`
(unchanged). Added `.status-chip.completed` CSS (mint/success palette,
reusing existing tokens). Added a new single-worker demo job,
`completedJob`, to actually exercise the new label, and remapped the
"Usability pass on Post Job wizard" History → Jobs row to it (was
previously mapped to `closedJob`).

**Verification:** JSX — balance check plus a standalone logic check of
all four derivation cases. HTML — `node --check` plus a DOM-stub
switch-sequence run (`mine` → `closedJob` → `completedJob` → `mine` →
`completedJob`) confirming no stale-state carryover between jobs.

## Roadmap changes

Section 24 added (click-through follow-up fixes), Section 25 added
(completed/closed split).

## Files touched

`HiveworkApp.jsx`, `hivework-app-v4-3.html`, `roadmap.md`, this session
brief (`session-22.md`).

## Next session

- Session 20's two remaining Section 22 tasks are still open and
  unstarted: Home's real content set, and support-access-point
  placement. User has not yet picked which to start on.
