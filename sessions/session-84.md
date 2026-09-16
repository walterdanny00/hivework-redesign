# Session 84 (2026-09-14) — Dark mode bug sweep across worker/owner JobDetail, Dashboard, Home, PostJob, Profile

## Starting point

User had already built a dark/light mode toggle into the app
(`[data-theme="dark"]` attribute swap, root CSS variables redefined in
`frontend/src/index.css`) before this session. Reported: the worker
submission-report screenshot from session 83's live test rendered with
the whole page correctly dark, but the composer's textareas and native
"Choose Files" button stayed light-cream — meaning some components
never got dark-mode variants when the toggle was built.

## Root causes found

Two distinct, repeating bug patterns, not one:

1. **Hardcoded hex/white values that shadow theme tokens.** Most
   critically `--cream-deep:#EFEBE1` was redeclared as a *local*
   CSS custom property inside both `.hw-jdw` (worker JobDetail) and
   `.jdo` (owner JobDetail) style blocks, shadowing the root-level
   token system entirely — `[data-theme="dark"]` had nothing to
   override. Same pattern found repeated as literal `#EFEAFB`
   (violet-tint) across Dashboard, Home, PostJob (x2), and Profile
   (x2), instead of referencing the already-correct `--violet-tint`
   root token. Also several flat `background:#fff` declarations
   (textarea `:focus` state, `.fig-caption-input`, `.paid-strip`,
   `.verified-strip` on both worker and owner sides).
2. **Text elements with no explicit `color`, riding on a native
   element's default.** `<button>`-wrapped labels don't inherit page
   color the way plain divs do; four instances found:
   applicant username in both the Applicants tab (`.jdo .app-info .n`)
   and Overview tab (`.jdo .ledger-info .n`), and the worker's own
   rating stars (`.hw-jdw .star`, missing `color` entirely — fixed to
   `var(--butter)` matching the owner-side equivalent that already had it).

## Fixes applied, by file

- **`frontend/src/index.css`**: added `--cream-deep` as a real root
  token (light `#EFEBE1` / dark `#1A1914`), plus new `--report-paper`,
  `--report-paper-raised`, `--report-ink`, `--report-ink-soft`,
  `--report-line` tokens for the submission-report's paper palette
  (dark values: `#2A2924`/`#333029`/`#EAEBE6`/`#A8A79E`/`#454239`),
  and `--silver-tint`/`--bronze-tint` for the trust chips.
- **`frontend/src/pages/JobDetail.tsx`**: removed the two local
  `--cream-deep` redeclarations; fixed the 4 hardcoded-`#fff`
  backgrounds; fixed the 4 missing-color text bugs; pointed the
  submission-report's paper palette at the new `--report-*` tokens
  (kept as its own distinct scope, per Section 94's deliberate
  "one-screen exception" — now themed rather than fixed-light); fixed
  `TRUST_COLOR`'s hardcoded `Silver: '#9ca3af'`/`Bronze: '#b45309'` to
  reference `var(--trust-silver)`/`var(--trust-bronze)` (already
  correctly dark-aware root tokens the map wasn't using).
- **`Dashboard.tsx`, `Home.tsx`, `PostJob.tsx`, `Profile.tsx`**:
  replaced 6 literal `#EFEAFB` instances with `var(--violet-tint)`;
  `Profile.tsx`'s `chip-silver`/`chip-bronze` repointed to the new tint
  tokens plus `var(--trust-silver)`/`var(--trust-bronze)`.

## Regression found and fixed within this same session

Fixing `chip-expert` (Profile.tsx) to `var(--violet-tint)` broke it —
that chip renders on the profile's fixed violet gradient cover, the
same context as `chip-pioneer`/`chip-validator` right next to it,
which both already use fixed (non-theme) styling for exactly that
reason. `--violet-tint`'s dark value is a translucent violet, which
disappears against an already-violet backdrop instead of contrasting
with it. Fixed by giving `chip-expert` and (proactively, same latent
risk, same location) `chip-verified` fixed white-glass styling
(`rgba(255,255,255,.85)` background, fixed violet/teal ink) instead of
a theme-flipping token. Confirmed working via screenshot.

**Lesson for future dark-mode work**: a chip or badge sitting on a
fixed-color hero (violet gradient cover, `--ink-fixed` cards) needs
fixed styling regardless of theme — the same rule already established
for `.job-head` in Section 96's era of thinking, now generalized. A
token that looks like the right fix in isolation can still be wrong
depending on what it's sitting on.

## Verification

Live-checked in dark mode via screenshots at each step: worker
submission composer (textareas, fig-caption input — no longer flash
white on focus), owner "Client wallet verified" banner, Applicants tab
and Overview tab usernames, worker rating stars, Dashboard nudge
banner, Profile trust chips (Expert/Verified/Silver/Bronze) and skill
chip-outline pills. All confirmed correct after the regression fix.

## Status: closed

No further active dark-mode bugs reported as of end of session. Not
exhaustively swept beyond the five files touched (Dashboard, Home,
PostJob, Profile, JobDetail) — Onboarding, Settings, History*, Help,
Landing, NotFound not yet checked for the same two bug patterns.

## Open items carried forward

Unchanged from session 83:

1. JobDetail token-redeclaration removal (`bd53c30`, reverted as
   `5b13ca8`, session 71) — investigated in depth session 75 (Section
   87), no code-level cause found; parked, no retry planned unless a
   concrete symptom resurfaces.

New:

2. Dark mode sweep only covered Dashboard, Home, PostJob, Profile, and
   JobDetail — Onboarding.tsx, Settings.tsx, HistoryJobs.tsx,
   HistoryWithdrawals.tsx, HistoryWork.tsx, Help.tsx, Landing.tsx, and
   NotFound.tsx have not been checked for the same two bug patterns
   (hardcoded hex/white shadowing theme tokens; text with no explicit
   color inside native elements). No known issues reported there yet —
   listed for awareness, not urgency.
