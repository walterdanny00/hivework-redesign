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
# source: files land at ~/storage/downloads/ (Termux shared storage) after
# downloading from chat — cp from there, not from a repo-relative path.

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

**This two-repo routine applies to `hivework-redesign`'s own content
only (roadmap, session briefs, shell files in `screens/`). Once the
patching-into-main-app phase begins (Section 30), real edits to
`~/Piwork/frontend/src/` push to the Piwork repo alone — see Section 30
for why.**

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
| "Wallet Connect" flow (proposed pattern — see Section 3) | *(not `/onboarding` — see below)* | ✅ Built, reclassified · ✅ Recompiled (JSX) | Originally built as "Onboarding," but `Onboarding.tsx` turned out to be something else entirely (see next row). Kept as a proposed new consent/KYC-disclosure pattern, since no equivalent exists in the real app today — just not a redesign of the real `/onboarding` route. In `HiveworkApp.jsx`, wired as the `welcome` screen — this is what Landing's CTAs actually open (**not** Profile Complete; that mix-up was caught and fixed, see Bug Fix Log #10). **Returning-user gap fixed (session 16, Section 18):** every shell previously ran every wallet connect through connect→profile→notify unconditionally, with no branch for a returning user with an already-complete profile — contradicted the real app's confirmed pattern (`Dashboard.tsx` soft inline nudge banner, no forced walkthrough at all). All 5 files (2 shells + standalone `HiveworkOnboarding.jsx`/`-0.jsx`/`.html`) now branch straight to `routing` for a returning/complete user, each via that file's own existing convention for demo-state props (inline demo link in the shells, `PreviewControls`/preview-row toggle in the standalone files). |
| Real `onboarding` (profile-completion form) | `onboarding` | ✅ Done · ✅ Recompiled (JSX) · ✅ **Patched into real `Onboarding.tsx` and live-verified** (Section 47) | Single reactive form, triggered when a worker tries to apply without skills. Required skills field (chip input), optional devices/languages (searchable combobox, shared with Post Job) + bio (200-char limit), `returnTo` redirect. Canonical: `hivework-profile-complete.html` + `HiveworkProfileComplete.jsx`. See Section 3. In `HiveworkApp.jsx`, reached only via Dashboard's "Finish →" nudge, which was previously bugged to route to `profile` instead — fixed (Bug Fix Log #9 area). Real-code patch note (Section 47): `Profile.tsx` imports `ProfileForm` directly from this file — the form is defined and exported here, not a separate file — so the two screens share one patch target. Rebuilt to the canonical design (chip-input skills, shared `Combobox` for devices/languages, bio counter); page chrome (`Onboarding()` wrapper) finished in the same pass to avoid shipping half-styled classes with no matching `<style>` block (Section 43 pattern). |
| Home | `/` | ✅ Done | |
| Browse | `jobs` | ✅ Done · ✅ **Patched into real `Jobs.tsx` and live-verified** (Section 42) | Category tile grid replaces real code's pill filter row (visual only, same `useSearchParams`/`category` filter underneath). 3 real categories (`bug-testing`/`translation`/`ui-feedback`) show live counts from `GET /api/jobs/stats`; 4 shell-only categories render as disabled "Coming soon" tiles — see Section 42 for why. Cards restored the description snippet + applicant count the shell's `rec-item` style had dropped. |
| Job Detail | `jobs/:id` | ✅ Done, both views · ✅ Recompiled (JSX) · ✅ **Patched into real `JobDetail.tsx` and live-verified** (worker: Section 36, session 30; owner: Section 37, session 31) | Owner view: comparison closed 2026-08-07 — user's own re-upload confirmed identical to the already-reconciled canonical pair (tabbed Overview/Applicants/Slots, trust badges, ledger, Close-unfilled-slots, inline rating). Applicants confirmed to live inline on this screen, not a separate route — matches how `JobDetail.tsx` actually works in code; the shell's old standalone Applicants screen was removed. Worker (non-owner) view: ✅ done, see Section 11 — canonical: `hivework-job-detail-worker.html`/`HiveworkJobDetailWorker.jsx`. In `HiveworkApp.jsx`, both views are wired in, branching on a new `isOwner` flag added to the shell's job data. Real-code patch note: decline button ships visually but inert (no backend endpoint exists, Section 16/37); multi-worker "slots still open after first approval" gap and real file-upload attachments both logged, not designed for (Section 35). |
| Post Job | `post-job` | ✅ Done · ✅ Recompiled (JSX) · ✅ **Patched into real `PostJob.tsx` and live-verified** (Section 42) | 4-step wizard (Basics/Details/Workers/Review), SVG icons (not emoji), Device/Language as searchable multi-select comboboxes. Canonical shell version (Section 9) shows all 7 categories functionally; **real-code patch does not** — only 3 are real server-side (Section 42), the other 4 ship visible-but-disabled ("Coming soon"). Device/Language selections join into one comma string on change to match the real single-string `device_required`/`language_required` fields. Per-step validation added (stricter than real code's single Review-time check, same underlying rules). Real `connected` gate and all four full-screen payment states (locked/paying/done/error) plus `handlePayAndPost` and its Pi callbacks are byte-identical to real code — restyle only. |
| Profile | `profile/:username` | ✅ Done · ✅ **Patched into real `Profile.tsx` and live-verified** (Section 47) | Reached via avatar menu, not segnav (intentional). Full restyle: violet-gradient cover, big avatar, stat-pills, level/trust chip pills (Dashboard's chip convention), edit toggle wired to the shared `ProfileForm` (see `onboarding` row above), skills/devices/languages tag display, reviews wired to real `ratings` fetch data. |
| Dashboard | `dashboard` | ✅ Done | This **is** the mockup's old "Earnings" screen — same screen, correct name now. Worker/Client tab toggle, balance, withdraw, active applications/jobs. Runs a `profileComplete` nudge on mount — **this nudge is the real trigger to the required profile-completion form** (the real `/onboarding`, Section 3); the Wallet Connect flow's Quick Profile step stays purely optional. Fixed a component-duplication bug: "Your work" and "Withdrawals" used two different list styles for the same kind of content — consolidated to one (`.hist-row`). Identity block (avatar/username/level chip) — Section 33. Client-tab budget tracker (posted/refunded/net committed) + jobs-posted count + tab-aware first stat-pill — Section 34. |
| History → Work | `history/work` | ✅ Done · ✅ **Patched into real `HistoryWork.tsx` and live-verified** (Section 44) | Drill-in from Dashboard ("See all →"), not a nav-level screen. Page chrome restyled to tokens; list itself reuses the already-restyled `ApplicationCard`. **Bug fixed (Section 52):** shipped with no local CSS for `ApplicationCard`'s own classes (`.hist-row` etc.) — unstyled on every visit since those classes only existed in `Dashboard.tsx`'s unmounted `<style>` block. Fixed by redeclaring locally, per `HistoryWithdrawals.tsx`'s existing pattern. |
| History → Jobs | `history/jobs` | ✅ Done · ✅ **Patched into real `HistoryJobs.tsx` and live-verified** (Section 44) | Same — drill-in from Dashboard. Backend `/api/history/jobs` gained a computed `refunded` field (summed from `balance_transactions`, verified directly against Supabase) so `JobCard`'s refund badge works here too, matching Dashboard. **Bug fixed (Section 52):** same missing-local-CSS bug as History → Work, affecting `JobCard`'s classes — fixed the same way. Hardcoded hex literals (not yet tokenized to `:root` vars) flagged for a follow-up pass. |
| History → Withdrawals | `history/withdrawals` | ✅ Done · ✅ **Patched into real `HistoryWithdrawals.tsx` and live-verified** (Section 44) | Same — drill-in from Dashboard. Previously duplicated `WithdrawPanel`'s row markup; now shares the new `WithdrawalRow.tsx` component with it instead. |
| Contact Support | *(no route — reusable component, not a screen)* | ✅ Done | See Section 6, 17, and 29. `ContactSupport.tsx` — inline expanding widget (link → form), not a modal. Canonical: `HiveworkContactSupport.jsx` — reusable component, used with contextual `subject` props matching Layout, Job Detail (×2), Post Job. Two access points now live in both shells, both routing to the same centered modal (session 17/18): the Profile menu entry (shell invention — real app has no dropdown behind the avatar at all, Section 8) and the `.help-strip` footer (Section 29, BUG-106 parity — real `Layout.tsx`'s actual footer link, present on all 10 in-app screens). **Acknowledged functionally redundant, kept as-is (2026-08-14):** within the shell's binary connected model (no partial logged-out browsing state, Section 17 Part A), the profile menu is always reachable whenever the footer is, so the footer isn't covering a state the menu misses — they point at the same modal in the same situations. Section 29's original reasoning ("not duplicating one real thing twice") explained why this wasn't copying real code twice, but doesn't by itself establish the two serve different users; that's a separate, still-open question. Decided to leave both rather than drop either — not resolved on discoverability grounds, just not forced by this fact. Post Job's payment-error anchor was logged as a gap here; **fixed 2026-08-12 (Section 18 follow-up)** — see below. **Neither `HiveworkRangeFilter.jsx` nor `HiveworkContactSupport.jsx` was actually uploaded to the session that did the step-6 wiring — both were reconstructed from the spec already in memory, not ported from the real canonical files.** Worth diffing the shells' versions against the real canonical files next time either is uploaded. |
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
13. **Job Detail (owner view) — Applicants tab, avatar/rating row, skill
    chips, and cover note squashed onto one horizontal line** instead of
    stacking. A base `.applicant-row{display:flex}` rule, meant for a
    different, compact list context, was leaking into this scoped view.
    Fixed by adding `.jdo .applicant-row{display:block}` to override it,
    with `.app-top`/`.app-chips` kept independently flex for their own
    internal row layout. Found and fixed by the user post-session-12,
    off-sandbox; not covered by session 12's headless-browser or
    brace-balance verification. Same class of bug as #4 and #11/#12 above —
    worth keeping in mind whenever a new scoped view reuses a class name
    that also has a broader base rule.
14. **`WithdrawPanel.tsx`/`HistoryWithdrawals.tsx` failed-withdrawal error
    text said "contact support" as plain static words, not the real wired
    component** — tapping did nothing in either spot. Fixed in both shells
    by mounting the real Contact Support widget inline in the failed-row
    error line, matching the exact "Re: {subject}" embedding convention
    already used in Job Detail's wallet-error state. Confirmed via
    headless-browser test (HTML shell) that the widget opens, accepts a
    message, and sends, from both the Dashboard mini-preview and the full
    History→Withdrawals page simultaneously without an id collision
    (instance-scoped by a `ctx`-prefixed container id). The JSX shell needs
    no such scoping — React gives every mounted `<HiveworkContactSupport>`
    its own state automatically — worth remembering next time a vanilla-JS
    pattern gets ported over out of habit.

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
  (Section 8) — ✅ done, see Section 8
- `WithdrawPanel.tsx` real-detail parity (fee/net preview, "Withdraw all",
  wallet note, status-badged history, failed-row Contact Support wiring) —
  ✅ done, see Section 15
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
not a design decision. **Fixed in the redesign (2026-08-11, see Section 15)**
— both mockup files now wire the real widget into the failed-withdrawal
error line, matching the real components' shape exactly. The live-app bug
itself still needs the actual code fix; the redesign now shows what that
should look like.

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
the live app's pattern). **Update, verified 2026-08-12 audit — wiring is
now complete, this is stale:** `HiveworkContactSupport` is wired into both
shells at every documented context — Job Detail's wallet-verification
error (`initContactSupport('jdw-contact-support', ...)` / JSX line ~1014),
Post Job's payment error (`initContactSupport('pj-contact-payment-error',
...)` / JSX line ~1726), both withdraw-failed row kinds, and the
profile-menu modal. No longer a standalone component pending wiring.

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
the calendar boundary (not rolling window) behaves as intended.
**Update, verified 2026-08-12 audit — stale, now recompiled:** wired into
all three History screens (Work/Jobs/Withdrawals) in both shells —
`HiveworkRangeFilter`/`renderRangeFilter`, resetting `shown` on range
change, same pattern in all three call sites.

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
in both populated and empty states.
**Update, verified 2026-08-12 audit — stale, now recompiled:** decoupled
bell/avatar behavior is live in both shells (`toggleNotif()`/its own
`notifPanel` in HTML, separate `notifOpen` state + `BellIcon` in JSX),
with the real unread badge (caps "9+") and mark-all-read-on-open. Sample
notification data is used rather than the canonical `.jsx` file verbatim
— that data-source note (not the wiring) is the accurate remaining caveat,
already flagged correctly elsewhere in the Screen Inventory table.

---

## 8. Profile-menu — doesn't exist in real app; kept as redesign addition, now wired (2026-08-10)

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

### Wiring pass, done (2026-08-10)

- **Log out** — real product gap fill: clears back to Landing with a
  confirmation toast ("Logged out"). Client-side reset only — does not
  gate other nav items on a logged-out state (real `Layout.tsx` hides
  Post Job/Dashboard/NotificationBell when disconnected). **Resolved the
  next day, Section 17 Part A:** decided to keep the shell's simple
  binary (landing vs. fully-logged-in nav) rather than add a third
  "browsing while logged out, partial nav" state to match the real
  header nav — confirmed with the user, no nav-hiding logic needed. Not
  an open item.
- **Notification settings** — no real feature exists to wire to, so this
  now surfaces an honest "coming soon" toast rather than doing nothing or
  implying a feature that isn't there.
- **Edit profile** — real `Profile.tsx` toggles editing in place on the
  same page (own-profile view only) and shares `ProfileForm` with real
  `/onboarding`. Mirrored here: clicking "Edit profile" opens the Profile
  screen in an in-place edit mode (bio textarea + the same chip-toggle
  skill options used elsewhere) instead of a separate route; Save/Cancel.
  Simulated persistence only (updates local state, no backend call) —
  matches how the rest of this shell handles form submission everywhere
  else. "View profile" still opens the same screen read-only.
- **Contact support** — already wired from the prior session (initialized
  via `initContactSupport`/`<HiveworkContactSupport>` in the menu); no
  change needed this pass, confirmed still functioning.
- New shared `hwToast()` (HTML shell) / `toast` state (JSX shell) helper —
  small fixed-position confirmation pill, reused by Log out and
  Notification settings; available for any future action needing the same
  lightweight feedback pattern.
- Verified end-to-end in headless browser (HTML shell): menu opens, each
  item does its wired action, edit-mode chip toggle + bio field persist on
  Save and discard on Cancel, Log out returns to Landing — no console
  errors. JSX only brace/paren/bracket-balance checked (net-zero), same
  limitation noted every session this file has been touched — still no
  JSX build/lint tool available in this sandbox.

**Correction (2026-09-03, Session 36):** this section's title and the
"wiring pass" above describe the standalone shell demo only — that was
always shell-only invention, never real code. The real `Layout.tsx`
avatar (patched Section 39) is and always was a plain `NavLink` straight
to `/profile/:username`, no dropdown, no menu component anywhere in
`frontend/src`. Session 36 replaced the avatar's need for a popup menu
with a hamburger side-menu instead (Section 47) — see that section for
what's actually live now (Help, Contact Support, Log out).

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
**Update, verified 2026-08-12 audit — stale:** since recompiled into
`hivework-app-v4-3.html` too (Section 12, 2026-08-09) —
`WIZARD_STEPS = [Basics, Details, Workers, Review]` confirmed live in
that file. Both shells at parity. See `sessions/session-03.md`.

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
`profile` instead — see Bug Fix Log). **Update, verified 2026-08-12
audit — stale:** since recompiled into `hivework-app-v4-3.html` too
(Section 12, 2026-08-09) — `page-onboarding`/`profileCompleteState`
confirmed live in that file. Both shells at parity. See
`sessions/session-04.md`.

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
**Update, verified 2026-08-12 audit — stale:** since recompiled into
`hivework-app-v4-3.html` too (Section 12, 2026-08-09) — `isOwner` branch
and `jdw-`-prefixed worker-view functions confirmed live in that file.
Both shells at parity.

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
**Update, verified 2026-08-12 audit — stale, since fixed:** Post Job's
payment-error anchor was added and Contact Support wired to it 2026-08-12
(Section 18 follow-up) — confirmed live in both shells
(`initContactSupport('pj-contact-payment-error', ...)` in HTML,
`HiveworkContactSupport` at the `paymentError` block in JSX). No longer a
gap.

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

---

## 15. WithdrawPanel real-detail parity + Contact Support fix — done (2026-08-11)

Real `WithdrawPanel.tsx`/`HistoryWithdrawals.tsx` were swept directly (user
pulled and pasted both from the Termux repo). Confirmed real: dynamic
fee/net live preview, a "Withdraw all" quick-max link, a wallet-verified
note (its actual meaning is different from what was assumed when this gap
was first flagged — see below), per-row status badges
(queued/processing/completed/failed), fee/net split shown on every history
row, `to_address` shown only on completed rows, and the plain-text
"contact support" bug in the failed-row error line (Bug Fix Log #14).

**Correction to the original gap description:** the "wallet-address-not-
shown warning" wasn't a defensive privacy disclosure as first assumed —
Pi doesn't expose a destination address until payment creation, so the
real copy is a correctness note: "sent to your **active Pi wallet** — make
sure the wallet you want to receive to is the one unlocked in your Pi
Browser." Reproduced verbatim in both shells.

**Built, both shells:** a real `WithdrawPanel` (React component / vanilla-JS
render function) replacing the old static balance-card markup — live fee/
net preview, "Withdraw all," the corrected wallet note, a disabled/enabled
Withdraw button gated on the real validation rule
(`amt >= min && amt > fee && amt <= balance`), and a "Demo: simulate failed
request" trigger link (same reviewer-visibility convention session 11 used
for wallet-connect error states) since a real API failure isn't otherwise
reachable from this mockup. A real submit decrements the balance and
prepends a new `queued` row to the withdrawal history, in both shells.
Withdrawal history rows (Dashboard mini-preview + full History→Withdrawals
page, both now sharing one `WithdrawalRow` renderer / component) upgraded
to the real shape: status badge (violet=queued/processing, teal=completed,
coral=failed, reusing exactly the same tint pairs the app's status-pills
already use elsewhere — no new colors introduced), fee/net split, shortened
`to_address` on completed rows, and the real Contact Support widget mounted
inline in any failed row's error line.

**Demo fee value flagged as an assumption:** the real `fee`/`minWithdrawal`
values come from the backend per-response (`GET /api/withdrawals`), not a
frontend constant — general Pi Network searches only turned up information
about exchange withdrawals, not this app's own escrow-to-wallet payout, so
a flat 0.01π fee across all sample rows is illustrative demo data, not a
confirmed real number. Flagged in-code in both files.

**HTML-shell-specific implementation note:** the live fee/net preview and
submit-button disabled state are patched directly on the DOM on every
keystroke, not through a full panel re-render — same focus-preserving
convention established during the Post Job port (a full `innerHTML` rebuild
drops cursor position in vanilla JS, unlike React's controlled-input
diffing). The JSX shell needs no such workaround; a plain `onChange` +
re-render is idiomatic there.

**Instance-scoping note:** the Dashboard mini-preview and the full History
page can both have a failed row's Contact Support widget mounted at the
same time (only one screen is visible, but the shell renders both into the
DOM regardless of visibility). HTML shell: fixed by prefixing each
mounted widget's container id with a `dash`/`hist` context tag, same fix
already logged for the profile-menu/job-detail collision. JSX shell needed
no such fix — confirmed via reading the real `HiveworkContactSupport`
component that it uses local `useState`, so React scopes every mounted
instance's state automatically. An `instanceKey` prop was drafted by habit
during this port, found unnecessary on inspection, and removed before
shipping — worth remembering next time a vanilla-JS pattern gets carried
into the JSX shell without checking whether React already solves it.

**Verified:** end-to-end in headless browser (HTML shell) — fee/net preview
updates live while typing with focus retained, submit button enables/
disables correctly, "Withdraw all" fills the input, the demo-fail trigger
shows the error copy, a real submit decrements the balance and adds a
`queued` row, all 4 status badge colors render, and the failed row's
Contact Support widget opens/types/sends correctly from both the Dashboard
preview and the full History page without an id collision. One console
message (a 403 on the Google Fonts CDN fetch) confirmed pre-existing and
unrelated — this sandbox has no network access, not a regression. JSX shell
only brace/paren/bracket-balance checked (net-zero), same standing
limitation as every session touching this file.

**Correction (2026-08-12, Section 18 follow-up):** this was misdiagnosed as
"not built" — a Termux sweep of the real app found both pieces already
exist: `JobCard.tsx` already renders the "↩ Xπ refunded" badge
(`!!job.refunded` check), and `Dashboard.tsx:174` already mounts
`<WithdrawPanel kind="refund" />` conditionally when
`tracker.total_refunded > 0`. The only real gap was that neither was
demoed in the shells. Fixed for one of the two: `WithdrawPanel` in
`HiveworkApp.jsx` and `hivework-app-v4-3.html` takes a `kind`
prop/parameter (`'earnings'` | `'refund'`), branching balance label and
wallet-note copy per real `WithdrawPanel.tsx`; a refund-kind panel + short
refund history now renders in Dashboard's "My Jobs" tab (both shells),
gated on a demo refund balance mirroring the real
`tracker.total_refunded > 0` check.

**Correction #2, verified 2026-08-12 audit:** the JobCard "↩ Xπ refunded"
badge was **not** actually added to either shell — grepped both files for
`JobCard`, `.refunded`, and `refund-badge`; no match. Only the
WithdrawPanel refund-kind panel and its refund-history rows exist. This
roadmap previously implied ("Now fixed" covering "both pieces") that the
badge was demoed too — it wasn't. Genuinely still a shell-demo gap, not a
real-app gap (the real `JobCard.tsx` has it). See also Section 19, whose
own "Fixed in all 4 relevant files" list correctly never claimed this
badge was added — only Section 15's wording here overstated it.

---

## 16. Owner-side decline-applicant flow — proposed pattern, built (2026-08-11)

**Swept first, per standing rule.** Read `JobDetail.tsx`'s approve/reject
logic directly. Finding: the real app has **no explicit decline/reject
feature at all** — no `/reject-application` endpoint, no `handleReject`.
The only place `status: 'rejected'` gets set is as a side effect inside
`handleApprove`, and only for single-worker jobs (approving one applicant
auto-rejects the rest, since the job can only fill one slot). Multi-worker
jobs have no reject path in real code whatsoever. The only owner-facing
button on a pending applicant in `JobDetail.tsx` today is "Approve &
Assign."

This reclassifies the item from a parity gap to a **proposed pattern**
(same category as Section 3's Wallet Connect) — old code informs data
shape (`status: 'rejected'` already exists and is already rendered
correctly by both `ApplicationCard.tsx` and `JobDetail.tsx`'s badge logic)
but doesn't dictate UX here, since there's no real decline UX to match.

The mockup's own existing `decline()`/`declineApplicant()` (a silent
`filter()`, no confirm/undo/record) matched the gap description in the
session-13 "Next session" note exactly, confirming this was the intended
target.

**Design decisions, made explicitly rather than assumed:**
- Declined applicants are **not** removed outright or handled via a
  transient toast/undo window — they move into a persistent, collapsed
  "Declined (N)" section at the bottom of the Applicants tab, with a
  per-row Undo that works anytime, not just briefly after the action.
  Rationale: a toast disappears in seconds; an owner checking back an
  hour (or a job-cycle) later needs an actual record, not a narrow
  recovery window.
- Confirmation is an **inline "Sure?/Cancel" swap on the button itself**,
  not a modal — keeps flow unbroken when working through a list of
  several applicants in sequence, and matches the design system's
  existing inline-confirm pattern (e.g. Close-unfilled-slots).
- Confirmed with the user: this pattern assumes **permanent backend
  storage** if it were ever built for real (not just session-durable) —
  narrow but real value for slot-reopening after a drop-out, dispute
  resolution, and an owner recalling past decisions across jobs. Not
  proposed for exposure to the worker's side, and not an analytics
  surface (no admin/analytics layer exists in this app today).

**Built, both shells:** two-step decline (`requestDecline`/`cancelDecline`/
`confirmDecline` in React; `requestDecline`/`cancelDecline`/`confirmDecline`
functions + `ownerState.confirmingDeclineId` in vanilla JS), a collapsed
`declined` array + toggle (`declinedExpanded`) rendering a "Declined (N)"
footer section under the Applicants tab, and `undoDecline` moving an entry
back into the live applicants list. New CSS: `.decline-confirm` (coral,
reusing the existing danger/error token — no new color introduced),
`.decline-cancel`, `.undo`, and the `.declined-section`/`.declined-toggle`/
`.declined-row` block, added to both files' `.jdo`-scoped style blocks.

**Verified:** end-to-end in headless browser (HTML shell) — Decline
correctly arms the inline confirm swap, Confirm moves the applicant into
a "Declined (1)" section that expands on click, Undo restores them to the
live applicant list and the section cleanly disappears when empty again.
JSX shell only brace/paren-balance checked (net-zero) — same standing
limitation, no JSX build tool in this sandbox.

**Not built — noted as a real gap if this ever ships:** the real backend
has no `/reject-application` (or un-reject) endpoint; this pattern is
demoed entirely in local/session state per the sandbox's standing
limitation, consistent with every other proposed pattern in this roadmap.


## 17. Layout.tsx logged-out nav behavior, and Contact Support UX pass (2026-08-11)

**Part A — Layout.tsx nav sweep.** Swept first, per standing rule. Read
`Layout.tsx` directly. Finding: real code has **two separate navs with
different logged-out behavior**, not one:
- **Header nav** (`<header>`, desktop-style): Browse always shows; Post
  Job, Dashboard, and `NotificationBell` are wrapped in
  `{connected && (...)}` and genuinely disappear when logged out. The
  avatar circle becomes a plain "Open in Pi Browser" text when
  disconnected.
- **Bottom tab nav** (sticky, mobile-style — Home/Jobs/Post/Earnings):
  **always renders all 4 items unconditionally**, no `connected` check
  at all. The shell's existing `segnav` (Home/Browse/Post/Dashboard,
  settled per Section 1) maps to this bottom nav, not the header nav.

This directly contradicted session 13's assumption that the shell's nav
should hide Post/Dashboard/Bell when logged out — that behavior only
exists in the header nav, which the shell doesn't have an equivalent of.

Resolved by inspecting the shell, not by building anything new: it
already has `hwLogout()` (a proposed fill for a real gap — the live app
has no logout feature at all, session token is set on connect and never
cleared, Section 8) which resets state and routes to the `landing`
screen. Landing already renders full-page with no header/segnav at all
(Section 1), and its CTAs already route into the Wallet Connect flow to
reconnect. So logout → landing → reconnect was already fully working
end-to-end before this session. **Decision, confirmed with the user:**
keep this simple binary (landing vs. fully logged-in nav) rather than
adding a third "browsing while logged out, partial nav" state to match
the real header nav's behavior. No nav-hiding logic needed. The stale
code comment on `hwLogout()` claiming this was still an open item was
corrected.

**Part B — Contact Support UX, three iterations in the same session.**

1. *Tried a persistent footer.* Real `Layout.tsx` has a footer line
   (`BUG-106` comment: several error states elsewhere tell users to
   "contact support" with previously no way to actually do that) sitting
   between main content and the bottom nav. Confirmed this was missing
   from the shells and built it — a `.hw-footer-help` "Need help?
   [Contact support]" line on every main-app screen. Verified end-to-end
   in headless browser (correct subject line, sends successfully, no id
   collision with the existing profile-menu instance).

2. *Reverted the footer.* On reflection, judged redundant: the
   profile-menu Contact Support entry (Section 6) is already reachable
   from every main-app screen via the header avatar, giving the same
   global coverage the real footer exists to provide in an app that has
   no such menu item. Running both duplicated one access point rather
   than adding a second. A footer restricted to a single screen was also
   considered and rejected — it doesn't solve a coverage problem either.
   Reverted the footer markup/CSS/init call in both shells; kept the
   `hwLogout()` comment fix from Part A. Re-verified the profile-menu
   instance still worked correctly post-revert.

3. *Fixed the profile-menu form itself.* User flagged (confirmed by
   actually rendering and screenshotting it) that the inline-expanding
   form — textarea + Cancel/Send unfolding inside the profile menu's
   228px dropdown, directly above "Log out" — looked cramped and
   unprofessional. Considered modal, dedicated screen, and mobile-native
   bottom sheet; no existing precedent for any of the three in the
   codebase. Chose a centered modal: a dedicated screen is overkill for
   a 2-field form, a bottom sheet reads more casual than this utility
   form calls for, and a modal reuses the card/shadow language already
   used elsewhere (profile menu, testnet tooltip). Built in both shells:
   clicking "Contact support" closes the menu and opens a modal (dimmed
   backdrop, `×` close, click-outside-to-close), opened straight to the
   form. JSX shell: `HiveworkContactSupport` extended with optional
   `startOpen`/`onCancel` props, both defaulting to prior behavior so
   the two existing inline call sites (Job Detail wallet-error,
   withdrawal-error) are unaffected. HTML shell: new
   `openContactModal()`/`closeContactModal()`, a targeted one-line
   addition to the shared `csCancel()` for the modal's container id, and
   removal of the stale `initContactSupport('menu-contact-support', ...)`
   call left from the old inline-menu wiring. Then, per user feedback,
   repositioned the modal from screen-center to anchored near the bottom
   edge (`bottom: 24px`, still a centered card, not a full-width sheet)
   — CSS-only change in both shells.

**Verified, all three iterations:** headless-browser runs in the HTML
shell for each — footer built and confirmed working, footer reverted and
profile-menu instance reconfirmed working, modal built and confirmed
(opens on click with form immediately visible, sends and shows
confirmation, all three close paths work, reopening after any close path
shows a fresh empty form), and the bottom-repositioned modal
re-confirmed identical behavior with a screenshot. One console message
(403 on Google Fonts CDN) reconfirmed pre-existing/sandbox-related across
all runs, not a regression. JSX shell balance-checked (net-zero) after
each edit — same standing limitation, no JSX build tool in this sandbox.

**Not built — real gap, unaddressed as of this session (2026-08-11):** Post
Job's wizard still has no payment-error anchor point for a `ContactSupport`
instance (pre-existing gap, Section 6) — out of scope for this item.
**Fixed the next day — see Section 19 (2026-08-12):** confirmed live in
both shells, no longer a gap.


## 18. Returning-user wallet-connect gap, and self-contained onboarding files (2026-08-12)

**Question that started this:** does an existing user who already
completed their profile and enabled notifications get pushed through
those screens again on every reconnect, or does wallet connect alone
take them straight in?

**Sweep first, per standing rule.** Read the real app's auth/dashboard
code directly (`usePi.ts`, `Dashboard.tsx`, confirmed no
`ProfileSetup`/`NotificationOpt`/`EnableNotifications` components exist
anywhere in the codebase). Finding: **the real app never gates a
returning user behind onboarding screens at all.** Login is just Pi
wallet auth; a successful connect lands directly on Dashboard.
`profileComplete` only drives a soft inline nudge banner ("Complete
your profile · Add your skills so clients can hire you", linking to
`/onboarding?returnTo=/dashboard`) — dismissible by ignoring, never a
hard redirect.

**Compared against the shells — real gap found.** Every shell
(`HiveworkApp.jsx`, `hivework-app-v4-3.html`, and the standalone
`HiveworkOnboarding.jsx`/`-0.jsx`/`.html`) ran *every* wallet connect
through connect→profile→notify unconditionally — no branch existed for
a returning/complete-profile user. This contradicted what the sweep
just confirmed about the real app.

**Fixed in all 5 files,** each via that file's own existing convention
rather than one copy-pasted pattern:
- `HiveworkApp.jsx` / `hivework-app-v4-3.html`: added a `returning`
  branch to `handleConnect`/`owConnect` (skips straight to `routing`
  instead of `profile`), surfaced via a new "Demo: returning user (skip
  setup)" link next to the existing no-Pi-Browser/failed demo links.
- `HiveworkOnboarding.jsx`/`-0.jsx`/`hivework-onboarding.html`: added a
  `profileComplete` prop/state, same effect, surfaced via a new
  `PreviewControls`/preview-row toggle ("New/incomplete profile" vs.
  "Returning · profile complete"), matching the existing
  `piBrowserDetected`/`intent` toggle pattern already in those files.

**Bug caught and fixed during this work:** the first pass at the
`HiveworkApp.jsx` demo link called `setSimulateReturning(true)` and
`handleConnect(...)` in the same click handler; since `handleConnect`'s
outcome runs inside a `setTimeout`, it captured the pre-update (`false`)
value via React's normal closure-per-render behavior — the flag never
actually took effect, so the demo link silently did nothing different.
Fixed by passing `returning` as a direct function argument instead of
reading it off state inside the delayed callback. Confirmed this
specific failure mode didn't apply to `owConnect` (plain mutable
variable, not React state) or to `HiveworkOnboarding.jsx` (the toggle
click and the Connect click are two separate handlers/renders, so the
closure is already fresh by the time Connect fires).

**Also done this session, per request:** `HiveworkOnboarding.jsx` and
`-0.jsx` previously imported `./hivework-tokens.css` for their design
tokens; now embed the `:root` token variables directly in the
component's own `<style>` block instead, so the file is fully
self-contained — matching how `HiveworkApp.jsx` already worked.

**Verification:** brace-balance checked (Node, net-zero) after every
edit across all 5 files — same standing limitation, no JSX build tool
in this sandbox, no headless-browser run this session (text-only
editing, not visually iterated).

**Not built — noted as a gap:** none of the shells detect Pi Browser
presence for real (`piBrowserDetected` is hardcoded/prop-driven, as
already logged in Section 8/17) — unrelated to this fix, just adjacent
code touched.

---

## 19. Next-session gap sweep — two false gaps found, three real fixes shipped (2026-08-12)

**Started from the carried-over "next session" list (sessions 14/15/16):**
WithdrawPanel's `refund` kind not demoed, `JobCard.tsx`'s refund badge
"unbuilt," Post Job's missing payment-error anchor. Per the standing
sweep-first rule, checked the real app (Termux, `~/Piwork/frontend/src/`)
before touching any shell file.

**Sweep found two of the three were misdiagnosed:**
- `JobCard.tsx` already renders the "↩ Xπ refunded" badge — not unbuilt.
- `Dashboard.tsx:174` already mounts `<WithdrawPanel kind="refund" />`
  conditionally on `tracker.total_refunded > 0` — not unbuilt in the real
  app. `WithdrawPanel.tsx` itself already branches all copy on
  `kind`/`isRefund` (balance label, wallet note, history heading).
- `PostJob.tsx:142` already has a `<ContactSupport subject="Job posting
  payment issue" />` anchor on its payment-error state — not a real-app
  gap.

All three "gaps" were actually shell-demo gaps only — the real app had
already shipped this functionality; the shells (both compiled and
standalone) just never caught up to demo it. `HiveworkApp.jsx`'s own
inline comments already said as much for two of the three (`kind`
prop absent, PostJob wizard's payment error "not modeled" per
`HiveworkContactSupport`'s header comment) — the roadmap's phrasing
("unbuilt," "real gap") was the stale part, not the code.

**Fixed in all 4 relevant files:**
- `HiveworkApp.jsx`: `WithdrawPanel` takes a `kind = "earnings"` prop;
  refund-kind panel + short refund history now renders in Dashboard's
  "My Jobs" tab, gated on a demo refund balance (mirrors the real
  `tracker.total_refunded > 0` check, since this shell has no tracker
  object). `PostJobWizard`'s step-4 submit now has real payment-error
  state, reusing the existing canonical `HiveworkContactSupport`
  component (subject `"Job posting payment issue"`, matching real code),
  with a "Demo: simulate failed payment" trigger following the same
  convention as `WithdrawPanel`'s `demoFail`.
- `hivework-app-v4-3.html`: same two fixes ported to the vanilla-JS
  pattern — refund kind gets its own parallel global-state functions
  (`REFUND_BALANCE`, `refundWithdrawState`, `renderRefundPanel()`, etc.,
  mirroring the earnings-kind functions 1:1 per this file's existing
  per-kind duplication convention rather than a new shared abstraction);
  Post Job's `postJobSubmit()` reuses the existing `initContactSupport`
  registry.
- `HiveworkPostJob.jsx` (standalone): payment-error fix only (no
  Dashboard in this file). Self-contained `PostJobContactSupport`
  component added (own file, own state) rather than importing
  `HiveworkContactSupport`, matching this file's existing
  self-containment convention (same one used for
  `HiveworkOnboarding.jsx`/`-0.jsx` in Section 18).
- `hivework-post-job.html` (standalone): payment-error fix only. Reused
  the file's existing `rv-err` placeholder div (previously always
  `display:none`, never populated) rather than adding new markup; a
  lightweight inline Contact Support widget (own state, no registry
  needed since there's only one call site in this file).

**Verification:** brace/paren/bracket-balance checked (Node, net-zero)
on both JSX files; both HTML files' inline `<script>` extracted and
run through `node --check` for syntax validity — caught and fixed one
real bug this way (a broken escaped-apostrophe string in
`hivework-post-job.html`'s "message sent" text that would have thrown
at runtime). No headless-browser run this session — standard sandbox
limitation, no network access to install a browser.

**Follow-up fix (2026-08-12, same day):** user flagged that refund history
didn't visually tie in with "Jobs you've posted" below it on the myjobs
tab — unlike mywork's "Your work"/"Withdrawals" pair, which both use flat
list rows and read as one continuous list. Root cause: refund history was
using `WithdrawalRow`'s flat `.wd-item` row style, sandwiched between the
refund `WithdrawPanel` (heavy card) above and `job-post-row` (heavy card)
cards below — three different visual weights stacked. Fixed by giving
refund rows their own `RefundRow`/`renderRefundRow()` treatment using the
`.job-post-row` card language (border/radius/shadow) instead — now the
myjobs tab reads as one card-based visual family. Caught+fixed the same
double-backslash escaped-apostrophe bug as earlier this session (this time
in `hivework-app-v4-3.html`'s new `renderRefundRow` function) via
`node --check` on the extracted script.

**Not built — noted as a gap:** the refund history list in both shells
is still a short static demo array (2 rows), not wired to the same
pagination/range-filter machinery as the earnings withdrawal history —
acceptable for a demo panel gated behind a conditional balance check,
but worth flagging if this needs full parity later.

## 20. Refund rows extended to the full /history/withdrawals page (2026-08-12)

**Follow-up to Section 19's Dashboard-level fix.** User asked directly
whether refund history was already built — yes, on the Dashboard myjobs
tab (Section 19 + its follow-up). What wasn't built: those refund rows
never appeared on the separate paginated `/history/withdrawals` page
(reached via "See all →"), which only ever pulled from the earnings-only
`WITHDRAWAL_HISTORY`/`HW_WITHDRAWAL_HISTORY` array. Confirmed a Dashboard-
only summary wasn't sufficient — refunds needed to show up in the full
ledger too: a fintech-statement framing (bank/card apps tag transaction
type inline on one continuous list rather than splitting into separate
sections) made the case that omitting refunds here would read as a bug,
not a design choice.

**Approach:** merge, don't replace. The Dashboard mini-preview
(`withdrawalHistory.slice(0,3)`/`renderDashWdHistory`) and the myjobs
refund card (`refundHistory.slice(0,2)`/`RefundRow`/`renderRefundRow`)
are untouched — each still reads its own source array. Only the full
history page now reads a merged, newest-first-sorted, kind-tagged
combination of both arrays. Chose the flat `WithdrawalRow`/`renderWdRow`
style for the merged list (not `RefundRow`'s heavier card style) since
every other row on this page is already flat — a small "Refund" pill tag
next to the amount distinguishes kind without breaking the row rhythm,
matching how bank/card statement UIs tag transaction type inline rather
than visually separating sections.

**Fixed in both shells:**
- `HiveworkApp.jsx`: new `withdrawalsHistoryMerged` (computed inline,
  tags untagged legacy rows with `kind` at merge time rather than
  editing every literal in `WITHDRAWAL_HISTORY`/`REFUND_HISTORY`) feeds
  the `/history/withdrawals` `HistoryList`; `handleWithdraw`/
  `handleRefundWithdraw` now stamp new rows with `kind` natively.
  `WithdrawalRow` shows a `.wd-kind-tag` pill when `w.kind === "refund"`.
- `hivework-app-v4-3.html`: new `getMergedWithdrawalsHistory()` mirrors
  the JSX merge logic; `renderHistWithdrawals()` now filters/sorts/
  renders from the merged list instead of `HW_WITHDRAWAL_HISTORY` alone
  — this also fixed a latent bug where `filtered`/`visible` were computed
  once for `mountWdFailedContacts` and then recomputed separately (and
  differently, pre-fix) inside `renderHistList`, risking drift between
  what rendered and which rows got a mounted Contact Support widget; now
  there's a single `merged`/`filtered`/`visible` chain feeding both.
  `mountWdFailedContacts`'s `subjectPrefix` param is now optional —
  when omitted it resolves per-row from `w.kind` ("Withdrawal failed" vs
  "Refund withdrawal failed"), needed since the merged 'hist'-ctx list
  mixes both kinds; the two Dashboard-only call sites still pass an
  explicit prefix since each sees only one kind. `submitWithdraw`/
  `submitRefundWithdraw` now stamp new rows with `kind`.
- Both shells: `.wd-amt-group`/`.wd-kind-tag` CSS added (violet-bordered
  pill, reusing existing `--violet-deep`/`--cream` tokens, no new colors
  — same design-system rule as every prior screen).

**Verification:** brace/paren/bracket-balance re-checked on
`HiveworkApp.jsx` (net-zero); `hivework-app-v4-3.html`'s inline
`<script>` re-extracted and passed `node --check`. No headless-browser
run — standing sandbox limitation (no network access to install one).

**Not a gap, verified 2026-08-12 audit:** pagination and range-filter
*are* fully wired on the merged withdrawals list, same shared pattern as
Work/Jobs history — `HiveworkRangeFilter`/`HistoryList` (JSX) and
`renderRangeFilter`/`renderHistList` (HTML) apply to `withdrawalsHistoryMerged`/
`getMergedWithdrawalsHistory()` exactly as they do to the other two lists,
no bypass. The actual (and only) limitation, same as every other History
screen: the list is backed by static demo arrays, not a real paginated
backend endpoint (2 earnings-history rows arrive "live" via `unshift` on
submit, refund rows likewise) — a data-source gap, not an unwired-feature
gap.

**QA catch, same session:** with refunds now merged into the full
history page, the myjobs tab's "Refund history" card header was the only
one of the four history-section headers (Your work/Withdrawals/Jobs
you've posted/Refund history) missing a "See all →" link — an
inconsistency user caught on preview. Added one in both shells, wired to
`goToHistWithdrawals` (same target as the mywork tab's Withdrawals "See
all", since it's the same merged destination page). No new screen/route
needed. Re-verified: brace-balance net-zero (JSX), `node --check` clean
(HTML).

## 21. JobCard "↩ Xπ refunded" badge demoed, both shells (2026-08-12)

**Closes the gap tracked since Section 15 Correction #2 / Section 19:**
the real `JobCard.tsx` already renders a "↩ Xπ refunded" badge via
`!!job.refunded` — confirmed via Termux grep this was never rendered in
either shell (zero matches for `JobCard`/`.refunded`/`refund-badge`).
Genuinely a shell-demo gap, not a real-app gap.

**Fix:** a third card added to the Dashboard myjobs "Jobs you've posted"
list, representing a closed job whose unfilled slots were refunded —
gated on a demo `refunded` flag, same "real-app-confirmed feature just
needs shell-demoing" pattern Section 19 used for the WithdrawPanel refund
kind.

- `HiveworkApp.jsx`: new `DASH_CLOSED_JOB` demo constant, third
  `.job-post-row` rendered conditionally on `DASH_CLOSED_JOB.refunded`.
- `hivework-app-v4-3.html`: mirrors the JSX — `HW_DASH_CLOSED_JOB`
  constant, static `#dash-closed-job-row` block (hidden by default),
  populated by new `renderDashClosedJob()`, wired into the same dashboard
  init call as `renderRefundPanel()`/`renderDashRefundHistory()`.
- Both shells: new `.status-pill.closed` pill + `.jp-refund-badge`
  (violet-bordered mono pill) CSS, reusing existing
  `--violet-deep`/`--cream`/`--ink-soft` tokens — no new colors, same
  design-system rule as every prior screen.

**Verification:** brace/paren/bracket-balance re-checked on
`HiveworkApp.jsx` (net-zero); `hivework-app-v4-3.html`'s inline
`<script>` re-extracted and passed `node --check`. No headless-browser
run — standing sandbox limitation (no network access to install one).

**Status:** no other actionable shell-demo gaps currently tracked.
Remaining items are standing/deferred: KYC/testnet badge wiring (deferred
until KYC is actually implemented), Pi Browser real-presence detection
(standing gap, Section 8/17), full backend pagination for History lists
(data-source gap, per Section 20).

## 22. Large structural sweep (2026-08-12) — findings reclassified against the
##     roadmap's own "old code informs facts, never dictates UX" rule

**Trigger:** user flagged the JobCard refund badge gap, which prompted a
full sweep of `frontend/src` (real component/page inventory + `App.tsx`
routing) rather than another one-off screen check. Files read in full:
`ApplicationCard.tsx`, `Home.tsx`, `lib/RoutePersistence.tsx`,
`Layout.tsx`.

**Self-correction, same session:** the first pass of this sweep framed
one finding — the shell's single sticky segmented-pill nav (`segnav`)
vs. the real app's top-header-plus-bottom-tab-bar layout — as a
"structural mismatch" to fix. User caught this against the roadmap's own
opening rule before any work started. Re-sorted findings below into what
old code legitimately informs (routing/data-shape/business-logic facts)
vs. what would have been old code dictating UX (container shape,
nav-chrome layout). The nav-shape framing is dropped entirely — `segnav`
already covers all 4 real destinations functionally, and how it's
containered is a design-system call, not something old layout should
override.

**Legitimate facts surfaced (routing/data-shape/business-logic — fair
game per the roadmap's own rule):**
- `ApplicationCard.tsx` is a single shared component (Dashboard summary
  + `HistoryWork.tsx` both use it, "so the two can't visually drift") and
  the **whole card is clickable**, navigating to `/jobs/:id`. This is a
  routing fact: a real, reachable path from work history into Job Detail
  exists that the shell's `HistoryRow` currently has no equivalent for
  (`HistoryRow` has no click handler at all, for any of the 3 History
  screens). Badge logic: green (approved/completed), red (rejected),
  purple (else), plus a separate "Paid" badge — no separate earnings
  ledger for workers; a completed application *is* the payment record.
- `Home.tsx` has **no auth branch** — one component, identical content
  whether connected or not. That's a routing/structure fact undercutting
  the shell's invented Landing-vs-Home split (no `Landing.tsx` exists in
  the real app at all).
- `Home.tsx`'s content set is a fact, not a style: a "Sentinel Trust
  Layer" trust-badge concept, a stat row (live open-job count from
  `/api/jobs/stats`, platform fee %, category count), a Categories list
  with live per-category counts, and a 3-step "How it works" explainer.
  None of this exists anywhere in the shell today — the shell's "Home"
  screen (personalized earnings hero, "Welcome back, Olawalt") has no
  real counterpart; it reads closer to what Dashboard should show.
- Nav destinations + auth-gating is business logic: 4 primary
  destinations (Home/Jobs/Post/Dashboard), Post Job + Dashboard + the
  notification bell hidden when not connected, logged-out state shows
  plain text ("Open in Pi Browser"), not a CTA button.
- A persistent, non-profile-menu support access point is a deliberate
  fix for a real reported issue (`Layout.tsx`'s footer link, tagged
  BUG-106: "several error messages elsewhere tell people to 'contact
  support' but there was previously no way to actually do that anywhere
  in the app"). That the *need* is real is a fact worth knowing — the
  shell's session 15/16 decision to revert its own footer link (reasoning
  the profile-menu already gave global coverage) was made without this
  context and is now worth reconsidering. How any such access point looks
  is still entirely our call.
- `lib/RoutePersistence.tsx` — pure technical behavior (Pi Browser
  refreshes reload to `/`, so the last in-app route is restored from
  localStorage, gated to Pi Browser only). No visual component, no UX
  implication either way — logged here so a future screen involving
  reload/deep-link state doesn't get designed in ignorance of it.

**Dropped (would have been old code dictating UX):**
- Reshaping the shell's nav container to mirror the real app's literal
  top-header + bottom-tab-bar split. `segnav` already reaches every real
  destination; container shape is a design-system decision.

**Status:** item 1 closed 2026-08-13 — see Section 23. Item 2 closed
2026-08-13 — see Section 28. Item 3 closed 2026-08-14 — see Section 29.
All three items from this sweep are now done.

Neither is gated behind KYC or real auth — pure visual/UX-design screens,
buildable now the same way every other screen in the shell already is
(demo data, no real backend/auth wiring required). The only state to
account for is the existing connected/not-connected toggle, using the
shell's existing demo-state convention (same pattern as the Wallet
Connect flow's demo links) — not a hard gate on doing the work.

## 23. History → Job Detail click-through (2026-08-13)

**Closes Section 22 "Next" item 1.** Scope confirmed before building:
pulled `HistoryJobs.tsx`, `HistoryWork.tsx`, `JobCard.tsx` (not yet seen
in full) — `HistoryJobs.tsx` renders via `JobCard`, same pattern as
`HistoryWork.tsx`/`ApplicationCard`, and `JobCard.tsx` navigates to
`/jobs/${job.id}` on click exactly like `ApplicationCard.tsx`. Fix covers
both History → Work and History → Jobs; History → Withdrawals untouched
(own `WithdrawalRow` component, a withdrawal is a payment record, not a
job — no real click-through fact applies there).

**Demo-data-set ceiling, not a shipped limitation:** both shells' Job
Detail screens are backed by a fixed 3-entry demo set (`mine`/
`translate`/`bug`), not real IDs, so only rows with a matching demo job
could be wired: History → Jobs' "Test payment flow on Android"/"Localize
onboarding copy" rows (identical titles to the demo jobs) → `mine`/
`translate`; History → Work's "Test flow on hivework multi worker job
post" (closest thematic match) → `bug`. Remaining rows in both lists have
no matching demo job and stay non-clickable for now — every row would be
clickable against a real backend/IDs. Also wired the Dashboard "Your
work" preview's matching row in both shells, since the real
`ApplicationCard.tsx` is confirmed shared by Dashboard summary and
`HistoryWork.tsx` with the same clickable behavior in both places.

**Back-navigation needed no changes:** both shells' `goBack()` already
returns to `lastScreen`, tracked generically before every screen switch,
and Job Detail's back button already calls `goBack()` — opening Job
Detail from a History screen already returns to that screen.

**`HiveworkApp.jsx`:** `jobKey` added to the two matching `WORK_HISTORY`/
`JOBS_HISTORY` rows. `HistoryRow` takes an optional `onClick`;
`HistoryList` takes an optional `onRowClick`, wiring a row's click
handler only when both `onRowClick` and `row.jobKey` are present. Both
History screens pass `onRowClick={openDetail}`; Withdrawals untouched
(custom `renderRow`). Dashboard's "Your work" preview wired the same way.
`.hw-app .hist-row.clickable{cursor:pointer;}` added — matches the
shell's existing minimal clickable-row convention (`.rec-item`,
`.ticket`), no added hover/elevation.

**`hivework-app-v4-3.html`:** mirrors the JSX. `jobKey` added to the same
two `HW_WORK_HISTORY`/`HW_JOBS_HISTORY` rows. `renderHistList()` takes an
optional `onRowClickFn` (function-name string, since rows render as
`onclick="..."` HTML strings), adding the `clickable` class + `onclick`
only when a row has `jobKey`. Both History screens pass `'openDetail'`;
Withdrawals untouched. Static Dashboard "Your work" preview row matching
`bug` got `class="hist-row clickable" onclick="openDetail('bug')"` added
directly — `.clickable` as a class name already matches this file's
existing convention (`notif-row unread clickable`).
`.hist-row.clickable{cursor:pointer;}` added to the CSS block.

**Verification:** brace/paren/bracket-balance check (Python, net-zero) on
`HiveworkApp.jsx`; `hivework-app-v4-3.html`'s inline `<script>` extracted
and passed `node --check`. No headless-browser run — standing sandbox
limitation (no network access to install one).

**Follow-up, same session — closed/completed Job Detail rendering:**
user asked directly whether the demo-data-set limit meant closed jobs
have no detail screen at all. Answer: no, `/jobs/:id` is the same real
route regardless of status — pulled the real `JobDetail.tsx` to confirm
closed/completed is the same page with sections conditionally hidden/
shown by `job.status`, not a separate screen. Found both shells'
Owner-view simulations already let you interactively resolve a job live
(close all slots, complete, rate) — the real gap was a hardcoded
`"in progress"` header label that never reflected that resolved state,
plus `JobDetailWorker`'s existing `state`/stage-pipeline (`completed_
rated` already modeled, stage 4/paid) being force-started at `"ready"`
every time. Fixed both: header status is now derived from actual slot
counts (`isFullyClosed`) instead of hardcoded; Worker Job Detail now
takes `job.state` instead of always `"ready"`. Added per-job override
support (`initialApplicants`/`initialSlots`/`initialClosedCount`/
`totalSlots`) to `JobDetailOwner`, falling back to the existing globals
for `mine`/`translate`/`bug` — no change to those three. Added two new
demo jobs: `closedJob` (3 completed+rated, 2 refunded-closed, 0 open →
header now reads "closed") and `completedWork` (`state:
"completed_rated"` → renders existing SETTLED paid-strip + rating-given
panel on mount). Remapped every remaining unmapped History row to one of
these — History → Jobs' 3 closed rows → `closedJob`; History → Work's 5
remaining completed rows → `completedWork`. Every History row now clicks
through to something real; verified via a Node `vm`-sandboxed DOM stub
actually executing both shells' render functions for all 5 demo jobs
with no exceptions, confirming `closedJob` renders "closed" while `mine`
still renders "in progress" unaffected, and `completedWork` renders the
paid strip and rating-given panel.

## 24. History → Job Detail follow-up: two bugs found on user testing (2026-08-13)

User tested Section 23's click-through fix directly and found it was
incomplete: closed/completed jobs were still opening the "in progress"
Job Detail screen (client view, both shells), and the worker view's
completed job wasn't clickable at all in the HTML shell. Root cause was
**not** the `openDetail()`/`JOB_DATA` override mechanism added in Section
23 — that mechanism itself works correctly (verified by re-running the
DOM-stub simulation, including the `mine` → `closedJob` sequence, which
still renders "closed" correctly). The bugs were in surfaces that Section
23 didn't touch:

**Bug A (both shells) — Dashboard's separate "closed job" refund-demo
preview.** `DASH_CLOSED_JOB`/`HW_DASH_CLOSED_JOB` is an older, unrelated
demo card (`"Beta test iOS build"`, refunded) used to show the refund
badge on the client Dashboard's "Jobs you've posted" panel. Its "View
details →" button was hardcoded to `openDetail("mine")`/
`openDetail('mine')` — a leftover from before `closedJob` existed in
`JOB_DATA`/`jobData` — so clicking it always opened the in-progress
`mine` job. Fixed in both shells to open `closedJob` instead. Title
still reads "Beta test iOS build" (a different demo entry than
`closedJob`'s "This is a test job") — same closest-available-match
convention already used elsewhere in Section 23, not a full data
reconciliation.

**Bug B (HTML only) — Dashboard's "Your work" preview second row was
static, unwired markup.** `HiveworkApp.jsx`'s equivalent preview maps
live over `WORK_HISTORY.slice(0, 2)`, so it's automatically
clickable via `jobKey` — this is why the JSX worker view already
worked correctly. `hivework-app-v4-3.html`'s preview is hardcoded HTML;
Section 23 only added the `clickable` class/`onclick` to the first row
(`bug`), never the second (title-matches `completedWork`). Added
`class="hist-row clickable" onclick="openDetail('completedWork')"` to
that row, mirroring the JSX behavior.

**Verification:** JSX — brace/paren/bracket balance (net-zero). HTML —
`node --check` on the extracted script, plus a `vm`-free Node DOM stub
actually calling `openDetail('closedJob')`, `openDetail('mine')` →
`openDetail('closedJob')` (sequence check), and `openDetail('completedWork')`,
confirming the rendered HTML shows "closed" (not "in progress") and a
paid/settled marker respectively.

**Files touched:** `HiveworkApp.jsx`, `hivework-app-v4-3.html`,
`roadmap.md`, `session-22.md`.

## 25. Owner-view "completed" vs "closed" split (2026-08-13)

User asked directly what "closed" actually means when a multi-slot job
has a mix of completed and refunded slots — Section 23/24's
`isFullyClosed` derivation collapsed both "all slots completed" and
"some slots refunded" into one "closed" label. Also raised a real
underlying fact: not every job is multi-slot — the real `PostJob.tsx`
supports single-worker jobs (`worker_slots:1`, Section 9), where the
completed/closed distinction matters most since there's no partial-mix
nuance to obscure.

**Decision:** split the owner-view header into three states instead of
two:
- **`completed`** — every slot finished and was rated, zero refunded.
- **`closed`** — at least one slot was refunded/closed unfilled, even
  if other slots also completed (a mixed or all-refunded outcome —
  matches `closedJob`'s existing 3-completed/2-refunded demo data,
  which still correctly renders "closed" under the new logic, not
  "completed").
- **`in progress`** — unchanged.

New `.status-chip.completed` CSS added in both shells (mint/success
palette, matching the existing `--mint`/`.status-pill.open` success
color already used elsewhere — not a new color introduced).

**New demo job — `completedJob`, both shells:** single-worker (`totalSlots:
1`), one slot, `status:'completed'`, `initialClosedCount:0` — deliberately
single-slot rather than reusing a multi-slot pattern, since that's the
case the completed/closed distinction matters most for. Wired to the
existing "Usability pass on Post Job wizard" History → Jobs row
(previously mapped to `closedJob`, now correctly reflects its own
sub-label of "completed" rather than "completed · closed").

**Verification:** JSX — brace/paren/bracket balance (net-zero), plus a
standalone Node check of the derivation logic covering all four cases
(empty/in-progress, closed with mixed outcome, pure completed,
in-progress with a completed slot present). HTML — `node --check` on
the extracted script, plus a DOM-stub run of `openDetail('mine')` →
`openDetail('closedJob')` → `openDetail('completedJob')` →
`openDetail('mine')` → `openDetail('completedJob')` (switch-sequence
check), confirming each renders the correct one of the three header
labels with no stale-state carryover.

**Files touched:** `HiveworkApp.jsx`, `hivework-app-v4-3.html`,
`roadmap.md`, `session-22.md` (this closes out the same session's
follow-up thread, not a new session).

## 26. Home & Browse categories, rebuilt from scratch (2026-08-13)

**Context:** a prior chat session (not part of this roadmap's session-brief
sequence — recovered from a shared chat export) had scoped and partially
built this same work — Browse's category grid extended from 3 to 7, plus
a Home categories teaser — but the session was cut off mid-edit and never
synced back to Termux. The uploaded `HiveworkApp.jsx`/`hivework-app-v4-3.html`
at the start of this session still had none of it (confirmed by direct
inspection, not assumed). Rebuilt from scratch this session rather than
resumed.

**Scope carried over from that prior session's agreement (re-confirmed
before building, per this roadmap's standing rule):** fix Browse first so
all 7 categories are represented, then give Home a curated top-3 category
teaser linking into Browse — Home should not duplicate Browse's own list.
Browse keeps its original pastel-tile grid look (not the alternate
row-list style that prior session had also explored) extended to fit 7
tiles; Home's teaser uses a row-list (icon circle, label, live count,
chevron).

**Browse, both shells:** the original 3-tile layout hardcoded one
"featured" wide tile for the 3rd item — dropped, since that doesn't
generalize to 7. Now a uniform 2-col grid of all 7 `CATEGORY_OPTIONS`,
cycling the existing pastel palette (plus two additions in the same
family) instead of one-off per-tile colors, with the SVG line-icons
already built for Post Job's category picker swapping in for the old
emoji.

**Home, both shells:** new "Categories" section after "Recommended for
you" — top 3 categories by demo open-job count as a row list, ending in
a "+4 more categories" ghost row into Browse. Demo per-category open-job
counts (`CATEGORY_COUNTS` in JSX) were invented for this pass — only
bug-testing/translation/ui-ux-feedback had any count before (carried over
from the old 3-tile data); usability-testing, content-review,
survey-data-collection, and localization-testing are new invented values,
not sourced from anything real.

**Bug found and fixed, both shells — invisible category icons:** the
shared `CATEGORY_OPTIONS` SVGs carry no `stroke` color of their own; they
only render visibly in Post Job's picker because of a `.cat-opt svg{stroke:
var(--ink-soft)}` rule scoped to that component. The new Browse tiles and
Home category rows had no equivalent rule, so the icons rendered
invisible (empty violet-tinted circles / blank tile icons) — not a missing
feature, a missing CSS line. Fixed with explicit `stroke` on `.tile
.t-icon svg` (`var(--ink)`) and `.cat-icon svg` (`var(--violet-deep)`).

**Category filtering, both shells (new — not part of the recovered prior
session's work):** Browse tiles are now clickable and toggle a selected
state (violet inset border), filtering the "Open now" list to that
category; clicking the same tile again, or a "Clear ✕" next to the section
title, resets to showing everything. Home's category rows and the ghost
row now navigate into Browse with that category pre-selected (or cleared,
for "more categories") instead of just landing on an unfiltered Browse.
Only `bug` has a real demo job to filter to today — same demo-data
ceiling as History's click-through work (Section 21/23) — so every other
category correctly renders a "No open jobs in this category yet" empty
state rather than nothing, by design.

**Verification:** JSX — brace/paren/bracket balance (net-zero). HTML —
`node --check` on the extracted script, plus a Node DOM stub actually
calling `renderBrowseOpenNow()`/`toggleBrowseCategory()` through a
selection → different-selection → deselection sequence, confirming: the
default state shows the one real open job, selecting a category updates
the title and highlights the right tile only, an unmatched category
correctly shows the empty state, and toggling off returns to the default
unfiltered view with the clear button hidden again. No headless browser —
same standing sandbox limitation as every prior session.

**Files touched:** `HiveworkApp.jsx`, `hivework-app-v4-3.html`,
`roadmap.md`, `session-23.md` (new).

**Status:** Section 22 item 2 (Home's real content set) is now partially
done — categories are live; trust-badge pill, 3-stat row, and "How it
works" are still missing from Home. Section 22 item 3 (support access
point) is untouched. See "Next session" in `session-23.md`.

## 27. Home content completed — trust badge, stat row, Help screen, submission composer (2026-08-13)

**Context:** picked up Section 22 item 2's remaining pieces. Swept the
real `Home.tsx` first per standing rule — found all three missing pieces
(trust badge, 3-stat row, "How it works") already exist there verbatim,
resolving the open scoping question from session 23. Also found a real
discrepancy: `Home.tsx`'s own `CATEGORY_OPTIONS`-equivalent list only has
3 categories (bug-testing, translation, ui-feedback) — it never got
updated when the redesign expanded categories 3→7 (confirmed via
`grep -rln CATEGORY_OPTIONS`, which only matches `Home.tsx`, `Jobs.tsx`,
`PostJob.tsx` — the 7-category system is a real redesign addition, not
invented, but `Home.tsx` itself is stale relative to it). Decision: kept
the session-23 top-3-teaser as-is rather than shrinking to match Home's
stale 3-item list, since the 7-category system is the more current fact.

**Overkill check before building (user-requested), both shells:** ran
targeted greps against the real app before writing anything —
- Categories → filtered Browse: not new, real `Home.tsx` already does
  `navigate('/jobs?category=slug')`. Extends an existing pattern.
- "How it works": zero matches anywhere else in the real app. Home-only,
  safe to port.
- Trust badge ("Sentinel"): appears in both `Home.tsx` and `JobDetail.tsx`
  — but different claims (Home: platform-wide "Powered by Sentinel Trust
  Layer" pill; JobDetail: job-scoped "Client wallet verified by Sentinel"
  banner). Confirmed as a family of related-but-distinct indicators, not
  duplication — safe to build independently.

**Design-system reuse (further overkill reduction):** rather than
inventing new CSS, found the Landing screen already has design-system
versions of all three Home needs — `.eyebrow`/`.eyebrow-dot` (trust
badge), `.trust-row`/`.trust-item` (stat row), `.flow`/`.flow-steps`/
`.flow-step` (how-it-works, same 3-step copy verbatim). Home's new
`.hw-*`-prefixed classes (`hw-eyebrow`, `hw-trust-row`, `hw-help-*`) are
compact/stacked re-implementations of that same visual language scoped
to `.hw-app` (Landing's originals are scoped to `.hivework-landing` —
shared design tokens, separate component scope, same convention as the
rest of the shell).

**Home scope decision:** rather than stacking all three educational
sections onto Home (which already carries hero-block, active ticket,
recommended job, and categories), Home gets only the trust badge + stat
row directly, plus one link row ("❔ How it works, submissions & FAQ →")
into a new dedicated **Help** screen — reached the same way Profile/
History are (drill-in from Home only, not in segnav). Keeps Home lean
for a returning user while still surfacing the content.

**Help screen, both shells:** three sections — "How it works" (Landing's
3-step copy, compact stacked layout), "Submitting valid proof of work"
(explanatory guide to the new composer's 4 parts, see below), and an
FAQ (4 entries — flagged to the user as invented placeholder content,
same convention as `CATEGORY_COUNTS`, since nothing equivalent exists in
the real app).

**Submission structure, both shells — new standard proof-of-work
composer:** user asked directly for a standard way to submit valid proof
of work. Swept the real `JobDetail.tsx` first — confirmed the actual API
(`/api/jobs/:id/submit-work`) only ever accepts one field, `submission`
(plain string); no structured-report endpoint, no attachment endpoint.
Replaced the worker Job Detail's single generic textarea (placeholder
tried to cover bug/translation/feedback jobs in one sentence) with a
templated composer that stays inside that real constraint:
- **What was done** — required, all job types.
- **Evidence** — required, placeholder varies by job type (bug: repro
  steps; translation: before/after text; feedback: reviewed verdict),
  classified from the job's free-text `cat` label via `getSubmissionKind()`
  since neither shell's demo data has a category slug field on job
  objects (only Browse/Post Job's `CATEGORY_OPTIONS` do).
- **Environment** — bug-testing jobs only (device/OS/browser).
- **Notes** — optional, all job types.

All 4 fields concatenate into one `###`-headed string via
`composeSubmission()` on submit — no backend/schema change, just smarter
client-side composition of the same real field. Submit button now gates
on "What was done" + "Evidence" both non-empty (`canSubmitWork()`)
instead of the old single-field non-empty check.

**Bug found and fixed along the way, JSX only:** the `job` object built
for `JobDetailWorker` at the job-detail routing site was missing a `cat`
field entirely (only had `eyebrow`, which embeds `cat` as a substring
but isn't parseable back out) — would have made `getSubmissionKind()`
silently receive `undefined` and always fall through to the generic
`feedback` kind, even for bug-testing jobs. Fixed by passing `cat: job.cat`
into the constructed object alongside the existing fields.

**Attachments block, both shells:** kept visually (per the existing
shell convention of showing intended future state) but relabeled
"Coming soon" and disabled, rather than looking like a working upload
feature backed by nothing — same honesty-over-polish call as other
placeholder content in this project.

**Verification:** JSX — brace/paren/bracket balance (net-zero) after
every edit. HTML — `node --check` on the extracted inline script. Both
— a standalone Node logic test of `getSubmissionKind()`/
`composeSubmission()`/`canSubmitWork()` across bug/translation/feedback
job kinds, confirming: Environment only appears for bug kind even when
filled for others, all-fields-present composes correctly with `###`
headers, and the submit gate correctly blocks when Evidence is empty.
No headless-browser DOM run this session (no `jsdom` available, no
network access to install it) — same standing sandbox limitation as
every prior session, but a first for not even having the Node-DOM-stub
option; logic-level testing substituted.

**Files touched:** `HiveworkApp.jsx`, `hivework-app-v4-3.html`,
`roadmap.md`, `session-24.md` (new).

**Status:** Section 22 item 2 (Home's real content set) is now fully
done. Section 22 item 3 (support access point placement outside the
profile menu) is still untouched — the only open item from that
original scope.

## 28. Home hero reconciliation — earnings hero → reputation, escrow ticket → activity ticker (2026-08-13)

**Context:** Section 27's "fully done" claim on Section 22 item 2 turned
out to be premature. Re-reading Section 22's original finding closely
surfaced a gap Section 27 never touched: real `Home.tsx` has no auth
branch (identical content whether connected or not), and the shell's
personalized hero (earnings total, active-ticket card) was flagged back
then as having no real counterpart — it "reads closer to what Dashboard
should show." Section 27 stacked the real content set (trust badge,
stat row, categories, Help link) directly under that unresolved
personalized hero without reconciling it. That reconciliation is what
this session closes.

**Decision, discussed with user:** the "no auth branch" fact is
structural information from the old code, not a UX mandate — per the
standing rule, it doesn't dictate stripping personalization. The actual
call was content-overlap with Dashboard, decided independently:
- **Earnings hero → reputation stat.** Dashboard shows *balance*
  (withdrawable, drops on withdrawal), not lifetime earned — so the old
  "Total earned 116π" never literally duplicated a Dashboard number.
  Still swapped out, on narrower grounds: it's a ledger/money metric by
  category, which is Dashboard's domain by convention regardless of the
  specific figure. Rating + jobs-completed is identity, not money —
  genuinely Home's territory. Data already existed in the old hero's
  subtext, just promoted to the headline.
- **Escrow-locked ticket → live activity ticker.** The single ticket
  showed the user's *own* job status — a straight duplicate of an item
  from Dashboard's active-jobs list. Rather than dropping the ticket
  visual (the design system's signature element) entirely, reused the
  same ticket shape to show anonymized, platform-wide recent activity
  instead — proof for the Sentinel trust badge sitting above it, not a
  personal-status duplicate. Auto-advancing carousel (3 slides, 4s
  interval), swipeable via pointer drag, dot indicators, pauses while
  dragging, disables both the auto-advance interval and the live-dot
  pulse animation under `prefers-reduced-motion`.

**Data collision caught before shipping:** first draft of the ticker's
lead slide reused "Localize onboarding copy / Translation / 6π" —
identical to the "Recommended for you" item directly below it on the
same screen. Caught on a rendered screenshot check, not just a code
read; swapped to a distinct demo job (Content review / "Product FAQ
copy pass" / 5π).

**Self-caught regression:** a `sed` pass used to temporarily boot the
HTML shell to `home` for a screenshot check used too broad a match and
also silently rewrote `routeAfterOnboarding()`'s unrelated `else`
fallback from `showScreen('home')` to `showScreen('landing')`. Caught by
re-grepping for the target string after the sed ran, before treating the
task as done; reverted, boot screen restored to real `landing` default
per Section 26/27's established boot-route convention.

**Flagged as demo data, both shells:** `ACTIVITY_TICKER`'s three entries
are placeholder content, same convention as `CATEGORY_COUNTS` — no real
"recent activity feed" endpoint has been confirmed to exist in the real
app. Worth a Termux sweep before treating this as more than shell demo
content.

**Left undecided, intentionally:** whether ticker slides should deep-
link anywhere. Original build (HTML shell) briefly wired the first two
slides to `openDetail()`, which was inconsistent with the JSX shell
(no click-through) and conceptually shaky besides — anonymized platform
activity isn't naturally "yours" to click into. Removed rather than
guessed; both shells currently render the ticker as informational-only.

**Verification:** JSX and HTML both brace/paren/bracket-balance
(net-zero) after every edit. Rendered the HTML shell with Playwright
(local `file://`, no network needed) and screenshotted Home directly to
catch the content-collision bug above — first session this project has
had an actual visual render check rather than code-only verification.

**Files touched:** `HiveworkApp.jsx`, `hivework-app-v4-3.html`,
`roadmap.md`.

**Status:** Section 22 item 2 is now genuinely fully done — hero and
ticket both reconciled against Dashboard, not just content-added-on-top.
Section 22 item 3 (support access point) remains the only open item.

## 29. Persistent support access point — Section 22 item 3 closed (2026-08-14)

**Sweep, per standing rule:** user pulled `frontend/src/components/Layout.tsx`
directly via Termux and pasted it in, rather than working from Section
17/22's secondhand notes. Full file read. Confirmed facts:
- The `BUG-106` footer sits between `<main>` and the bottom tab nav — its
  own row, not inside either — and **always renders, no `connected`
  gate**, unlike Post/Dashboard/Bell which do hide when logged out.
- Deliberately minimal styling: 11px, muted color, centered, "Need help?
  Contact support" as plain text-into-link, not a button or icon.
- It's the *only* real clickable support entry point in the app — a
  second grep (`grep -rn "contact.support\|BUG-106\|support@\|help@"
  frontend/src/`) turned up five other "contact support" mentions
  (`WithdrawPanel.tsx`, `JobDetail.tsx` ×2, `PostJob.tsx`,
  `HistoryWithdrawals.tsx`), all inline error-state text with no link at
  all.
- Layout.tsx wraps **every** route via `<Outlet/>` — so the footer shows
  on all real pages, not a subset.

**Correction (2026-08-14, user-caught):** the paragraph above originally
argued the footer wasn't redundant with the shell's profile-menu entry
because that entry "has no real counterpart" and is a pure shell
invention — so keeping both wasn't duplicating one real thing twice.
That's true but doesn't actually settle redundancy *within the shell*:
"not copying real code twice" and "serves a different user need" are
different claims, and only the second one matters for whether keeping
both is good UX. Checked directly: the shell's binary connected model
(landing vs. fully-logged-in, no partial browsing-while-disconnected
state — Section 17 Part A) means the profile menu is reachable in every
situation the footer is. They point at the identical modal in identical
circumstances — functionally redundant, full stop. **Decision: left
both in place anyway (not resolved on discoverability grounds — just
not forced to choose by this fact).** Real app itself only has one
access point (no dropdown exists there at all), so this redundancy is
purely a shell artifact, worth revisiting if either surfaces as
actual clutter later.

**Design decision:** rather than tie visibility to `segnav`'s 4
MAIN_SCREENS (which intentionally hides on drill-in screens like Job
Detail/History/Profile/Help), matched the real `<Outlet/>` scope instead
— visible on all 10 in-app screens. In both shells this needed **no
JS/state toggle at all**: the strip is a single static element placed
once, inside the same container (`.frame` / the `.hw-app` conditional
branch) that's already hidden during the fullpage flows (landing/
welcome/onboarding) and shown for every real screen — it rides along
with whichever screen is active for free, the same mechanism `segnav`
uses but without needing its own `mainScreens.includes(id)` check.
Reused the existing centered contact-support modal (session 17/18) via
`openContactModal()` (HTML) / `setContactModalOpen(true)` (JSX) rather
than forking a new instance.

**Built, both shells:** `.help-strip` — centered, 11.5px, `var(--ink-soft)`,
top border in `var(--line)`, "Contact support" in `var(--violet-deep)`
700-weight matching the existing link-color convention (e.g. `.see-all`).
Placed after the last screen block, before the shell's closing container
tags.

**Verified:** Playwright screenshots (local `file://`) on Home (main
tab) and Help (drill-in screen) confirm the strip renders on both;
confirmed absent on the landing page (`.help-strip` in DOM but
`is_visible() === False`); clicked through and confirmed the modal opens
correctly from the new entry point. Diffed the full `showScreen('...')`
call list against the pre-edit file (sorted, `diff`) to positively rule
out a repeat of Section 28's `sed` regression. JSX brace/paren/bracket
net-zero after edit.

**Files touched:** `HiveworkApp.jsx`, `hivework-app-v4-3.html`,
`roadmap.md`, `session-26.md`.

**Status:** Section 22 item 3 closed. All three items from the Section
22 structural sweep (2026-08-12) are now fully done.

## 30. Patching-into-main-app phase — methodology and standing rules (2026-08-14)

Not started yet — this section is the guide for when it does. Everything
built so far has lived in two standalone demo files with no build
tooling, no real data, no real auth, no consequences if something broke.
Patching means editing real `~/Piwork/frontend/src/` components with
real routing, real API calls, and a real build — a different risk class,
and this section's rules exist because of that, not out of caution for
its own sake.

**Pre-flight, before this phase starts at all:** one more full sweep of
the real app, specifically for anything not yet gated behind KYC/auth —
i.e. any real screen/feature this project hasn't found or designed for
yet. Everything covered so far was buildable without a KYC/auth gate
(Section 22's own closing note); this sweep checks whether that's still
the complete set, not just the covered set. To be done in a fresh chat,
before the first patch.

**Pilot screen selection:** not every "done" screen is equally safe to
start with. Screens explicitly logged as *reconciled with real code*
(skeleton/routing/logic already match, only visuals differ — Post Job
Section 9, real `/onboarding` Profile Complete Section 10, Job Detail
worker view Section 11, Job Detail owner view diff-confirmed identical)
are the low-risk case: swap styling onto an unchanged structure. Screens
that are pure shell inventions with no 1:1 real counterpart — Landing
(no `Landing.tsx` exists; `Home.tsx` has no auth branch at all, Section
22), the Wallet-Connect flow (Section 3), the profile-menu (Section 8)
— are NOT safe pilots: patching those means adding real logic that
never existed, a product decision, not a restyle. Save those for after
the workflow is proven on a reconciled screen.

**Sweep checklist, per screen, before any patch (not grep — full reads):**
1. The real component in full — every hook, every conditional branch,
   every prop from `Outlet`/route params.
2. Data dependencies — what it actually fetches (`apiFetch` calls,
   `usePiConnection`, etc.) vs. what the shell fakes with a demo
   constant. Every demo constant (`CATEGORY_COUNTS`, `ACTIVITY_TICKER`,
   `DASH_CLOSED_JOB`, etc.) needs an explicit decision on patch: wire to
   the real call, or leave a flagged stopgap — never silently left in
   as if it were real.
3. Styling mechanism in the real repo for that file — global
   stylesheet/theme vs. inline styles (`Layout.tsx`'s pattern) —
   determines how the patch is even applied.
4. Shared dependencies the screen pulls in (`ContactSupport`,
   `NotificationBell`) that also need patched form, or knowingly stay
   old-style until their own turn.
5. Existing tests that'll break or need updating.
6. Real build/lint/test commands (`package.json` scripts) — verification
   target shifts from brace/paren/bracket balance to the actual toolchain.
7. Sort findings the same way Section 22 already does: facts we must
   preserve (data shape, routing, business logic) vs. what we're free to
   restyle.

**Branch discipline (revised 2026-09-03, Session 36):** the original
blanket rule here was "work on a feature branch, never `main`." In
practice, every patch session since 34 pushed straight to `main` and
that's what deployed each time — the written rule and actual practice
had diverged. Corrected policy: **branch only for genuinely new/risky
patterns** (a new UI pattern, something that touches every page,
payment/auth flow, or anything worth previewing before it's live);
**low-risk restyles of already-reconciled screens go straight to
`main`**, matching what's actually been happening. Also factored in: no
Vercel CLI access on this Termux setup (`npx vercel ls` → invalid
token), so branched work has no preview URL anyway — verification
always means merging to `main` first, so branching only pays off when
there's something to gain by delaying the merge.

**Push workflow change, from this phase on:** real patches to
`~/Piwork/frontend/src/` push to the Piwork repo only. The
`hivework-redesign` two-repo routine (top of this file) does NOT apply
to these edits — `hivework-redesign` is a public repo, and production
app code doesn't belong there. `hivework-redesign` keeps getting the
roadmap/session-brief/shell-file pushes exactly as before; it's only
real-app patches that are Piwork-only from here on.

**Status:** Pre-flight KYC/auth-gap sweep complete (session 27) — see
Section 31 for both findings. As of session 28, the account-
verification gate is fully designed and built (canonical + both
shells). As of session 29, `LEVEL_MAP` is also fully wired (Section
32) — Section 31 is closed and the first-patch pilot decision is
unblocked. Job Detail (worker view) is the standing pilot candidate.
As of session 30, the pilot is **done end to end**: sweep (Section 35)
→ patch built (Section 36) → `npm run build` clean → merged to `main`
→ verified live in Pi Browser against real auth and real data. The
patching-into-main-app workflow this section describes is now proven,
not just planned. Next screen to patch is an open decision, not yet
made.

## 31. Account verification gate — newly discovered, undesigned (2026-08-14)

*(Originally logged as "Wallet Verification" — see terminology
correction below; the wallet itself is not what's being gated.)*

Found during Section 30's pre-flight sweep, via full read of the real
`JobDetail.tsx` (not grep-only, per the sweep checklist). This is a real
gate in the live apply flow that has never appeared anywhere in this
project — not the screen inventory, not any session brief, not the
existing Job Detail canonical files.

**What it is:** before a worker can apply to a job, `JobDetail.tsx`
checks two account-level flags, in this order:
1. `hasWallet` — fetched from `/api/users/me/wallet-status` (account-
   wide, not job-specific, despite firing on every Job Detail mount for
   a non-owner)
2. `profileComplete` — the already-known gate, Section 3/Dashboard nudge

If `hasWallet === false`, a **"Verify Your Wallet"** card renders
*before* the profile-complete gate: a real 0.01π payment through the Pi
Wallet SDK (`handleVerifyWallet`), with its own loading state
("Confirm in Pi Wallet...") and an error state wired to
`ContactSupport` (`subject="Wallet verification issue (job ${id})"` —
a 6th real `ContactSupport` usage, not previously counted in Section
29's list of five). On success, a separate confirmed-state banner reads
"🛡️ Client wallet verified by Sentinel" earlier in the same file.

Both `hasWallet` and `profileComplete` start `null` (loading) and the
Apply button itself stays disabled until both resolve — so there's also
an undesigned loading state on top of the two gate states.

**Why this matters for Section 30:** Job Detail (worker view) was
named a low-risk *reconciled* pilot — skeleton/logic already matches,
only visuals differ. That assumption held for the profile-complete gate
already covered in Section 3. This finding means it does not fully
hold: the wallet-verify gate, its loading state, and its error state
are real logic this project has never designed a matching screen state
for. Job Detail is not disqualified as a pilot, but it can no longer be
treated as "just restyle a fully-known structure" — the wallet-verify
panel needs a design decision before that screen is patched, not
during.

**Not yet designed/decided:**
- Visual treatment for the Verify Your Wallet card (currently unstyled
  inline JSX in the real component, same as the rest of the file
  pre-redesign)
- Whether it's a state variant of the existing Job Detail canonical
  file/screen, or warrants its own screen file — leaning toward state
  variant, same file, since it's the same route and same component,
  just an earlier branch in the same conditional chain as the
  profile-complete gate already handled there
- The `verifying` "Confirm in Pi Wallet..." loading state
- The null/null double-loading state ahead of both gates

**Second finding, same sweep — `LEVEL_MAP` is a distinct, undesigned
element, not the same thing as the already-covered trust badge:**
confirmed by direct read of `Profile.tsx`. Two genuinely separate
fields render in two separate JSX blocks:
- `LEVEL_MAP[profile.level]` — pioneer/verified/expert/validator
  progression badge (gold text, directly under the username)
- `profile.trust_badge` + `TRUST_COLOR[profile.trust_tier]` — a
  separate element, explicitly commented `/* TrustScore badge */` in
  the real code — Gold/Silver/Bronze/Unverified

The roadmap's existing "trust badges" coverage (Job Detail owner view,
inventory table, ✅ Done) is the `TRUST_COLOR`/`trust_tier` system only.
`LEVEL_MAP` was mentioned exactly once, in Section 8 (2026-08-10), as a
throwaway phrase — "level/trust badge" — while sweeping `Profile.tsx`
for an unrelated question (whether a menu exists behind the avatar). It
was never revisited as its own design item. `LEVEL_MAP` also appears on
`Dashboard.tsx` (next to `@username`, same four values) — a second
real location, also undesigned. **Not yet built or decided anywhere in
this project**, distinct from Section 31's wallet-verify finding above.

**Also checked, confirmed clean:** `WithdrawPanel.tsx` read in full —
matches the roadmap's existing refund-kind design (Section 19/20) with
no gaps; `hasWallet`/wallet-verification confirmed scoped to
`JobDetail.tsx` only, doesn't touch Dashboard or Withdraw.

**Terminology correction (2026-08-14, same sweep):** confirmed via
`usePi.ts` that "wallet verification" was an imprecise label. A wallet
is already attached automatically during normal Pi login —
`usePiConnection()` fetches `walletAddress` straight from
`Pi.Wallet.getUserMigratedWalletAddresses()`, no gate, no payment. The
`hasWallet` flag checked in `JobDetail.tsx` comes from a wholly separate
backend call (`/api/users/me/wallet-status`) and means something
stricter — has this account completed the 0.01π verification payment.
More accurate framing: this is an **account-level anti-fraud/spam
gate**, not "wallet verification" in the SDK sense. The wallet is
already there; the payment is what's being gated.

**Also swept and confirmed clean, no further findings:** `api.ts`
(simple `sessionToken` from `localStorage`, sent as `x-session-token`
header — the pattern any Section 30 patch will need to replicate),
`support.ts` (already-known BUG-106 mailto→in-app story, fully
reflected elsewhere in this roadmap), `usePaginatedList.ts` (generic
cursor pagination, matches existing History-page understanding),
`ApplicationCard.tsx`/`JobCard.tsx` (full reads confirm existing
roadmap notes, no surprises).

**`RoutePersistence.tsx` — real navigation logic, not a screen, but
must survive Section 30 patching:** a Pi-Browser-specific workaround.
Pi Browser's webview does a genuine fresh reload on refresh and always
re-lands on `/`, losing in-app location. This hooks every navigation to
save the current path to `localStorage`, and restores it once on boot —
gated strictly to Pi Browser (`window.Pi` check), never fires in a
normal browser, and deliberately skips restoring `/onboarding` (a
transient, `returnTo`-keyed flow). Never appeared anywhere in this
roadmap before. No visual/design decision needed — it has no UI — but
it's real behavior Section 30 needs to know about and preserve, since
nothing about it is visible in any screen file.

**`incompletePayment` handling — checked, confirmed clean, not a
gap:** if Pi finds an unresolved payment from a previous session during
`Pi.authenticate()`, `Layout.tsx` fires a silent, best-effort cleanup
call (`/api/payments/incomplete`) once a session token exists —
explicitly commented as fire-and-forget, "not something the user should
be blocked on." No screen state is missing here; it's correctly
invisible by design.

**Sweep status: file-level pre-flight sweep complete for this
session.** Every file under `frontend/src` has now been read in full
(pages, all 6 non-page components, all 5 lib files) or confirmed
covered by an earlier full read. Two real, undesigned findings stand:
the anti-fraud wallet-verification gate (above) and the `LEVEL_MAP`
progression badge (above). Everything else checked is either already
reflected correctly in this roadmap or has no design surface (invisible
by design, or purely internal plumbing). Recommend treating this as the
completed pre-flight sweep referenced at the top of Section 30, pending
a final decision on how the two findings get designed before the first
patch.

**Update, 2026-08-14 (session 28) — reconciled, not fully undesigned
as originally logged.** The canonical `HiveworkJobDetailWorker.jsx`
already had `wallet_off`/`wallet_error` states (session 8) with
generic, non-Sentinel copy — session 27's "undesigned" framing was
correct that the real `hasWallet` gate was undocumented in the
roadmap, but didn't cross-check whether a canonical mockup file
already covered it. What was actually missing — a `verifying` loading
state and a success/confirmation transition — has now been built into
the canonical file and recompiled into both shells (`HiveworkApp.jsx`,
`hivework-app-v4-3.html`): a new `wallet_verified` state (mint
"Wallet verified" strip, reusing the `.paid-strip` visual convention
via new `.verified-strip`/`.verified-icon`/`.verified-text` classes)
and a `verifying` button state ("Confirm in Pi Wallet..."), sequenced
`verifying → wallet_verified → profile_off`.

**Standing decision, newly logged:** Sentinel is a separate security
project, to be integrated in the future. It is deliberately kept out
of this redesign's visual language — no Sentinel branding, icon, or
naming in any wallet-verification UI (this rules out the raw
"🛡️ Client wallet verified by Sentinel" banner text originally quoted
above; the real payment/API layer itself has no Sentinel reference —
`memo: 'Hivework wallet verification'`, `metadata.type:
'wallet_verification'` — so only display copy needed to stay generic).
This had been discussed before this session but never written down.

**Submission-composer drift — found mid-session, unrelated to the
wallet gate, now reconciled (2026-08-14).** While verifying the
wallet-gate edit hadn't regressed anything nearby, a second drift
surfaced: canonical `HiveworkJobDetailWorker.jsx`'s work-submission
(`'approved'`) case had gone stale relative to the shell — the reverse
of this project's normal drift direction (shell trails canonical,
except here the shell had a real feature the canonical file never
received). The shell (`HiveworkApp.jsx` / `hivework-app-v4-3.html`)
had already moved to a newer structured 4-field composer ("Section
27" per its own code comments): "What was done" / "Evidence" /
conditional "Environment" (bug jobs only) / optional "Notes", branched
via `getSubmissionKind()` (bug/translation/feedback classified from
the job's `cat` label) and composed into one string via
`composeSubmission()` before submit — the real
`/api/jobs/:id/submit-work` endpoint only ever accepts one plain-text
field, so the structure is UI-only. Attachments are explicitly tagged
"Coming soon" and disabled, rather than shown as a live-looking
mockup as the old single-field version did. Ported verbatim into the
canonical file (helper functions, the `'approved'` case, and the
component's `subWhat`/`subEvidence`/`subEnvironment`/`subNotes` state
+ derived `canSubmitWork`), diffed clean against the wallet-gate
version — nothing outside the intended scope moved, brace/paren/
bracket-balanced. Not yet re-recompiled into either shell (the shells
already have this composer natively — see below — so no shell change
is needed for this specific fix).

**Section 31 status: CLOSED (2026-08-14, session 29).** Both findings
now fully designed and built. The wallet-gate states live in the
canonical file and both shells (session 28). The `LEVEL_MAP`
progression badge (Profile + Dashboard) is now also fully wired — see
Section 32.

## 32. LEVEL_MAP progression badge — wired (2026-08-14, session 29)

Closes Section 31's remaining open item. Sweep-before-designing pull
(`grep -n -B 3 -A 15 "LEVEL_MAP"` against `Profile.tsx`/`Dashboard.tsx`)
confirmed the real system: one `LEVEL_MAP` (🥉 Pioneer / 🥈 Verified /
🥇 Expert / 💎 Validator, gold text) under `@username` on both screens,
bare text, no container.

**Precedent-matching find, same pattern as session 28's wallet-gate
discovery:** the shell already had undocumented chip infrastructure —
a hardcoded `chip-verified`/`chip-gold` pair in three spots
(`HiveworkApp.jsx` profile-menu, profile-edit cover, profile-view
cover; HTML shell confirmed at parity). "Verified" and "Gold" are real
`LEVEL_MAP`/`trust_tier` values, just hardcoded to one state each
instead of driven by the 4-state maps. Decision: wire it, don't
redesign it (user call). Dashboard had no identity header/card at all
— handled narrower than a full identity block, per user call: level
chip + earned total only, not a 1:1 port of the real card.

**Went through three passes before landing** (full iteration log in
`session-29.md`) — generic pastel pills + page-head corner tuck,
rejected; tiered chips (Pioneer outline / Validator dark-ink-gold
pulled from `.job-head`/`.amt`) + bordered strip, rejected on the
Dashboard treatment specifically (chip tier styling kept); final:
Dashboard's earned total reuses `.hero-block`/`.hero-num`/`.hero-sub`
verbatim — the same big-Sora-number/violet-π treatment Home's rating
stat uses since Section 28 moved the earned figure off Home — with the
level chip sitting quietly in `.hero-sub` underneath the number.

**Built, both files:**
- `LEVEL_CHIP_CLASS`/`LEVEL_LABEL` and `TRUST_CHIP_CLASS` maps
- CSS: `.chip-pioneer` (outline), `.chip-expert` (violet-tint, reused),
  `.chip-validator` (solid ink+gold), `.chip-silver`/`.chip-bronze`/
  `.chip-unverified` (alongside existing `.chip-verified`/`.chip-gold`)
- All 3 profile chip spots wired to real data instead of hardcoded text
- Dashboard: `.hero-block` reused directly (JSX: static markup; HTML
  shell: `PROFILE_DATA` object + `levelChipHtml()`/`trustChipHtml()`
  helpers populated at boot into `#dash-earned-num`/`#dash-level-chip`)
- No emoji in the chip treatment (real code's 🥉🥈🥇💎 prefixes
  dropped) — consistent with the SVG-icons-not-emoji convention from
  Post Job, Section 9

**Verification:** `HiveworkApp.jsx` braces 1869/1869, parens
1913/1913, brackets 217/217; `hivework-app-v4-3.html` 664/664 div
open/close, parses clean. No leftover class references from the two
superseded passes (corner block, bordered strip) in either file.

**Open flag, unresolved:** whether real `Dashboard.tsx`'s
`total_earned` is a top-level field on the same payload as
`level`/`trust_tier`, or a separate call — designed off session 28's
terminal pull (showed it inline), not re-verified this session. Worth
confirming via Termux before Dashboard specifically becomes a Section
30 patch target.

**Status:** Section 30's first-patch pilot decision is now fully
unblocked — both Section 31 findings are closed. Job Detail (worker
view) remains the standing pilot candidate.

**Follow-up, same day:** the standalone canonical *HTML* snapshot,
`hivework-job-detail-worker.html`, was also found stale on the same
submission-composer issue — it hadn't been included in the JSX
reconciliation above since it wasn't uploaded until later in the
session. It's a deliberate single-state snapshot (its own comment
confirms it only ever demonstrates the `'approved'` state — the
wallet-gate states were never meant to render there, so that scope
decision still stands), but the `'approved'` panel itself still had
the old single-field textarea and a live-looking two-item attachment
list with an upload progress bar. Reconciled to the same structured
4-field composer as the JSX (What was done / Evidence / optional Notes
— no Environment field, since this file's demo job is "UI Testing" /
Usability Testing, which classifies as "feedback" not "bug"; the
Environment field only shows for bug jobs). Attachments changed to the
static "Coming soon" disabled treatment matching the JSX. See
session-28.md.

## 33. Dashboard identity block — username, rating, final placement (2026-08-14, session 29 cont'd)

Follow-up to Section 32, same day. After Section 32 landed, user
flagged the Dashboard build still couldn't be called complete without
the username actually showing, and asked whether the chat file held
anything on star rating/tier badge — it didn't, directly, but the
question prompted a wider Termux sweep than Section 32's original
`LEVEL_MAP`-scoped grep.

**Wider sweep, real `Dashboard.tsx`:**
```
grep -n -B 5 -A 40 "LEVEL_MAP" pages/Dashboard.tsx
```
Confirmed two things Section 32 hadn't checked:
- The identity card is exactly `avatar + @username + LEVEL_MAP` (left)
  / `total_earned` (right) — **no `trust_tier` anywhere in it.** This
  settles Section 31's original open question in Dashboard's case
  specifically: the trust badge (Gold/Silver/Bronze/Unverified) is
  Profile-only, real code confirms it. Nothing needed there.
- A second, separate real element sits just below the card: a 3-pill
  stat row — `jobs_completed`, `rating` (⭐, one decimal), and
  `total_earned` again (duplicated from the card above, in the real
  app). Rating was not previously part of any Dashboard design in this
  project.

**Cross-check against Section 28:** Section 28 had moved rating +
jobs-completed onto Home's hero, reasoned as "identity, not money —
genuinely Home's territory," deliberately not Dashboard's. This sweep
doesn't overturn that reasoning as a design call, but it is worth
flagging as a technical fact per the roadmap's standing distinction:
the real app shows rating in both places, not exclusively on a
Home/Dashboard split. The redesign is allowed to differ from that (old
code doesn't dictate UX), and the resulting design here does still
differ from the real app on one point — see below.

**Built:**
- **Identity elements:** avatar (reused `.dash-id-avatar`, same 38px
  violet-gradient circle convention as `.app-avatar`/`.avatar-sm`
  elsewhere) + `@Olawalt` (Sora bold) + level chip, grouped as
  `.dash-id`.
- **Stat row:** two `.stat-pill` cards — Jobs done / Rating — reusing
  the exact elevated-card component already built for Profile's stat
  row (Section 9/step-6 era), same demo figures (17 / 4.3★) so numbers
  stay consistent across screens for the same demo user. **Deliberately
  left out a third "Earned" pill**, even though real `Dashboard.tsx`
  shows one there — it's already shown prominently in the hero-block
  directly above, and repeating it as a small pill underneath read as
  redundant rather than complete. Noted here as an intentional
  divergence from the real card's exact field count, not an oversight.

**Placement — iterated live with the user, three positions tried:**
1. Standalone row above the hero-block (avatar+username+chip on its
   own line, hero-block untouched below) — first build, functional but
   untested against the header.
2. Moved into the page-head itself, right-aligned against "Wallet &
   jobs / Dashboard." (`.dash-head` flex row) — user's direct request.
3. **Final:** moved again, this time to the right side of the
   hero-block's own row, sitting level with the "Total earned" figure
   rather than the page title (`.dash-hero` flex row: label+number on
   the left, avatar+username+chip on the right, vertically centered
   against the number). User confirmed this as the landed placement.
   Page-head reverted back to its original plain two-line form (no
   `.dash-head` split); that class and its CSS were fully removed
   rather than left dormant.

**Verification:** `HiveworkApp.jsx` braces 1875/1875, parens
1917/1917, brackets 217/217. `hivework-app-v4-3.html` 676/676 div
open/close, parses clean via `lxml`. Confirmed no leftover
`.dash-head` references in either file after the final move — grepped
clean.

**Files touched:** `HiveworkApp.jsx`, `hivework-app-v4-3.html`,
`roadmap.md`, `session-29.md` (updated).

**Status:** Dashboard's identity block is now complete against the
real card's fields (avatar, username, level) plus the adjacent rating
stat, with one documented, deliberate omission (no duplicate Earned
pill). Trust-tier badge confirmed correctly absent from Dashboard —
stays Profile-only. Nothing else changed on Dashboard; the page-head,
nudge banner, toggle row, `WithdrawPanel`, and history rows remain
untouched throughout this and Section 32.

## 34. Dashboard client-tab budget tracker — posted/refunded/net committed, jobs-posted count, tab-aware stat pill (2026-08-15, session 29 cont'd)

Prompted by a direct question: does the real Dashboard show posted/
refunded/active-escrow stats on the client (My Jobs) tab? It does —
never in scope for Sections 32/33, which only swept the identity card
and worker-side 3-pill row.

**Sweep, real `Dashboard.tsx`'s `ClientView`:**
```
cd ~/Piwork/frontend/src
cat pages/Dashboard.tsx
grep -n -i "posted\|refund\|escrow" pages/Dashboard.tsx
grep -rn "budget_tracker\|BudgetTracker\|total_posted\|total_refunded" .
```
Confirmed: `data.budget_tracker` (`total_posted`, `total_refunded`)
feeds a client-tab-only card, gated on `total_posted > 0 ||
total_refunded > 0`, with a third figure computed as `total_posted -
total_refunded`, labeled "active escrow" in real code. The wider grep
across `frontend/src` found no other consumer or definition of
`budget_tracker` — its computation lives in the backend, out of reach
of this sweep. Neither shell had any of this before this session.

**Label correction — "Active escrow" → "Net committed":** the real
math doesn't distinguish pi still locked on open jobs from pi already
paid out on finished ones — both just count as "not refunded," so
"active escrow" overstates precision the number doesn't have. Math
(`total_posted - total_refunded`) kept as-is — real code's own
computation, a technical fact. Label changed to "Net committed,"
accurate for both cases without implying everything's still pending.
Per the roadmap's standing rule, copy/labels are the redesign's call;
real code's own imprecise naming doesn't bind it.

**Built — escrow ticker card (`.dash-escrow-ticker`):**
- Dark ink card, JetBrains Mono figures — reuses the existing
  `.job-head`/`.amt`/`chip-validator` "money moment" idiom (the
  roadmap's own "escrow ticker" signature element) rather than the
  real card's plain generic `.card`.
- Net-committed figure gets a violet accent (`#B3A6FF`, lightened for
  contrast on ink) — violet already means "current/in-progress"
  elsewhere (`.ledger-dot.progress`); posted/refunded stay muted as
  historical totals.
- **Color check performed before building:** confirmed via a token
  grep that `#F4D584` (used in `.job-figures .amt`/`chip-validator`)
  isn't an actual defined CSS variable — a hardcoded repeat in exactly
  two spots, not part of the documented cream/ink/violet palette
  (`--cream`/`--ink`/`--violet`/`--mint`/`--coral`/`--butter`/`--line`/
  `--card`). Used `--violet` (a real token, already carrying the right
  semantic meaning) instead of extending an undocumented color a third
  time.
- Demo figures: 24π posted / 4π refunded / 20π net committed — derived
  from data already on screen (10π + 6π open job-post-rows + 8π
  `DASH_CLOSED_JOB`/`HW_DASH_CLOSED_JOB` = 24; 4π matches
  `refundedAmt`), not invented.
- Kept distinct from `refundBalance`/`REFUND_BALANCE` (2.4π,
  currently-withdrawable) vs. the tracker's `totalRefunded` (4π,
  lifetime) — real code keeps these as two separate fields; documented
  in code comments so they don't read as contradicting each other on
  the same tab.
- Placement matches real code: myjobs tab only, above "Jobs you've
  posted," below the refund panel/history when present.

**Gap found — no jobs-posted count anywhere in real code.** Worker
side has `jobs_completed` as an actual field (3-pill row above the tab
toggle); client side has nothing equivalent — real code renders the
job cards and expects manual counting. Confirmed via the same
`budget_tracker` grep (its only consumer, no count field in it). User
requested one anyway — a genuine addition, not a ported fact, same
category as Section 11's "Not selected" state.

**Built:** `"Jobs you've posted · 3"` in the section title, matching
the `Open now · ${category}` pattern already used on Browse — not a
new UI convention. Count derived as `2 + (closedJob.refunded ? 1 : 0)`
off the two static open rows + conditional closed row already
rendered, rather than a separate hardcoded number that could drift.

**User feedback — count wasn't visible enough.** It landed in the
section title, well below the fold from what's actually the first
thing visible on both tabs — the top `.dash-stat-row`, hardcoded to
always show "17 / Jobs done" + "4.3★ / Rating" regardless of
`workView`/tab.

**User's suggestion, adopted — tab-aware first stat-pill.** Three
options were discussed; only one built, the other two logged rather
than folded in silently:
1. **Built.** Swap the first pill's value+label by tab: "Jobs done" on
   My Work, "Jobs posted" (reusing the count above) on My Jobs.
2. **Deferred, not built.** Also swap the Rating pill on My Jobs.
   Rating is a worker-reputation stat with no client-tab equivalent
   anywhere in real code's data model — building this later would mean
   inventing a new backend field/metric, not just a UI branch. Flagged
   as a real product decision, out of scope for a restyle pass.
3. **Considered, rejected.** Hide the stat row entirely on My Jobs.
   Noted for the record, not taken.

**Built (option 1):**
- JSX: pill reads `workView === "myjobs" ? DASH_JOBS_POSTED_COUNT : 17`
  / `"Jobs posted" : "Jobs done"` — reuses existing `workView` state,
  no new state added.
- HTML: pill given `id="dash-stat1-n"`/`id="dash-stat1-l"`;
  `toggleWork()` updates both text nodes on every tab switch, same
  `HW_DASH_JOBS_POSTED_COUNT` constant driving the section-title count.

**Verification:** `HiveworkApp.jsx` braces 1890/1890, parens
1933/1933, brackets 217/217. `hivework-app-v4-3.html` 687/687 div
open/close, parses clean via `lxml` — confirmed after every edit pass
(ticker card, label rename, count, pill swap).

**Filename note:** working copy was uploaded as
`hivework-app-v4-3-1.html` (stray `-1` suffix). Discarded on push —
canonical name stays `hivework-app-v4-3.html`, matching every other
reference in this project's docs.

**Files touched:** `HiveworkApp.jsx`, `hivework-app-v4-3.html`,
`roadmap.md`, `sessions/session-29.md`.

**Still open, unresolved:**
1. ~~Section 33's `total_earned` payload-shape flag~~ — **resolved, see
   below.**
2. Option 2 above (client-tab rating equivalent) — deferred, needs a
   product decision before it's buildable.
3. Whether `budget_tracker`'s backend computation treats "active
   escrow" as intentionally broad, or has its own naming looseness
   worth flagging upstream — out of scope for this project, noted for
   awareness only.

## 35. Job Detail (worker view) — Section 30 pilot sweep, pre-patch (2026-08-15, session 30)

Full per-screen sweep (Section 30's checklist, items 1-6 — full reads,
not grep-only) run against real `JobDetail.tsx` before any patch is
written, since this is the standing pilot candidate for the first
real-app patch.

**Structural fact:** real `JobDetail.tsx` is one 720-line component,
owner and worker view branching internally (`isOwner ? ... : ...`).
The redesign's two-file split (`HiveworkJobDetail.jsx` /
`HiveworkJobDetailWorker.jsx`) stays — a maintainability call, not a
UX one — but the patch itself has to land inside one real file,
sharing the top-level `job`/`applications` fetches across both
branches rather than duplicating them.

**Worker-view gating order, confirmed from live code** (checked in
this literal sequence): `mySlotState` (approved/submitted/completed)
→ `applied || myApp?.status === 'pending'` → `hasWallet === false` →
`profileComplete === false` → `showApplyForm` → default Apply button.
**Correction to session-08's state map:** that doc describes the "real
code" order as wallet → profile → apply → work → paid — inverted from
what's actually in the live file. Doesn't change the ledger/timeline
design (verify→profile→apply→work→paid is the right *journey*
narrative for the UI, still stands), but the patch needs to replicate
the literal branch order above, not session-08's description of it.

**Facts to preserve on patch:** `Job`/`Application` field names and
types; multi-worker derived values (`workerSlots`, `isMultiWorker`,
`perSlotBudget`, `approvedCount`, `unfilledSlots`, `slotsAvailable`);
`mySlotState`'s dual derivation (multi-worker reads `slot_status`,
single-worker reads `status`); the exact API endpoints (`wallet-status`,
`me/profile`, `my-application`, `submit-work`, `apply`, `rate`);
`handleVerifyWallet`'s Pi SDK payment shape (0.01π, memo, the four
named callbacks) verbatim.

**Free to restyle, confirmed:** no dedicated CSS file exists for this
screen — real code is 100% inline `style={{}}` plus bare global
utility classNames (`card`, `btn btn-primary`, `badge badge-purple`,
etc.), so there's no real stylesheet to fight; inline styles get
replaced wholesale. The 🛡️ Sentinel banner is still literally present,
unconditional, above both branches — confirms session 28's decision
stands (generic "Wallet verified" wording only, no Sentinel mention).
All emoji (🛡️✅📬🎉⭐👥) replaced per the existing SVG-icon convention.

**Toolchain:** no test script, no lint script — `package.json` only
has `dev`/`build`/`preview` (Vite + `tsc`). `npm run build` is the real
post-patch verification gate, replacing the brace/paren-balance checks
used on standalone files. No existing tests for `JobDetail.tsx` to
break.

**New real gap found — logged, not designed for yet (user decision:
skip for this pilot, revisit later):** session-08's 11-state map
predates the multi-worker fields entirely (no mention of `worker_slots`
anywhere in it). Tracing the live logic now: the moment any one slot on
a multi-worker job is approved, `handleApprove` flips `job.status` to
`'in_progress'`. The worker-view Apply button disables unconditionally
on `job.status !== 'open'` — it never checks `unfilledSlots`/
`slotsAvailable`. So once a multi-worker job has its first approval, no
new worker can ever apply again, even with slots still open — the
button just reads "Job is in_progress," indistinguishable from a fully
staffed job. This undercuts the owner-side "Close unfilled slots"
feature's own premise (Section 9/11, already ✅ Done on the owner view),
which only makes sense if workers could otherwise keep applying to
remaining slots. Related, smaller instance of the same gap: a `pending`
applicant whose slot gets closed via that owner feature never has their
own application status touched (`handleCloseSlots` only increments
`slots_closed`) — they'd sit in the "Application submitted, client will
review" state indefinitely with no signal the opportunity has closed.
Same bucket as session-08's "rejected has no UI state" gap and the
BUG-10x log entries — a real product/backend gap, not something this
redesign fixes. **Decision: skip for this pilot patch, revisit later**
(logged here rather than folded into the pilot's scope).

**Status:** sweep complete, pilot not yet patched into the real app.
Design/patch work for Job Detail (worker view) can proceed from here.

## 36. Job Detail (worker view) — first real patch, built (2026-08-15, session 30 cont'd)

First real edit to `~/Piwork/frontend/src/pages/JobDetail.tsx`. Built
locally as a full replacement file, not yet applied/committed on a
feature branch or run through `npm run build` — that's the next step
(see below). Scope: worker (non-owner) branch only. Owner branch's
hooks, handlers, and JSX are untouched byte-for-byte; the worker
branch's hooks/handlers (state, `apiFetch` calls, `handleVerifyWallet`,
`handleApply`, `handleSubmitWork`, `handleRate`) are also untouched —
only what renders changed, plus the specific additions below.

**Header split (user decision):** worker branch now renders the design
system's dark `.job-head` card (eyebrow/title/π-figures); owner branch
keeps today's header exactly as-is, deferred to its own future patch.

**Design decisions made while building, all logged:**

1. **Description/Requirements added.** The canonical worker-view design
   (`HiveworkJobDetailWorker.jsx`, session 8) never included these
   sections at all — a real content gap, not a style choice, since
   workers need this to decide whether to apply. Added as `.panel`
   cards matching the ledger's visual system, placed after `job-head`,
   before the ledger.
2. **Rating flow consolidated.** The old shared "Rate the worker/
   client" card at the bottom of the file split into two: the worker's
   half is now the ledger's existing `completed_unrated`/
   `completed_rated` stage-5 panel (already fully designed for exactly
   this, just never wired to real data before); the owner's half stays
   the old shared block, now gated `isOwner && !isMultiWorker &&
   job.status === 'completed'` (multi-worker owner rating already
   happens per-applicant inline elsewhere in the owner branch — this
   block was never meant to double up with that, and didn't in the
   original code either).
3. **`rejected` state wired in.** `JDWPanel`'s "Not selected this time"
   panel was already fully built (session 8) but flagged as "proposed,
   not shipped as if it exists," since real code had no render branch
   for `myApp?.status === 'rejected'` at all. Real code already *sets*
   this status server-side (single-worker jobs, `handleApprove`) — the
   data was always there, just unrendered. Wiring it in now is purely
   additive (no new fields, no new endpoint), so it's included in this
   patch rather than left dark. "Browse more jobs" now actually
   navigates to `/jobs`.
4. **Submission composer ported.** `getSubmissionKind`/
   `SUBMISSION_EVIDENCE_HINT`/`composeSubmission` copied from the shell
   into real code, replacing the old single-field `submission` state
   with the 4-field structured composer (`subWhat`/`subEvidence`/
   `subEnvironment`/`subNotes`). Concatenates to the same one string
   `/api/jobs/:id/submit-work` already expects — no API change.
   Attachments stay the disabled "Coming soon" treatment, not a live
   mockup — see logged task below for why.
5. **`wallet_verified` transitional state wired in.** Canonical design
   (session 28) already specified this brief mint-checkmark confirmation
   between a successful wallet-verify payment and the profile-complete
   stage. Real code previously just flipped `hasWallet` straight to
   `true` with no transitional UI. Added a local `showWalletVerified`
   boolean, set true in `handleVerifyWallet`'s success callback and
   auto-cleared after 1.4s — UI-only, no new data dependency.
6. **Sentinel banner genericized, worker branch only.** Replaced with a
   `.verified-strip` reading "Client wallet verified," no Sentinel
   mention — per the standing decision (session 28). Owner branch keeps
   the original "🛡️ Client wallet verified by Sentinel" text untouched,
   out of scope for this patch.

**Logged, backend-blocked task: real file-upload attachments.** The
canonical shell (`HiveworkApp.jsx`) already has a fully-built,
interactive-looking attachments UI (file list, upload progress, add
button) for the work-submission composer — no further design work
needed there. It stays disabled ("Coming soon") in the real patch
because the real `/api/jobs/:id/submit-work` endpoint has zero
file-upload support (confirmed in the Section 35 sweep — one
plain-text `submission` field, nothing else). Shipping the interactive
version against a real worker submitting real evidence for a real
payout would look functional while silently dropping their files.
**Not blocked on this patch or any other screen** — blocked on backend
work (a real upload endpoint + storage) that's out of this redesign
project's scope. Once that exists, swap the "Coming soon" placeholder
for the already-built interactive version and wire it in.

**Not included, per prior decision (Section 35):** the multi-worker
"slots still open after first approval" gap — logged, not designed
for, in this patch.

**Verification so far:** brace/paren/bracket balance checked on the
built file (621/621, 586/586, 84/84) — no real toolchain check yet,
since the file hasn't been placed into the actual repo/branch. That's
the next step, per Section 30's rule that `npm run build` (not
balance-checking) is the real gate once a patch lands in the repo.

**Status:** patch built, `npm run build` verified clean (tsc + vite,
243.91 kB → 256.90 kB bundle growth consistent with the new code),
committed and merged to `main` on `~/Piwork` (commit `d100ef5`),
Vercel production deploy clean. **Verified live in Pi Browser against
real auth and real data — confirmed working.** Section 30's pilot is
done: the patch-into-main-app workflow is proven end to end (sweep →
patch → build → merge → live verification) on a real screen for the
first time.

### `total_earned` payload-shape flag — resolved (2026-08-15)

Open since Session 33: whether real `Dashboard.tsx`'s `total_earned` shares
a payload with `level`/`trust_tier` or comes from a separate call.
Confirmed via Termux grep of the real component:

```
grep -n -B 5 -A 5 "total_earned" pages/Dashboard.tsx
grep -n "apiFetch\|useEffect\|useState" pages/Dashboard.tsx
```

**Confirmed: single payload.** `total_earned` and `level` both come off the
same `data` state object, populated by one `apiFetch('/api/dashboard?tab=
${tab}')` call. `profileComplete` is the separate one, its own `useState` +
its own `apiFetch('/api/users/me/profile')` call — unrelated to this flag.

Two incidental facts surfaced by the same grep, logged for completeness,
neither changing anything already built:
- Real code renders `total_earned` twice (identity header + 3-pill stat
  row) — matches what Section 33 already found and intentionally dropped
  to one instance in the redesign (hero-block), reasoning stands.
- Real code colors both instances with `var(--pi-gold)`, the same token
  used on `LEVEL_MAP` text. The redesign's `.hero-block` uses `--violet`
  for the π unit instead — a real divergence from source styling, but a
  design call already made in Session 29 Pass 3, not new drift. Flagged
  here only so it isn't mistaken for an unnoticed gap later.

No code change required — this closes the flag, doesn't reopen the design.


## 37. Job Detail (owner view) — patch + live verification (2026-08-15, session 31)

Owner branch of real `JobDetail.tsx`, previously untouched (comparison
closed 2026-08-07, reconciled with the canonical `.jdo` design). Picked
as the next patch target per session 30's own open item — the natural
choice since it shares a file with the worker branch just shipped.

**Pre-patch decisions:**

- **Overview/Applicants/Slots tab split is a restyle, not new logic.**
  Real code has always been one flat applicant list; canonical `.jdo`
  splits pending applicants (Applicants tab) from everyone already
  assigned — approved/submitted/completed (Slots tab ledger). Same
  data, reorganized, no new fetches.
- **Decline button — confirmed no real endpoint exists** (grep for
  reject/decline matched only worker-side `rejected`-status display
  logic, nothing else — consistent with Section 16's "proposed pattern,
  never built" finding). **User decision: ship it visibly but fully
  inert** — greyed out, `disabled`, no click handler, labeled "soon."
  Reasoning: app isn't Pi-ecosystem-listed yet, small internal test
  group only. Flagged that this calculus should be revisited before
  wider release.
- **Sentinel banner genericized for the owner branch**, per the
  standing session-28 decision — session 30 explicitly deferred this
  to "this patch's own later pass." This is that pass.

**Header status** ported from the shell's Section 25 3-state split
(`completed`/`closed`/`in progress`), driven by real `job.status` /
`job.slots_closed` — no new fields, since `slots_closed` was already
tracked for the close-unfilled-slots feature.

**Scope discipline**, same standard as Section 36: `handleApprove`,
`handleComplete`, `handleCloseSlots`, `handleRateWorker`, `handleRate`
untouched. Only render changed, plus the items above. Single-worker
rating block moved from its own standalone section into the Slots tab
visually — same state (`rateScore`/`rateComment`/`myRating`), no logic
change.

**Verification so far (pre-deploy):** brace/paren/bracket balance
checked (673/673, 661/661, 90/90).

**Live verification — two regressions caught and fixed post-deploy:**

Same Termux download-lag trap as session 30 hit again first try
(`cp` silently no-opped on an unfinished download, so the first
commit/push/merge cycle was empty against an unchanged `main`) —
caught via `md5sum` before trusting `git diff`, re-downloaded, real
diff landed (392 insertions, 203 deletions), `npm run build` clean
(267.26 kB, up from 256.90 kB). Deployed to `main`/Vercel production,
same route as Section 36 (no preview-deployment path available for Pi
auth). User process note, logged not fixed: the commit was made while
on `main` rather than the `patch/job-detail-owner-redesign` branch cut
for this work, so the later branch merge was a correct no-op — not
harmful, `main` is where it needed to land, but the feature branch is
now a stale empty record of the patch.

Live-tested by the user in Pi Browser, two real bugs found:

1. **Slots tab lost the profile-link.** Old flat list linked every
   applicant's name to their profile regardless of status; patch only
   kept the link in the Applicants tab (pending-only). **Fixed:**
   restored the same `navigate('/profile/${username}')` button pattern
   in the Slots tab ledger.
2. **Rating stars and comment textarea rendered near-black,
   unstyled.** `.jdo` was missing a `textarea` rule entirely, and
   `.rate-stars button` had no explicit color, inheriting default
   near-black text instead of the intended gold/butter accent.
   **Fixed:** added `.jdo textarea` (cream background, violet focus
   ring, matching `.hw-jdw`'s existing pattern) and
   `color:var(--butter)` on the star buttons. **Correction
   (2026-08-16): the note originally here claimed `.hw-jdw` (worker
   view) had the same missing-textarea/star-color gap, not yet
   fixed. User checked the live worker view directly — it renders
   fine, no gap exists there.** No patch needed; this was a
   misread at write-time, not a real bug. Removed from the open-items
   list (was Section 37/session-31 "Next session" item 3).

Both fixes verified via hash-matched re-download → rebuild (267.73 kB)
→ commit (`955254a`) → push → redeploy → re-tested live, confirmed
working by the user.

**Open, unresolved:** user described a "worker or client can click the
profile of either" behavior from real code that doesn't appear
anywhere in this file, in either branch, before or after any patching
(checked worker view too — "Posted by @username" has always been
plain text there as well, same in the canonical shell mockup). Not
investigated further — needs the user to point at where they're
actually seeing this before it can be traced.

**Status:** owner-view patch shipped, both regressions fixed,
committed and merged to `main` (`afebc33` → `955254a`), Vercel
production deploy clean, **verified live in Pi Browser — confirmed
working.** This closes out Job Detail as a whole — both branches now
match the design system. Standing candidate for next patch, agreed
with the user: **`Layout.tsx`** (dark top nav + bottom tab bar),
untouched by the redesign, visible on every screen including both Job
Detail branches just shipped.

## 38. Layout.tsx — pre-patch sweep (2026-08-16)

Per Section 30's standing rule, full read of `Layout.tsx` done before
any design work, via Termux:

```
cd ~/Piwork/frontend/src
cat components/Layout.tsx
grep -n "className\|style={{" components/Layout.tsx
grep -n "^import" components/Layout.tsx
find . -iname "*Layout*test*" -o -iname "*Layout*spec*"
```

**Note:** the `find` command as first run had a stray trailing `/`
after `*spec*`, which triggered a shell warning
(`-iname` pattern contains a path separator) and silently evaluated
to false throughout — so it did not actually search anything. Needs
a clean re-run (`find . -iname "*Layout*test*" -o -iname
"*Layout*spec*"`) before we can say whether tests exist for this
file. Not yet re-run.

**Structural facts confirmed from the full read:**

- `usePiConnection()` supplies `connected`, `user`,
  `incompletePayment`. On mount/dependency-change: `POST
  /api/auth/verify` with `accessToken`/`walletAddress`; on success,
  stores `sessionToken` in `localStorage`, then (if
  `incompletePayment` exists) fires a best-effort, fire-and-forget
  `POST /api/payments/incomplete` cleanup call. All untouched —
  logic to preserve as-is.
- **Top nav gating:** Browse always renders regardless of
  `connected`. Post Job, Dashboard, and `<NotificationBell/>` only
  render when `connected`. The avatar link (→
  `/profile/${user?.username}`) vs. a plain "Open in Pi Browser" text
  node also swaps on `connected`.
- **Bottom tab bar does NOT gate on `connected` at all** — Home,
  Jobs, Post, Earnings all render unconditionally, logged in or out.
  This is a real asymmetry against the top nav's gating and needs a
  deliberate design decision (keep the asymmetry, or flag it as a
  product question) — not something to silently paper over while
  restyling.
- `ContactSupport` (BUG-106 footer strip, `subject="General support
  request"`) and `NotificationBell` are both imported and used
  as-is — both already have canonical redesigned components from
  earlier sections (Section 6/17/29 and Section 7 respectively).
  This patch reuses them; does not rebuild them.
- Styling mechanism: 100% inline `style={{}}` plus bare utility
  classNames (`container`, `btn btn-ghost`) — same pattern as
  `JobDetail.tsx`, no dedicated stylesheet to fight on patch.
- **Old-theme CSS variable names in use here** (`--bg-card`,
  `--border`, `--pi-purple-light`, `--pi-purple`, `--text-muted`) —
  distinct from the redesign's token names (`--cream`, `--ink`,
  `--violet`, `--violet-deep`, `--mint`, `--coral`, `--butter`,
  `--line`, `--card`). Needs an explicit mapping decision on patch,
  not a find-and-replace assumption.
- Bottom tab icons are plain emoji (🏠🔍➕📊), not SVG — same
  emoji-vs-SVG gap the roadmap already called out and fixed
  elsewhere (Post Job categories, Section 9).

**Still open before design work starts:** whether the shell's
`segnav` pattern (Section 17) already represents a considered
replacement for this real top-header-plus-bottom-tab-bar structure,
or whether that decision needs revisiting now that this is a real
patch rather than a standalone shell screen. Not resolved this
session — flagged for whoever picks this up next.

**Status:** sweep done, no patch written yet.


## 39. Layout.tsx — patch built, shipped, live-verified (2026-08-16)

Following Section 38's sweep, three real decisions were made before
writing any code:

- **Bottom-tab-bar/top-nav gating asymmetry:** resolved by adopting
  the shell's binary connected model wholesale rather than
  reconciling the two navs' gating logic separately. Confirmed:
  the shell's `segnav` (Section 17) has no internal gating at all —
  disconnected users see the full-page Landing screen and never
  reach a `segnav` screen in the first place, per a standing decision
  already recorded in a code comment above `hwLogout()`. This
  resolves the asymmetry by removing the disconnected case from this
  component's nav entirely, rather than making the tab bar match the
  header's gating.
- **Segnav vs. real header+tab-bar structure:** decided to replace
  the real structure with the shell's `segnav` pattern outright,
  not just restyle the existing two-nav layout.
- **Enforcing the binary model at the route level:** swept `App.tsx`
  and found no dedicated Landing route — `/` is a single `index`
  route to `Home`, and `Home.tsx` has zero `connected` branching.
  Building a real route guard across every route was scoped out as
  its own future item (not part of this patch) — logged, not built.
  `Layout.tsx` itself only assumes a connected user for its own nav
  rendering; it doesn't block disconnected access to other routes.

**Build:** `Layout.tsx` patched — header/bottom-tab-bar replaced
with the `segnav` pattern; old CSS variables (`--bg-card`,
`--border`, `--pi-purple`, `--pi-purple-light`, `--text-muted`)
mapped to redesign tokens; emoji tab icons dropped for `segnav`'s
text-label pattern; `useEffect` verify/cleanup logic, `ContactSupport`
footer strip, and `NotificationBell` all preserved untouched.

**Bug caught and fixed same session:** first build placed `segnav`
`position: sticky; bottom: 16px` (floating at the bottom, closer to
where the old tab bar sat) — wrong. User caught it from a live
screenshot. Canonical shell CSS is `position: sticky; top: 0`,
directly under the header, and the header itself is `position:
relative` (not sticky) in the canonical pattern — both fixed,
rebuilt, redeployed, and confirmed correct live.

**Logout — investigated and closed as infeasible, not deferred:**
question raised (disconnected state can't be live-tested without a
way to log out). Swept `usePi.ts` — `usePiConnection` exposes no
disconnect setter; state lives entirely inside the hook, set once on
mount. Web research against the official Pi SDK reference confirmed
the SDK's entire client method surface (`Pi.init`, `Pi.authenticate`,
`Pi.createPayment`, `Pi.nativeFeaturesList`, `Pi.openShareDialog`,
`Pi.openUrlInSystemBrowser`, `Pi.Ads`) has no logout/disconnect/
deauthorize method at all — apps can request Pi auth but never
revoke it. A local-only state reset was considered and rejected:
it wouldn't survive a page refresh (`Pi.authenticate()` re-runs on
mount and likely re-succeeds silently), so it would look like logout
without being one. **No "Log out" menu item will be built.** The
disconnected UI already shipped (header-only, "Open in Pi Browser")
is not a stub waiting on logout — it's the real, permanent UI for
"auth hasn't succeeded yet," which can recur for any user on any
visit (outside Pi Browser, declined consent, `Pi.authenticate()`
throwing) — not a first-timer-only state.

**Status:** shipped (`8d13488` → `525d484` after the placement fix),
build verified both times, **live-verified in Pi Browser — connected
state confirmed working.** Disconnected state reviewed via code
(same proven `connected ? ... : ...` conditional as before, just
restyled) but not live-tested, since there's no logout path to
reach it with an already-authenticated session — accepted as
reviewed-not-live-verified given logout is now confirmed permanently
unbuildable.

## 40. Home.tsx + new Help.tsx — patch built, shipped (2026-08-16)

Pre-patch sweep found real `Home.tsx` far short of the finished
shell design — 3 of 5 shell Home features had no real backing at
all (reputation stat, activity ticker, Help screen), discovered and
resolved as separate decisions before building:

- **Reputation stat:** feasible as real data. `Profile.tsx` already
  calls `/api/users/${username}` live and returns `rating` +
  `jobs_completed` for any username — Home reuses the same endpoint
  for the connected user's own username. Only renders when
  `connected`; this is Home's first-ever auth branch.
- **7-category expansion:** real category system is only 3 values
  everywhere (`PostJob.tsx`'s dropdown, `Jobs.tsx`'s filter chips) —
  the shell's 7-category system is a redesign-only invention. Also
  caught: shell's 3rd category value is `ui-ux-feedback`, which does
  **not** match real code's `ui-feedback` — kept the real value to
  avoid breaking the one category that already works. Decision:
  ship all 7 on Home now, accept the 4 non-real categories as
  correct-empty-state dead ends in Browse (not errors) until
  `PostJob.tsx`/`Jobs.tsx` get a follow-up patch adding real support
  for them — flagged as shared scope for whichever gets picked next.
- **Activity ticker:** no real "recent platform activity" endpoint
  exists. Shipped as clearly-flagged demo content (code comments),
  same convention as the shell's own placeholder data.
- **"Recommended for you":** also no real backing. Considered
  showing the most recent real open job under that heading, but
  ruled out — real personalization needs to be based on the user's
  profile (skills, devices, application history), not recency. Left
  as flagged demo content pending that future recommendation logic
  (mechanics not yet designed).
- **Help screen:** fully feasible, net-new. Home's inline "How it
  works" block removed and moved into a new `/help` route
  (`Help.tsx`) behind a ghost-row link, alongside a submission-guide
  section and FAQ (FAQ flagged placeholder — no real support-content
  source exists yet). `App.tsx` updated with the new route.

**Build:** all three files (`Home.tsx`, new `Help.tsx`, `App.tsx`)
hash-verified, `tsc && vite build` clean (57 modules, up from 56;
283.14 kB, up from 268.21 kB — consistent with the added scope).

**Status:** committed and pushed (`2f8dfc9`), build-verified,
**live-verified in Pi Browser — confirmed working by the user.**
Real screens still not patched at this point: `Jobs.tsx` (Browse),
`PostJob.tsx` (patched next session, see Section 42), `Dashboard.tsx`,
`Profile.tsx`, `Onboarding.tsx`, `HistoryWork.tsx`, `HistoryJobs.tsx`,
`HistoryWithdrawals.tsx`.

## 41. Home.tsx greeting — live-verified; Render infrastructure split (2026-08-17)

**Greeting confirmed live.** The personalized greeting added on top of
the Home.tsx/Help.tsx patch (`8606e7d` — time-of-day kicker + real
username, connected only, above the existing marketing hero text) was
pushed but couldn't be tested right away — the backend was down for
unrelated reasons (see below). Confirmed working correctly once the
backend was back. This closes out Home.tsx/Help.tsx as fully
live-verified, no open pieces remaining.

**Render infrastructure — root cause found, fixed.** Testing the
greeting surfaced the backend and signing service both appearing
down (Dashboard/Browse failing to load, reputation stat silently
missing). Traced to Render's free-tier 750-hour pool being exhausted
mid-month — not a code issue. Root cause: the 750 hours are shared
across every free service in one Render account, and are only
consumed while a service is actually awake (auto-sleep after 15 min
idle otherwise). Both `hivework backend` and the `signing service`
were being kept continuously awake via an existing cron job (to
avoid cold-start delays breaking Pi payment transactions — a real,
serious failure mode, not just UX), which alone burns close to the
full 750-hour budget per always-on service. With two services
sharing one pool, combined consumption exhausted the budget in
roughly half a month even with light two-tester traffic.

Considered and ruled out: paying for Render's always-on tier (real
cost to the user, ~$25+/mo, not available right now); dropping the
keep-alive cron entirely (rejected — reintroduces the payment-failure
risk this was solving); backend idempotency fix for the payment
endpoints (real fix, correct long-term, but out of scope for now —
user isn't ready to touch payment-critical code).

**Decision:** split `backend` and `signing service` across two
separate Render accounts, each getting its own 750-hour pool, both
kept warm via their existing (now separately-targeted) cron jobs.
Noted and accepted: Render's Acceptable Use Policy language on
avoiding payment/usage restrictions via multiple accounts is a real,
if low-probability, risk for this approach — user's call given no
funds are currently available for the paid alternative.

**Migration executed:** signing service redeployed to a new Render
account (new URL: `https://piwork.onrender.com`, replacing
`https://hivework-signing.onrender.com`); all env vars copied over.
Backend's `SIGNING_SERVICE_URL` (referenced in
`backend/src/lib/piPayments.ts:87`, used to call the signing
service's `/payout` endpoint) updated to the new URL and redeployed.
Confirmed via grep that the signing service's own copy of
`SIGNING_SERVICE_URL` is dead/unused in its code — carried over
from copying all env vars, doesn't affect behavior either way.
Cron job for signing repointed to the new URL; backend's separate
cron job unaffected (URL unchanged).

**Tested end-to-end:** full payment cycle (post job → apply → submit
→ approve → Pi released) run live in Pi Browser against the new
split setup — confirmed working cleanly, no cold-start-related
failure. Old signing service on the original account to be suspended
(rollback safety window) then deleted once confirmed stable.

## 42. Jobs.tsx (Browse) + PostJob.tsx — patch built, shipped, live-verified (2026-09-01)

Picked up the shared scope logged at the end of session 32: the deferred
3→7 category-system expansion, plus the two remaining screens carrying it.

**Sweep found a real backend fact not previously logged:** grepped
`backend/src/routes/jobs.ts` and found a real `GET /api/jobs/stats`
endpoint already exists, returning live per-category open-job counts —
but hardcoded to exactly 3 keys (`bug-testing`/`translation`/`ui-feedback`),
silently skipping anything else (`if (counts[j.category] !== undefined)`).
Also confirmed `POST /draft` has **no server-side category whitelist at
all** — any string saves fine — but that doesn't make the shell's other 4
categories real: `/stats`, the real Browse filter buttons, and the real
`ICONS` map are all hardcoded to the same 3 values, so a job posted under
one of the 4 shell-only categories would exist in the DB but be invisible
to every real counting/filtering/display mechanism. This also reconfirmed
`ui-feedback` (not `ui-ux-feedback`) as the real 3rd category value,
already flagged as a naming mismatch back in session 32.

**Decision (user-confirmed):** categories stay data-driven with a `real:
true/false` flag per entry, not hardcoded per-value JSX — so flipping one
of the 4 "coming soon" categories on later, once the backend catches up,
is a one-line flag change, not a restructure. Post Job ships only the 3
real categories as functional/selectable; the other 4 render as visible
but disabled "Coming soon" tiles, same inert-but-visible convention as
the owner-view Decline button (session 31). Browse wires its 3 real tiles
to live counts from `/api/jobs/stats`; the 4 extra tiles stay flagged
demo/zero, consistent with the Section 40 convention already established
for Home's category teaser.

### Jobs.tsx (Browse)

Every real hook untouched — `load()`, the `category`-driven `useEffect`,
`searchParams`/`navigate`, all byte-identical. One additive `useEffect`
added for the live `/stats` fetch (independent of the job-list fetch,
fails silently). Render-only changes: shell's tile-grid-with-icons
pattern (SVG, not real code's emoji `ICONS`) replaces the pill filter
row; cards moved to the shell's `rec-item` style but with the
description snippet and applicant count added back in — real fields the
shell's card design had dropped, restored since this is now a real-data
patch, not a demo shell. Loading skeleton, error-retry, and empty states
restyled to tokens, same states real code always had.

**Build:** hash-verified, `tsc && vite build` clean (57 modules, 289.30
kB, up from 268.21 kB). Diff: 206 insertions / 39 deletions.

### PostJob.tsx

Real logic kept fully intact: the `connected` gate and its "Pi Browser
required" lock screen, all three other full-screen states (paying/done/
error), `handlePayAndPost` and every one of its `window.Pi.createPayment`
callbacks (`onReadyForServerApproval`/`onReadyForServerCompletion`/
`onCancel`/`onError`), the exact `/api/jobs/draft` POST body shape,
`PLATFORM_FEE_RATE`/`MIN_BUDGET`/`DESC_MAX`/`REQ_MAX` — byte-identical.

Two real reconciliation decisions, both user-confirmed before building:

- **Device/Language shape.** Real backend fields are single strings
  (`device_required`/`language_required`). Shell's `PostJobCombobox` is a
  multi-select array. Kept the multi-select UI; every selection change
  now joins the array into one comma string and writes it straight into
  `form.device_required`/`form.language_required` — same pattern
  precedent as the submission composer's `composeSubmission` (structured
  UI concatenated into one field for a real single-field constraint).
  Everything downstream (validation, the draft POST, the review card)
  still only ever sees a plain string, same as real code always sent.
- **Step validation.** Real code validates everything once, at the old
  flat form's single "Continue to Review" click. Patch validates
  per-step instead (1: title/budget/min-budget, 2: description/
  requirements, 3: multi-worker deadline rules) — stricter than real
  code, but running the exact same checks real `handleReview` ran, just
  distributed to the step where each field lives. Confirmed with the
  user as the deliberate choice over exact-behavior-only mirroring.

Flat form restructured into the shell's 4-step wizard (Basics/Details/
Workers/Review) — pure UI reorg of the same fields, same restyle-not-new-
logic standard as prior patches. Category grid uses the same data-driven
3-real/4-disabled pattern as Jobs.tsx.

**Build:** hash-verified, `tsc && vite build` clean (57 modules, 299.38
kB, up from 289.30 kB after Jobs.tsx — consistent with the wizard's added
scope). Diff (both files together): 648 insertions / 169 deletions.

**Status:** both committed and pushed together (real-code phase — Piwork
repo only, no `hivework-redesign` two-repo routine needed for this pair),
build-verified, **live-verified in Pi Browser — confirmed working by the
user** (Browse's 3 real tiles + counts, 4 disabled tiles, per-step
validation blocking correctly, device/language chips surviving into
Review, full pay-and-post cycle through to "Job posted!").

Real screens still not patched: `Dashboard.tsx`, `Profile.tsx`,
`Onboarding.tsx`, `HistoryWork.tsx`, `HistoryJobs.tsx`,
`HistoryWithdrawals.tsx`.

## Section 43 — Dashboard.tsx patched into real code (2026-09-02)

**Screen inventory update:** `Dashboard.tsx` moves from "not yet patched" to
✅ shipped, live-verified. Shared components `WithdrawPanel.tsx`,
`ApplicationCard.tsx`, `JobCard.tsx` restyled to redesign tokens in the same
pass, since Dashboard renders all three directly.

### Real gaps found in sweep, resolved this session
- `earnings_pending` — real backend field (worker tab, sum of `approved`-status
  application budgets), previously computed but never surfaced in the old UI.
  **Decision: surfaced as a third stat pill ("Pending"), worker tab only.**
- No real jobs-posted total existed anywhere in the backend — the `jobs` array
  on the client tab is capped at `SUMMARY_LIMIT` (5) for the "See all" cutoff,
  with no separate count field. **Decision: added a lightweight backend count
  query** (`supabase.from('jobs').select('id', { count: 'exact', head: true
  }).eq('client_id', user_id)`) rather than approximate or drop the number —
  correctness over a shortcut. New response field: `jobs_posted_count`.
- Shared components were still fully old-style (Pi-purple/gold theme,
  `.badge-*` classes) despite rendering inside the newly-patched page.
  **Decision: restyled all three now**, since leaving them old-style would
  ship a visually split page, and it front-loads work the History screens
  (`HistoryWork.tsx`, `HistoryJobs.tsx`) will need later — both reuse
  `ApplicationCard`/`JobCard`.

### Bug found + root cause (worth remembering for every future patch)
First build/deploy shipped completely unstyled — plain stacked text, no card
layout, no colors. Root cause: there is no shared stylesheet across pages.
`index.css` (96 lines) is leftover old dark-theme scaffolding
(`--pi-purple`/`--pi-gold`/`.badge-*`) and is not where the redesign lives.
**Every real file patched into the new design embeds its own scoped
`<style>{...}</style>` block**, copied in from the shell prototype, prefixed
uniquely per file (`Layout.tsx` → `.hw-layout`, `JobDetail.tsx` → `.jdo`,
`PostJob.tsx` → `.hw-post-job`). Dashboard.tsx's JSX referenced shell class
names correctly but never got its own `<style>` block added — the classes
existed in the design source, just not embedded in the file being patched.
Fixed by adding a `.hw-dash`-prefixed scoped style block (full `:root` token
redeclaration + all component rules) directly in `Dashboard.tsx`, matching
the established per-file pattern exactly.

**Standing rule going forward:** any newly-patched page needs its own
embedded `<style>` block if it introduces classes not already used by a file
still mounted on the page (e.g. `Layout.tsx`'s tokens are global once
mounted, but page-specific classes are not). Check for this explicitly as a
build step, not just a TS compile check — `tsc`/`vite build` will not catch
missing CSS, only a live visual check will.

### Also corrected
Job status pill mapping was initially guessed as `open`/`escrow`/`closed`
(borrowed from shell demo data) — real enum confirmed via `jobs.ts` sweep is
`open` / `in_progress` / `completed`. Fixed before shipping; pill copy
changed accordingly ("In progress" instead of "In escrow" — more accurate to
what the status actually represents, since escrow custody spans the whole
job lifecycle, not just the in-progress state).

### Build
Backend: `tsc` clean. Frontend: `tsc && vite build` clean, 303.88 kB
(up from 298.00 kB baseline pre-Dashboard, consistent with the added
per-file `<style>` block size).

### Live-verified (Pi Browser, piwork-frontend.vercel.app/dashboard)
Hero (total earned + identity), stat pills (Jobs done/posted, Rating,
Pending), profile nudge, toggle, worker tab (withdraw panel + applications
list + "See all"), client tab (jobs-posted count, escrow ticker gating,
job cards with correct status pill + refund badge, refund withdraw panel
gating). All confirmed working via screenshots.

### Screen inventory status (post-Section 43)
| Screen | Status |
|---|---|
| Layout.tsx | ✅ shipped, live-verified |
| Home.tsx + Help.tsx | ✅ shipped, live-verified |
| Job Detail (worker + owner) | ✅ shipped, live-verified |
| Jobs.tsx (Browse) | ✅ shipped, live-verified |
| PostJob.tsx | ✅ shipped, live-verified |
| Dashboard.tsx | ✅ shipped, live-verified |
| WithdrawPanel / ApplicationCard / JobCard (shared) | ✅ shipped, live-verified |
| Profile.tsx | Not yet patched |
| Onboarding.tsx | Not yet patched |
| HistoryWork.tsx / HistoryJobs.tsx / HistoryWithdrawals.tsx | Not yet patched — but `ApplicationCard`/`JobCard`/`WithdrawPanel`'s own internal history list are now already restyled, so these three screens are lower-effort than before Section 43. |

## Section 44 — History screens patched into real code (2026-09-02)

Picked the three remaining History screens over Profile.tsx/Onboarding.tsx,
since no shared scope forced an order and these were the cheapest of the
remaining set — `ApplicationCard`/`JobCard`/`WithdrawPanel` were already
restyled in Section 43, so `HistoryWork.tsx` and `HistoryJobs.tsx` only
needed page chrome.

### Real gaps found in sweep, resolved this session
- **`HistoryWithdrawals.tsx` duplicated `WithdrawPanel`'s list logic**
  instead of sharing it — its own inline `STATUS_STYLE` map, own
  `shortAddr()`, still fully old-theme markup, while `WithdrawPanel`
  (restyled Section 43) already had its own internal withdrawal-history
  list on the same `/api/withdrawals` data. Same shape of issue as Section
  43's `ApplicationCard`/`JobCard` duplication risk, just not yet fixed for
  withdrawals specifically. **Decision: extracted a shared `WithdrawalRow.tsx`
  component** (same precedent as `ApplicationCard`/`JobCard`), used by both
  `WithdrawPanel.tsx` and `HistoryWithdrawals.tsx`.
- **`JobCard`'s refund badge could never render on History → Jobs** —
  `/api/history/jobs` didn't select a `refunded` field, while Dashboard's
  client tab (same `JobCard` component) does show it. Same component,
  silently different capability depending on which screen mounted it.
  **Decision: fixed at the backend**, not the frontend — added real
  `refunded` data to the route rather than hiding the badge conditionally
  per-screen, so `JobCard` behaves identically everywhere it's mounted.

### Bug caught before shipping — `refunded` is not a column
First backend draft added `refunded` directly to `/api/history/jobs`'s
`select()`, assuming it was a real column on `jobs` since Dashboard's
client tab already displayed it. **It is not a column at all.** A
user-run `grep -n "refunded" backend/src/routes/dashboard.ts` sweep showed
it's computed in `dashboard.ts` by querying `balance_transactions`
(`kind = 'refund'`, `worker_id = <client's own user id>` — the table is a
generic ledger keyed by whoever gets credited, not literally "worker"),
grouped by `job_id`, merged onto each job in JS. A direct column `select()`
would have thrown a query error in production.

Corrected `history.ts`'s `/jobs` route to replicate the same computation:
pull the current page's `job_id`s, query `balance_transactions` scoped to
those ids (`.in('job_id', jobIds)`), sum by `job_id`, merge onto each item.
Scoped to just the current page rather than the client's full refund
history (unlike `dashboard.ts`, which needs an all-jobs total for its
budget tracker) — no such aggregate is needed here.

**Verified against Supabase directly**, not just code inspection:
- Confirmed `jobs` table genuinely has no `refunded` column.
- Confirmed every `balance_transactions` refund row's `worker_id` matches
  the corresponding job's `client_id` (10/10 sample rows) — the
  `.eq('worker_id', user_id)` filter is filtering on the right identity.
- Confirmed refunds land as **multiple rows per job**, not one row per job
  (two test jobs had 4 refund transactions each, summing to 8π) — this is
  why the fix `reduce`/accumulates rather than assumes a 1:1
  job-to-refund-row relationship. A naive "take the first match"
  implementation would have silently undercounted these exact jobs.

### Also fixed — RangeFilter.tsx
Shared by all three History pages. Old theme: `var(--pi-purple)` filled
active state, `var(--radius-sm)` (6px), `var(--text-muted)`. Restyled to
match Dashboard's `toggle-row`/`toggle-btn` pattern exactly — same track
color (`#EFECE5`), same active treatment (white pill + soft shadow, not a
solid violet fill; violet stays reserved for primary actions/amounts), same
100px pill radius used everywhere else in the system.

### Build
Frontend: `tsc && vite build` clean, 58 modules, 307.92 kB (up from
303.88 kB post-Dashboard baseline). Backend: `tsc` clean.

(First build attempt reported `tsc: command not installed` — a Termux PATH
issue, not a real problem; `npx tsc` resolved it correctly through the
project's own `node_modules`. Commit/push had already happened before this
was caught and re-verified after the fact — build gate held, but out of
its usual order this session.)

### Live-verified (Pi Browser, piwork-frontend.vercel.app)
Refund panel + refund history list render correctly through the new shared
`WithdrawalRow`. History → Jobs multi-refund badges confirmed showing the
correctly summed total (8π across 4 transactions), not a single
transaction's amount. History → Withdrawals confirmed visually matching
`WithdrawPanel`'s own list. Filter pills, empty states, and page chrome
confirmed working across all three screens.

---

## Section 45 — Missing font load fixed app-wide (2026-09-02)

**Not a per-screen issue — root cause affected every already-shipped
screen simultaneously.** Flagged by the user: bold text across the real
app looked like faux/synthetic bold (thin, slightly slanted) rather than a
true drawn bold weight — visible on Dashboard, History screens, anywhere
`fontWeight:700+`/Sora headings appear. The shell (`hivework-app-v4-3.html`)
never showed this, since it's a standalone file with its own `<head>`.

**Root cause:** `frontend/index.html` — confirmed via
`cat frontend/index.html` — had **no font loading at all**. No Google
Fonts `<link>`, nothing. Every real-code page's
`font-family:'Sora'/'Inter'/'JetBrains Mono'` was silently falling back to
the device's system sans-serif, which synthesizes bold instead of using an
actually-drawn bold weight — exactly the reported symptom.

**Fix — one file, not a per-screen patch:** added the missing
`<link rel="preconnect">` + Google Fonts `<link>` tags to
`frontend/index.html`. Also widened the requested weight list beyond what
the shell itself requests (`Inter:wght@400;500;600`) — real patched files
use `fontWeight: 700` on Inter in several places (Withdraw button,
`.hw-loadmore`, etc.) that would still have faux-bolded even after adding
the link tag if left uncovered. Final weight list:
`Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700`.

### Build
`tsc && vite build` clean; `dist/index.html` grew 0.69 kB → 1.01 kB
(new `<link>` tags only), JS/CSS bundle sizes unchanged.

### Live-verified
Confirmed on Dashboard (known screen, direct before/after comparison
available via prior screenshots) — headings and bold UI text now render
as genuine heavy weights, not synthetic/slanted fallback bold.

---

## Section 46 — Browse screen visual fixes: icons, tile design, withdraw card (2026-09-02)

Three related but separate real bugs surfaced from user screenshots of the
actual real app (not the shell) — each traced to its exact root cause
before fixing, not guessed at.

### Fix 1 — Browse category icons weren't rendering at all
`Jobs.tsx`'s `CATEGORIES` icon SVGs (`fill="none"`, `strokeWidth`,
`strokeLinecap`/`strokeLinejoin` all set) never had an actual `stroke`
*color* set anywhere — not inline, not in `BROWSE_STYLES`. With no stroke
color, `strokeWidth` has nothing to apply to and every path is invisible.
The `.t-icon` badge box itself rendered fine (correct size/background),
which is why it looked like an empty gray/cream placeholder square rather
than a missing element. **Fix:** one CSS rule added,
`.hw-browse .t-icon svg{display:block;stroke:currentColor;}` — no JSX/icon
markup changes needed, the icons were already correctly built.

### Fix 2 — WithdrawPanel never used the shell's actual dark balance-card design
Confirmed via shell sweep: `.balance-card` is `background:var(--ink)`,
white text, with a radial violet glow overlay
(`radial-gradient(circle,rgba(108,92,231,.4),transparent 70%)`) — this is
the actual design source for both the earnings and refund withdraw panel
variants. What shipped in Section 43 used a plain white
`background:'var(--card)'` card instead — a different, lighter treatment
that was never the intended design, not a later regression. **Fix:**
rebuilt `WithdrawPanel.tsx`'s card against the shell's exact spec — dark
ink background, radial glow, full text-color hierarchy
(`#fff`/`#B4B1BC`/`#8B889A`), `rgba(255,255,255,.12)` input field. Same
component serves both variants, so this fixed both places it mounts
(Dashboard worker tab "Available balance" and client tab "Refunded
balance") in one change.

### Fix 3 — Browse tile layout/color didn't match the shell at all
Initial diagnosis (before Fix 1's stroke fix) was mistaken for a
"missing icon" issue; after icons rendered correctly, the deeper mismatch
became clear via user screenshot comparison against the shell: Browse
tiles were built as a horizontal row (icon-left, text-right) with a cream
icon badge and violet icon color — the shell's actual tile is a **vertical
card** (icon on top, name/count below, fixed 104px height), with **no
icon badge at all** (bare icon sitting directly on the tile background,
dark `var(--ink)` stroke), and a **rotating pastel background per tile
position** (`nth-child(7n+1)` through `+7`: pink/gold/mint/lavender/blue,
cycling). Selected state also differs — shell uses an inset violet ring
(`box-shadow:inset 0 0 0 1.5px var(--violet)`), not a background swap.

Confirmed via a side-by-side preview before touching real code, then user
approved a full match to the shell. Additionally discovered the shell has
**no dimming at all** for "coming soon" (disabled) tiles — no
`.tile.disabled` rule exists in the shell's CSS; every tile renders at
full color regardless of `real`/`coming soon` status. Original real-code
`.tile.disabled{opacity:.55}` was dropped to match, flagged as a minor
trade-off (loses a visual non-interactive hint, though the click-guard
logic still correctly blocks taps on disabled tiles).

**Fix:** rebuilt `BROWSE_STYLES`' `.tile`/`.t-icon`/`.t-name`/`.t-count`
rules to the shell's exact spec — pure CSS change, no JSX restructuring
needed, since the existing two-child JSX structure (icon div, then
name+count div) naturally restacks vertically once `.tile` switches from
`flex-direction:row` to `column`.

### Build
All three fixes: `tsc && vite build` clean across each incremental push
(308.22 kB after Fixes 1+2, further build confirmed clean after Fix 3).

### Live-verified (Pi Browser, piwork-frontend.vercel.app/jobs)
User-confirmed via screenshot: real bug/globe/monitor/compass icons now
render inside tile badges. Dark violet-glow balance card confirmed
matching shell reference on Dashboard. Browse tiles confirmed rebuilt to
vertical-card layout with correct rotating pastel colors across all 7
categories, "coming soon" tiles at full color (not faded), inset ring on
selected tile.

### Fix 4 — Post Job category icons, same root cause as Fix 1
Caught by the user in a follow-up screenshot after Fix 1 shipped:
`PostJob.tsx`'s `CATEGORIES` array uses the near-identical icon-SVG pattern
as `Jobs.tsx` (`fill="none"`, `strokeWidth` set, no `stroke` color anywhere)
and `POST_JOB_STYLES` had no `.cat-opt svg{stroke:...}` rule either — exact
same bug as Fix 1, in a second file that happens to share the same icon
convention. Confirmed against the shell's own rule for this element
(`.hivework-post-job .cat-opt svg{stroke:var(--ink-soft);}` /
`.selected svg{stroke:var(--violet-deep);}`) before fixing, rather than
reusing Browse's `currentColor` approach — Post Job's unselected/selected
icon colors are two distinct static colors in the shell, not a single
`color` property inherited by both states.

**Fix:** two CSS lines added to `POST_JOB_STYLES`, no JSX/layout changes:
```
.hw-post-job .cat-opt svg{display:block;flex-shrink:0;stroke:var(--ink-soft);}
.hw-post-job .cat-opt.selected svg{stroke:var(--violet-deep);}
```

**Worth remembering:** two files now confirmed to share this exact
missing-stroke pattern (`Jobs.tsx`, `PostJob.tsx`) because both independently
copied the same icon-SVG convention from the shell without also copying the
shell's accompanying stroke rule. If any other file reuses this icon
pattern, worth a quick `grep strokeWidth` check for a missing paired
`stroke` rule before assuming it's fine, rather than waiting for another
screenshot to catch it.

### Build
`tsc && vite build` clean.

### Live-verified (Pi Browser, piwork-frontend.vercel.app/post-job)
User-confirmed via screenshot: unselected category icons render in muted
gray, selected category icon (Bug Testing, default selection) renders in
violet, matching the shell's intended treatment.


| Screen | Status |
|---|---|
| Layout.tsx | ✅ shipped, live-verified |
| Home.tsx + Help.tsx | ✅ shipped, live-verified |
| Job Detail (worker + owner) | ✅ shipped, live-verified |
| Jobs.tsx (Browse) | ✅ shipped, live-verified — icon/tile/color fixes this session |
| PostJob.tsx | ✅ shipped, live-verified — icon-stroke fix this session |
| Dashboard.tsx | ✅ shipped, live-verified — balance-card fix this session |
| WithdrawPanel / ApplicationCard / JobCard / WithdrawalRow (shared) | ✅ shipped, live-verified |
| HistoryWork.tsx / HistoryJobs.tsx / HistoryWithdrawals.tsx | ✅ shipped, live-verified |
| `frontend/index.html` (font loading, app-wide) | ✅ fixed, live-verified |
| Profile.tsx | ✅ shipped, live-verified — canonical form patch + full restyle, Section 47 |
| Onboarding.tsx | ✅ shipped, live-verified — canonical form patch + page chrome, Section 47 |
| Combobox.tsx (shared, new) | ✅ shipped, live-verified — extracted from `PostJob.tsx`'s local `PJCombobox`, Section 47 |
| formOptions.ts (shared, new) | ✅ shipped — `DEVICE_OPTIONS`/`LANGUAGE_OPTIONS` single source of truth, Section 47 |
| Layout.tsx hamburger side-menu | ✅ shipped, live-verified — Help/Contact Support/Log out, Section 47 |

---

## Section 47 — Profile.tsx + Onboarding.tsx patched into real code; hamburger side-menu added (2026-09-03, session 36)

Picked up the last two real screens in the original patch queue,
`Profile.tsx` and `Onboarding.tsx`. A new hamburger side-menu in
`Layout.tsx` was also built mid-session, at the user's request, after
live-verification of the Profile patch showed the avatar no longer
needed to carry a popup menu.

### Correction to the roadmap going in
Session 35's "Next session" note (previously at the end of this file)
said "no shared scope between them — either order works." That was
wrong. A full sweep of the real `Profile.tsx` showed it imports
`ProfileForm` directly from `./Onboarding` — the form isn't a separate
file, it's defined inside `Onboarding.tsx` and exported. Patching either
screen's form necessarily touches the other's source file. (Reflected
in the `onboarding` row of the Screen Inventory table, Section 1.)

### Real gap found in sweep: two inconsistent shell designs for the same form
The compiled shell (`hivework-app-v4-3.html`) has two different,
disagreeing implementations of the profile form:
- **Canonical**, `hivework-profile-complete.html` (Section 3/10,
  already reconciled) — required skills as a type-to-add chip input,
  devices/languages as a searchable combobox, bio with a 200-char
  counter.
- **v4-3's inline Profile-edit mode** (`renderProfileScreen()`) — a
  simpler fixed toggle-chip list of preset skills, bio only, no devices
  or languages fields at all.

Since the real `ProfileForm` is one component serving both `Profile.tsx`
edit mode and the real `Onboarding.tsx`, decision was to patch the
shared form once to the canonical design rather than build the
incomplete v4-3 version and redo it later. This also meant finishing
`Onboarding.tsx`'s own page chrome in the same pass — leaving it
half-styled would have reproduced the exact "referenced classes, no
`<style>` block" bug from Section 43.

### Built
- **`frontend/src/components/Combobox.tsx`** (new) — extracted from
  `PostJob.tsx`'s local `PJCombobox` (Section 42) so the devices/
  languages picker isn't duplicated a second time. Class names kept
  unchanged (`pj-combo`/`chip-row`/`chip-outline`/`pj-combo-list`/
  `pj-combo-opt`) — every host page still declares its own matching
  CSS, same no-shared-stylesheet convention as the rest of the codebase
  (Section 43).
- **`frontend/src/lib/formOptions.ts`** (new) — `DEVICE_OPTIONS` and
  `LANGUAGE_OPTIONS`, single source of truth now shared by `PostJob.tsx`
  and `ProfileForm`, instead of the ~40-language list living in two
  places.
- **`frontend/src/pages/PostJob.tsx`** — swapped its local `PJCombobox`
  function and local option arrays for imports from the two files
  above. No visual or behavioral change; pure dedup.
- **`frontend/src/pages/Onboarding.tsx`** — `ProfileForm` rebuilt to
  the canonical design (chip-input skills, shared `Combobox` for
  devices/languages, bio counter). Page wrapper (`Onboarding()`)
  finished to match — icon header, kicker copy, own scoped
  `.hw-onboarding` style block.
- **`frontend/src/pages/Profile.tsx`** — full restyle: violet-gradient
  cover, big avatar, stat-pills, level/trust chip pills (brought in
  line with Dashboard's already-shipped chip convention, Section
  32/33 — previously plain colored text), edit toggle wired to the new
  `ProfileForm`, skills/devices/languages tag display, reviews wired to
  real `ratings` fetch data (was already real data, just restyled).
  Loading skeleton and not-found states restyled to tokens too.

One deliberate design call: the shell's `chip-pioneer` variant
(transparent + soft border) is built for a light card background. On
Profile's violet gradient cover it would be unreadable, so it got a
translucent-white treatment specific to that context — each page can
define its own variant, consistent with the no-shared-stylesheet
pattern.

### Bug found post-deploy, fixed same session
Live-verification (screenshot) showed typed text in the skills
chip-input and bio textarea was invisible — present, just uncolored.
Root cause: `Combobox`'s `<input>` had an explicit `color:var(--ink)`
in its CSS rule, but the skills chip-input and bio `<textarea>` rules
didn't, so they inherited an unreadable ambient color instead. Fixed in
both `Profile.tsx` and `Onboarding.tsx`'s scoped style blocks. Pushed
straight to `main` (low-risk, patches already-live code) — see the
revised branch-discipline rule, Section 30.

### Branch discipline — policy correction
See Section 30 (updated 2026-09-03): the old "work on a feature branch,
never `main`" rule didn't match actual practice since session 34,
corrected to branch only for genuinely new/risky patterns.

### New: hamburger side-menu in `Layout.tsx`
Came up mid-session — live-verification of the Profile patch showed the
avatar no longer needed to double as a popup-menu trigger (its old
"View profile"/"Edit profile" items are redundant now that Edit lives
on the profile page itself). Also surfaced a stale roadmap claim:
Section 8 said the profile-menu is "wired," but that only ever
described the standalone shell demo — the real `Layout.tsx` avatar
(patched Section 39) is and always was a plain `NavLink` to
`/profile/:username`, no dropdown, no menu component anywhere in
`frontend/src`. Correction added to Section 8 directly.

Built new, branched (`feature/side-menu`) since this is the first
drawer/overlay nav pattern in the app and touches every page via
`Layout.tsx`:
- Hamburger icon (three horizontal lines, not dots — explicit user
  preference) left of the logo, opens a slide-in panel (backdrop +
  animated panel, no new dependency).
- Panel contents: **Help** (existing `/help` route), **Contact
  Support** (reuses the existing `ContactSupport` component — already
  globally available via the footer `.hw-support-strip`, so this
  duplicates an entry point for discoverability rather than filling a
  new gap), **Log out** (connected-only).

**Logout is a partial fill, documented as such, not a full fix.** Real
gap per Section 8: no backend session-invalidation endpoint exists, and
Pi Browser owns the actual Pi-level session — this app only ever stores
its own `sessionToken` locally via `usePiConnection()`. What "Log out"
actually does: clears `localStorage.sessionToken`, closes the menu, and
force-reloads to `/`. It does **not** guarantee Pi Browser itself
forgets the user — `usePiConnection()`'s `Pi.authenticate()` call may
silently re-auth on the next mount if Pi Browser still has an active
session. Same documented compromise the shell's `hwLogout()` already
used; not a new gap, just now real and live instead of a shell
placeholder.

### Build
```
npx tsc && npx vite build
```
Clean both times — no errors. Bundle grew 307.92 kB → 317.82 kB
(Profile/Onboarding patch) → 320.56 kB (side-menu), 58 → 60 modules
(two new files: `Combobox.tsx`, `formOptions.ts`).

### Live-verified (Pi Browser, piwork-frontend.vercel.app)
- `/profile/:username` — cover gradient, level + trust chips readable,
  stat pills, Edit toggle
- Edit mode — skills chip-input, devices/languages combobox, bio
  counter, Save/Cancel — **text color bug caught here, fixed same
  session**
- Non-own profile — no Edit button
- `/onboarding` — page chrome styled correctly, not bare
- Hamburger menu — opens/closes (backdrop + ✕), Help navigates,
  Contact Support expands inline, Logout only shown when connected,
  header/segnav/avatar unaffected

### Screen inventory status (post-Section 47)
Every real screen now patched into `main` — this closes out the full
redesign patching pass started in Section 30. See Section 1 for the
updated table.

## Section 48 — Full visual re-verification pass, in progress: legacy `index.css` theme found still live (2026-09-03, session 37)

Started the re-verification pass session 36 left as an open decision.
`Layout.tsx` and `Home.tsx` came back clean (see session-37.md for full
detail; shell's profile-menu dropdown flagged as the stale side this
time — real code is correct). Surfaced a real, unresolved, systemic bug
in the process: **findings only, no fix applied this session.**

### Loose ends from Section 47 closed out
- `feature/side-menu` confirmed merged to `main` via `git branch
  --merged main`.
- `strokeWidth`-without-paired-`stroke` sweep (flagged session 35)
  closed: `Jobs.tsx`/`PostJob.tsx` already fixed, `JobDetail.tsx`/
  `Layout.tsx` never at risk, `Home.tsx` checked and clean.

### Bug found: `index.css` never migrated off the pre-redesign dark theme
`index.css`'s `:root` still holds the full old dark-theme token set
(`--bg`, `--bg-card`, `--text-primary`, `--text-secondary`, `--border`,
`--pi-purple` family) — none of which exist in the new system's tokens
(`Layout.tsx`'s `:root`). Global classes still built on them: `.btn`,
`.btn-primary`, `.btn-ghost`, `.card`, `.badge-*`, `.label`,
`.form-group`, bare `input/textarea/select`. No double-background risk —
`.hw-layout` paints `var(--cream)` over the body everywhere.

Confirmed blast radius: `Home.tsx`'s `Post a Job` button (pale text on
cream — real contrast bug), `JobDetail.tsx`'s Back button (falls outside
its own `.hw-jdw` scoped override) and its bare open-slot `.label`, and
`Profile.tsx`'s three bare `.card` divs (would render as dark boxes on
the cream page — a background-color bug, not just contrast, and one that
survived Section 47's "full restyle" of this exact file). `Jobs.tsx`,
`PostJob.tsx`, `Dashboard.tsx`, `ContactSupport.tsx` confirmed as
consumers too but not yet checked for their own scoped overrides.

Fix direction (not yet built): retarget `index.css`'s tokens to the new
system's values at the source, rather than scoping six per-file
overrides — `index.css` is a genuine single global stylesheet, unlike
the shell files or the rest of the page-scoped codebase. New-system
token values pulled from `Layout.tsx` and on hand for next session.

Full detail: see session-37.md.

## Section 49 — `index.css` legacy-token bug fixed (2026-09-03, session 38)

Retargeted `index.css`'s `:root` off the pre-redesign dark theme onto the
new cream/ink/violet tokens (`--violet`/`--violet-deep` for primary +
hover — matching the shell's own `.btn-primary:hover` convention exactly;
`--cream`/`--card` for backgrounds; `--line`/`--ink`/`--ink-soft` for
border/text). Pure value swap, no structural changes.

Confirmed via scoped-`<style>`-block grep that `Jobs.tsx`, `PostJob.tsx`,
`Dashboard.tsx`, and `ContactSupport.tsx` (left unconfirmed in Section 48)
have no per-file override for these classes — all four were fully exposed
and are now fixed by the source-level retarget alone, no per-file patch
needed anywhere.

One fix made beyond Section 48's explicit findings: `.badge-*` background
tints were still opaque near-black values built for the old dark card
background — replaced with light pastel tints of the corresponding new
tokens so badges stay legible on cream.

Build clean (`npx tsc && npx vite build`), bundle unchanged at 320.56 kB
— pure CSS, no JS touched. Pushed to `main`. Live-verified in Pi Browser:
`Home.tsx` Post-a-Job button, `JobDetail.tsx` Back button + open-slot
label, `Profile.tsx`'s three cards, `Jobs.tsx`/`PostJob.tsx`/
`Dashboard.tsx`/`ContactSupport.tsx` buttons, and `.badge-*` instances —
all clean. Closes out the Section 48 bug entirely.

Full detail: see session-38.md.

## Section 50 — Re-verification pass continued: `Jobs.tsx` clean, `PostJob.tsx` step-indicator drift found (2026-09-03, session 39)

Continued the pass from Section 48/49 in oldest-first order.

**`Jobs.tsx` (Browse): clean, no bug.** Bare `.btn-primary`/`.btn-ghost`
(Post-a-Job, Try-again) confirmed rendering correctly now that
`index.css`'s retargeted tokens (Section 49) were visually diffed
against `Layout.tsx`'s `:root` and found byte-identical. `strokeWidth`-
without-`stroke` pattern on all 7 category-tile SVGs safely covered by
`.hw-browse .t-icon svg{stroke:var(--ink);}`. Roadmap-described
features (3 real categories w/ live counts, 4 disabled "Coming soon"
tiles, restored description snippet + applicant count on cards) all
confirmed present.

Two documentation-only notes, no fix needed: (1) unlike other screens,
Browse has no standalone canonical `HiveworkJobs.jsx`/`hivework-jobs.html`
— it only ever existed inside the compiled shell; (2) shell's demo data
uses category value `ui-ux-feedback`, real code correctly uses
`ui-feedback` (matches backend) — same stale-shell pattern as the
profile-menu dropdown (Section 48).

**`PostJob.tsx`: clean on tokens, one real design-fidelity finding.**
Same token/stroke checks as `Jobs.tsx` passed clean, and all
roadmap-described wizard behavior (per-step validation, real 3-of-7
category gating, combobox-to-string sync, full payment-state flow)
confirmed present.

New finding — **wizard step-indicator doesn't match canonical**:
real `PostJob.tsx`'s `.wizard-track`/`.wz-dot` CSS has no connecting
line between steps at all (canonical has a `:after` pseudo-element
line that fills violet as steps complete), and its "active"/"done"
dot fills are inverted from canonical — real code fills the *active*
dot solid violet and the *done* dot solid **mint**; canonical instead
leaves the active dot as an outlined ring (violet border, no fill) and
fills only the done dot, in violet not mint. Not a token bug (both
sides use only defined system tokens) — a genuine unreconciled visual
divergence in how progress is communicated, likely built to an earlier
version of the pattern before canonical settled. No fix applied this
session — flagged for a decision on which version to standardize on.

Same `ui-ux-feedback`-vs-`ui-feedback` documentation-only mismatch
noted here too (shell side, not real code).

Full detail: see session-39.md.

## Section 51 — `JobDetail.tsx` re-verified, `--text-muted`/`--pi-gold` fixed, `NotificationBell.tsx` fully patched (2026-09-04, session 40)

Continued the re-verification pass at `JobDetail.tsx` (worker + owner
views) — clean on tokens/behavior, per-view design confirmed against
canonical. New finding: two unscoped inline-style tokens
(`var(--text-muted)`, `var(--pi-gold)`) resolving to nothing, missed by
prior sessions' scoped-`<style>`-block grep checks. Two open
design-fidelity items logged, not fixed: owner-view Slots ledger missing
canonical's connector line; worker-view `.entry-time` dead CSS + simplified
attachments vs. canonical.

**`--text-muted`/`--pi-gold` fix:** traced to 3 files / 8 call sites
(`NotificationBell.tsx`, `JobDetail.tsx`, `Dashboard.tsx`). Both were real
pre-redesign tokens dropped (not migrated) in session 38's retarget —
confirmed via `index.css.bak`. Fixed as `:root` aliases
(`--text-muted: var(--ink-soft)`, `--pi-gold: #B8860B`), same bridge
convention as `--safe`/`--caution`/`--danger`. Build clean, live-verified.
Added `frontend/src/index.css.bak` to `.gitignore` (separate commit).

**`NotificationBell.tsx`: discovered never actually patched to canonical
at all** — still plain emoji icon, full-width fixed-position strip, and
three more undefined legacy tokens (`--bg-card`, `--border`, `--text`).
`--bg-card` being undefined was the direct cause of a live bug the user
found: the panel rendered fully transparent, page scrollable underneath.
Full patch applied — canonical's `HiveworkNotificationBell.jsx` design
ported onto real data/hooks (polling, mark-all-read, navigate-on-click
untouched), with tokens scoped to `.hnb-wrap` (not canonical's bare
`:root`, avoiding a Bug-Fix-Log-#8/#9-class risk) and `formatTime()`
rewritten for real `created_at` timestamps instead of canonical's demo
`minsAgo`.

Live-test after the patch found two more bugs, both fixed same session:
panel clipped off the left edge of the screen (wrong anchor point — fixed
via `position:fixed` + viewport-relative width), and panel rendering
underneath the nav bar (`.hw-header`'s `z-index:5` lost to `.hw-segnav`'s
`z-index:8` inside its own stacking context — fixed by raising the header
to `z-index:30`). Both confirmed clean via live screenshot.

Full detail: see session-40.md.

## Section 52 — `Dashboard.tsx` re-verified (black-rectangle glitch explained), `HistoryWork.tsx`/`HistoryJobs.tsx` unstyled-card bug fixed (2026-09-04, session 41)

Continued the re-verification pass at `Dashboard.tsx` — clean sweep across
`Dashboard.tsx`, `WithdrawPanel.tsx`, `ApplicationCard.tsx`, `JobCard.tsx`:
no orphan classes, no unscoped tokens, no dead code. No standalone
canonical file exists for Dashboard (same pattern as Browse) — it only
ever lived inside the compiled shell (`HiveworkApp.jsx`'s embedded
`WithdrawPanel` function / `hivework-app-v4-3.html`'s Earnings screen), so
the shell itself served as the reference.

**Session 40's black-rectangle glitch explained, not a persistent bug:**
traced to `WithdrawPanel.tsx`'s own independent fetch/loading state, which
renders unconditionally at the top of `WorkerView` before the applications
section — a plain unstyled `background:'var(--ink)'` bar (no shimmer, no
shape hinting at the real balance-card layout). Confirmed as a real but
one-time loading flash, consistent with the user's own note that it wasn't
reliably reproducible. Not fixed (design-polish item, not a functional
bug). Two other apparent shell-vs-real differences (third "Pending"
stat-pill, `WithdrawPanel`'s self-contained history list vs. the shell's
separate "Withdrawals" section) confirmed as documented deliberate
real-code evolutions past the shell (Sections 43/44) — not gaps.

**New bug found and fixed — `HistoryWork.tsx`/`HistoryJobs.tsx` shipped
fully unstyled:** continuing the sweep to History screens + `WithdrawalRow`
per the standing order, neither file's own `<style>` block declares the
classes their rendered children need — `HistoryWork.tsx` renders
`<ApplicationCard>` (`.hist-row`/`.hist-sub`/`.hist-sub.pos`/`.hist-amt`),
`HistoryJobs.tsx` renders `<JobCard>` (`.job-post-row`/`.jp-top`/`.jp-amt`/
`.jp-status-row`/`.jp-applicants`/`.jp-refund-badge`/`.status-pill` +
variants). Those classes exist today only inside `Dashboard.tsx`'s
embedded `<style>` block, which unmounts along with `Dashboard` on
navigation — same root cause as Section 43's original "shipped fully
unstyled" incident, but here affecting every "See all →" click, not an
edge case. `HistoryWithdrawals.tsx` is the control case: it already
redeclares `.hist-row`/`.status-pill` itself, citing Section 43's standing
rule in its own comment — whoever patched the other two in the same
session missed applying that rule to them. Confirmed live before fixing:
flat text, no cards, no borders, no color coding, no amount styling on
both routes.

Fixed by copying the missing rules 1:1 from `Dashboard.tsx`'s existing
declarations into each file's own `<style>` block (reprefixed
`.hw-histwork`/`.hw-histjobs`), following `HistoryWithdrawals.tsx`'s exact
precedent. Applied via a Python patch script (backup + anchor-uniqueness
check, refuses to touch anything ambiguous) rather than manual editing, at
the user's request to avoid risky manual nano edits. Both patches applied
cleanly, diffs confirmed clean single-block insertions right after each
file's `.skel-pill` rule, nothing else touched. Build clean (`npx tsc &&
npx vite build`, dist bumped to 324.97 kB total). Pushed, deployed, and
live-verified on both `/history/work` and `/history/jobs`: bordered rows,
mono-font amounts, status pills, refund badges all render correctly.
Committed: `frontend/src/pages/HistoryWork.tsx` +
`frontend/src/pages/HistoryJobs.tsx`.

**Minor, not fixed this session:** both files hardcode hex literals
(`#1B1A1F`, `#5643D9`, `#E7E3DA`, `#6B6874`, `#FFFFFF`) instead of `:root`
custom properties — values are correct but breaks from the tokenized
pattern `HistoryWithdrawals.tsx` (and every other patched file) uses.
Flagged for a follow-up tokenization pass, same trip.

Full detail: see session-41.md.

## Next session

1. Finish the History-screens sweep: pull and diff `WithdrawalRow.tsx` and
   re-confirm `HistoryWithdrawals.tsx` (requested but not completed this
   session — session ended on doc updates instead). Then continue
   oldest-first to `Profile.tsx`/`Onboarding.tsx`.
2. Black-rectangle glitch: explained, not fixed — `WithdrawPanel.tsx`'s
   loading skeleton is a plain unstyled bar; worth a design pass
   (shimmer/shape) if picked up, otherwise no functional issue remains.
3. Decide the `PostJob.tsx` wizard step-indicator direction (Section 50)
   and the `JobDetail.tsx` owner-view ledger-connector /
   worker-view dead-CSS-and-attachments items (Section 51) — none fixed
   yet, no due dates set.
4. Tokenize `HistoryWork.tsx`/`HistoryJobs.tsx`'s hardcoded hex literals to
   `:root` custom properties, matching the pattern every other patched
   file uses.
5. Documentation-only, still open: shell's stale profile-menu dropdown vs.
   real hamburger pattern; shell's `ui-ux-feedback` vs. real `ui-feedback`
   category-value naming mismatch. Neither urgent.

No due date set on any of the above — open decision for the user.
