# Session 85 (2026-09-16) — Dark mode: Onboarding.tsx KYC pill

## Starting point

Session 84 closed the dark-mode bug sweep as "not exhaustive" — it only
covered Dashboard, Home, PostJob, Profile, and JobDetail. Onboarding.tsx,
Settings.tsx, HistoryJobs.tsx, HistoryWithdrawals.tsx, HistoryWork.tsx,
Help.tsx, Landing.tsx, and NotFound.tsx were flagged as unchecked. This
session continued that sweep, starting with Onboarding.tsx.

## What was found

Swept `Onboarding.tsx` (its own `ONBOARDING_STYLES` block — no shared
stylesheet, per Section 43) against the two bug patterns established in
Section 97:

1. **Pattern 1 (hardcoded hex shadowing theme tokens) — confirmed, one
   instance:** `.chip-outline` had `background:#EFEAFB` — the same
   literal violet-tint hex already fixed elsewhere in session 84, but
   this file's separate style block meant that fix never touched it.
   Live class (renders `Combobox` selected-chip state for Device/
   Language), not dead CSS.
2. **New variant of pattern 1, not seen in the five files already
   swept: an entire hardcoded gold/amber block**, the KYC notice pill:
   - `.kyc-pill{background:#FFF3DC;border:1px solid #F4DFA8;...}`
   - `.kyc-pill svg:first-child{color:#B8860B;...}`
   - `.kyc-pill span{...color:#8A6512;...}`
   - inline `stroke="#8A6512"` on the chevron `<svg>` in JSX itself
     (a presentation attribute, not CSS — doesn't resolve `var()`,
     needed a different fix than the others)
3. **Pattern 2 (missing explicit `color`)** — not found in this file.
   Skill-chip remove button, save/skip buttons, and ToS links all set
   `color` explicitly already.

Checked root tokens on Termux before patching (`grep -n "pi-gold\|:root\|
\[data-theme\]" index.css`): `--pi-gold` (`#B8860B` / dark `#F0C36A`)
and `--pi-gold-tint` (`#FFF3DC` / dark `rgba(255,200,87,.14)`) already
existed and were dark-aware, unused by this file. No existing token
covered the `#F4DFA8` border color — same situation as `--report-*` in
session 84 — so a new token was added.

## Fixes applied

- **`frontend/src/index.css`**: added `--pi-gold-border` as a new root
  token (light `#F4DFA8` / dark `rgba(240,195,106,.35)`, matching the
  opacity convention of the other dark gold values).
- **`frontend/src/pages/Onboarding.tsx`**:
  - `.chip-outline` background → `var(--violet-tint)`
  - `.kyc-pill` background → `var(--pi-gold-tint)`
  - `.kyc-pill svg:first-child` color → `var(--pi-gold)`
  - `.kyc-pill span` color → `var(--pi-gold)` (was `#8A6512`, a touch
    darker than `#B8860B` — visually negligible, and now themes
    correctly instead of staying fixed-light)
  - `.kyc-chev` gained `stroke:var(--pi-gold)` in CSS; the JSX's inline
    `stroke="#8A6512"` presentation attribute was removed from the
    `<svg>` so the CSS rule (which wins over presentation attributes)
    owns the color instead

## Verification

Built clean (`npx tsc && npx vite build`), pushed. User confirmed both
commands printed successfully; live dark-mode screenshot of the
expanded KYC pill still pending from user to fully close this file out.

## Status: open (Onboarding.tsx dark-mode fix built + pushed, not yet
live-verified via screenshot; sweep of remaining unchecked files continues)

## Open items carried forward

Unchanged from session 84, plus one addition:

1. JobDetail token-redeclaration removal (`bd53c30`, reverted `5b13ca8`,
   session 71) — investigated session 75 (Section 87), no code-level
   cause found; parked, no retry planned unless a concrete symptom
   resurfaces.
2. Dark-mode sweep still incomplete: Settings.tsx, HistoryJobs.tsx,
   HistoryWithdrawals.tsx, HistoryWork.tsx, Help.tsx, Landing.tsx,
   NotFound.tsx not yet checked. Onboarding.tsx now checked and patched
   (this session) — pending live screenshot confirmation.
