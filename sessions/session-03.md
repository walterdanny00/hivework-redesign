# Session 03 — Post Job Wizard: Steps 2–3, Categories, Device/Language Redesign

## Reconciled with real code

Swept `PostJob.tsx` directly. It's **not** a multi-step wizard in the real
app — one continuous form (title, category, budget w/ live 7% fee
breakdown, description 1000-char, requirements 500-char, optional
device/language free-text, worker_slots, conditional deadline fields when
multi-worker) → `review` state (recap cards + payment breakdown) →
`paying` → `done`/`error`, driven by `window.Pi.createPayment` callbacks.
No separate `Job` type file exists — shape is inline in the component's
`useState`.

**Decision:** keep the step-wizard as a deliberate UX improvement over the
real flat form (same pattern as the profile-menu decision) — same real
fields, split across steps. The real `review`/`paying`/`done`/`error`
states stay unchanged as the wizard's final stage.

**Real product gap found, not a redesign inconsistency:** single-worker
jobs have no deadline field anywhere in `PostJob.tsx` —
`deadline_mode`/`deadline_at`/`slot_duration_days` only exist inside the
`isMultiWorker` conditional. Single-worker jobs stay open indefinitely with
no due date. Flagged as an open product gap, same bucket as the missing
log-out feature (Section 8 of the roadmap) — not something this redesign
pass fixes.

## Field grouping (steps 2–3)

- **Step 1 — Basics** (already built): title, category, budget w/ fee
  breakdown
- **Step 2 — Details** (new): description, requirements, device/language
  required
- **Step 3 — Workers & Deadline** (new): worker count, conditional
  deadline-mode fields (only rendered when multi-worker)
- **Review & Pay** (unchanged from real code's `review` state)

An accordion-style alternative (expandable sections on one scroll, sticky
bottom total bar instead of a separate review step) was also built and
compared — rejected in favor of the step-wizard.

## Category taxonomy — expanded 3 → 7

Real categories were only `bug-testing`, `translation`, `ui-feedback`.
Expanded to: Bug Testing, Translation, UI/UX Feedback (renamed for clarity
against the new Usability category), Usability Testing, Content Review,
Survey / Data Collection, Localization Testing.

Emoji icons (🐛🌍🎨🧭📝📊🔍) were tried first and rejected — inconsistent
rendering across platforms, mismatched visual weight against the app's
clean SVG line-icon system. Replaced with matching stroke-based SVG icons
(stroke-width 1.8, tinted violet when selected): bug/wrench glyph, globe,
layout/monitor, compass, document, bar-chart, map-pin.

## Device & Language — redesigned as searchable comboboxes

Real code has both as plain free-text inputs. Redesign moves both to a
shared searchable multi-select combobox component: pick from a suggestion
list, or type a value not on the list and an "Add '...'" option appears —
so both common categories (Android, iOS, Web/Browser, Desktop, Any device)
and specific entries (e.g. "Samsung Galaxy S23," "Android 13+") work the
same way. Language ships with a ~40-language suggestion list. Multiple
chips allowed on both fields.

This went through a branching path worth noting for future sessions: an
initial version was built inline into the main wizard file by mistake
(should have been a separate variant); corrected by branching it into
`hivework-post-job-v2.html`, confirming it as canonical, then merging it
back into the single canonical file.

## Other fixes

- **Worker-count stepper:** was +/− only, which doesn't scale to large
  values (real code allows unrestricted `worker_slots`, e.g. 100+). Made
  the number itself tap-to-edit — stepper still works for small
  adjustments, typing a value directly now also works.
- **Combobox JS bug:** dynamically-generated onclick handlers used the raw
  field ID (e.g. `f-device-search`) as part of a JS function name — hyphens
  aren't valid in identifiers, so `f-device-search_select(...)` parsed as
  subtraction (`f - device - search_select`), throwing `ReferenceError: f
  is not defined`. Fixed by sanitizing the ID into a safe function-name key
  before use.

## JSX port

Ported the settled HTML design to `HiveworkPostJob.jsx`, matching
`HiveworkJobDetail.jsx`'s established conventions: `STYLES` template string
with class-prefixed scoping, single-file `export default function` +
`useState`, no external CSS or Tailwind. Device/Language combobox built as
a small reusable `Combobox` sub-component shared by both fields.

## Files

- `hivework-post-job.html` — canonical, done (4-step wizard, SVG category
  icons, searchable device/language comboboxes)
- `HiveworkPostJob.jsx` — canonical, done (React port, same conventions as
  `HiveworkJobDetail.jsx`)
- `hivework-post-job-accordion.html` — rejected alternative, not canonical
- `hivework-post-job-v2.html` — retired; its device/language work is now
  merged into the main canonical file

## Still open

- Real `/onboarding` (profile-completion form) screen not yet designed
- Job Detail: pending comparison between Claude's build and the user's own
  version; worker (non-owner) view status per Session 02
- Single-worker deadline gap (real product gap, not a design task — see
  above)
- Post Job not yet recompiled into the shell (`hivework-app-v4-3.html` /
  `HiveworkApp.jsx`) — its `#post` section is still the old flat
  single-step placeholder
