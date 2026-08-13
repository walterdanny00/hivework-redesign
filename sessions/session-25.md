# Session 25 — 2026-08-13

**Focus:** correcting session 24's premature "fully done" claim on
Section 22 item 2 — reconciling Home's personalized hero (earnings
total, active-ticket card) against Dashboard, which session 24 never
touched.

## Starting-state check

Read `roadmap.md` (all 27 sections), `session-23.md`, `session-24.md`
before starting, per standing rule. Verified both shells matched
session 24's claimed state via targeted greps (`hw-eyebrow`,
`hw-trust-row`, `hw-help`, `composeSubmission`, etc. — all present,
counts matched between shells).

## Gap found on re-read, not on first pass

User pushed back that item 2 wasn't actually done. Re-reading Section
22's original finding closely (not just trusting session 24's status
line) surfaced the miss: real `Home.tsx` has no auth branch — identical
content whether connected or not — and the shell's personalized hero
was flagged back in Section 22 as having no real counterpart, reading
"closer to what Dashboard should show." Session 24 added the real
content set (trust badge, stat row, categories, Help link) directly
under that unresolved hero without ever reconciling it against
Dashboard. That reconciliation is what this session closes.

## Decision process — discussed with user before building

Per the standing rule, treated "`Home.tsx` has no auth branch" as a
structural fact from the old code, not a UX mandate — didn't take it as
license to strip personalization. The actual design call was decided on
content-overlap grounds, independent of that fact:

- **Earnings hero → reputation stat.** Checked first whether it even
  conflicted with Dashboard: Dashboard shows *balance* (withdrawable,
  drops on withdrawal), not lifetime earned, so the old "Total earned
  116π" never literally duplicated a Dashboard number. Swapped anyway,
  on narrower grounds — it's still a money/ledger metric by category,
  which is Dashboard's domain by convention. Rating + jobs-completed is
  identity, not money — Home's territory. Walked user through 4 options
  (reputation / recommended-job-as-ticket / since-last-visit pulse /
  next-action nudge) with a live HTML mockup before deciding.
- **Escrow-locked ticket → live activity ticker.** The ticket showed
  the user's own job status, duplicating Dashboard's active-jobs list.
  User asked to keep the ticket visual rather than deleting it outright
  → repurposed as anonymized, platform-wide recent activity (proof for
  the Sentinel badge above it), then user asked for it animated →
  built as an auto-advancing carousel (3 slides, 4s interval), swipeable,
  dot indicators, pauses on drag, disables both the auto-advance and the
  live-dot pulse under `prefers-reduced-motion`. Demoed as a standalone
  interactive HTML mockup before building into the real shells.

## Built — both shells

- Home hero slot: reputation stat (★ rating + jobs-completed), replacing
  the earnings figure.
- Home ticket slot: `ACTIVITY_TICKER` carousel (JSX: React state +
  `useEffect` interval + pointer handlers; HTML: vanilla-JS equivalent,
  `initHomeTicker()`), replacing the single escrow-locked ticket.
- Recommended for you, Categories, Help link: untouched.

## Bugs caught before shipping

- **Content collision:** first draft of the ticker's lead slide reused
  the same job ("Localize onboarding copy" / Translation / 6π) already
  shown in "Recommended for you" directly below it — caught via a
  rendered screenshot, not a code read. Swapped to a distinct demo job
  (Content review / "Product FAQ copy pass" / 5π).
- **Self-caused regression:** a `sed` used to temporarily boot the HTML
  shell to `home` for the screenshot check over-matched and silently
  rewrote `routeAfterOnboarding()`'s unrelated fallback from
  `showScreen('home')` to `showScreen('landing')`. Caught by re-grepping
  the target string after running sed, before calling the task done;
  reverted.

## Left undecided, intentionally

Whether ticker slides should deep-link anywhere. An early HTML draft
wired two slides to `openDetail()`, inconsistent with the JSX shell and
conceptually shaky (anonymized activity isn't "yours" to click into) —
removed rather than guessed. Both shells currently render the ticker as
informational-only.

## Flagged as demo data

`ACTIVITY_TICKER`'s three entries are placeholder content, same
convention as `CATEGORY_COUNTS` — no real "recent activity feed"
endpoint has been confirmed to exist in the real app.

## Verification

JSX and HTML both brace/paren/bracket-balance (net-zero) after every
edit. Rendered the HTML shell with Playwright (local `file://`, no
network needed) and screenshotted Home directly — first session this
project has had an actual visual render check rather than code-only
verification; it's what caught the content-collision bug above.

## Roadmap changes

Section 28 added.

## Files touched

`HiveworkApp.jsx`, `hivework-app-v4-3.html`, `roadmap.md`, this session
brief (`session-25.md`).

## Next session

- Section 22 item 2 is now genuinely fully done — hero and ticket both
  reconciled against Dashboard, not just content-added-on-top.
- Section 22 item 3 — support access point placement outside the
  profile menu — is the only remaining open item. Not yet started. Will
  need a Termux sweep of the real `Layout.tsx` (header/footer structure,
  any prior support-link precedent) before designing anything, per
  standing rule.
