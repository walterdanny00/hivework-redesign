# Session 54 — 2026-09-06

## Topic: Logout / Landing re-verification blocker — reopened

Carried into this session as the one open item from session 53's "Next
session" note: Landing/Wallet Connect re-verification blocked, no way
found to actualize a real logged-out state to test against.

## Context recap

This exact question was investigated once before, in Section 39
(2026-08-16, `Layout.tsx` patch session). That pass swept `usePi.ts`,
checked the Pi SDK's full client method surface (`Pi.init`,
`Pi.authenticate`, `Pi.createPayment`, `Pi.nativeFeaturesList`,
`Pi.openShareDialog`, `Pi.openUrlInSystemBrowser`, `Pi.Ads`), and found
no logout/disconnect/deauthorize method anywhere in it. A local-only
state reset was considered and rejected — reasoning at the time: it
wouldn't survive a page refresh, since `Pi.authenticate()` re-runs on
mount and likely re-succeeds silently, so it would look like logout
without being one. Conclusion: **closed as infeasible, not deferred.**
No "Log out" menu item was built; the shipped disconnected UI was
treated as the permanent "auth hasn't succeeded yet" state, not a stub
waiting on logout.

## What prompted reopening

User had separately looked across the Pi ecosystem for any app that
appears to achieve a real logout, and found CiDi Games (a Pi
Core Team–backed studio) as one that seems to. Web research on CiDi
Games itself turned up only business/partnership coverage, no technical
detail on their implementation. Cross-checking against general Pi SDK
documentation (JS SDK reference, community developer guide, demo app
flow docs) confirmed the same fact as the original Section 39
investigation: `Pi.authenticate()` is the only relevant call, and
nothing in the documented SDK surface revokes or clears Pi-side consent.
This pointed to a different explanation: any app with a working "real
logout" is not deauthenticating from Pi's side at all — it's managing
its own app-level session on top of Pi's SDK auth, and clearing *that*
is what makes logout look real.

## Sweep of the real code (Termux, `~/Piwork`)

`grep -rn "logout\|Logout" frontend/src` surfaced `Layout.tsx`'s
`handleLogout`, already carrying a code comment describing the same
documented compromise as the shell's `hwLogout()` — no server-side
logout endpoint exists, Pi Browser owns the real Pi-level session, this
app only ever stores its own `sessionToken` locally.

Reading `Layout.tsx` in full:
- A mount-time `useEffect` calls `POST /api/auth/verify` whenever
  `connected && user?.accessToken` are present, and on success does
  `localStorage.setItem('sessionToken', data.sessionToken)`.
- `handleLogout` does `localStorage.removeItem('sessionToken')`,
  closes the menu, and does `window.location.href = '/'`. This part
  was already correct.

Reading `usePi.ts` in full — this is where the actual gap was found:
- `usePiConnection()`'s `useEffect` runs on every mount, unconditionally,
  with no gate of any kind: `Pi.init()` then immediately
  `Pi.authenticate(['username','payments','wallet_address'], ...)`.
- Because Pi Browser already has standing consent from a prior session,
  this call silently re-succeeds with no dialog. The moment `handleLogout`
  reloads `/`, `usePi.ts` remounts, re-authenticates, and `Layout.tsx`'s
  verify effect mints a fresh `sessionToken` within moments — undoing
  the logout before a logged-out Landing screen is ever actually visible.

This is the mechanism the original Section 39 rejection was gesturing
at ("Pi.authenticate() re-runs on mount and likely re-succeeds
silently") — but that investigation stopped at "so local reset won't
work," without exploring whether the mount-time call itself could be
made conditional.

Also surfaced along the way, not previously flagged: searching for the
shell's Connect Wallet UI (Not connected / Connecting… / Connected
states, KYC banner, Testnet note, ToS checkbox — three screenshots
supplied by user showing this from the design shell) turned up no match
anywhere in real `frontend/src` (`grep` for "Landing", "Connect Wallet",
and "connecting" all came back empty across `.tsx`/`.jsx`/`.ts`). Real
`Onboarding.tsx` currently only redirects home if not connected once
`ready` — it has no visible connect step of its own. This UI was
designed in the shell but never patched into the real app.

## Decision

**Reopened, not re-closed.** The Pi-SDK-side conclusion from Section 39
still holds (no way to revoke Pi's own consent) — but that was never
actually the blocker. The blocker is that our own app re-triggers its
own auth call unconditionally on every mount, which the original
investigation didn't separate out as its own fixable problem.

**Proposed fix (not yet built):** add a persisted "connect intent" flag
(e.g. `piConnected` in localStorage), set on first successful auth,
checked by `usePi.ts` before auto-running `Pi.init()`/`Pi.authenticate()`
on mount. Expose a callable `connect()` from the hook so Landing/
Onboarding's "Connect with Pi Wallet" tap can trigger auth explicitly
(driving the existing Connecting… UI properly) instead of relying on a
passive mount-time effect. `handleLogout` clears the flag alongside
`sessionToken`. Refresh-while-connected is unaffected, since the flag
persists across reloads — only logout removes it.

## Roadmap updated

Section 65 added, documenting this reopening and pointing back to
Section 39. "Next session" replaced with three concrete steps: build
the flag/`connect()` gate in `usePi.ts`, patch the 3-state Connect
Wallet UI into real `Onboarding.tsx`, then finally live-test Landing/
Wallet Connect against a genuine logged-out state.

## Next session

1. Build the `piConnected` flag + `connect()` export in `usePi.ts`;
   remove the unconditional mount-time auto-authenticate call.
2. Update `handleLogout` to clear the flag alongside `sessionToken`.
3. Patch the Connect Wallet UI (3 states + KYC banner + Testnet note +
   ToS checkbox) from the canonical shell into real `Onboarding.tsx`.
4. Once both land: live-test a real logged-out Landing state for the
   first time — previously impossible, now unblocked pending the build.
