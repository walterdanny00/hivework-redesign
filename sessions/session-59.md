# Session 59 — 2026-09-06

## Topic: Full Landing page ported from shell; own chrome via `Layout`'s `isLandingRoute` bypass

Session 58's fix confirmed working, but the user flagged the real gap:
session 57's `!connected` branch in `Home.tsx` was Claude-improvised
placeholder content, never an actual port of the shell's Landing screen.
Wanted: every logged-out visitor (first-time or returning, post-logout)
lands on the real shell Landing design, with its 3 CTAs ("Get started" /
"Find work" / "Post a job") routing into wallet connect.

## Locating the real Landing markup

First pulled `renderWelcome()` (line ~2433 in `hivework-app-v4-3.html`) —
this turned out to be the **connect screen itself** (with demo toggles
for returning-user/no-Pi-Browser/failed states), not a separate marketing
page. Landing is a genuinely separate screen in the shell, `#page-landing`
— confirmed via further search of the shell file. The shell's own comment
notes fullpage screens (Landing/Welcome/Onboarding) bypass the shell's
header/segnav entirely — real code didn't do this; `Home.tsx` rendered
inside `Layout.tsx`'s always-on app header.

## Scope decisions (user calls)

- **Page scope:** port the *full* Landing page — hero, trust row,
  animated ticker, Categories preview, "How escrow works" section,
  footer — not just what was visible in the screenshot (hero/trust
  row/ticker only).
- **Chrome:** Option B — Landing gets its own bespoke nav (logo, testnet
  badge, "Get started" button), no app hamburger menu at all on this one
  screen — matching the shell's architecture rather than squeezing
  marketing content under the existing app header (Option A).

## Built

- **`Landing.tsx`** (new) — full ported page. Bespoke nav with testnet
  badge/tooltip, hero with animated ticker, real category cards (live
  counts from `/api/jobs/stats`, only the 3 real categories — not the
  shell's hardcoded "1 open job"/"0 open jobs"), the "How escrow works"
  section, and footer. All nav links and both hero CTAs route through
  `/onboarding` with the matching `returnTo` — the shell's
  `goToWelcome('none'|'find'|'post')` intent flag maps directly onto
  `Onboarding.tsx`'s existing `returnTo` param, so no new mechanism was
  needed. (The shell's "returning user" demo toggle in `renderWelcome`
  doesn't need porting either — real `Onboarding.tsx` already does the
  real version correctly: once `connected` is true it goes straight to
  the profile-form-or-skip logic.)
- **`Home.tsx`** — the placeholder `!connected` branch is now just
  `return <Landing />`; connected functional Home untouched.
- **`Layout.tsx`** — added `isLandingRoute` (true when at `/` and not
  connected); hides the app header, side menu, and segnav when true, so
  Landing owns its own chrome. Deliberate call, flagged not silently
  made: kept the small "Need help? Contact support" strip visible even on
  Landing, consistent with Help staying reachable logged-out (a deviation
  from the shell, which doesn't have this strip on its Landing).

## Applied

```
cd ~/Piwork
cp ~/storage/downloads/Landing.tsx frontend/src/pages/Landing.tsx
cp ~/storage/downloads/Home.tsx frontend/src/pages/Home.tsx
cp ~/storage/downloads/Layout.tsx frontend/src/components/Layout.tsx
npx tsc --noEmit -p frontend
# frontend/src/pages/Landing.tsx:3:10 - error TS6133: 'usePiConnection' is declared but its value is never read.
```

`Landing.tsx` doesn't actually need `usePiConnection` (only ever rendered
from `Home.tsx`'s already-resolved `!connected` branch) — fixed via:

```
sed -i "s/import { usePiConnection, PI_SANDBOX } from '..\/lib\/usePi'/import { PI_SANDBOX } from '..\/lib\/usePi'/" frontend/src/pages/Landing.tsx
npx tsc --noEmit -p frontend
# clean
```

## Files touched

`frontend/src/pages/Landing.tsx` (new), `frontend/src/pages/Home.tsx`,
`frontend/src/components/Layout.tsx` — real app code, Piwork repo only.

## Pushed

```
git add frontend/src/pages/Landing.tsx frontend/src/pages/Home.tsx frontend/src/components/Layout.tsx
git commit -m "Port full Landing page from shell design; give it its own chrome via Layout's isLandingRoute bypass"
git push
```
**Confirmed clean push by user.**

## Live test

User confirmed "working beautifully": real ported Landing renders
(replacing the placeholder), ticker cards animate in a staggered loop,
category card counts reflect real open jobs, nav links and both hero CTAs
route correctly into `/onboarding` with the right `returnTo`, and logout
from a connected state lands cleanly back on Landing with no flicker.

Two follow-on issues surfaced by this same test round, not caused by this
patch: an already-complete-profile user still saw the profile form
(session 60/61), and the KYC pill's visual styling didn't match the shell
(session 60).

## Roadmap updated

Section 70 added.

## Next session

Fix KYC pill styling and the profile-complete skip check — see
session-60.md.
