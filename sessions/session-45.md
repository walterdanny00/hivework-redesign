# Session 45 (2026-09-04)

Picked up open item #1 carried from session 44: no canonical answer existed
for whether `.pj-combo input` should have a background, and if so `--cream`
(Profile.tsx) or `--card` (Onboarding.tsx).

## Investigation

Checked the compiled shell's analogous `.hwpc-combobox` pattern (Profile
Complete / Onboarding canonical) first: container carries `background:
var(--card)`, inner `<input>` is `background:transparent`. Promising lead,
but `Combobox.tsx` needed checking directly to see if the real component
follows that container/transparent-input shape.

Pulled `Combobox.tsx` (shared component, extracted from PostJob.tsx's
original `PJCombobox` per its own header comment) plus a `chip-row` grep
across all three host files. Findings:

- `.pj-combo` is a bare wrapper (`position:relative` only, identical in all
  3 files) — not the `.hwpc-combobox` container/transparent-input shape.
- The `<input>` is a **direct sibling** inside `.pj-combo`, not nested
  inside `chip-row`. `chip-row` only lays out the selected chips
  (flex/gap/margin) and is identically unstyled across all 3 host files —
  it carries no background in any of them.
- **`PostJob.tsx` — the origin file — never styled `.pj-combo input` at
  all.** No rule exists for it there. So in the live Post Job flow, that
  combo input has always rendered as a bare, unstyled native `<input>`: no
  border, no padding, no background — sitting directly below the styled
  chips. Not a deliberate minimal look; a gap.
- Only `Profile.tsx` (`--cream`) and `Onboarding.tsx` (`--card`) had
  independently patched in a background, in opposite directions, with no
  origin file to arbitrate between them — which is why Section 53 couldn't
  resolve this the same way it resolved the other 3 `ProfileForm` token
  swaps.

## Decision

`--card` — matches `Onboarding.tsx`'s existing rule and the app's broader
field-surface convention (`.field input`, and the `textarea`/`skills-box`
convention already fixed to `--card` in Section 53). Two changes:

1. **`PostJob.tsx`**: added the missing `.pj-combo input` rule (padding,
   border, radius, `background:var(--card)`, color, font) plus a
   `:focus` state — copied verbatim from `Onboarding.tsx`'s existing rule.
2. **`Profile.tsx`**: swapped its one `.pj-combo input` background from
   `--cream` to `--card`.

## Patch, applied

Python patch script, backup + unique-anchor-check convention (same as
Section 53/55). Both anchors matched exactly once. Diff reviewed: exactly
the two intended changes, nothing else touched.

`npx tsc` clean (from `~/Piwork/frontend`, correct project root per
Section 53's earlier gotcha). `npm run build` clean: `325.70 kB` JS (up
slightly from session 44's `325.40 kB` — expected, new CSS text added to
`PostJob.tsx`'s embedded style string) / `2.38 kB` CSS unchanged (these are
inline JS-embedded per-page styles, not `index.css`, so the CSS bundle
doesn't move).

Pushed to the Piwork repo (real code, `frontend/src/` only):
`fix: style .pj-combo input in PostJob.tsx (was unstyled) and align
Profile.tsx to --card, matching Onboarding/canonical field-surface
convention`. Push confirmed clean by the user.

## Files touched

`pages/PostJob.tsx`, `pages/Profile.tsx`.

## Carried into next session

1. Landing / Wallet Connect re-verification remains blocked — no way found
   yet to actualize a real logged-out state to test against.
2. Black-rectangle glitch: explained (session 41), not fixed —
   `WithdrawPanel.tsx`'s loading skeleton is a plain unstyled bar; worth a
   design pass (shimmer/shape) if picked up, otherwise no functional issue
   remains.
3. Decide the `PostJob.tsx` wizard step-indicator direction (session 39)
   and the `JobDetail.tsx` owner-view ledger-connector / worker-view
   dead-CSS-and-attachments items (session 40) — none fixed yet, no due
   dates set.
4. `--cream`/`--line`/`--mist`/`--sand` are 4 very close near-white
   warm-grays — worth a follow-up pass to decide if any should merge, or
   if the layering is intentional.
5. Minor, not fixed: `Jobs.tsx`'s `.cat-empty` rule in `BROWSE_STYLES` is
   dead CSS (unused). Safe to remove whenever this file is touched next.
6. Documentation-only, still open: shell's stale profile-menu dropdown vs.
   real hamburger pattern; shell's `ui-ux-feedback` vs. real `ui-feedback`
   category-value naming mismatch. Neither urgent.

Item #1 from session 44's list (`.pj-combo input` background question) is
now **closed** — resolved and pushed this session.

No due date set on any of the above — open decision for the user.
