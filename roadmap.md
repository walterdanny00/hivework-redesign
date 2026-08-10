# Hivework Redesign — Design Roadmap

Living reference for the visual redesign. Goal: the old app matches this new
design system — not the reverse. Old code structure informs technical facts
(routes, data shape) but never dictates UX decisions.

Design tokens: cream/ink/violet color system, Sora/Inter/JetBrains Mono type,
"escrow ticker" as the signature element.

**Workflow:** screens are built/iterated as separate files, mirroring the
real app's per-route components (`Dashboard.tsx`, `JobDetail.tsx`, etc.) —
not one hand-maintained mega-file. A compiled shell (`hivework-app-v4-3.html`
/ `HiveworkApp.jsx`) only gets rebuilt as a deliberate step when a full
clickable demo is specifically wanted.

**Docs location:** this roadmap + session briefs live in this repo,
`hivework-redesign`, kept separate from the main Piwork codebase repo so
they're accessible from any chat/account. `roadmap.md` is edited in place to
always reflect current state; `sessions/` holds one dated file per session,
numbered (`session-01.md`, `session-02.md`, ...). Screen files
(`.html`/`.jsx`) live in `screens/`.

**Push workflow — two independent repos, no git-native sync:**
`~/Piwork/hivework-redesign/` and `~/hivework-redesign/` are **not** a
submodule and **not** two clones of the same repo — confirmed via
`ls -la ~/Piwork/hivework-redesign/.git` (no `.git` there at all — it's
plain content tracked inside the `Piwork` repo) and `git remote -v` in each
(`walterdanny00/Piwork.git` vs `walterdanny00/hivework-redesign.git`,
separate histories). Nothing enforces they stay in sync; a push can
succeed on one and silently fail on the other.

Standard push routine:
```
cd ~/Piwork && git pull
cd ~/hivework-redesign && git pull

# always check for drift before copying anything new in
diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git
# silent output = clean. Anything printed = resolve which side is
# current before proceeding — don't layer a new commit on top of it.

cp <files> ~/Piwork/hivework-redesign/<screens|sessions>/  (or repo root for roadmap.md)
cp <files> ~/hivework-redesign/<screens|sessions>/          (or repo root for roadmap.md)

cd ~/Piwork
git add hivework-redesign/
git commit -m "<message>"
git push

cd ~/hivework-redesign
git add .
git commit -m "<message>"
git push
```
Since commit hashes will never match between the two (unrelated
histories), the `diff -rq` check is the only reliable way to verify
they're actually in sync — `git log` can't be used for that.

**Standing rule — sweep before designing:** before redesigning any
particular screen, always do a thorough sweep of the code/files on Termux
first, to see all information and components actually supposed to be on
that screen. Applies to every future screen, not a one-off — this is how
Section 6/7/8's findings surfaced in the first place.

---

## 1. Screen Inventory

| Screen | Route | Status | Notes |
|---|---|---|---|
| Landing | `/` (logged out) | ✅ Done · ✅ Recompiled (JSX) | Nav "Get started" + hero CTAs route into the Wallet Connect flow with intent (`find`/`post`/`none`). Testnet badge added. Canonical: `HiveworkLanding.jsx` + `hivework-landing.html` (ported 1:1, verified via structural diff). In `HiveworkApp.jsx`, this is now the shell's actual entry screen (`screen="landing"` default), rendered full-page without the persistent header/segnav. |
| "Wallet Connect" flow (proposed pattern — see Section 3) | *(not `/onboarding` — see below)* | ✅ Built, reclassified · ✅ Recompiled (JSX) | Originally built as "Onboarding," but `Onboarding.tsx` turned out to be something else entirely (see next row). Kept as a proposed new consent/KYC-disclosure pattern, since no equivalent exists in the real app today — just not a redesign of the real `/onboarding` route. In `HiveworkApp.jsx`, wired as the `welcome` screen — this is what Landing's CTAs actually open (**not** Profile Complete; that mix-up was caught and fixed, see Bug Fix Log #10). |
| Real `onboarding` (profile-completion form) | `onboarding` | ✅ Done · ✅ Recompiled (JSX) | Single reactive form, triggered when a worker tries to apply without skills. Required skills field (chip input), optional devices/languages (searchable combobox, shared with Post Job) + bio (200-char limit), `returnTo` redirect. Canonical: `hivework-profile-complete.html` + `HiveworkProfileComplete.jsx`. See Section 3. In `HiveworkApp.jsx`, reached only via Dashboard's "Finish →" nudge, which was previously bugged to route to `profile` instead — fixed (Bug Fix Log #9 area). |
| Home | `/` | ✅ Done | |
| Browse | `jobs` | ✅ Done | |
| Job Detail | `jobs/:id` | ✅ Done, both views · ✅ Recompiled (JSX) | Owner view: comparison closed 2026-08-07 — user's own re-upload confirmed identical to the already-reconciled canonical pair (tabbed Overview/Applicants/Slots, trust badges, ledger, Close-unfilled-slots, inline rating). Applicants confirmed to live inline on this screen, not a separate route — matches how `JobDetail.tsx` actually works in code; the shell's old standalone Applicants screen was removed. Worker (non-owner) view: ✅ done, see Section 11 — canonical: `hivework-job-detail-worker.html`/`HiveworkJobDetailWorker.jsx`. In `HiveworkApp.jsx`, both views are wired in, branching on a new `isOwner` flag added to the shell's job data. |
| Post Job | `post-job` | ✅ Done · ✅ Recompiled (JSX) | 4-step wizard (Basics/Details/Workers & Deadline/Review). Categories expanded 3→7, SVG icons (not emoji). Device/Language redesigned as searchable multi-select comboboxes. See Section 9. |
| Profile | `profile/:username` | ✅ Done | Reached via avatar menu, not segnav (intentional) |
| Dashboard | `dashboard` | ✅ Done | This **is** the mockup's old "Earnings" screen — same screen, correct name now. Worker/Client tab toggle, balance, withdraw, active applications/jobs. Runs a `profileComplete` nudge on mount — **this nudge is the real trigger to the required profile-completion form** (the real `/onboarding`, Section 3); the Wallet Connect flow's Quick Profile step stays purely optional. Fixed a component-duplication bug: "Your work" and "Withdrawals" used two different list styles for the same kind of content — consolidated to one (`.hist-row`). |
| History → Work | `history/work` | ✅ Done | Drill-in from Dashboard ("See all →"), not a nav-level screen |
| History → Jobs | `history/jobs` | ✅ Done | Same — drill-in from Dashboard |
| History → Withdrawals | `history/withdrawals` | ✅ Done | Same — drill-in from Dashboard |
| Contact Support | *(no route — reusable component, not a screen)* | ✅ Done · ⚠️ Wired into shell with reduced scope | See Section 6. `ContactSupport.tsx` — inline expanding widget (link → form), not a modal. Canonical: `HiveworkContactSupport.jsx` — reusable component, used with contextual `subject` props matching Layout, Job Detail (×2), Post Job. **In the shells (both files, step 6, 2026-08-09), only wired into the Profile menu and worker Job Detail's wallet-error state** (that error state is currently unreachable via the demo's default flow, wired anyway for fidelity) — Post Job has no payment-error anchor point in this simplified wizard, so that spot is logged as a gap rather than faked. **Neither `HiveworkRangeFilter.jsx` nor `HiveworkContactSupport.jsx` was actually uploaded to the session that did this wiring — both were reconstructed from the spec already in memory, not ported from the real canonical files.** Worth diffing the shells' versions against the real canonical files next time either is uploaded. |
| Range Filter | *(no route — shared component on the 3 History pages)* | ✅ Done · ✅ Recompiled (JSX + HTML) | See Section 7. `HiveworkRangeFilter.jsx` — segmented "This week/This month/All", calendar-based not rolling. Wired into all 3 History screens in both shell files as of the step-6 recompile pass (2026-08-09) — this required making `hivework-app-v4-3.html`'s History screens data-driven, since they'd been static markup before. Now also drives pagination reset — see Section 13. Same reconstructed-not-ported caveat as Contact Support above applies here too. |
| Notification Bell | *(no route — component in Layout, header-level)* | ✅ Done · ✅ Recompiled (JSX) | See Section 7. Corrected: `HiveworkNotificationBell.jsx` — own dropdown panel, decoupled from the avatar/profile menu, real unread badge (caps "9+"), mark-all-read on open, tap-to-navigate. In `HiveworkApp.jsx` this fix (bell/avatar decouple) is live; sample notification data, not the real component file verbatim. |

**Shell recompile status (2026-08-09):** both `HiveworkApp.jsx` and
`hivework-app-v4-3.html` now have every screen above fully wired and are at
parity — Landing is the entry point in both, Wallet Connect and Profile
Complete are correctly split into two separate destinations, Job Detail
branches owner/worker, Post Job's wizard replaced the old flat form, the
bell/avatar + standalone-Applicants bugs are fixed, and Range Filter +
Contact Support are wired into both files. See Section 12.

**Nav structure — settled:** Home / Browse / Post / Dashboard (4 items). Every
real route maps cleanly onto one of these four or is a drill-in reached from
within one of them. No 5th slot needed.

**Confirmed via `ls frontend/src/pages/`:** exactly 10 page components exist,
all already accounted for above — no missed top-level pages. "Notification
settings" (a profile-menu item in the mockups) has zero matches anywhere in
the codebase — it's a static label with no real feature behind it, not
something to design for.

**Current baseline files:** `hivework-app-v4-3.html` (fully recompiled,
at parity with the JSX shell, see Section 12), `HiveworkApp.jsx` (fully
recompiled),
`HiveworkLanding.jsx` / `hivework-landing.html` (canonical, done),
`hivework-onboarding.html` / `HiveworkOnboarding.jsx` (canonical, done —
proposed Wallet Connect pattern, reached from Landing),
`hivework-job-detail.html` / `HiveworkJobDetail.jsx` (canonical, done —
comparison closed 2026-08-07), `hivework-post-job.html` /
`HiveworkPostJob.jsx` (canonical, done), `hivework-profile-complete.html` /
`HiveworkProfileComplete.jsx` (canonical, done — real `/onboarding` route,
reached only from Dashboard's nudge), `HiveworkContactSupport.jsx`
(canonical, done — reusable component, not yet wired into shell),
`HiveworkNotificationBell.jsx` (canonical, done — reusable component;
shell approximates its behavior with inline sample data rather than this
file verbatim), `HiveworkRangeFilter.jsx` (canonical, done — reusable
component, not yet wired into shell), `hivework-job-detail-worker.html` /
`HiveworkJobDetailWorker.jsx` (canonical, done — Job Detail worker/non-owner
view).

---

## 2. Bug Fix Log

Applied to both the HTML and JSX mockups (several fixed twice — once on the
original 8-screen set, again on a later upload which had regressed them):

1. **Profile dead end** — no back control, and `profile` wasn't in the
   nav-visibility list. Fixed with a back button using the same
   `goBack()`/`lastScreen` pattern Job Detail already used.
2. **Profile badge colors lost** — Verified/Gold badges both rendered as
   plain translucent-white chips because `.cover .chip` overrode the
   `.chip-verified`/`.chip-gold` color classes. Override removed.
3. **Post wizard step mismatch** — step 2 "Details" was marked active while
   the visible fields were step-1-level Basics content. Step 1 now marked
   active to match.
4. **Testnet badge added** — small pill next to the logo, tappable, shows a
   one-line Test-Pi explainer. Required scoping the logo's accent-color rule
   from a generic `.logo span{color:violet}` down to a dedicated `.accent`
   class, so the color couldn't leak onto the new badge (or anything else
   added near the logo later).
5. **Landing double-background bug** — the standalone `hivework-landing.html`
   port (and `HiveworkLanding.jsx`, since its injected `<style>` tag applies
   globally to the real document, not just the component) had
   `background:var(--cream)` set only on the `.hivework-landing` wrapper div,
   never on `body` itself — leaving two visible background layers (white
   body behind cream content). Found by comparing against the original
   `hivework-concept.html`, which sets the background directly on `body`
   with no wrapper. Fixed in both files. **Worth checking on every future
   screen file, HTML or JSX.**
6. **Dashboard list-component duplication** — "Your work" used `.hist-row`
   but "Withdrawals" right below it used a different `.ledger` timeline
   component for the same kind of content. Consolidated to `.hist-row`,
   reserving `.ledger` for the dedicated Withdrawal History screen.

Also: logo text capitalized to "Hivework" (was lowercase "hivework" in the
app header only; landing already had it right).

7. **Post Job combobox function-name bug** — dynamically-generated onclick
   handlers used the raw field ID (e.g. `f-device-search`) as part of a JS
   function name; hyphens aren't valid in identifiers, so
   `f-device-search_select(...)` parsed as subtraction, throwing
   `ReferenceError: f is not defined`. Fixed by sanitizing the ID into a
   safe function-name key before use. Worth checking on any future
   component that builds function/handler names from a DOM element ID.
8. **Missing design-token block (`HiveworkProfileComplete.jsx`)** — the
   file didn't define its own `:root` token block, so `var(--violet)` etc.
   resolved to nothing in standalone preview: the head-icon's gradient
   background and its white-stroked SVG both went invisible. Fixed by
   adding the `:root` block into the file's `STYLES` string. Checked
   `HiveworkJobDetail.jsx` and `HiveworkPostJob.jsx` directly — both
   already self-contain their own token block, confirming the real
   convention is that **every screen file defines its own tokens**, none
   rely on the external `hivework-tokens.css` at render time. Worth
   checking on every future screen file, same as the Landing
   double-background bug above.
9. **Shell (`HiveworkApp.jsx`) had zero `:root` token block** — same class
   of bug as #8, but in the compiled shell itself: it relied entirely on a
   `./hivework-tokens.css` import that doesn't exist anywhere in the user's
   preview environment, so the shell preview showed no styling at all.
   Fixed by inlining the same token values directly into the shell's own
   `<style>` block and dropping the external import — the shell is now
   fully self-contained, matching the established per-file convention.
   `HiveworkLanding.jsx` had the identical bug (relied on the same missing
   import) and got the same fix, plus a `--radius` token its own CSS needed
   but had never defined anywhere.
10. **Landing's CTAs wrongly routed to Profile Complete instead of Wallet
    Connect** — during shell recompile, Landing's "Get started"/hero CTAs
    were wired to `HiveworkProfileCompleteScreen` (the real `/onboarding`
    profile-completion form). That's wrong: per Section 3, the proposed
    Wallet Connect flow (`HiveworkOnboarding.jsx`) is what Landing's CTAs
    are supposed to open — Profile Complete is reached only from
    Dashboard's "Finish →" nudge. User caught this on review. Fixed by
    giving the Wallet Connect flow its own `welcome` screen key in the
    shell, distinct from `onboarding` (which now serves only the Dashboard
    nudge path). Worth double-checking on any future recompile step that
    touches more than one screen with similar naming/purpose.
11. **`hivework-app-v4-3.html` only — Landing buttons stretched full-width/
    stacked** instead of sitting side-by-side. The HTML shell merges all
    screens' CSS into one global stylesheet (unlike the JSX shell, which
    mounts styles per-screen), so a generic button rule was leaking onto
    the Landing CTAs. Fixed with an explicit `width:auto` on
    `.hivework-landing .btn`.
12. **`hivework-app-v4-3.html` only — "Find work"/"Post a job" opened a
    blank page.** The injected Wallet Connect wizard markup reused
    `class="frame"` for its own wrapper div, colliding with
    `showScreen()`'s `document.querySelector('.frame')`, which is meant to
    hide/show the *main app shell's* frame. Since `#page-welcome` sits
    earlier in the DOM than the real app frame, once the wizard's markup
    was injected, `querySelector('.frame')` grabbed the wizard's own div
    first and hid it — right as it was supposed to appear. Fixed by
    renaming the wizard's wrapper class to `hw-onboard-frame`. **Any time a
    screen's injected markup reuses a class name the shell's own routing
    logic queries by, expect this same failure mode** — worth checking on
    future screens ported into the HTML shell specifically (the JSX shell
    doesn't have this risk, since React scopes renders to each component
    rather than a global `querySelector`).

---

## 3. Onboarding — reconciled with real code (important)

**Finding:** `Onboarding.tsx` is not a wallet-connect flow. It's a single,
reactive profile-completion form, triggered when a worker tries to apply to
a job without skills filled in (confirmed by a code comment, verbatim: "triggered
when a worker tries to apply without skills"). It has no wallet UI, no KYC
notice, no Terms checkbox. It redirects to Home immediately if not
connected, and enters via a `returnTo` query param (default `/jobs`), not
`?intent=`.

**Where wallet connection actually happens:** `usePi.ts` confirmed
`Pi.authenticate()` fires automatically in a `useEffect` the moment
`usePiConnection()` is used — i.e. on every page load via `Layout.tsx`.
There is no dedicated screen or explicit user-triggered "Connect" action
anywhere in the real app today. The hook also can't distinguish "Pi Browser
not installed" from "not connected yet" — both collapse to the same
`connected: false` state, so a Pi-Browser-fallback needs its own separate
`!!window.Pi` check. Real auth scope is 3 permissions (`username`,
`payments`, `wallet_address`), not 2.

**Decision:** keep the built 4-screen flow (`hivework-onboarding.html` /
`HiveworkOnboarding.jsx`) as a **proposed new pattern**, not a redesign of
`/onboarding`. It's not wasted work — no explicit consent/KYC-disclosure
step exists anywhere today, and arguably should. It's just not what the
`/onboarding` route actually does.

### The proposed "Wallet Connect" flow (as built)

**Screen 1 — Connect Pi Wallet**
- Live wallet-card visual (gradient card, status flips Not connected → Connected,
  shows `@handle` once connected) instead of static text
- KYC requirement shown as a collapsible pill ("KYC required for paid activity —
  tap to learn more"), not a forced-read paragraph
- Quiet one-line Testnet note underneath, lighter weight than the KYC pill
- Terms/Privacy checkbox — Connect button correctly `disabled` until checked
- Pi Browser fallback: button swaps to "Open in Pi Browser" + explainer when not
  detected
- Built-in preview controls (Pi Browser detected/not, intent none/find/post) for
  testing states without a real router — explicitly marked non-shipping

**Screen 2 — Quick Profile** *(skippable)*
- Identity row (avatar + handle, tagged "From Pi Wallet")
- Bio (optional), Skills chips (optional), Devices chips (optional)

**Screen 3 — Notifications**
- Three concrete notification examples, "Enable notifications" / "Not now"

**Screen 4 — Routing confirmation**
- Brief spinner + intent-aware message before landing in the app

**Colors used are pulled from existing precedent, not invented:** `#FFF3DC`/
`#B8860B` (KYC pill) and `#EFEAFB` (profile tag) match the exact hardcoded tints
already used by `chip-gold`, `status-pill`, and `cat-opt.selected` elsewhere in
the app.

### The real `/onboarding` — reconciled with real code, done

- Single form, not a wizard — matches the real form's structure (only 4
  fields; a wizard would be overkill, unlike Post Job's genuinely large
  multi-section flow)
- **Skills required** (marked `*`) — skip button explicitly warns "you won't
  be able to apply yet". Redesigned as a real chip-input (type + Enter/comma
  to commit, Backspace-on-empty pops last chip, × removes any), since
  skills are open-ended/user-generated — real code has this as a plain
  comma-separated text input
- Devices, Languages — real code has both as plain comma-separated text
  inputs. Redesign upgrades both to the same searchable multi-select
  combobox already built for Post Job (same suggestion lists: Android/iOS/
  Web-Browser/Desktop/Any device; ~40 languages; same custom "Add '...'"
  behavior) — deliberate cross-screen component reuse, not just visual
  similarity
- Bio — optional, hard 200-char limit, live counter (matches real behavior
  as-is)
- Shares its form component (`ProfileForm`) with `Profile.tsx`'s edit mode
  in the real code; the redesign doesn't yet extend that sharing (Profile
  screen's edit mode hasn't been redesigned to match)
- Enters via `?returnTo=` (defaults to `/jobs`), exits back to wherever the
  user was trying to go
- **Files:** `hivework-profile-complete.html` / `HiveworkProfileComplete.jsx`
  — both canonical and done. JSX ported matching `HiveworkJobDetail.jsx`'s
  and `HiveworkPostJob.jsx`'s conventions. Not yet recompiled into the
  shell. See `sessions/session-04.md`.

---

## 4. Open Decisions (deliberately deferred)

- **KYC/testnet UI**, once KYC is actually wired up: confirm whether testnet
  status is still current at ship time — the badge should get removed (or
  its copy updated) rather than shipped stale.

---

## 14. Pi Wallet Connect — async states, done (2026-08-10)

Screen 1 of onboarding (the proposed Wallet-Connect flow) previously showed
an instant connect for mockup purposes. Real `Pi.authenticate()` (`lib/
usePi.ts`) is async and can fail — added a simulated delay plus two failure
paths so the demo now reflects that:

- `walletStatus`: `idle` → `connecting` (spinner, disabled button, "Waiting
  on Pi Wallet…") → `connected` (unchanged happy path, auto-advances to
  Profile) OR `no-pi-browser` / `failed` (in-card error block + Retry
  button, connect button relabels "Retry connection").
- **Demo-only trigger links** ("Demo: no Pi Browser" / "Demo: connection
  failed") shown under the connect button while idle+ToS-checked, so a
  reviewer can see all states without needing a real device. Not real
  detection logic — matches the existing real-app gap (can't distinguish
  "Pi Browser missing" from "not connected" without its own `!!window.Pi`
  check, logged under Screen Inventory).
- Both files updated in parallel, same state/logic shape. **JSX shell
  already had a step ahead of the HTML shell:** a hardcoded
  `piBrowserDetected = true` stub + "Open in Pi Browser" fallback button
  label + `pibrowser-note` copy, none of which existed in the HTML shell —
  kept as-is, async/retry layered on top of it.
- Verified end-to-end in headless browser (Playwright) for the HTML shell:
  connecting spinner mid-flight, button disables + relabels, no-Pi-Browser
  error renders, Retry re-enters connecting then succeeds and auto-advances
  to Profile — no console errors. JSX only checked via brace/paren/bracket
  balance (no JSX build/lint available in this sandbox, consistent with
  prior sessions).
- **Playwright gotcha found:** `text=` locators match substrings inside
  surrounding prose too (e.g. "Try again" matched both the retry button
  AND the error paragraph's own sentence containing "try again") — use a
  class selector when a click target's label text also appears in nearby
  copy.

---

## 5. Not Yet Started

- Job Detail: owner view pending comparison between Claude's build and the
  user's own version. Worker (non-owner) view — ✅ done, see Section 11
- Contact Support widget (Section 6) — ✅ done, see below
- Range Filter + Notification Bell correction (Section 7) — ✅ both done, see below
- Wiring the profile-menu's items (log out, notification settings, contact
  support) to real functionality — menu itself is being kept, not removed
  (Section 8)
- "Load more" / pagination affordance on all three History screens — ✅ done,
  see Section 13
- Pi wallet connect async/loading/error states — ✅ done, see Section 14

---

## 6. Contact Support — newly found gap

Not a screen — a small reusable inline widget (`ContactSupport.tsx`), never
touched in the redesign until now. Confirmed by reading the component
directly:

- **Collapsed state:** plain underlined text link, default label "Contact
  support"
- **Expanded state (in place, no navigation):** optional "Re: {subject}"
  context line, a textarea (placeholder "Describe the issue and we'll follow
  up.", 4000 char max), Send/Cancel buttons, inline success or error message
  after submit
- **Why it exists:** replaced an old `mailto:` link (BUG-106/BUG-110) —
  leaving the Pi ecosystem and exposing the user's email are both
  discouraged by Pi's Mainnet Listing Requirements. The redesign should read
  as "handled right here," not a handoff elsewhere.
- **Used with contextual `subject` props in:** `Layout.tsx` (persistent
  "Need help?" link), `JobDetail.tsx` ×2 (payment issue / wallet
  verification issue), `PostJob.tsx` (posting payment issue)

**Real bug found in the live app, separate from the redesign:**
`WithdrawPanel.tsx` and `HistoryWithdrawals.tsx` only have the plain static
words "contact support" in their error text — not the actual component.
Tapping does nothing in those two spots right now. This needs a code fix,
not a design decision.

**Design task:** one inline expand-in-place component, using the existing
token system (likely close to `.field` textarea styling + a `.chip`-style
text link for the collapsed state), that slots into Job Detail and Post
Job's error states.

**Status: ✅ Done.** Built `HiveworkContactSupport.jsx` as a reusable
component (`subject`/`label` props), not a per-screen copy. Collapsed:
underlined violet text link. Expanded: soft-shadow card (not a modal),
optional "Re: {subject}" chip-style context pill, textarea (4000-char
limit, live counter, warns in the last 200 chars), Send/Cancel. After
submit: a mint checkmark success card, or a danger-toned error card with
a "Try again" button that returns to the form — reusing existing
`--mint`/`--danger` tokens, no new colors introduced. Verified against a
wired-in preview showing all 4 real usage contexts (Layout "Need help?",
Job Detail ×2, Post Job) with mock error banners for realistic placement.
No real backend endpoint was found in the sweep, so Send is simulated
(comment flags `POST /api/support` as the real call site, unchanged from
the live app's pattern). Not yet recompiled into Job Detail/Post Job's
actual mockup files — still a standalone component pending that wiring.

---

## 7. Range Filter + Notification Bell — found via a full `components/` sweep

Found by cross-referencing every file in `frontend/src/components/` against
how many other files actually import it (`ContactSupport` was the first hit
from this kind of check; this was a deliberate full sweep to catch anything
else in the same situation). Confirmed no orphaned/unused components exist,
and every `pages/` file is reachable from a real route — but two real,
in-use components had never been represented:

### Range Filter
Shared by all three History pages (`used in 3 files`). A segmented "This
week / This month / All" control. **Calendar-based, not a rolling window,
deliberately** — "This week" = since this week's Monday 00:00 local, "This
month" = since the 1st of the current calendar month. The code comment
explains why: a rolling 7/30-day window bleeds into the previous calendar
period near boundary days, which reads as wrong to a user expecting "this
week" to mean the calendar week. Design task: add this filter to History →
Work/Jobs/Withdrawals, styled as a segmented pill selector (visually close
to the existing `segnav` pattern — violet-filled active segment).

**Status: ✅ Done.** Built `HiveworkRangeFilter.jsx` as a reusable
component (`value`/`onChange` props), exporting a `getRangeBoundary(key)`
helper alongside it so the calendar-math (Monday-of-this-week,
1st-of-this-month) lives in one place rather than being reimplemented per
screen. Styled as the suggested segmented pill, violet-filled active
segment. Verified against a wired-in preview (`RangeFilterPreview.jsx`,
non-shipping) that actually filters a mock Withdrawal History list against
sample entries spread across today/this-week/this-month/older — confirmed
the calendar boundary (not rolling window) behaves as intended. Not yet
recompiled into the three actual History mockup files.

### Notification Bell — correction, not just an addition
**Our mockups have been representing this wrong.** The bell icon's `onClick`
in the current shell files triggers the same `setMenuOpen` toggle as the
avatar button — meaning every screen built so far treats notifications as
decorative, opening the profile menu instead. The real `NotificationBell.tsx`
is a fully separate component:
- Its own dropdown panel (full-width, drops from under the header) — not
  the avatar/profile menu
- A real unread-count badge (caps at "9+"), not the static dot currently
  shown
- Polls every 45s for new notifications (v1 — polling not push, noted in
  the code as intentional for now, to revisit once Pi SDK push support is
  confirmed)
- Real content: a list of notifications (title, body, timestamp) or an
  explicit "No notifications yet." empty state
- Opening the panel marks everything read (optimistic, then confirmed with
  the backend); tapping a notification with a related job navigates there

**Fix needed in the shell files themselves:** decouple the bell from
`setMenuOpen`, give it its own open/closed state and dropdown panel, and
design that panel's content (list item style, empty state, unread badge)
using the existing token system.

**Status: ✅ Done.** Built `HiveworkNotificationBell.jsx` as a reusable
component (`notifications`/`onNavigate` props), fully decoupled from the
avatar/profile menu — its own click-outside-aware open state. Real unread
badge (coral, caps at "9+"), not a static dot; disappears immediately on
open via optimistic mark-all-read. Unread items get a subtle violet-tinted
row background + violet dot; read items lose both. Empty state reuses the
bell glyph itself (dimmed, circled) rather than a generic icon, so it
still reads as "notifications," matching the real "No notifications yet."
copy. 45s polling stubbed in as a comment (`GET /api/notifications/poll`,
no-op) since no real endpoint was exercised in the sweep — same simulated
pattern as Contact Support's Send. Verified against a wired-in preview
(`NotificationBellPreview.jsx`, non-shipping) showing it in a mock header
in both populated and empty states. Not yet recompiled into the actual
shell/Layout mockup files.

---

## 8. Profile-menu — doesn't exist, needs removing from every screen

The biggest finding of the component sweep. Confirmed by reading both
`Layout.tsx` and `Profile.tsx` directly: **there is no dropdown menu behind
the avatar in the real app**, and there never was.

- `Layout.tsx`: the avatar is a plain `NavLink` straight to
  `/profile/:username` — not a toggle, not a menu trigger
- `Profile.tsx`: the page itself has no menu either — just avatar,
  level/trust badge, bio, an "Edit profile" button (own profile only),
  stats, tags, and reviews

So every item that's ever appeared in our mockups' "profile-menu" was
fabricated:

- **"Notification settings"** — zero matches anywhere in the codebase, not
  a real feature (confirmed earlier)
- **"Contact support"** — a real feature, but lives as its own inline
  widget (Section 6), never inside a menu
- **"Log out"** — doesn't exist anywhere in the live app. This is a real
  product gap, separate from the redesign: `Layout.tsx` stores a session
  token in `localStorage` on connect, and nothing anywhere clears it.
  Worth flagging back as an actual missing feature, not a design decision.

**Decision (reversed from initial "remove" verdict above): keep the
profile-menu.** Even though it doesn't match the real app today, it's being
kept in the redesign as a deliberate product improvement — the old app
never had a sign-out feature at all, and the menu pattern fills that real
gap. None of its three items are wired to actually function yet:

- **Log out** — real product gap (see above); needs an actual session-clear
  implementation later, not just a design decision
- **Notification settings** — no real feature behind it yet; kept as a
  placeholder in case one gets built
- **Contact support** — real feature (Section 6), currently duplicated
  between the menu and its proper inline-widget use elsewhere; reconcile
  when wiring happens

**Action needed:** none for now at the design level — the menu stays as-is
across all screens. Wiring each item to real functionality is deferred to a
later implementation pass.

---

## 9. Post Job — reconciled with real code, done

**Finding:** `PostJob.tsx` is not a wizard — one continuous form (title,
category, budget w/ live 7% fee breakdown, description 1000-char,
requirements 500-char, optional device/language free-text, worker_slots,
conditional deadline fields when multi-worker) → `review` state (recap
cards + payment breakdown) → `paying` → `done`/`error`, driven by
`window.Pi.createPayment` callbacks. No separate `Job` type file exists.

**Real product gap found, separate from the redesign:** single-worker jobs
have no deadline field anywhere in the real code —
`deadline_mode`/`deadline_at`/`slot_duration_days` only exist inside the
`isMultiWorker` conditional. Single-worker jobs stay open indefinitely with
no due date. Same bucket as the missing log-out feature (Section 8) — a
real gap to flag back, not something this redesign pass fixes.

**Decision:** keep the step-wizard as a deliberate UX improvement over the
real flat form. Field grouping: **Basics** (title, category, budget) →
**Details** (description, requirements, device/language) → **Workers &
Deadline** (worker count, conditional deadline fields) → **Review & Pay**
(unchanged from the real `review` state). An accordion-style alternative
was built and compared, then rejected in favor of the wizard.

**Categories expanded 3→7:** real set was only `bug-testing`,
`translation`, `ui-feedback`. Now: Bug Testing, Translation, UI/UX
Feedback (renamed for clarity against the new Usability category),
Usability Testing, Content Review, Survey / Data Collection, Localization
Testing. Emoji icons were tried and rejected (inconsistent across
platforms, mismatched visual weight against the app's SVG icon system) —
replaced with matching stroke-based SVG icons.

**Device & Language redesigned:** real code has both as plain free text.
Redesign uses a shared searchable multi-select combobox — pick from a
suggestion list (Android/iOS/Web-Browser/Desktop/Any device; ~40 common
languages) or type a custom value and an "Add '...'" option appears, so
specific entries (e.g. "Samsung Galaxy S23," "Android 13+") work the same
as picking a suggestion. Multiple chips allowed on both.

**Files:** `hivework-post-job.html` / `HiveworkPostJob.jsx` — both
canonical and done. JSX ported matching `HiveworkJobDetail.jsx`'s
conventions. Recompiled into `HiveworkApp.jsx` 2026-08-08 — its `#post`
section now runs the full 4-step wizard, replacing the old flat form.
Not yet recompiled into `hivework-app-v4-3.html`. See `sessions/session-03.md`.

---

## 10. Profile Complete (real `/onboarding`) — reconciled with real code, done

**Finding:** `Onboarding.tsx` (see Section 3) is a single reactive
profile-completion form, not a wizard. `ProfileForm` is exported inline
from the same file and reused by `Profile.tsx`'s edit mode. Real fields:
Skills (required, plain comma-separated text with live badge-chip preview),
Devices (optional, same pattern), Languages (optional, same pattern), Bio
(optional, 200-char hard limit with live counter). Save disabled until
Skills has ≥1 entry.

**Decision:** single screen, not a wizard — only 4 fields, matches the
real form's structure. Skills upgraded to a real chip-input; Devices and
Languages upgraded to the same searchable combobox already built for Post
Job (Section 9) — deliberate component reuse across screens, not
duplicated logic. Bio kept as a plain textarea + counter, already matching
the real pattern.

**Bug found and fixed (standalone preview only):** the ported JSX didn't
define its own `:root` design-token block, so the head-icon's gradient and
white SVG stroke both resolved to nothing outside the real shell. Fixed by
adding the token block directly into the file — see Bug Fix Log #8. This
also confirmed the real convention: every screen file self-contains its
own tokens; none depend on the external `hivework-tokens.css`.

**Files:** `hivework-profile-complete.html` / `HiveworkProfileComplete.jsx`
— both canonical and done. Recompiled into `HiveworkApp.jsx` 2026-08-08,
reached only via Dashboard's nudge (which was itself bugged to route to
`profile` instead — see Bug Fix Log). Not yet recompiled into
`hivework-app-v4-3.html`. See `sessions/session-04.md`.

---

## 11. Job Detail — Worker (non-owner) view — reconciled with real code, done

**Finding:** the worker branch of `JobDetail.tsx` is a single dynamic
slot — exactly one of 11 states renders at a time, gated in this priority
order: wallet unverified → wallet-verify error → profile incomplete →
ready to apply → apply form open → application pending → approved/submit
work → work submitted → slot paid (rate) → slot paid (rated). Full state
map and the exact code condition each maps to: see `sessions/session-08.md`.

**Design decision:** built two competing structures (isolated state cards
vs. a 5-stage ledger/timeline with only the current stage expanded) and
picked the ledger. It ties into the app's existing signature idiom
(escrow ticker, mono-type amounts, dark statement-style header) rather
than reading as generic, and its stage-progression naturally matches the
real code's gating order.

**Real gap found, separate from the redesign:** the live code has no
render branch for a rejected application (`myApp?.status === 'rejected'`)
— a rejected worker currently sees the same "Apply for this Job" button as
someone who never applied. Same bucket as the missing log-out feature
(Section 8) and the missing single-worker deadline field (Section 9). The
"Not selected" state in the design is a proposed addition, not a
reconciled existing feature.

**Attachments — proposed, not real:** the real `submit-work` call only
ever sends a plain-text `submission` field, no file upload exists anywhere
in the code. Kept in the design as a deliberate UX addition (same
precedent as the Wallet Connect flow, Section 3), not shipped as if it
already exists.

**Files:** `hivework-job-detail-worker.html` / `HiveworkJobDetailWorker.jsx`
— both canonical, done. Shows the "approved — submit work" state as the
representative example; the other 10 states follow the identical
entry/panel pattern (JSX version exposes a `state` prop covering all 11,
matching the state keys in `sessions/session-08.md`). Recompiled into
`HiveworkApp.jsx` 2026-08-08, defaulting to the `ready` state on the
shell's one non-owner job; the component self-drives further transitions.
Not yet recompiled into `hivework-app-v4-3.html`.

---

## 12. Shell Recompile — both shells done, at parity (2026-08-09)

**Approach:** screen-by-screen into the shell rather than one full-file
pass — too much interdependent state (`screen`, `menuOpen`, `detailKey`,
`workView`) for a safe single-shot swap, and some fixes are structural
(bell/avatar decouple, removing the standalone Applicants screen) and
needed to land before later screen swaps could build on top cleanly.

**Order followed:**
1. Bell/avatar decouple + remove standalone Applicants screen (applied to
   **both** `HiveworkApp.jsx` and `hivework-app-v4-3.html`)
2. Profile-menu item decision — kept "Edit profile," cut "Wallet settings"
   (never part of any earlier decision)
3. `isOwner` data-model stub + Job Detail owner/worker swap-in
4. Post Job wizard swap-in
5. Landing + Wallet Connect + real Onboarding wired in as reachable screens
6. Range Filter + Contact Support wiring into History/error states

All 6 steps are done in both `HiveworkApp.jsx` and `hivework-app-v4-3.html`
as of 2026-08-09 — the vanilla-JS shell's dedicated pass through steps 3–6
(different state model than React, ported separately rather than reusing
the JSX work directly) is complete, and the two files are at parity.

**Bell/avatar + Applicants fix, both files:** avatar keeps the profile
menu (now 5 items); bell gets its own separate notification panel — real
unread-count badge, optimistic mark-all-read-on-open, click-outside-to-
close overlay for both panels. Standalone Applicants screen removed
entirely; "Review applicants →" buttons on Dashboard now open Job Detail
directly, matching the real-code decision that applicant review lives
inline there.

**Job Detail swap, `HiveworkApp.jsx` only:** added `isOwner` to the shell's
flat job data (`mine`/`translate` → true, both appear in Dashboard's "Jobs
you've posted"; `bug` → false). Ported the full canonical owner component
in wholesale; ported the full canonical worker component in wholesale once
its JSX source was uploaded. Job Detail now branches on `job.isOwner`.

**Post Job swap, `HiveworkApp.jsx` only:** ported the full 4-step wizard
in wholesale, removing the shell's orphaned old `category` state and dead
CSS that only served the flat form.

**Landing / Wallet Connect / Onboarding swap, `HiveworkApp.jsx` only:** app
now starts at `screen="landing"` (matches the real `/` route), rendered
full-page without the shell's persistent header/segnav. Landing's CTAs set
an `onboardingIntent` state (`'find'`/`'post'`/`'none'`) and route to the
`welcome` screen (Wallet Connect flow) — corrected from an earlier mistaken
wiring to Profile Complete, see Bug Fix Log #10. Dashboard's nudge routes
directly to the separate `onboarding` screen (Profile Complete), fixing a
pre-existing bug where it pointed at `profile` instead.

**Range Filter / Contact Support swap, both files (step 6, completed
2026-08-09):** Range Filter wired into all 3 History screens in both
shells — required making `hivework-app-v4-3.html`'s History screens
data-driven (previously static markup). Contact Support wired into the
Profile menu and worker Job Detail's wallet-error state (currently
unreachable via the demo's default flow, wired anyway for fidelity) —
**not** into Post Job, since this simplified wizard has no payment-error
anchor point to hang it on; that's logged as a gap rather than faked.

**Honesty note carried over from that session:** neither
`HiveworkRangeFilter.jsx` nor `HiveworkContactSupport.jsx` was actually
uploaded when this wiring was done — both were reconstructed from the
spec already in memory, not ported from the real canonical files. Worth
diffing the shells' versions against the real canonical files the next
time either gets uploaded.

**Two bugs surfaced and fixed in `hivework-app-v4-3.html` only** during
this final pass — see Bug Fix Log #11 (Landing buttons stretching
full-width due to the HTML shell's merged global stylesheet) and #12 (a
`class="frame"` naming collision between the injected Wallet Connect
wizard markup and the shell's own `querySelector('.frame')` routing logic,
which caused "Find work"/"Post a job" to open a blank page). Neither bug
existed in `HiveworkApp.jsx`, since React's per-component rendering isn't
vulnerable to the same DOM-wide `querySelector` collision.

---

## 13. History Pagination — done (2026-08-09)

**Finding:** `usePaginatedList.ts` confirmed a shared cursor-pagination
hook backs all 3 History lists (Work/Jobs/Withdrawals) in the real app;
the mockups had only ever shown static example rows.

**Built:** a `HistoryList` component (JSX) / `renderHistList()` function
(HTML) shared across all 3 screens — filters by the active Range Filter,
then slices to a `shown` count (`HIST_PAGE_SIZE = 2`), with a "Load more"
button that reveals 2 more rows per tap and disappears once the filtered
list is exhausted (plus an empty state for when a range filter zeroes out
the list). `shown` resets to `HIST_PAGE_SIZE` whenever the Range Filter
changes or the screen is re-entered via "See all →", so switching filters
never leaves a stale reveal-count behind. Sample datasets for all 3 lists
expanded from 3–4 rows each to 5–6, so there's something to actually
page through.

Verified end-to-end in a headless browser for `hivework-app-v4-3.html`
(row counts step 2 → 4 → 6 → button disappears; range-filter switch
correctly resets the count). `HiveworkApp.jsx` was refactored the same
way but could only be checked via brace/paren balance — no network access
in this environment to run a real JSX build.

**Not built:** a real cursor/backend call — this is a client-side reveal
of already-loaded sample rows, not a fetch-more-from-server pattern. Fine
for a mockup; worth flagging if this ever needs to demonstrate loading
states too.
