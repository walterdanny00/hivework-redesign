# Session Brief — 2026-08-03

## What happened
Continued the Hivework redesign: reviewed and fixed bugs across the mockup
set, resolved the Dashboard/nav confusion against real code, built and
then replaced the Onboarding flow, fixed a component-duplication bug on
Dashboard, settled the workflow question of separate-files-vs-compiled,
and built a first pass at Job Detail's multi-worker layout.

## Decisions made
- **Nav confirmed at 4 items**: Home / Browse / Post / Dashboard. Verified
  by inspecting `Dashboard.tsx` directly — it IS the mockup's old
  "Earnings" screen under the wrong name, not a separate thing. The three
  `history/*` routes are drill-ins from Dashboard, not nav-level screens.
- **Applicants placement resolved**: inline on Job Detail, not a separate
  screen. Grounded in the actual codebase (`JobDetail.tsx` already handles
  applicants + rating in one component), not a stylistic guess.
- **Workflow going forward**: build/iterate screens as separate files,
  matching the real app's per-route component structure. Only compile
  into one shell file when a full clickable demo is specifically wanted,
  as a deliberate step — not maintained by hand indefinitely.
- **Onboarding**: user's own build (`hivework-onboarding.html` /
  `HiveworkOnboarding.jsx`) adopted as canonical, replacing an earlier
  Claude-built version. Stronger interaction design (collapsible KYC pill,
  live wallet-connect visual, TOS-gated Connect button, routing
  confirmation screen).
- **Design process docs** moved to this separate public repo
  (`hivework-redesign`), apart from the main Piwork codebase repo.

## Bugs found and fixed
- Profile screen dead end (no back button) — fixed twice, regressed once
  between mockup versions
- Profile Verified/Gold badges losing their color to a `.cover .chip`
  override — same, fixed twice
- Post wizard step indicator mismatched the fields actually shown — same,
  fixed twice
- Testnet badge initially used a hardcoded, bordered, off-token color
  scheme — rebuilt using actual CSS custom properties, no border, neutral
  tone (previous version was borrowing `chip-gold`'s amber inappropriately)
- Dashboard's "Your work" and "Withdrawals" used two different list
  components for the same kind of content — found and fixed by the user,
  consolidated to one (`.hist-row`)
- Shell file still contained superseded onboarding screens after the
  canonical version was adopted elsewhere — removed

## Built this session
- Onboarding (4 screens) — canonical version is the user's own build
- Job Detail, multi-worker owner view (`hivework-job-detail.html` /
  `HiveworkJobDetail.jsx`) — Claude's first pass; user building their own
  version to compare before one is picked as canonical

## Open going into next session
- Job Detail: waiting on user's own version to compare against Claude's
- Post Job wizard steps 2–3 still placeholders
- Async wallet-connect states (loading/error) on Onboarding Screen 1 — not
  decided
- `profileComplete` nudge on Dashboard — relationship to onboarding's
  skippable profile step not resolved
- Worker (non-owner) view of Job Detail not yet redesigned
