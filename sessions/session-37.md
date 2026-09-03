# Session 37 — Full visual re-verification pass, in progress: legacy `index.css` theme found still live (2026-09-03)

Picked up session 36's open "Next session" decision: started the full
visual re-verification pass across all patched screens against the shell,
oldest-patched screens first. This session covers `Layout.tsx` and
`Home.tsx` cleanly, then surfaces a real, unresolved, systemic bug.
**No fix applied this session — findings only, logged for next session.**

## Loose ends from session 36, both closed out

- **`feature/side-menu` merge status** — confirmed via `git branch
  --merged main`: genuinely merged, not just committed to its own
  branch. No drift.
- **`strokeWidth`-without-paired-`stroke` sweep** (flagged in session 35
  after catching it twice, in `Jobs.tsx` then `PostJob.tsx`) — swept
  `pages/` and `components/` for the pattern. `Jobs.tsx` and
  `PostJob.tsx` were already fixed per session 35. `JobDetail.tsx` and
  `Layout.tsx` were never at risk — they set `stroke="currentColor"`
  directly on the element. `Home.tsx` looked suspicious at first grep but
  checks out: `.hw-cat-icon svg{stroke:var(--violet-deep);}` covers all
  six category icons. Sweep closed, nothing left to patch.

## Re-verification pass — screens checked so far

Order: oldest-patched first (most likely to predate later design
conventions).

- **`Layout.tsx`** — clean, matches session 36's description exactly
  (hamburger icon, avatar as plain `NavLink`, segnav only when
  connected, panel with Help/Contact Support/Logout). One documentation
  note in the other direction: the *shell* (`hivework-app-v4-3.html`)
  still has the old profile-menu dropdown pattern (View profile/Edit
  profile/Notification settings/Contact support/Log out) that real code
  never had post-Section 39 and definitely doesn't have now. This
  inverts the roadmap's usual drift direction — the shell is stale here,
  not the app. Logged as a documentation gap, not urgent, since real
  code is correct and live.
- **`Home.tsx`** — icons clean (see sweep above). Placeholder data
  (`DEMO_CATEGORY_COUNTS`, `ACTIVITY_TICKER`) clearly commented as such.
  Tokens correctly rely on `Layout.tsx`'s global `:root` block rather
  than redeclaring, which is correct since real pages nest inside
  `Layout` (unlike the standalone shell files). This is where the real
  bug below was found.

## Real bug found: `index.css` never migrated off the old dark theme

`index.css` is essentially untouched pre-redesign leftover. Its `:root`
still defines the full old dark-theme token set (`--bg:#0f0e17`,
`--bg-card:#1a1827`, `--text-primary:#f0eeff`, `--text-secondary:#9d98bb`,
`--border:#2e2a45`, `--pi-purple` family, etc.) — none of which exist in
the new design system's tokens (`Layout.tsx`'s `:root`: `--cream`,
`--ink`, `--ink-soft`, `--violet`, `--violet-deep`, `--line`, `--card`,
`--mint`, `--coral`, `--butter`). Global classes still built on the old
tokens: `.btn`, `.btn-primary`, `.btn-ghost`, `.card`, `.badge-*`,
`.label`, `.form-group`, and the bare `input/textarea/select` rules.

No double-background risk — confirmed `Layout.tsx`'s `.hw-layout` paints
`var(--cream)` directly over the body at `min-height:100vh`, so the dark
`body` background never shows through anywhere.

### Confirmed blast radius

Swept `pages/` and `components/` for consumers of the bare/global
classes (`.container` excluded — layout-only, harmless):

- **`Home.tsx`** (lines 140–141) — `Find Work` uses `.btn.btn-primary`
  (close-ish: `--pi-purple #6c3fc5` vs new `--violet #6C5CE7`, minor
  drift, not broken). `Post a Job` uses `.btn.btn-ghost` — this one is
  real: `--text-secondary #9d98bb` (pale lavender-gray, built for a dark
  background) on the app's cream background is a genuine
  contrast/legibility bug, on the very first screen a user sees.
- **`JobDetail.tsx`** — already has its own scoped override
  (`.hw-jdw .btn-primary` / `.hw-jdw .btn-ghost` with correct new-system
  colors) for every button *except* the plain `<button className="btn
  btn-ghost">` Back button at line 670, which isn't covered by the
  `.hw-jdw` scope and falls through to the broken global rule. Also: the
  bare `<div className="label">` at line 965 ("Open slot — awaiting an
  applicant") has no matching override in the file's own `<style>`
  block — confirmed via direct grep of the scoped block, came back
  empty. Renders in the old `--text-secondary` color.
- **`Profile.tsx`** — three bare `<div className="card">` instances
  (lines 177, 194, 216), none overridden in the file's own scoped
  style block (confirmed empty via direct grep). This is a step past
  the button contrast issue: `.card`'s `background: var(--bg-card)`
  (`#1a1827`, near-black) with a dark navy border would render as
  **dark boxes floating on the cream page** — a background-color bug,
  not just a text-contrast one. Notable that this survived Section 47's
  "full restyle" pass of `Profile.tsx` entirely.
- **`Jobs.tsx`, `PostJob.tsx`, `Dashboard.tsx`, `ContactSupport.tsx`** —
  confirmed via grep to also reference the bare global `.btn-primary` /
  `.btn-ghost` classes, but **not yet checked** for whether each file's
  own scoped `<style>` block overrides them (the way `JobDetail.tsx`
  partially does). `PostJob.tsx`'s `.btn-row .btn-ghost` / `.btn-row
  .btn-primary` override is flex-layout only, not color — still needs
  confirming whether color is covered elsewhere in that file.

### Fix direction (not yet built)

Given the number of independently-affected files, scoping a per-file
override (the `JobDetail.tsx` pattern) six times over is very likely the
wrong shape here — `index.css`'s `:root` is a genuine single global
stylesheet, unlike the shell files (which each self-contain tokens for
standalone preview) and unlike the rest of the codebase's page-scoped
convention. The fix almost certainly belongs at the source: retarget
`index.css`'s old tokens to the new design system's values so every
consumer picks it up at once, rather than patching six files
individually. Pulled the new system's actual token values
(`Layout.tsx`'s `:root` block) to have on hand for that mapping, but
**no fix was written or shipped this session** — decision was to log the
finding, update the roadmap, and continue in a new session.

## Not yet re-verified

`Jobs.tsx` (Browse), `PostJob.tsx`, `JobDetail.tsx` (worker + owner
views — beyond the two spot-checks above), `Dashboard.tsx`,
`HistoryWork`/`HistoryJobs`/`HistoryWithdrawals` + shared
`WithdrawalRow`, `Profile.tsx` + `Onboarding.tsx` (beyond the `.card`
check above) — original re-verification order from session 36 still
applies.

## Next session

1. **Fix the `index.css` legacy-token bug** — retarget `:root`'s old
   dark-theme tokens to the new system's values (`--cream`, `--ink`,
   `--violet`, etc.), then re-check every confirmed consumer (`Home.tsx`
   buttons, `JobDetail.tsx` Back button + open-slot label, `Profile.tsx`
   cards) renders correctly. Also finish checking `Jobs.tsx`,
   `PostJob.tsx`, `Dashboard.tsx`, `ContactSupport.tsx` for scoped
   overrides before/after the fix.
2. Resume the re-verification pass at `Jobs.tsx` (Browse) next, per the
   original oldest-first order.
3. Documentation-only: shell's stale profile-menu dropdown (should
   reflect the hamburger pattern eventually — not urgent).
