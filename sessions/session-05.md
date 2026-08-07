# Session 05 — Contact Support widget

**Date:** 2026-08-07

## What happened

Built `HiveworkContactSupport.jsx` — the reusable inline Contact Support
widget flagged in the earlier `components/` sweep (Section 6 of the
roadmap). Real `ContactSupport.tsx` is a link-that-expands-in-place, not a
modal, used with contextual `subject` props in `Layout.tsx`, `JobDetail.tsx`
(×2 — payment issue, wallet verification issue), and `PostJob.tsx`
(posting payment issue).

## Design

- **Reusable component**, not a per-screen copy — takes `subject` (optional)
  and `label` (default "Contact support") props.
- **Collapsed:** plain underlined violet text link.
- **Expanded (in place, no navigation):** soft-shadow card, optional
  "Re: {subject}" shown as a chip-style pill (consistent with how chips
  read elsewhere in the system, not plain text), textarea (4000-char limit,
  placeholder "Describe the issue and we'll follow up.", live counter that
  turns red in the last 200 characters), Send/Cancel buttons.
- **After submit:** a mint checkmark success card, or a danger-toned error
  card with a "Try again" button that returns to the form. Both reuse the
  existing `--mint`/`--danger` tokens — no new colors introduced, same
  discipline as earlier design-system notes.
- Send is simulated (no real backend endpoint found in the sweep) — code
  comment flags `POST /api/support` as the real call site, same pattern
  used for Profile Complete's simulated save.

## Verification

Built a wired-in preview (`ContactSupportPreview.jsx`, not a shipping file)
showing the widget inside mock realistic error banners for all 4 real
usage contexts — Layout's persistent "Need help?" link, Job Detail's
payment-issue and wallet-verification-issue banners, and Post Job's
posting-payment-issue banner. Confirmed the color system ties in correctly
across all states (violet for the link/primary action, coral for the
warning banners, mint for success, danger red for errors/limit warnings) —
all pulled from existing tokens, nothing new.

## Status

Contact Support is **done** as a standalone reusable component. Not yet
recompiled into Job Detail/Post Job's actual mockup files — that wiring
(replacing their current dead plain-text "contact support" strings, per
the real bug noted in Section 6) is still open.

## Files touched

- `HiveworkContactSupport.jsx` (new — canonical, reusable)
