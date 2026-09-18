# Session 92 — 2026-09-18

Picked up two loose ends carried over from session 91, then ran a full
build-items sweep (screens/features scoped but never finished, distinct
from bug fixes) to directly answer what's still unbuilt.

## `.cat-empty` confirmed gone — closed

Flagged as dead CSS back in Section 54. `grep -rn "cat-empty"
frontend/src/pages/Jobs.tsx` returned zero matches (checked during
session 91; folded into this write-up as agreed then, rather than
patched in isolation). No code change needed.

## Stale "Current baseline files" note — fixed

The baseline-files list near the top of `roadmap.md` still read
`HiveworkContactSupport.jsx` and `HiveworkRangeFilter.jsx` as "not yet
wired into shell." Both the Screen Inventory rows and Section 7 itself
confirm both were actually wired into both shells back at the step-6
recompile pass (2026-08-09) — the note was dead text left over from
before that pass. Corrected in place.

## Full build-items sweep — nothing new found

Re-checked the roadmap specifically for scoped-but-unfinished
screens/features, not bug fixes:

- **Multi-worker "slots still open after first approval" gap**
  (Section 35/36) — real backend/product bug (`Apply` button disables
  on `job.status !== 'open'` instead of checking `unfilledSlots`).
  Knowingly skipped for the pilot; logged out of scope for this
  redesign project, not a pending task.
- **File-upload attachments** — deferred from that same session,
  separately confirmed closed (session 79, built for real).
- "Not Yet Started" section (Section 5): every item checked off.
- Screen Inventory: every screen Done.

No other unbuilt screen or feature found.

## New consolidated section: "Coming soon" / backend-and-content-blocked items

Logged as a single section in `roadmap.md` (Section 107) so these don't
scatter and go stale the way the old open-items recap did.

**"Coming soon" / disabled in the real app:**
- Browse (`Jobs.tsx`) tile grid — 4 of 7 category tiles disabled. Only
  `bug-testing`/`translation`/`ui-feedback` are real server-side
  (`GET /api/jobs/stats` only counts those 3).
- Post Job wizard (`PostJob.tsx`) — same 4 categories, same backend
  limit, shown disabled.
- Both wired as a data-driven `real: true/false` flag per category
  (session 42) — a one-line flip once backend support exists, but
  genuinely blocked on backend work.
- File-upload attachments used to be in this bucket too; closed for
  real in session 79.

**Features not wired to real data yet (`Home.tsx`, Section 40):**
- Activity ticker — no real "recent platform activity" endpoint;
  flagged demo content.
- "Recommended for you" — no real backing; showing the most recent
  open job was considered and ruled out (needs real personalization
  keyed off skills/devices/application history, not recency). Left as
  flagged demo content; recommendation logic not yet designed.
- Help screen FAQ — flagged placeholder copy; no real support-content
  source yet.

All frontend-complete but backend/content-blocked — same shape as the
category expansion.

## Files
`hivework-redesign/roadmap.md` (baseline-files note fix + new Section
107). No frontend/backend code changes this session.

**Status: closed.** Remaining open items after this session:
`JobDetail.tsx` token-redeclaration removal (parked) — nothing else.
