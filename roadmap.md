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
numbered (`session-01.md`, `session-02.md`, ...).

**Standing rule — sweep before designing:** before redesigning any
particular screen, always do a thorough sweep of the code/files on Termux
first, to see all information and components actually supposed to be on
that screen. Applies to every future screen, not a one-off — this is how
Section 6/7/8's findings surfaced in the first place.

---

## 1. Screen Inventory

| Screen | Route | Status | Notes |
|---|---|---|---|
| Landing | `/` (logged out) | ✅ Done | Nav "Get started" + hero CTAs route into onboarding with intent (`?intent=find` / `?intent=post`). Testnet badge added. Canonical: `HiveworkLanding.jsx` + `hivework-landing.html` (ported 1:1, verified via structural diff). |
| "Wallet Connect" flow (proposed pattern — see Section 3) | *(not `/onboarding` — see below)* | ✅ Built, reclassified | Originally built as "Onboarding," but `Onboarding.tsx` turned out to be something else entirely (see next row). Kept as a proposed new consent/KYC-disclosure pattern, since no equivalent exists in the real app today — just not a redesign of the real `/onboarding` route. |
| Real `onboarding` (profile-completion form) | `onboarding` | ❌ Not designed | Single reactive form, triggered when a worker tries to apply without skills. Required skills field, optional devices/languages/bio, 200-char bio limit, `returnTo` redirect. See Section 3. |
| Home | `/` | ✅ Done | |
| Browse | `jobs` | ✅ Done | |
| Job Detail | `jobs/:id` | ⚠️ Multi-worker owner view built, pending comparison | Claude built `hivework-job-detail.html`/`HiveworkJobDetail.jsx` (owner view, mixed slot states, applicant review + inline per-slot rating). User building their own version to compare before picking one. Applicants confirmed to live inline on this screen, not a separate route — matches how `JobDetail.tsx` actually works in code. Worker (non-owner) view not yet redesigned. |
| Post Job | `post-job` | ⚠️ Step 1 only | Wizard steps 2 (Details) and 3 (Review) still placeholders |
| Profile | `profile/:username` | ✅ Done | Reached via avatar menu, not segnav (intentional) |
| Dashboard | `dashboard` | ✅ Done | This **is** the mockup's old "Earnings" screen — same screen, correct name now. Worker/Client tab toggle, balance, withdraw, active applications/jobs. Runs a `profileComplete` nudge on mount — **this nudge is the real trigger to the required profile-completion form** (the real `/onboarding`, Section 3); the Wallet Connect flow's Quick Profile step stays purely optional. Fixed a component-duplication bug: "Your work" and "Withdrawals" used two different list styles for the same kind of content — consolidated to one (`.hist-row`). |
| History → Work | `history/work` | ✅ Done | Drill-in from Dashboard ("See all →"), not a nav-level screen |
| History → Jobs | `history/jobs` | ✅ Done | Same — drill-in from Dashboard |
| History → Withdrawals | `history/withdrawals` | ✅ Done | Same — drill-in from Dashboard |
| Contact Support | *(no route — reusable component, not a screen)* | ❌ Not designed | See Section 6. `ContactSupport.tsx` — inline expanding widget (link → form), not a modal. Used in Layout, Job Detail (×2), Post Job. |
| Range Filter | *(no route — shared component on the 3 History pages)* | ❌ Not designed | See Section 7. "This week/This month/All", calendar-based not rolling. |
| Notification Bell | *(no route — component in Layout, header-level)* | ⚠️ Mockups actively wrong, needs correction | See Section 7. Our mockups tie it to the same toggle as the avatar menu — real component is a separate dropdown panel with live unread count, polling, and a real notification list. |

**Nav structure — settled:** Home / Browse / Post / Dashboard (4 items). Every
real route maps cleanly onto one of these four or is a drill-in reached from
within one of them. No 5th slot needed.

**Confirmed via `ls frontend/src/pages/`:** exactly 10 page components exist,
all already accounted for above — no missed top-level pages. "Notification
settings" (a profile-menu item in the mockups) has zero matches anywhere in
the codebase — it's a static label with no real feature behind it, not
something to design for.

**Current baseline files:** `hivework-app-v4-3.html`, `HiveworkApp.jsx`,
`HiveworkLanding.jsx` / `hivework-landing.html`, `hivework-onboarding.html`,
`HiveworkOnboarding.jsx`, `hivework-job-detail.html` / `HiveworkJobDetail.jsx`
(provisional, pending comparison).

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

### The real `/onboarding` — not yet designed

- Single form, not a wizard
- **Skills required** (marked `*`) — skip button explicitly warns "you won't
  be able to apply yet"
- Devices, Languages — plain comma-separated text inputs, not chip toggles
  (worth deciding whether the redesign keeps text inputs or upgrades to
  chips — real behavioral difference, not just visual)
- Bio — optional, hard 200-char limit, live counter
- Shares its form component (`ProfileForm`) with Profile.tsx's edit mode —
  worth keeping that sharing intact in the redesign too
- Enters via `?returnTo=` (defaults to `/jobs`), exits back to wherever the
  user was trying to go

---

## 4. Open Decisions (deliberately deferred)

- **Pi wallet connect async states.** Screen 1 of onboarding shows an
  instant connect for mockup purposes; the real `Pi.authenticate()` call is
  async and can fail. Decide whether onboarding needs loading/error states
  now or defers to implementation.
- **KYC/testnet UI**, once KYC is actually wired up: confirm whether testnet
  status is still current at ship time — the badge should get removed (or
  its copy updated) rather than shipped stale.

---

## 5. Not Yet Started

- The real `/onboarding` (profile-completion form) — see Section 3
- Job Detail: pending comparison between Claude's build and the user's own
  version; worker (non-owner) view untouched
- Post Job wizard steps 2–3
- Contact Support widget (Section 6)
- Range Filter + correcting Notification Bell (Section 7)
- Wiring the profile-menu's items (log out, notification settings, contact
  support) to real functionality — menu itself is being kept, not removed
  (Section 8)
- "Load more" / pagination affordance on all three History screens —
  `usePaginatedList.ts` confirmed a shared cursor-pagination hook backs all
  of them plus the withdrawal list; current mockups just show static
  example rows

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
