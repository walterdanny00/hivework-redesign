# Session 07 — Range Filter

**Date:** 2026-08-07

## What happened

Built `HiveworkRangeFilter.jsx` — the last item from the earlier
`components/` sweep (Section 7 of the roadmap). Real `RangeFilter` is
shared across all three History pages (Work/Jobs/Withdrawals): a segmented
"This week / This month / All" control, deliberately calendar-based rather
than a rolling window.

## Design

- **Reusable component**, `value`/`onChange` props — same pattern as the
  other shared components (Combobox, Contact Support, Notification Bell).
- **Calendar-based boundaries**, not rolling:
  - "This week" = since this week's Monday 00:00 local
  - "This month" = since the 1st of the current calendar month, 00:00 local
  - A rolling 7/30-day window bleeds into the previous calendar period
    near boundary days — the real code comment explains this is why it's
    calendar-based, not a naive "last N days" calculation.
- Exported a standalone `getRangeBoundary(key, now)` helper alongside the
  component, so the date math lives in one place rather than being
  reimplemented on each of the three History screens that will consume it.
- Styled as a segmented pill selector per the roadmap's suggestion —
  violet-filled active segment, visually close to the existing `segnav`
  pattern already used elsewhere.

## Verification

Built a wired-in preview (`RangeFilterPreview.jsx`, not a shipping file)
that actually filters a mock Withdrawal History list against 5 sample
entries spread across today, this week, this month, and further back.
Confirmed switching segments correctly narrows the list using the calendar
boundary rather than a rolling window.

## Status

Range Filter is **done** as a standalone reusable component. This closes
out both items from the original `components/` sweep (Range Filter +
Notification Bell, Section 7) — see `sessions/session-06.md` for the
Notification Bell correction from last session. Not yet recompiled into
the three actual History mockup files.

## Files touched

- `HiveworkRangeFilter.jsx` (new — canonical, reusable)
