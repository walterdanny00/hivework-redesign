# Hivework UI Redesign — Roadmap

## Sweep guide (apply to every future screen)

Before redesigning any screen, do a thorough code sweep on Termux first —
pull the real component(s), see every real field, feature, and gated state
that actually exists. This sweep is for **data and features only, not
layout**. The task from any sweep is to make sure every real piece of data
and every real feature ends up represented *somewhere* in the redesign,
however it's laid out. Tabs, grouping, and flow are fully up to the
redesign — they're never dictated by the old screen's structure.

## Screens — status

- **Job Detail (owner + worker) — done.** Worker: ledger-style timeline
  (Verify→Profile→Apply→Work→Paid), attachments mocked (thumbnail-grid,
  view-only lightbox on the owner side). Owner: tabbed by status
  (Pending/Active/Review/Done), close-unfilled-slots restored, per-applicant
  status chips. Sentinel wallet-verification banner confirmed unwired in
  real code — omitted from all redesign screens. See `sessions/session-02.md`
  for full detail.

- **Post Job** — in progress. Step 1 "Basics" built. Steps 2-3 still
  placeholders.

- **Onboarding** — not started. The real `/onboarding` (profile-completion
  form) needs its own design. An earlier 4-screen flow exists as a separate
  proposed pattern, kept but not adopted.

## Files

- `hivework-job-detail-worker-v2.html` — canonical worker view
- `hivework-job-detail-owner-v3-tabbed.html` — canonical owner view
