# Session 91 — 2026-09-18

Picked up open item #4 (`--cream`/`--line`/`--mist`/`--sand` near-white
gray merge question) in chat. Also caught and corrected a stale
open-items summary that had been carried forward unresolved for 40+
sessions.

## `--sand` merged into `--mist` — closed

Investigated actual usage via grep rather than going by token names:

- `--line` is a distinct border-color token — not part of the
  near-white question at all.
- `--cream` is the base page/surface background — distinct role.
- `--sand` was only used as pill-track background (`.hw-segnav`,
  `.toggle-row`, `.app-chip`, decline buttons).
- `--mist` was only used for closed/muted state (`.status-pill.closed`,
  `.chip-unverified`, `.close-slots-card`).

Conceptually distinct roles, but the values collapse: `--mist` and
`--sand` are byte-identical in dark mode (`#1E1D18` both) and
near-indistinguishable in light mode (`#F1EFEA` vs `#EFECE5`).
Confirmed visually via light/dark screenshots of Dashboard — the
segnav track and "Completed" pills looked identical in both modes.

**Decision:** merge `--sand` into `--mist`. Two tokens producing a
difference nobody can see (and that dark mode already collapsed by
accident) isn't worth the upkeep.

**Patch, applied:**
- Repointed call sites via `sed`: `Layout.tsx`, `JobDetail.tsx`,
  `Dashboard.tsx` (5 occurrences total).
- Removed `--sand` token declarations from `index.css` (light + dark).
- Confirmed zero remaining `var(--sand)` references in live code
  (only `.bak` files retain it, expected — untouched backups).

Build clean: 65 modules, 12.44s. Committed and pushed to `Piwork`
alone (real-code patch, not a `hivework-redesign` doc change).

## Stale open-items summary caught and corrected

While reviewing the carried-forward "open items" list, traced each
item back through the roadmap instead of taking the summary at face
value. Found that three of the five items listed as still-open going
into this session had actually been resolved dozens of sessions ago:

- **`PostJob.tsx` wizard step-indicator direction** — resolved
  session 47 (Section 58): trimmed `WIZARD_STEPS` to 3 entries,
  Review/Paying/Done/Error treated as a distinct no-indicator phase.
  Patched, pushed, live-tested.
- **`JobDetail.tsx` owner ledger-connector / worker attachments** —
  resolved session 48 (Section 59): missing `.jdo .ledger:before`
  connector rule restored (dropped from an earlier port); attachments
  item resolved same section.
- **Doc-naming mismatches** (profile-menu vs. hamburger,
  `ui-ux-feedback` vs. `ui-feedback`) — resolved session 50
  (Section 61): naming mismatch confirmed intentional/
  documentation-only; profile-menu-vs-hamburger had a real decision —
  canonical shell updated to match real app's hamburger + side-drawer
  pattern, patched and pushed.

All three got closed correctly at the time, but the roadmap's
end-of-file "open items" recap kept getting copy-pasted forward into
each new session's summary without being pruned — so they've read as
unresolved since session ~50 even though nothing about them was
actually open.

**Only one item was genuinely still open going into this session:**
`JobDetail.tsx` token-redeclaration removal — parked indefinitely, no
retry planned unless a concrete symptom resurfaces. That one remains
open after this session too.

## Files
`frontend/src/components/Layout.tsx`, `frontend/src/pages/JobDetail.tsx`,
`frontend/src/pages/Dashboard.tsx`, `frontend/src/index.css`. No
backend changes.

**Status: closed.** Remaining open items after this session:
JobDetail token-redeclaration removal (parked) — nothing else.
