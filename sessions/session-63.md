# Session 63 — 2026-09-07

## Topic: BUG-004 investigation (device notifications), Notify step dropped from shell, catch-all 404 route added

Closed open item 1 carried forward from session 62: whether the shell's
Connect → Profile → Notify onboarding step is in scope or aspirational.
Along the way, surfaced and fixed a real, unrelated production gap
(missing catch-all route) while live-testing the resulting spike.

## Starting-state check

Before writing any code, read the shell's actual `notify` screen markup
(both `hivework-app-v4-3.html` and `HiveworkApp.jsx`) to see exactly what
UX pattern was being asked about:

```
grep -n -i "notify\|step indicator\|Connect.*Profile.*Notify" roadmap.md
```

The screen's copy ("Get notified the moment your work is approved or
paid...") paired with a skippable "Enable notifications" / "Not now"
button pair — a permission-ask pattern, not an in-app notification feed
(which would need no such gate). This meant the open item was really
about **device-level push notifications**, not in-app ones.

## Diagnosis

Checked the official Pi SDK reference (`SDK_reference.md`, pi-platform-docs)
before writing any code — no documented method to request a device
notification permission or trigger push exists in the public SDK
(`Pi.authenticate`, `Pi.createPayment`, `Pi.nativeFeaturesList`,
`Pi.openShareDialog`, `Pi.Ads`, `Pi.openUrlInSystemBrowser` only).
`nativeFeaturesList()`'s `NativeFeature` enum lists `request_permission`,
but nothing documented invokes it.

Decided to spike-test live in Pi Browser rather than rely on docs alone.
Checked routing and Pi SDK init conventions first so the throwaway route
matched real patterns:

```
grep -n -B2 -A30 "Routes\|<Route" frontend/src/App.tsx
grep -rn "Pi.init\|pi-sdk.js" frontend/
```

Confirmed `window.Pi` is initialized once, globally, in `main.tsx` —
independent of `PiProvider`/auth — so the spike route needed no wrapping
providers.

## Applied

**Spike v1** — `frontend/src/pages/DebugNotifyTest.tsx`, standalone route
`debug/notify-test` added to `App.tsx`, testing:
1. `typeof Notification !== 'undefined'`
2. `Pi.nativeFeaturesList()`
3. `Notification.requestPermission()` + firing a real `new Notification()`

Live result in Pi Browser:
- `Notification` is `undefined` in the webview — standard web push is not
  an option here at all.
- `nativeFeaturesList()` returned
  `["inline_media","request_permission","ad_network","safe_area_insets","file_share"]`
  — `request_permission` present but, per the SDK reference check above,
  with no documented invocation method.

**Spike v2** — before giving up, fetched the live `pi-sdk.js` source
directly (not just the docs) and found an undocumented scope baked into
the shipped code:
```
["payments","username","roles","platform","wallet_address","preferred_language","in_app_notifications"]
```
`in_app_notifications` appears nowhere in the official docs or the
community `pi-sdk-docs` site. Added a section 4 to the spike:
`Pi.authenticate(['username', 'in_app_notifications'], () => {})`.

Live result: Pi Browser showed a genuine, distinct consent line —
**"In app notifications: Send you in-app notifications"** — confirming
the feature is real on Pi's side. But the returned
`credentials.scopes` was `["username","platform"]` — `in_app_notifications`
was **not** included even after tapping Allow. Visible in the consent UI,
not honored end-to-end.

## Findings

- Device push notifications are confirmed **not usable today** in Pi
  Browser — neither via the standard web `Notification` API (absent
  entirely) nor via the undocumented `in_app_notifications` scope
  (shown in consent, not honored in the auth result).
- This independently answers `BUG-004`'s own deferred question
  (`NotificationBell.tsx`'s comment: "v1 is polling, not push... revisit
  once Pi SDK support is confirmed") — confirmed still correct, nothing
  has changed.
- In-app notifications (the bell) were separately confirmed already
  fully built and redesign-ported (`NotificationBell.tsx`, polling
  `/api/notifications` every 45s, mounted in `Layout.tsx`) — this was a
  gap in Section 18's original sweep (which only checked for
  `ProfileSetup`/`NotificationOpt`/`EnableNotifications`), now corrected.
  Unrelated to the Notify-step decision — nothing to change there.

## Applied (cleanup)

Spike removed in full once the question was answered:
```
git rm frontend/src/pages/DebugNotifyTest.tsx
# + import/route lines removed from App.tsx
npx tsc --noEmit -p frontend   # clean
```

Shell trim (both canonical files) — Connect→Profile→Notify (3 steps) to
Connect→Profile (2 steps), matching real `Onboarding.tsx`'s existing
behavior:
- `owWizardTrack`/`HWOWizardTrack` labels: dropped `"Notify"`.
- `notify` screen block removed entirely from both `hivework-app-v4-3.html`
  and `HiveworkApp.jsx`.
- Profile screen's Continue/Skip buttons now call `owFinish()` /
  `finishOnboarding` directly instead of routing to `notify`.
- Stale in-code comments referencing the old "profile+notify screens"
  flow updated to say "profile screen".

Applied via a Python script with `content.count(old) == 1` assertion
guards on every replacement (fails loudly instead of silently mismatching);
one assertion caught a stray duplicate on the first pass, fixed before
rerunning.

## Unplanned: `RoutePersistence`/404 bug found and fixed

Live-testing the spike page before its removal left a stale `lastRoute`
value in `RoutePersistence.tsx`'s `localStorage` persistence (its own
header comment explains why it exists: Pi Browser's refresh reloads the
bare entry URL, losing in-app location, so this restores the last route
on boot). After the spike route was deleted, a later cold boot in Pi
Browser restored `/debug/notify-test` — a route that no longer existed.

Diagnosed via:
```
find ~/Piwork/frontend/src -iname "RoutePersistence*"
cat ~/Piwork/frontend/src/lib/RoutePersistence.tsx
grep -n 'path="\*"\|NotFound\|404' ~/Piwork/frontend/src/App.tsx
```

Confirmed there was **no catch-all route at all** — an unmatched path
rendered fully blank, with no way back to Home, surviving even a cache
clear (the stale value lives in `localStorage`, unaffected by clearing
cache). This is a standing gap independent of the spike: any future
route rename/removal will strand anyone whose `localStorage` still
points at it, the same way.

**Fix:** added `frontend/src/pages/NotFound.tsx` (simple message + link
Home) and a `<Route path="*" element={<NotFound />} />` as the last
child inside the outer `path="/"` `Layout` route, positioned after the
`RequireAuth` group closes so it can't shadow any gated route. Verified
route nesting carefully via `sed -n` before compiling, since an earlier
patch attempt left a stray extra `</Route>` that needed a one-line fix
before `tsc` would pass.

`RoutePersistence.tsx` itself was deliberately left unhardened —
validating the saved path against the known route list before restoring
was proposed and declined: the catch-all already prevents the blank-page
stranding outcome (a stale restore now lands on "not found" instead),
judged sufficient without also touching the persistence logic.

## Verification

`npx tsc --noEmit -p frontend` run clean after: spike v1, spike v2,
spike removal, and the `NotFound`/catch-all route addition (four
separate clean runs across the session).

## Files touched

- `frontend/src/pages/DebugNotifyTest.tsx` — created, then removed (spike only).
- `frontend/src/App.tsx` — route/import added then removed for the spike;
  `NotFound` import + catch-all route added (kept).
- `frontend/src/pages/NotFound.tsx` — new, real app code (kept).
- `hivework-redesign/screens/HiveworkApp.jsx`, `screens/hivework-app-v4-3.html`
  — Notify step removed from both canonical shells.
- `hivework-redesign/roadmap.md` — Sections 74–75 added.

Real-app files (`App.tsx`, `NotFound.tsx`) pushed to Piwork repo only.
Shell/roadmap files pushed to both `~/Piwork/hivework-redesign/` and
`~/hivework-redesign/` per the standard two-repo routine.

## Pushed

```
# Spike v1 + v2 (throwaway, later removed):
git commit -m "Throwaway spike: test device notification permission support in Pi Browser (BUG-004)"
git commit -m "Spike (BUG-004): test undocumented in_app_notifications scope found in pi-sdk.js"

# Spike cleanup:
git commit -m "Remove BUG-004 spike (debug/notify-test) — investigation complete, see roadmap"

# Shell trim + roadmap Section 74 (both repos):
git commit -m "Section 74: drop Notify step from onboarding shell, document BUG-004 investigation"

# Catch-all 404 route:
git commit -m "Add catch-all 404 route (NotFound) — unmatched paths no longer render blank with no way out"
```
All pushes confirmed clean by user, including both repos for the shell/roadmap commit.

## Roadmap changes

Section 74 (BUG-004 investigation, Notify step dropped) and Section 75
(catch-all 404 route) added. Open items list now carries only the
`JobDetail.tsx` gated-action sweep (renumbered to item 1).

## Next session

1. Sweep `JobDetail.tsx` for any other gated action (rating, approve)
   that might still assume Browse is public.
