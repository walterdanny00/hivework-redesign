# Session 20 — 2026-08-12

**Focus:** user flagged the JobCard refund badge gap (closed in session
19), then asked for a large, thorough structural sweep of the real app —
not another one-off screen check. This session is that sweep, its
self-correction, and logging the resulting findings into the roadmap.

## Part A — Real component/page inventory + routing

Pulled the actual file structure first, since earlier guessed paths
(`src/pages`, `src/components` at repo root) were wrong — the real code
lives under `frontend/src`. Full inventory:

**Components:** `ApplicationCard.tsx`, `ContactSupport.tsx`, `JobCard.tsx`,
`Layout.tsx`, `NotificationBell.tsx`, `RangeFilter.tsx`,
`WithdrawPanel.tsx`

**Pages:** `Dashboard.tsx`, `HistoryJobs.tsx`, `HistoryWithdrawals.tsx`,
`HistoryWork.tsx`, `Home.tsx`, `JobDetail.tsx`, `Jobs.tsx`, `Onboarding.tsx`,
`PostJob.tsx`, `Profile.tsx`

**Lib:** `RoutePersistence.tsx` (routing only, all routes live in
`App.tsx`)

Cross-checked against roadmap's Screen Inventory (Section 1) — most map
cleanly, but four didn't: `ApplicationCard.tsx`, `Home.tsx`,
`RoutePersistence.tsx`, and the full shape of `Layout.tsx` had never been
fully read/diffed. Pulled all four in full.

## Part B — Findings

**`ApplicationCard.tsx`:** single shared component used by both the
Dashboard summary and `HistoryWork.tsx` ("so the two can't visually
drift"). The **whole card is clickable**, navigating to `/jobs/:id`. This
is a routing fact the shell has no equivalent for — `HistoryRow` (used
across all 3 History screens) has no click handler at all. Badge logic:
green (approved/completed), red (rejected), purple (else), plus a
separate "Paid" badge. No separate earnings ledger for workers — a
completed application *is* the payment record.

**`Home.tsx`:** no auth branch — one component, identical content whether
connected or not (no `Landing.tsx` exists in the real app). Content set:
a "Sentinel Trust Layer" trust-badge concept, a stat row (live open-job
count from `/api/jobs/stats`, platform fee %, category count), a
Categories list with live per-category counts, and a 3-step "How it
works" explainer. None of this exists in the shell — the shell's "Home"
screen (personalized earnings hero, "Welcome back, Olawalt") has no real
counterpart and reads closer to what Dashboard should show.

**`RoutePersistence.tsx`:** pure technical behavior — Pi Browser
refreshes reload to `/`, so the last in-app route is restored from
localStorage, gated to Pi Browser only via a `window.Pi` check. No visual
component, no UX implication, logged for future reference only.

**`Layout.tsx`:** two separate navs in the real app — a sticky top header
(logo, Browse/Post Job/Dashboard links, bell, avatar) and a separate
sticky bottom tab bar (🏠 Home / 🔍 Jobs / ➕ Post / 📊 Earnings). Also has
a persistent footer "Need help? Contact support" line, explicitly tagged
`BUG-106` ("several error messages elsewhere tell people to 'contact
support' but there was previously no way to actually do that anywhere in
the app"). Logged-out header state is plain text ("Open in Pi Browser"),
not a CTA.

## Part C — Self-correction

First pass framed the nav difference (shell's single segmented-pill
`segnav` vs. the real top-header-plus-bottom-tab-bar layout) as a
structural mismatch to fix. User caught this against the roadmap's own
opening rule — old code informs facts, never dictates UX — before any
work started. Re-sorted every finding into what's legitimately a fact
(routing/data-shape/business-logic) vs. what would have been old code
dictating UX (container/nav shape). The nav-reshape framing was dropped
entirely: `segnav` already reaches all 4 real destinations functionally;
how it's containered is a design-system call.

Legitimate facts kept: the History click-through gap, Home's real content
set, the auth-gating logic, and that a persistent support-access-point
*need* is real (informed by BUG-106) even though its shell footer link
was reverted in session 15/16 without that context.

## Roadmap changes

Section 22 added — full findings write-up, the self-correction, and a
"Next" list of three candidate tasks (History click-through, Home
content, support-access-point placement), none of which are gated behind
KYC/real auth.

## Files touched

`roadmap.md`, `session-19.md` (correction appended), this session brief
(`session-20.md`).

## Next session

- User has not yet picked which of the three Section 22 tasks to start
  on — awaiting direction.
- No code changes made this session — sweep and roadmap logging only.
