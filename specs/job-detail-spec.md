# Hivework — Job Detail Spec (multi-worker, owner view)

Reference for building your own version of this screen. Route: `jobs/:id`.
Covers the owner's view of a multi-worker job — the biggest gap in the
redesign, since the existing mockup only handled single-slot jobs.

Applicant review and per-worker rating are both included here rather than
on a separate screen — confirmed via the real codebase that both already
live inside `JobDetail.tsx`, not a separate route, so this isn't a design
guess, it's matching how the feature actually works.

---

## Header
- Back button
- Category label (e.g. "Bug testing")
- Job title

## Meta row
- Budget (total, e.g. "10π")
- Per-slot amount (e.g. "2π") — replaces the old single-slot mockup's flat
  "Applicants" count, since slot economics matter more than a raw number
- Posted (relative time)

## Slot progress (new — nothing in the old mockup represents this)
- A visual summary of all slots at a glance: how many of N are filled,
  and what state each filled slot is in (completed / in progress /
  submitted-awaiting-review / still open)
- A short text label under it spelling out the counts (e.g. "3 of 5 slots
  filled — 2 completed, 1 in progress")

## Description
- Free text, same as before

## Requirements
- Checklist, same as before

## Device & language
- Chip row, same as before

## Applicants section
- People who've applied but aren't approved into a slot yet
- Each row: avatar, handle, rating + jobs-done summary, Approve / Decline actions
- Count shown in the section header (e.g. "Applicants (2)")

## Slots section
- Approved workers currently occupying a slot
- Each row: avatar, handle, rating + jobs-done summary, and a status
  indicator for that slot specifically:
  - **Submitted** — worker turned in work, awaiting your review
  - **In progress** — approved, still working
  - **Completed** — slot finished and paid
- On a completed slot with no rating yet: inline star-rating control
  (tap to select, then confirm) — appears directly under that worker's
  row, not on a separate screen
- On a completed slot already rated: shows the rating given instead of
  the rating control

## Open slots note
- If any slots remain unfilled, a short line stating how many and that
  approving an applicant fills one

## Not addressed here — worker (non-owner) view
This spec covers the owner's view specifically, since it's the more
complex case. The worker's own view (their single slot's status, submit
button, etc.) is closer to what the original single-slot mockup already
showed — worth a lighter pass, not a full redesign.

## Known open question
Real-time slot state changes (approving an applicant, a worker submitting
work, marking a slot complete) aren't modeled as live interactions in a
static mockup — worth deciding how much of that needs to be interactive
in the mockup vs. left for implementation.
