# Session 81 (2026-09-13) — Submission-report visual identity finalized

## Starting point

Picked up directly from session 80's one open question: the merged-model
mockup (`submission-mockup-merged.html`) was designed in its own visual
system (paper/ink/stamp-green, IBM Plex Mono narrative + IBM Plex Sans
chrome) and had never been reconciled against the app's actual design
tokens (cream/ink/violet, Sora/Inter/JetBrains Mono). No schema or
composer work was touched this session — this was a visual-identity
decision only, sitting on top of session 80's locked content/structure.

## Comparison method

Rather than judging the mockup in isolation, both candidates were built
directly inside the real Slots-tab ledger markup (`.jdo .ledger-item`,
owner view, Job #4471/@Olawalt) — same `.ledger-dot`, `.ledger-status`
classes copied verbatim from `hivework-app-v4-3.html` — so the comparison
reflected how each would actually sit in the app, not a floating card.

- **A** — the report exactly as session 80 designed it: paper background,
  IBM Plex Mono/Sans, stamp-green accent, indented under the avatar
  column (`margin-left: 50px`, matching the old `.ledger-submission`
  placement).
- **B** — the same content/structure restyled fully onto app tokens:
  white `.tab-card` surface, the app's own existing
  `.ledger-status.submitted` gold pill instead of a new stamp component,
  violet primary + pill-radius chips/buttons.

Iterated in place: A's report widened to bleed out of the ledger's rail
indent rather than sitting squeezed to one side; A's invented
stamp-green was swapped for the app's existing `--teal-ink`/`--teal-tint`
(same color `.ledger-status.completed` already uses); A's typography was
tried under B's font mapping (Sora/Inter/JetBrains Mono) to see whether
consistency could be had without losing the paper-report shape; B was
widened to match. A dashed divider under the requirement-echo brief was
tried folded into B as a middle-ground detail.

## Decision, locked

**A stays — the paper/field-report layout is a deliberate one-screen
exception**, not reconciled to match every other screen in the app. A
submission review is meant to feel like handling a piece of evidence,
not filling out another app form, and that distinctiveness is exactly
what the fully-on-token version (B) traded away in exchange for
consistency. B is not used anywhere; kept only as the comparison
alternative, superseded.

Final treatment:

- **Layout/shape** — unchanged from session 80: paper background,
  rotated "Submitted" stamp chip, rail-mounted left border on figure
  captions, rectangular (not pill) chips and buttons, dashed divider
  under the requirement-echo brief.
- **Width** — widened to bleed out of the ledger's 22px rail-indent,
  flush with the `.tab-card`'s own edges, instead of indented under the
  avatar column.
- **Accent color** — the invented stamp-green is gone. `--stamp` now
  resolves to `var(--teal-ink)`/`var(--teal-tint)`, the app's own
  existing confirmed-state color — the one deliberate bridge back to the
  token system.
- **Typography** — switched from IBM Plex Mono/Sans to the app's own
  Sora (structural labels: section labels, brief label, attachments
  record label) + Inter (body prose, buttons) + JetBrains Mono
  (case-id and the environment value only) for better readability. The
  "field-report" identity is now carried entirely by layout/shape/color,
  not by a second, competing typeface stack.

## Files touched

Visual-identity decision only — no application code changed.
`Piwork/frontend/src/pages/JobDetail.tsx` still untouched. Mockup:
`submission-report-final.html` (supersedes the mid-session
`submission-report-token-comparison.html` exploration file — that one
can be discarded, not worth keeping as a reference).

## Not yet done — still queued for session 82

Unchanged from session 80's list, since none of it was started this
session:

1. Real composer UI (insert-at-cursor within fixed field boundaries).
2. Schema change: `attachments` → `{path, filename, caption, token}`,
   scoped per labeled field.
3. Migration path for existing flat-array attachments — not yet decided.
4. `composeSubmission()` refactor: fixed 4-field function → per-`kind`
   field config.
5. Composer placeholder/hint copy per category.
6. Real implementation of the attachments-record fallback UI, including
   referenced/unreferenced checkmark logic.
