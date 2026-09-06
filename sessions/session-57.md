# Session 57 — 2026-09-06

## Topic: Route guard + placeholder Landing branch + `lastRoute` clear on logout

Live-testing session 56's Connect Wallet UI surfaced problems bigger than
that patch itself, in this order:

1. Loading `piwork-frontend.vercel.app/jobs` directly in a regular mobile
   browser (not Pi Browser) showed a stripped-down nav (Help/Contact only)
   with no path back to Landing or a wallet-connect trigger for a
   logged-out visitor.
2. Sweeping `PostJob.tsx`/`Dashboard.tsx` (`grep -n -B2 -A15 "if (!connected)
   return" <file>` — had to `set +H` first, bash's history expansion
   intercepts `!` even in quotes) found both had static "not connected"
   dead-end messages with **no button, no `connect()` call**. Before
   session 55's gate, these self-healed within moments via the old
   unconditional auto-authenticate. Session 55's fix (correct, for
   logout) removed that self-healing as a side effect — any first-time or
   logged-out visitor hitting either screen now hit a permanent wall.
3. `App.tsx` confirmed `/` always renders `Home` unconditionally — no
   dedicated Landing route exists, and `Home.tsx` shows full functional
   content regardless of auth state.

## Decision (user call)

Discussed two shapes: a `ConnectPrompt` widget duplicated into each
locked screen, vs. a single route-level guard. User's actual intent was
architecture, not a per-screen fix: nothing account-related should be
reachable while logged out, full stop.

**Scope agreed after back-and-forth:**
- Gate `/post-job`, `/dashboard`, `/onboarding`, `/profile/:username`,
  `/history/*` — redirect to `/` if not connected.
- **Also gate `/jobs` and `/jobs/:id` (Browse)** — explicit instruction,
  reversing the shipped "browsing is open to everyone" decision from the
  KYC copy (roadmap Section 3). Flagged clearly before building: this
  makes that copy line false, and it gets rewritten as part of this
  patch (see session 60 for the actual pill-styling pass; the copy
  itself was updated here).
- `/help` stays open, matching Contact Support (explicit confirmation).

## Sweep: RoutePersistence collision

Before building, checked `frontend/src/lib/RoutePersistence.tsx` since
it's imported at the top of `App.tsx` and hadn't been read yet. Found it
restores the last-visited route on boot in Pi Browser, **before**
anything checks `connected`. Traced through logout: user on `/dashboard`
→ `lastRoute` saved → logout clears `sessionToken`/`piConnected` and
reloads `/` → `RoutePersistence`'s restore effect fires on the fresh
boot, sees `lastRoute = '/dashboard'`, navigates there → new guard bounces
back to `/`. Not a loop, but a visible flicker through the just-left
gated page before landing cleanly on Landing. Fixed by also clearing
`lastRoute` in `handleLogout`.

## Built

- `RequireAuth.tsx` (new) — redirects to `/` when `ready && !connected`.
- `App.tsx` — wraps the gated routes in `RequireAuth`.
- `Home.tsx` — added a `!connected` branch. **Note:** this was
  Claude-improvised placeholder marketing content at this point, not a
  real port of the shell's Landing screen — flagged as a gap and properly
  ported in session 59.
- `Layout.tsx` — one line via `sed`, same pattern as session 55:

```
cd ~/Piwork
sed -i "/localStorage.removeItem('piConnected')/a\\    localStorage.removeItem('lastRoute')" frontend/src/components/Layout.tsx
grep -n -A6 "handleLogout" frontend/src/components/Layout.tsx
```

Existing `if (!connected) return (...)` blocks in `PostJob.tsx`,
`Dashboard.tsx`, `JobDetail.tsx` left untouched — now unreachable dead
code since the guard blocks access first. Harmless, deferred to a later
cleanup pass rather than folded into this already-large patch.

## Applied

```
cp ~/storage/downloads/RequireAuth.tsx frontend/src/components/RequireAuth.tsx
cp ~/storage/downloads/App.tsx frontend/src/App.tsx
cp ~/storage/downloads/Home.tsx frontend/src/pages/Home.tsx
cp ~/storage/downloads/Onboarding.tsx frontend/src/pages/Onboarding.tsx
```

One typo hit on first attempt (`-npx tsc...`, stray leading `-`) — retried
clean:

```
npx tsc --noEmit -p frontend
# clean, no output — across the whole build, not just filtered,
# given the size of this patch (Profile.tsx, Jobs.tsx, History pages
# all touched by the new gating and hadn't been read end-to-end)
```

## Files touched

`frontend/src/App.tsx`, `frontend/src/components/RequireAuth.tsx` (new),
`frontend/src/components/Layout.tsx`, `frontend/src/pages/Home.tsx`,
`frontend/src/pages/Onboarding.tsx` — real app code, Piwork repo only.

## Pushed

```
git add frontend/src/App.tsx frontend/src/components/RequireAuth.tsx frontend/src/components/Layout.tsx frontend/src/pages/Home.tsx frontend/src/pages/Onboarding.tsx
git commit -m "Gate all routes except Landing/Help/Onboarding behind connected wallet; clear lastRoute on logout"
git push
```
**Confirmed clean push by user.**

## Live test (partial pass)

- Fresh/logged-out `/` → showed the new (placeholder) Home page, reduced
  content — correct shape, wrong content (see session 59).
- Tapping Find Work → correctly opened the Connect Wallet step at
  `/onboarding?returnTo=/jobs`.
- Header showed stale "not connected" chrome even after connecting
  successfully via Onboarding — this surfaced session 58's bug.

## Roadmap updated

Section 68 added.

## Next session

1. Diagnose and fix the stale-header symptom (session 58).
2. Port the real Landing screen properly — what's live now is a
   placeholder, not the shell's actual design (session 59).
