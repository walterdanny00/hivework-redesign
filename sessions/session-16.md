# Session 16 — 2026-08-12

**Focus:** user asked whether a returning user (already-complete profile,
notifications already enabled) gets pushed through the profile/notify
screens again on every reconnect, or whether wallet connect alone is
enough. Turned into a sweep, a confirmed real gap, a fix across 5 files,
a bug caught mid-fix, and a CSS self-containment pass on request.

## Part A — Sweep first

Per standing rule, swept the real app before touching any shell file.
Searched for `WalletConnect`/`onConnect` (only matched `node_modules`
type defs — not the real term), then `profileComplete`/`isNewUser`/
`onboardingComplete`, then confirmed no `ProfileSetup`/`NotificationOpt`/
`EnableNotifications` components exist anywhere in the codebase. Found
the real login path: `usePi.ts` (Pi SDK auth), landing directly on
`Dashboard.tsx`. `profileComplete` there only drives a soft inline nudge
banner ("Complete your profile" → `/onboarding?returnTo=/dashboard`),
never a forced screen. **Answer to the original question: no gate at
all — reconnect is wallet-auth-only, onboarding screens don't exist in
the real app's login path.**

## Part B — Shell comparison, gap found

Checked the shell against that finding. Every path into the shell app
(Landing's Get Started / Find Work / Post Job, all routing through
`HiveworkOnboardingFlow`/`owConnect`) ran connect→profile→notify
unconditionally — no returning-user branch anywhere, in any of the 5
onboarding-related files. Confirmed this as a real mismatch, not a
not-yet-decided design question.

## Part C — Fixed in all 5 files

- `HiveworkApp.jsx` / `hivework-app-v4-3.html`: `handleConnect`/
  `owConnect` now takes a `returning` flag and skips straight to
  `routing` instead of `profile`. Surfaced via a new "Demo: returning
  user (skip setup)" link, matching the existing demo-link convention
  in those files.
- `HiveworkOnboarding.jsx` / `-0.jsx` / `hivework-onboarding.html`: added
  a `profileComplete` prop/state with the same effect, surfaced via a
  new `PreviewControls`/preview-row toggle, matching *their* existing
  convention (`piBrowserDetected`/`intent`).

## Part D — Bug caught mid-fix

First pass at the `HiveworkApp.jsx` demo link called
`setSimulateReturning(true)` and `handleConnect(...)` in the same click
handler. Since `handleConnect`'s outcome branch runs inside a
`setTimeout`, it closed over the pre-update `false` value — the flag
never actually applied, so the "skip setup" demo silently did nothing
(user caught this by testing it). Fixed by passing `returning` directly
as a function argument instead of reading it off state inside the
delayed callback. Checked the equivalent code in `owConnect` (plain
mutable variable, not React state) and `HiveworkOnboarding.jsx` (toggle
click and Connect click are separate handlers/renders) — neither had
this failure mode, so only the one fix was needed.

## Part E — CSS self-containment (on request)

`HiveworkOnboarding.jsx`/`-0.jsx` previously imported
`./hivework-tokens.css` for design tokens. Removed the import; the
`:root` token variables are now embedded directly in the component's
own `<style>` block, matching how `HiveworkApp.jsx` already worked.

## Verification

Brace-balance checked (Node, net-zero) after every edit, across all 5
files. No headless-browser run this session — text-only editing, not
visually iterated; standing limitation, no JSX build tool in this
sandbox.

## Roadmap changes

Section 1's "Wallet Connect" flow row updated to note the fix. New
Section 18 covering the sweep, the gap, the fix, the bug, and the CSS
change.

## Files touched

`HiveworkApp.jsx`, `hivework-app-v4-3.html`, `HiveworkOnboarding.jsx`,
`HiveworkOnboarding-0.jsx`, `hivework-onboarding.html`, `roadmap.md`,
this session brief (`session-16.md`).

## Next session

Unchanged, carried over from sessions 14/15:

- `WithdrawPanel`'s `refund` kind (client refund balance, same
  component/copy variant) isn't demoed in either shell — only `earnings`
  kind shown
- `JobCard.tsx`'s "↩ Xπ refunded" badge, still unbuilt
- Post Job's wizard has no payment-error anchor point for a
  `ContactSupport` instance (pre-existing gap, Section 6)
