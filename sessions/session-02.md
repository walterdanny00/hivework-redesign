# Session 02 — Job Detail: Worker View + Owner View Redesign

## Worker view

**Design direction:** ledger style — a single vertical timeline (Verify →
Profile → Apply → Work → Paid), each stage a compact row with a timestamp;
only the current stage expands into an action panel. Chosen over a
stepper+hero-card alternative specifically because it accommodates a planned
future feature (image/video attachments on work submission) more naturally —
the panel grows to fit new fields without redesigning the whole card.

**States covered (8):** wallet unverified, profile incomplete, ready to
apply, apply form open, application pending, approved (submit work),
work submitted, slot paid. Rating card (worker rates client) appears once
the slot is complete.

**Attachments (mocked, not wired):** thumbnail-grid style settled on — small
square previews (image/video) with a remove ×, plus a dashed "+ Add" tile.
An alternate file-list style (filename/size/upload-progress rows) was also
mocked and rejected in favor of the instant visual preview thumbnails give.

**Sentinel banner:** confirmed via source read that the "Client wallet
verified by Sentinel" text exists in JobDetail.tsx's JSX but isn't wired to
anything real yet. Decision stands: omit Sentinel branding from every
redesign screen for now.

## Owner view

**Design direction:** tabbed by status — Pending / Active / Review / Done,
each tab showing a count. Chosen over an always-expanded full-card list
(also built and compared) for feeling more coordinated with larger
applicant lists.

Within a tab, applicant cards show fully expanded (no tap-to-expand) —
tabs already filter by status, so per-row collapse was redundant and just
added a tap with no benefit.

Each applicant card carries its own status chip (Pending / In progress /
Submitted / Completed) next to their star rating — this belongs on the
individual applicant row, not as a summary in the job header.

Included: skills chips (first 3 + more), device chip, trust tier badge,
star rating, cover note, work submission text + attachment thumbnails
(view-only — tap to preview, no remove control, since only the submitting
worker can delete their own attachments), Approve & Assign / Mark Complete
actions, and the Close Unfilled Slots panel (restored — was dropped in an
earlier pass and added back).

## Standing guide for future screen sweeps

Clarified and worth keeping visible in the roadmap: a code sweep before
redesigning a screen is for real data and real features/components only —
not for visual or UX structure. The task from any sweep is to make sure
every real piece of data and every real feature ends up represented
*somewhere* in the redesign, however it's laid out. Layout/UX choices
(tabs, grouping, flow, collapse vs. full display) stay fully up to the
redesign and are independent of what the sweep finds.

## Files

- `hivework-job-detail-worker-v2.html` — canonical worker view (ledger,
  thumbnail-grid attachments)
- `hivework-job-detail-owner-v3-tabbed.html` — canonical owner view
  (tabbed, status chips, close-slots panel, view-only attachments)

## Still open

- Post Job: only wizard step 1 "Basics" built, steps 2-3 still placeholders
- Real `/onboarding` (profile-completion form) screen not yet designed
