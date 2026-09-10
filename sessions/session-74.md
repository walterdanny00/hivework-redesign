# Session 74 — `JOB_DETAIL_OWNER_STYLES` hex/token drift fixed (2026-09-10)

Picked up open item 1 from Session 73.

## Work done

**`JOB_DETAIL_OWNER_STYLES` drift — item 1, closed.** `HiveworkApp.jsx`'s
`JOB_DETAIL_OWNER_STYLES` block had 4 rules silently detokenized to
hardcoded light-mode hex, where the HTML canonical already used the
proper design tokens:

| Selector | Canonical | Shell (drifted) |
|---|---|---|
| `.status-chip` | `var(--gold-tint)`/`var(--gold-ink)` | `#FFF3DC`/`#B8860B` |
| `.status-chip.closed` | `var(--mist)`/`var(--ink-soft)` | `#F1EFEA`/`var(--ink-soft)` |
| `.status-chip.completed` | `var(--teal-tint)`/`var(--teal-ink)` | `#E4F8F6`/`#1A9E92` |
| `.toggle-row` | `var(--sand)` | `#EFECE5` |

The hex values matched the tokens' light-mode values exactly, but
those tokens resolve differently in dark mode (confirmed via the
`:root` dark-theme block) — so this wasn't cosmetic, it meant the
shell's owner Job Detail status chip and view toggle would stay
stuck on light-mode colors in dark theme while everything else
flipped. Fixed by swapping the 4 rules back to `var(--*)` tokens to
match canonical exactly. Verified via diff: only those 4 lines
changed, nothing else touched.

Real app's equivalent (`HW_JDO_STYLES` in `JobDetail.tsx`) was
already correct — this fix was shell-only.

Patched, downloaded, and pushed clean to both `hivework-redesign`
repos per the standard two-repo push routine. Item 1 fully closed.

## Files touched

Docs repo (`hivework-redesign`): `screens/HiveworkApp.jsx`. Docs:
`session-74.md` (this brief), `roadmap.md`.

## Still open, unresolved

1. Shell's Dashboard budget-tracker demo data (Section 34-era)
   drifted behind Section 43's real implementation — not blocking.
2. JobDetail token-redeclaration removal (`bd53c30`, reverted
   `5b13ca8`, session 71) caused regressions — root cause not yet
   diagnosed.
3. Home.tsx welcome heading + "Your standing" hero number sizing
   (`.hw-page-head h2` → `28px`/`-.7px`; `.hw-hero-num` → `52px`/
   `-2px`) — diagnosed, fix applied (`326e035`) then reverted
   (`044d8de`) session 72 at user's request, fix unchanged, still
   deferred.

`JOB_DETAIL_OWNER_STYLES` drift closed this session (see Section 86
of roadmap.md).

All items from session 73 and earlier remain closed except those
carried forward above (see Sections 83, 85).
