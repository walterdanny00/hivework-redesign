# Session 39 (2026-09-03)

Continued the full visual re-verification pass (Section 48/49 →
Section 50), picking up where session 38 left off. Oldest-first order:
`Layout.tsx`/`Home.tsx` cleared session 37, `index.css` bug fixed
session 38. This session: `Jobs.tsx`, then `PostJob.tsx`.

## `Jobs.tsx` (Browse) — clean, no bug

Pulled the live file from `~/Piwork/frontend/src/pages/Jobs.tsx` plus
the real, retargeted `index.css` and `Layout.tsx` for a direct token
diff (rather than re-trusting Section 38's grep-only confirmation).

- `index.css`'s `:root` confirmed byte-identical to `Layout.tsx`'s —
  cream/ink/ink-soft/violet/violet-deep/mint/coral/butter/line/card
  all match. So the bare global `.btn-primary` (Post-a-Job empty
  state) and `.btn-ghost` (Try-again error state) — neither of which
  `Jobs.tsx` overrides in its own `BROWSE_STYLES` block — render
  correctly.
- `strokeWidth`-without-`stroke` risk: all 7 category-tile SVGs omit
  `stroke` on the element itself but are covered by
  `.hw-browse .t-icon svg{stroke:var(--ink);}`. Same safe pattern as
  `Home.tsx`'s icon sweep. Clean.
- No hardcoded old-theme colors anywhere in `BROWSE_STYLES` — the
  pastel tile background hexes (`#FFE8E5` etc.) are an intentional
  design choice, not a legacy leftover.
- Roadmap-described features (Section 42) all present: 3 real
  categories (`bug-testing`/`translation`/`ui-feedback`) with live
  `/api/jobs/stats` counts, 4 disabled "Coming soon" tiles, restored
  description snippet + applicant count on `rec-item` cards.

Two documentation-only notes, not bugs:
1. Unlike every other screen, Browse has no standalone canonical
   `HiveworkJobs.jsx`/`hivework-jobs.html` in `screens/` — it only
   ever existed inside the compiled shell (`hivework-app-v4-3.html`).
   Confirmed via `ls` on `screens/` — no matching file, `cat
   hivework-jobs.html` returned "No such file or directory."
2. Shell's demo tile data (`hivework-app-v4-3.html`, `#browse-tiles`)
   uses category value `ui-ux-feedback`; real code (and backend)
   correctly use `ui-feedback`. Doesn't affect anything live — shell
   demo data isn't wired to real filtering — but it's another
   instance of the shell being the stale side, same as the
   profile-menu dropdown flagged session 37.

**Verdict: passes, no fix needed.**

## `PostJob.tsx` — clean on tokens/behavior, one real finding

Pulled the live file plus both canonical references
(`HiveworkPostJob.jsx` and `hivework-post-job.html` — identical to
each other, as expected).

Clean:
- No hardcoded old-theme colors in `POST_JOB_STYLES`.
- `.btn-row .btn-ghost`/`.btn-row .btn-primary` overrides are
  flex-layout only (`flex: 0 0 auto` / `flex: 1`) — no color rules,
  so both fall through to the now-confirmed-correct global classes.
  This resolves the "left unconfirmed" flag from Section 37/38 with
  an actual visual diff, not just a grep.
- `strokeWidth`-without-`stroke`: all category-option SVGs covered by
  `.cat-opt svg{stroke:var(--ink-soft);}` /
  `.cat-opt.selected svg{stroke:var(--violet-deep);}`. Clean.
- Full roadmap-described behavior confirmed: 4-step wizard
  (Basics/Details/Workers/Review), per-step validation stricter than
  real code's old single Review-time check but never looser, real
  3-of-7 category gating with "Coming soon" tiles, Device/Language
  comboboxes syncing to comma-joined strings, and the full
  `connected`/`paying`/`done`/`error` payment-state flow with
  `handlePayAndPost` and Pi callbacks intact.

**New finding — wizard step-indicator design drift:**

| | Canonical (`HiveworkPostJob.jsx`/`.html`) | Real `PostJob.tsx` |
|---|---|---|
| Connector line between dots | `:after` pseudo-element line, fills violet as steps complete | **Missing — no connector at all** |
| Active-step dot | Outlined ring (`border-color: violet`, transparent fill) | Filled solid **violet** |
| Done-step dot | Filled solid **violet** | Filled solid **mint** |

Not a token bug — both sides use only defined system CSS variables.
It's a genuine, unreconciled visual-pattern divergence in how wizard
progress is communicated. Real code has no per-file override history
suggesting a deliberate change, so this most likely reflects an
earlier version of the step-indicator pattern that was never brought
back in sync after canonical settled on the connector-line/outlined-
active/violet-done version. Per the roadmap's standing rule, canonical
is the source of truth for UX decisions — but no fix was applied this
session; left as an open decision (adopt canonical's version in real
code, or the reverse) for session 40 or later.

Same `ui-ux-feedback`-vs-`ui-feedback` shell-side naming mismatch
noted here too (`CATEGORY_OPTIONS` in both canonical files).

**Verdict: passes on tokens/behavior; one open design-fidelity item
(step-indicator), not blocking, no due date.**

## Carried into Section 50 / Next session

1. Continue the pass at `JobDetail.tsx` (worker + owner) next, then
   `Dashboard.tsx`, History screens + `WithdrawalRow`,
   `Profile.tsx`/`Onboarding.tsx`.
2. Decide the `PostJob.tsx` step-indicator direction (canonical vs.
   real code) before or during that pass — no fix built yet.
3. Documentation-only, still open, not urgent: shell's stale
   profile-menu dropdown vs. real hamburger pattern; shell's
   `ui-ux-feedback` vs. real `ui-feedback` category value (now
   confirmed on both Browse and Post Job).
