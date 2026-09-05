# Session 50 (2026-09-05)

Picked up open item #4 (documentation-only pair, flagged since session 40):
stale profile-menu dropdown vs. real hamburger pattern, and the
`ui-ux-feedback` vs. `ui-feedback` category-value naming mismatch.

## Investigation — `ui-ux-feedback` vs `ui-feedback`

Swept both `screens/` (canonical) and `~/Piwork/frontend/src/`. Not
drift — an already-understood, intentional constraint. Canonical value/
label is `ui-ux-feedback` / "UI/UX Feedback"; real backend's category enum
is fixed as `ui-feedback`, and `Home.tsx` already carries its own code
comment flagging this explicitly. Nothing to change on either side.

**Decision:** close as documentation-only. Written into the roadmap as a
resolved, understood mismatch rather than an unexplained open bullet.

## Investigation — profile-menu vs. hamburger

Swept `Layout.tsx` directly. Finding: this wasn't a naming difference —
the real app no longer has a small avatar-anchored dropdown at all. It's
been a hamburger button (`hw-menu-btn`) opening a full-height side-drawer
overlay (`hw-side-overlay`/`hw-side-panel`/`hw-side-item`) since Section 47,
containing Help, Contact support, and Log out. The avatar itself is now a
direct link straight to `/profile/:username` — no dropdown trigger on it
at all. The canonical shell still designed the old small `.profile-menu`
dropdown (identity block + View profile/Edit profile/Notification
settings/Contact support/Log out) — a different UI pattern outright, not
just a class-name mismatch. Per the roadmap's own rule (old app matches
the new design system, not the reverse), the shell was the stale side
here.

**Decision:** update the canonical shell to the hamburger + side-drawer
pattern, making it the new source of truth going forward (user's choice,
over the alternative of reverting real code back to a small dropdown).
Notification settings item: dropped entirely to match real structure
exactly (user's call — real code doesn't have it, likely superseded by
the separate Notification Bell).

## Patch, applied

Python patch script, backup + unique-anchor-check convention, targeting
`hivework-app-v4-3.html` (screens/, canonical). 5 anchors: CSS block swap
(`.profile-menu` → `.side-drawer-overlay`/`.side-panel`/`.menu-btn`/
`.header-left` etc.), header markup (added hamburger button in a new
`.header-left` wrapper, avatar `onclick` changed from `toggleMenu()` to
direct `goToProfile(false)`), drawer markup (`.profile-menu` block
replaced with `.side-drawer-overlay`/`.side-panel` containing Help/
Contact support/Log out), JS (`toggleMenu()` replaced with
`toggleSideDrawer()`/`closeSideDrawer()`, `closeMenus()` updated to drop
its now-dead `#menu` reference). All 5 matched exactly once. Diff reviewed
clean — dropped items (identity/badges block, View profile, Edit profile,
Notification settings) removed as intended, nothing else touched.
`menu-overlay`/`#menuOverlay` (shared with the notif panel) correctly left
untouched — unrelated, still needed.

Pushed to both `hivework-redesign` repos (canonical shell content only,
no real-code touched this session): "Shell: replace profile-menu dropdown
with hamburger side-drawer, match real Layout.tsx".

## Live verification

Confirmed good by user: hamburger button opens the side-drawer, avatar
goes straight to profile, Help/Contact support/Log out all functional
inside the drawer. Clean test, clean push.

## Files touched

`screens/hivework-app-v4-3.html` (canonical shell only).

## Carried into next session

1. Landing / Wallet Connect re-verification remains blocked — no way
   found yet to actualize a real logged-out state to test against.
2. **New:** mirror this same profile-menu → hamburger-drawer redesign
   into `HiveworkApp.jsx` (same `.profile-menu` shape, roughly lines
   3319-3323 CSS / 3674 mount, per the earlier sweep) — the HTML shell is
   now ahead of the JSX shell on this pattern.
3. Add `--mist`/`--sand` to `hivework-app-v4-3.html`'s `:root` block so
   the canonical shell matches what's actually live in `index.css`.
   Documentation-only, no visual change.
4. Minor, not fixed: `Jobs.tsx`'s `.cat-empty` rule in `BROWSE_STYLES` is
   dead CSS (unused). Safe to remove whenever this file is touched next.

Item #4 from session 48/49's carried list (profile-menu vs. hamburger,
`ui-ux-feedback` vs `ui-feedback`) is now **closed** — both resolved this
session; the profile-menu item additionally produced a real shell patch,
not just documentation.

No due date set on any of the above — open decision for the user.
