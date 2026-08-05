# Session 01 — Hivework Redesign

**Date:** 2026-08-05
**Covers:** Everything from the start of the UI redesign through today's Job Detail port and repo setup.

## Summary

Full visual redesign of the Hivework/Piwork frontend, using a new design system
(cream/ink/violet palette, Sora/Inter/JetBrains Mono type, an "escrow ticker"
signature element). The goal is for the **old app to match the new design**,
not the reverse — old screen/code boundaries are treated as facts to verify
against, not constraints on the redesign itself.

## Screens — status as of today

| Screen | Status |
|---|---|
| Landing | Done |
| Home | Done |
| Browse | Done |
| Dashboard | Done (was mislabeled "Earnings" in early mockups) |
| History → Work / Jobs / Withdrawals | Done (drill-ins from Dashboard) |
| Profile | Done |
| Onboarding | Built as a proposed new pattern — does **not** represent the real `/onboarding` route (see below) |
| Job Detail | In progress — owner view built today (tabbed Overview/Applicants/Slots, ledger-style Slots); worker/non-owner view not started |
| Post Job | In progress — only wizard step 1 "Basics" built |

## Key decisions this phase

- **Profile menu — kept.** Confirmed via direct code read (`Layout.tsx`, `Profile.tsx`) that no dropdown exists in the real app today — the avatar is a plain link, and there's no log-out anywhere in the codebase. Despite that mismatch, the profile-menu (Notification settings / Contact support / Log out) is being kept in the redesign as a deliberate product improvement, since the old app never had a sign-out feature at all. None of its three items are wired to real functionality yet — that's deferred to a later implementation pass.

- **Onboarding — reconciled, kept as a separate proposal.** Reading `Onboarding.tsx` directly showed the real route is a single reactive profile-completion form (triggered when a worker tries to apply without skills filled in), not a wallet-connect flow. Wallet connection is actually fully automatic (`Pi.authenticate()` fires on mount via `usePi.ts`). The built 4-screen onboarding flow is kept as a proposed new pattern (adds a consent/disclosure step that arguably should exist), but doesn't represent the real `/onboarding` route — that screen is still undesigned.

- **Job Detail — the canonical HTML/JSX pair from earlier notes never actually existed on device.** Only an "alt" variant (`hivework-job-detail-alt.html`) was found, restored from device trash. That alt version — tabbed Overview/Applicants/Slots card, Slots reimagined as a route-style ledger — is now the working canonical Job Detail design. Claude ported it 1:1 into `HiveworkJobDetail.jsx` today.

## Real gaps found via code sweep (not yet in any mockup)

- **Contact Support** — real reusable inline widget (`ContactSupport.tsx`), not a modal/route: collapsed text link that expands in-place into a small form. Two spots (`WithdrawPanel.tsx`, `HistoryWithdrawals.tsx`) still show plain unlinked "contact support" text instead of the real component — a live bug, separate from the redesign.
- **Notification settings** — confirmed to not exist anywhere in the codebase; static label only.
- **RangeFilter** — a "This week/This month/All" calendar-based (not rolling) segmented filter used across all 3 History pages; never represented in mockups.
- **NotificationBell** — real component is a full-width dropdown panel (not tied to the avatar menu), with live unread-count badge, 45s polling, real notification list, mark-all-read-on-open, tap-to-navigate. Earlier mockups had this wrong (tied to the same toggle as the avatar) and need correcting, not just adding to.
- **WithdrawPanel** — dual-purpose via a `kind` prop (earnings vs refund, same panel/different copy); live fee/net preview, "Withdraw all" quick-max link, and a wallet-confirmation warning are all missing from the current mockup.
- **JobCard** — real component shows a "↩ Xπ refunded" badge, not yet in any mockup.
- **Nav** — settled at 4 items (Home/Browse/Post/Dashboard); confirmed the real bottom nav label is actually "Earnings" pointing at `/dashboard`, so the redesign's rename to "Dashboard" is a deliberate choice, not a correction.

## Standing workflow rules established this session

- **Termux sweep before every screen.** Before redesigning any particular screen, always do a thorough sweep of the code/files on Termux first, to see everything actually supposed to be on that screen. Applies to every future screen.
- **Dual-push.** Every update (screens, specs, session briefs, roadmap) gets pushed to both: the `hivework-redesign/` folder inside the main `Piwork` repo, and the standalone `hivework-redesign` repo on GitHub — same content, both places.
- **Session briefs numbered.** `sessions/session-01.md`, `session-02.md`, etc.

## Repo setup completed today

- Created the standalone `hivework-redesign` repo on GitHub (didn't exist before).
- Initialized it locally, pushed the full 16-file baseline (screens, tokens, specs, sessions, roadmap).
- Both repos now use HTTPS + personal access token for git auth (switched from a stalled SSH host-key prompt).
- Confirmed the main `Piwork` repo's `hivework-redesign/` folder was already up to date.

## Open items

- BUG-114 (low priority) — signing-service 429/non-JSON failure root cause still unconfirmed.
- BUG-005 — bump frontend Node engine 20.x → 24.x before 2026-10-01.
- Real `/onboarding` (profile-completion form) — still not designed.
- Job Detail worker (non-owner) view — not started.
- Post Job wizard steps 2–3 — still placeholders.
- NotificationBell needs correcting in existing shell files (not just added as new).
- WithdrawPanel's two "plain text contact support" spots need swapping to the real `ContactSupport` component.
