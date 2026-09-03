# Session 36 — Profile.tsx + Onboarding.tsx patched into real code; hamburger side-menu added (2026-09-03)

Picked up where session 35 left off: the last two real screens,
`Profile.tsx` and `Onboarding.tsx`. Also built a new hamburger side-menu
in `Layout.tsx` mid-session, at the user's request, after live-verification
surfaced that the profile avatar no longer needed to carry a popup menu.

## Correction to the roadmap going in

Session 35's "Next session" note said "no shared scope between them —
either order works." That was wrong. Full sweep of the real `Profile.tsx`
showed it imports `ProfileForm` directly from `./Onboarding` — the form
isn't a separate file, it's defined inside `Onboarding.tsx` and exported.
Patching either screen's form necessarily touches the other's source file.
Corrected in roadmap Section 30's pre-patch sweep notes area (see roadmap
diff) so this doesn't cause a bad assumption again.

## Real gap found in sweep: two inconsistent shell designs for the same form

The compiled shell (`hivework-app-v4-3.html`) has two different, disagreeing
implementations of the profile form:
- **Canonical**, `hivework-profile-complete.html` (Section 3/10, already
  reconciled) — required skills as a type-to-add chip input, devices/
  languages as a searchable combobox, bio with a 200-char counter.
- **v4-3's inline Profile-edit mode** (`renderProfileScreen()`) — a
  simpler fixed toggle-chip list of preset skills, bio only, no devices
  or languages fields at all.

Since real `ProfileForm` is one component serving both `Profile.tsx` edit
mode and the real `Onboarding.tsx`, decision was to patch the shared form
once to the canonical design rather than build the incomplete v4-3 version
and redo it later. This also meant finishing `Onboarding.tsx`'s own page
chrome in the same pass — leaving it half-styled would have reproduced the
exact "referenced classes, no `<style>` block" bug from Section 43.

## Built

- **`frontend/src/components/Combobox.tsx`** (new) — extracted from
  `PostJob.tsx`'s local `PJCombobox` (Section 42) so the devices/languages
  picker isn't duplicated a second time. Class names kept unchanged
  (`pj-combo`/`chip-row`/`chip-outline`/`pj-combo-list`/`pj-combo-opt`) —
  every host page still declares its own matching CSS, same no-shared-
  stylesheet convention as the rest of the codebase (Section 43).
- **`frontend/src/lib/formOptions.ts`** (new) — `DEVICE_OPTIONS` and
  `LANGUAGE_OPTIONS`, single source of truth now shared by `PostJob.tsx`
  and `ProfileForm`, instead of the ~40-language list living in two places.
- **`frontend/src/pages/PostJob.tsx`** — swapped its local `PJCombobox`
  function and local option arrays for imports from the two files above.
  No visual or behavioral change; pure dedup.
- **`frontend/src/pages/Onboarding.tsx`** — `ProfileForm` rebuilt to the
  canonical design (chip-input skills, shared `Combobox` for devices/
  languages, bio counter). Page wrapper (`Onboarding()`) finished to match
  — icon header, kicker copy, own scoped `.hw-onboarding` style block.
- **`frontend/src/pages/Profile.tsx`** — full restyle: violet-gradient
  cover, big avatar, stat-pills, level/trust chip pills (brought in line
  with Dashboard's already-shipped chip convention, Section 32/33 —
  previously plain colored text), edit toggle wired to the new
  `ProfileForm`, skills/devices/languages tag display, reviews wired to
  real `ratings` fetch data (was already real data, just restyled).
  Loading skeleton and not-found states restyled to tokens too.

One deliberate design call: the shell's `chip-pioneer` variant (transparent
+ soft border) is built for a light card background. On Profile's violet
gradient cover it would be unreadable, so it got a translucent-white
treatment specific to that context — each page can define its own variant,
consistent with the no-shared-stylesheet pattern.

## Bug found post-deploy, fixed same session

Live-verification (screenshot) showed typed text in the skills chip-input
and bio textarea was invisible — present, just uncolored. Root cause:
`Combobox`'s `<input>` had an explicit `color:var(--ink)` in its CSS rule,
but the skills chip-input and bio `<textarea>` rules didn't, so they
inherited an unreadable ambient color instead. Fixed in both `Profile.tsx`
and `Onboarding.tsx`'s scoped style blocks. Pushed straight to `main`
(low-risk, patches already-live code) — see branch-policy note below.

## Branch discipline — policy correction

Section 30 said "work on a feature branch, never `main`." In practice,
every patch session since 34 pushed straight to `main` and that's what
deployed each time — the written rule and actual practice had diverged.
Decided this session, explicitly: **branch only for genuinely new/risky
patterns (new UI pattern, touches every page, payment/auth flow, or
anything worth previewing before it's live); low-risk restyles of
already-reconciled screens go straight to `main`**, matching what's
actually been happening. Roadmap Section 30 updated to say this instead
of the old blanket rule.

No Vercel CLI access on this Termux setup (`npx vercel ls` → invalid
token), so branched work has no preview URL — verification always means
merging to `main` first. Factored into the policy: branching only pays
off when there's something to gain by delaying the merge, which there
isn't without a preview path.

## New: hamburger side-menu in `Layout.tsx`

Came up mid-session — live-verification of the Profile patch showed the
avatar no longer needed to double as a popup-menu trigger (its old
"View profile"/"Edit profile" items are redundant now that Edit lives on
the profile page itself). Also surfaced a stale roadmap claim: Section 8
says the profile-menu is "wired," but that only ever described the
standalone shell demo — the real `Layout.tsx` avatar (patched in Section
39) is and always was a plain `NavLink` to `/profile/:username`, no
dropdown, no menu component anywhere in `frontend/src`. Worth a correction
note wherever Section 8 gets touched next.

Built new, branched (`feature/side-menu`) since this is the first drawer/
overlay nav pattern in the app and touches every page via `Layout.tsx`:
- Hamburger icon (three horizontal lines, not dots — explicit user
  preference) left of the logo, opens a slide-in panel (backdrop +
  animated panel, no new dependency).
- Panel contents: **Help** (existing `/help` route), **Contact Support**
  (reuses the existing `ContactSupport` component — already globally
  available via the footer `.hw-support-strip`, so this duplicates an
  entry point for discoverability rather than filling a new gap),
  **Log out** (connected-only).

**Logout is a partial fill, documented as such, not a full fix.** Real
gap per Section 8: no backend session-invalidation endpoint exists, and
Pi Browser owns the actual Pi-level session — this app only ever stores
its own `sessionToken` locally via `usePiConnection()`. What "Log out"
actually does: clears `localStorage.sessionToken`, closes the menu, and
force-reloads to `/`. It does **not** guarantee Pi Browser itself forgets
the user — `usePiConnection()`'s `Pi.authenticate()` call may silently
re-auth on the next mount if Pi Browser still has an active session. Same
documented compromise the shell's `hwLogout()` already used; not a new
gap, just now real and live instead of a shell placeholder.

## Build

```
npx tsc && npx vite build
```
Clean both times — no errors. Bundle grew 307.92 kB → 317.82 kB (Profile/
Onboarding patch) → 320.56 kB (side-menu), 58 → 60 modules (two new files:
`Combobox.tsx`, `formOptions.ts`).

## Live-verified (Pi Browser, piwork-frontend.vercel.app)

- `/profile/:username` — cover gradient, level + trust chips readable,
  stat pills, Edit toggle
- Edit mode — skills chip-input, devices/languages combobox, bio counter,
  Save/Cancel — **text color bug caught here, fixed same session**
- Non-own profile — no Edit button
- `/onboarding` — page chrome styled correctly, not bare
- Hamburger menu — opens/closes (backdrop + ✕), Help navigates, Contact
  Support expands inline, Logout only shown when connected, header/segnav/
  avatar unaffected

## Screen inventory status (post-Session 36)

Every real screen now patched into `main` — this closes out the full
redesign patching pass started in Section 30. See roadmap.md for the
updated table.

## Next session

No screens left in the original patch queue. Options for next time:
a full visual re-verification pass across all patched screens against the
shell (session 35's pattern already caught a few shell/real-code drifts
even on "shipped" screens — worth doing once more now that everything's
patched), or move on to net-new features/gaps flagged along the way
(real logout, profile-menu settings items, anything else still marked
open in Section 8/17). No due date set — open decision for the user.
