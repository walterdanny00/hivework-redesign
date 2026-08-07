# Session 06 — Notification Bell correction

**Date:** 2026-08-07

## What happened

Built `HiveworkNotificationBell.jsx` — the correction flagged in the
earlier `components/` sweep (Section 7 of the roadmap). Every screen mockup
built so far had the bell icon wired to the same `setMenuOpen` toggle as
the avatar button, meaning notifications were treated as decorative,
opening the profile menu instead of anything real. The real
`NotificationBell.tsx` is a fully separate component.

## Design

- **Reusable component**, not a per-screen copy — takes `notifications`
  (array of `{ id, title, body, minsAgo, jobId, read }`) and `onNavigate`
  props.
- **Own dropdown panel**, fully decoupled from the avatar/profile menu —
  independent open/closed state, closes on outside click.
- **Real unread badge:** coral pill, caps at "9+", positioned on the bell
  icon — not the static dot the old mockups showed.
- **Mark-all-read on open:** badge disappears immediately when the panel
  opens (optimistic, matching the real "confirmed with backend after"
  behavior from the sweep).
- **List items:** title/body/timestamp, unread items get a subtle
  violet-tinted row background plus a violet dot; read items lose both.
  Tapping an item with a related job calls `onNavigate(jobId)`.
- **Empty state:** "No notifications yet." — reuses the bell glyph itself
  (dimmed, circled) rather than a generic icon, so it still reads as
  notifications-related even when empty.
- **45s polling:** stubbed in as a comment (`GET /api/notifications/poll`,
  no-op) — same simulated-endpoint pattern used for Contact Support's Send,
  since no real endpoint was exercised in the sweep.

## Verification

Built a wired-in preview (`NotificationBellPreview.jsx`, not a shipping
file) showing the bell inside a mock header, in both a populated state (3
unread + 1 read sample notification) and an empty state, to confirm the
panel placement, unread/read visual distinction, and mark-on-open behavior
all work together as intended.

## Status

Notification Bell is **done** as a standalone reusable component. Not yet
recompiled into the actual shell/Layout mockup files — that wiring
(replacing the old shared-toggle behavior in the existing screens) is
still open.

## Files touched

- `HiveworkNotificationBell.jsx` (new — canonical, reusable)
