# Session 58 — 2026-09-06

## Topic: Shared `PiProvider` context — fixes stale per-component connection state

Live-testing session 57's route guard surfaced a symptom: after
connecting via the new Onboarding flow, the app's routed content
(`/jobs`) correctly rendered as connected, but `Layout.tsx`'s header
still showed "Open in Pi Browser" chrome instead of the connected state.

## Diagnosis

`usePiConnection()` is a plain hook, not a shared/global state — every
call site gets its **own independent copy** of `connected`, with its own
separate mount-time auto-auth check, synced only via the `piConnected`
localStorage flag (not React state itself).

```
grep -rln "usePiConnection()" frontend/src
```
confirmed 8 real consuming files: `Layout.tsx`, `RequireAuth.tsx`,
`Home.tsx`, `JobDetail.tsx`, `PostJob.tsx`, `Dashboard.tsx`,
`Profile.tsx`, `Onboarding.tsx` (plus `.bak` files, not live).

**What happened on the live test:**
1. `Layout.tsx` mounted at cold boot, before connecting. Its own hook
   instance checked `piConnected`, found nothing, set itself to
   `connected: false` — permanently, since that effect runs once and
   `Layout` never remounts on navigation.
2. Connecting via `Onboarding.tsx` only updated *Onboarding's own*
   instance (plus the shared localStorage flag). Layout's copy never
   learned about it.
3. Navigating to `/jobs` mounted `RequireAuth` fresh — its own instance
   saw the now-set flag, auto-authenticated, let the user through.

This bug predates this session — it's not something sessions 55-57
introduced. It was invisible before session 55 because every instance
used to unconditionally self-authenticate on its own mount, so they all
converged to the same answer within moments regardless of being unsynced.
Session 55's gate removed that convergence for any instance mounted
before the flag existed — exactly `Layout`, since it mounts once at cold
boot.

## Fix

Moved connection state into a `PiProvider` context wrapping the app once
in `App.tsx`. Every `usePiConnection()` call site now reads from one
shared instance via `useContext` instead of running its own. Public shape
(`{ connected, user, ready, incompletePayment, connect }`) kept identical
— only `usePi.ts` and `App.tsx` needed changes; none of the 8 consuming
files were touched.

One correction mid-build: the provider needed JSX (`<PiContext.Provider>`)
but `usePi.ts` is a `.ts` file, not `.tsx` — most build tools (Vite
included) fail to parse JSX there. Rewrote that one line with
`React.createElement` instead of renaming the file (renaming would mean
touching every import reference).

## Applied

```
cd ~/Piwork
cp ~/storage/downloads/usePi.ts frontend/src/lib/usePi.ts
cp ~/storage/downloads/App.tsx frontend/src/App.tsx
npx tsc --noEmit -p frontend
# clean, no output
```

## Files touched

`frontend/src/lib/usePi.ts`, `frontend/src/App.tsx` — real app code,
Piwork repo only.

## Pushed

```
git add frontend/src/lib/usePi.ts frontend/src/App.tsx
git commit -m "Move Pi connection state into a shared PiProvider context, fixing stale per-component connection state"
git push
```
**Confirmed clean push by user.**

## Live test

Re-tested the exact symptom this fixes: header (avatar/notification
state) now updates immediately on connect, no reload needed. **Confirmed
working.**

## Roadmap updated

Section 69 added.

## Next session

Continue the Landing live-test: user reported logout still lands on the
reduced-content placeholder Home page rather than the real shell Landing
design, and the 3 CTA buttons ("Get started"/"Find work"/"Post job") from
the shell aren't wired yet — see session 59.
