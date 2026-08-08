# Session 09 — 2026-08-08

**Focus:** shell recompile, steps 1 and 3–5 (bell/avatar decouple, Job
Detail owner+worker swap, Post Job wizard swap, Landing + Wallet Connect +
real Onboarding wired in).

## Step 1 — bell/avatar decouple + remove standalone Applicants screen

Applied to **both** `HiveworkApp.jsx` and `hivework-app-v4-3.html`.

- Avatar keeps the profile menu (now 5 items — "Wallet settings" cut per
  decision, "Edit profile" kept)
- Bell gets its own fully separate notification panel: sample data, real
  coral unread-count badge ("9+" style, replacing the old static dot),
  optimistic mark-all-read-on-open, click-outside-to-close overlay added
  for both panels
- Standalone Applicants screen/route removed entirely — both "Review
  applicants →" buttons on Dashboard now open Job Detail directly, matching
  the real-code decision that applicant review lives inline in `JobDetail.tsx`

## Step 3 — Job Detail owner + worker swap (`HiveworkApp.jsx` only)

- Added `isOwner` to the shell's flat job data — `mine`/`translate` → true
  (both appear in Dashboard's "Jobs you've posted"), `bug` → false
- Ported the full canonical `JobDetailOwner` component in from
  `HiveworkJobDetail.jsx` (tabbed Overview/Applicants/Slots, trust badges,
  ledger, Close-unfilled-slots, inline rating)
- User confirmed the owner-view comparison was moot — their re-upload
  "pulled straight from the repo" was identical to the already-reconciled
  canonical pair, not a divergent build
- Ported the full canonical `JobDetailWorker` component in once
  `HiveworkJobDetailWorker.jsx` was uploaded (11-state ledger, self-driving
  via internal callbacks); the shell's one non-owner job (`bug`) got
  placeholder `slotsTotal`/`slotsFilled`/`client` fields since the flat
  `JOB_DATA` object doesn't model real per-job slot data
- **Bug found + fixed:** the shell had zero `:root` token block, relying
  entirely on a non-existent `./hivework-tokens.css` import — broke preview
  completely. Fixed by inlining the same token values used across all other
  canonical files directly into the shell's own `<style>` block.

## Step 4 — Post Job wizard swap (`HiveworkApp.jsx` only)

- Ported the full 4-step wizard in wholesale (Basics/Details/Workers &
  Deadline/Review, 7 categories, searchable device/language combobox,
  worker stepper, deadline-mode branching)
- Removed the shell's orphaned top-level `category` state and dead
  `.cat-select`/`.cat-opt` CSS that only served the old flat form

## Step 5 — Landing + Wallet Connect + real Onboarding (`HiveworkApp.jsx` only)

- App now starts at `screen="landing"` (matches the real `/` route),
  rendered full-page without the shell's persistent header/segnav
- Landing's CTAs set an `onboardingIntent` state and originally routed to
  Profile Complete — **this was wrong.**

### Bug caught by user: Landing was wired to the wrong screen

Landing's "Get started"/hero CTAs had been wired to
`HiveworkProfileCompleteScreen` (the real `/onboarding` route, which per
the roadmap is meant to be reached only from Dashboard's nudge). The
correct target is the proposed Wallet Connect flow
(`HiveworkOnboarding.jsx` — Connect/Profile/Notify, wallet card, KYC pill,
ToS checkbox, routing spinner). User uploaded `HiveworkOnboarding.jsx` +
`.html`; ported in as `HiveworkOnboardingFlow` under a new `welcome`
screen key, distinct from `onboarding` (which now serves only the
Dashboard nudge path). Also fixed in the same pass: Dashboard's "Finish →"
nudge was separately bugged to route to `profile` instead of `onboarding`
— now correct.

Dropped the file's own `PreviewControls` dev harness per its header
comment ("delete once wired to real detection"); added missing
`ShieldIcon`/`ChevIcon` (`BackIcon`/`CheckIcon` already existed in the
shell and were reused). Same missing-`:root`-token bug as the shell/Landing
had — fixed the same way.

## Status after this session

**All 6 shell-recompile steps are done in `HiveworkApp.jsx`** except Range
Filter/Contact Support wiring (step 6, not started). `hivework-app-v4-3.html`
only has step 1 — it needs its own dedicated pass through steps 3–5, which
can't directly reuse the JSX work since the vanilla-JS shell uses a
different state model (DOM classList toggling vs. React state).

## Next session

- Step 6: wire `HiveworkRangeFilter.jsx` into the 3 History screens and
  `HiveworkContactSupport.jsx` into Job Detail/Post Job/Withdrawal error
  states, in `HiveworkApp.jsx`
- Separate pass: bring `hivework-app-v4-3.html` up to parity with the JSX
  shell (steps 3–5)
