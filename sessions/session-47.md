# Session 47 (2026-09-05)

Picked up open item #2 carried from session 46: decide the `PostJob.tsx`
wizard step-indicator direction (open since session 39).

## Investigation

Per the standing sweep-before-designing rule, pulled `PostJob.tsx`
directly before deciding anything.

`WIZARD_STEPS` declared 4 dots:

```js
const WIZARD_STEPS = [
  { n: 1, label: 'Basics' },
  { n: 2, label: 'Details' },
  { n: 3, label: 'Workers' },
  { n: 4, label: 'Review' },
]
```

But the `wizard-track` markup that renders those dots only exists in the
component's main return block — the one reached for `wizardStep` 1–3.
`step === 'review'` is a **separate early return** with no wizard-track
at all. Grepping for `currentStep|activeStep|wizardStep` across
`frontend/src` confirmed there's no other indicator hiding elsewhere
either.

Net effect: dots 1–3 worked correctly (active/done states light up as
you move through Basics → Details → Workers), but dot 4 ("Review") was
declared and never reachable — the instant you hit Continue on step 3
and land on Review, the indicator just vanished. The other three
full-screen payment states (Paying/Done/Error) never had an indicator
to begin with and were never expected to.

## Decision

Two real options: extend the wizard-track onto the Review screen (dot 4
lights up), or trim `WIZARD_STEPS` to 3 and treat Review/Pay as a
distinct no-indicator phase.

Went with **trimming to 3**. Reasoning:

- Review/Paying/Done/Error already read as one continuous full-screen
  state sequence with their own emoji/title/sub pattern — visually
  distinct from the form steps. Adding a 4th dot would layer a second
  "progress" metaphor on top of a screen that already has its own idiom.
- A step dot implies "one more short step, same shape as the others."
  Review isn't data entry — it's a checkpoint before an irreversible Pi
  payment. Demoting it to "just another dot" undersells that.
- Matches what's already true for Paying/Done/Error, which never had an
  indicator and were never flagged as missing one — only Review's dot
  read as a gap, because `WIZARD_STEPS` implied it should exist. That's
  leftover framing from an old "4-step wizard" description, not a real
  UX gap.
- Smaller, reversible change — if it reads wrong live, adding a 4th dot
  back to Review is a quick add-on, not a redesign.

Also retitled the step-3 CTA from "Continue →" to "Review job →" so the
transition out of wizard mode reads as intentional rather than as an
invisible fourth step.

## Patch, applied

Python patch script, backup + unique-anchor-check convention (same as
sessions 44–46). Both anchors (the `WIZARD_STEPS` array, the step-3
button) matched exactly once. Diff reviewed clean — exactly the two
intended changes, nothing else touched.

`npx tsc --noEmit` clean (no output). `npm run build` clean:
`326.59 kB` JS (down slightly from session 46's `326.61 kB` — one fewer
array entry) / `2.38 kB` CSS unchanged (inline JS-embedded styles, not
`index.css`).

Pushed to the Piwork repo (real code, `frontend/src/` only):
`PostJob: drop dead 4th wizard-step dot, retitle step-3 CTA to "Review
job"` (commit `8542ef3`). Push confirmed clean by the user. Live-tested
and confirmed good.

## Files touched

`pages/PostJob.tsx`.

## Carried into next session

1. Landing / Wallet Connect re-verification remains blocked — no way
   found yet to actualize a real logged-out state to test against.
2. Decide the `JobDetail.tsx` owner-view ledger-connector /
   worker-view dead-CSS-and-attachments items (session 40) — not fixed
   yet, no due date set.
3. `--cream`/`--line`/`--mist`/`--sand` are 4 very close near-white
   warm-grays — worth a follow-up pass to decide if any should merge, or
   if the layering is intentional.
4. Minor, not fixed: `Jobs.tsx`'s `.cat-empty` rule in `BROWSE_STYLES` is
   dead CSS (unused). Safe to remove whenever this file is touched next.
5. Documentation-only, still open: shell's stale profile-menu dropdown vs.
   real hamburger pattern; shell's `ui-ux-feedback` vs. real `ui-feedback`
   category-value naming mismatch. Neither urgent.

Item #2 from session 46's list (`PostJob.tsx` wizard step-indicator
direction) is now **closed** — resolved and pushed this session.

No due date set on any of the above — open decision for the user.
