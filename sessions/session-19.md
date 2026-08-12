# Session 19 — 2026-08-12

**Focus:** closed the one genuine, actionable gap flagged by the 2026-08-12
audit (roadmap Section 15, Correction #2 / Section 19's Bug Fix Log): the
JobCard "↩ Xπ refunded" badge existed in the real app (`JobCard.tsx`,
`!!job.refunded` check) but was never demoed in either shell.

## Fix — JobCard refund badge, both shells

Added a third card to the Dashboard myjobs "Jobs you've posted" list
representing a closed job whose unfilled slots were refunded, gated on a
demo `refunded` flag — same "real-app-confirmed feature just needs
shell-demoing" pattern Section 19 used for the WithdrawPanel refund kind.

- `HiveworkApp.jsx`: new `DASH_CLOSED_JOB` demo constant
  (`{ title, amt, refunded: true, refundedAmt }`) near the other demo-data
  constants. Third `.job-post-row` rendered conditionally on
  `DASH_CLOSED_JOB.refunded`, showing a new `.status-pill.closed` pill and
  a `.jp-refund-badge` reading "↩ 4π refunded".
- `hivework-app-v4-3.html`: mirrors the JSX — new `HW_DASH_CLOSED_JOB`
  constant, a static `#dash-closed-job-row` block (hidden by default),
  populated by new `renderDashClosedJob()` — wired into the same dashboard
  init call as `renderRefundPanel()`/`renderDashRefundHistory()`. Same
  `.status-pill.closed` / `.jp-refund-badge` CSS added.
- Both shells: `.status-pill.closed` (`#F1EFEA` / `--ink-soft`) and
  `.jp-refund-badge` (violet-bordered mono pill, reusing
  `--violet-deep`/`--cream` — same tokens as the `.wd-kind-tag` pill from
  Section 20, no new colors) added next to the existing `.status-pill.open`/
  `.status-pill.escrow` rules.

**Verification:** brace/paren/bracket-balance check (Node, net-zero) on
`HiveworkApp.jsx`; `hivework-app-v4-3.html`'s inline `<script>` extracted
and passed `node --check`. No headless-browser run — same standing sandbox
limitation as every prior session (no network access to install one).

## Roadmap changes

Section 21 added, closing out the badge gap tracked since Section 15
Correction #2 / Section 19.

## Files touched

`HiveworkApp.jsx`, `hivework-app-v4-3.html`, `roadmap.md`, this session
brief (`session-19.md`).

## Next session

- No other actionable shell-demo gaps currently tracked. Remaining items
  are standing/deferred: KYC/testnet badge wiring (deferred until KYC is
  actually implemented), Pi Browser real-presence detection (standing gap,
  Section 8/17), and full backend pagination for the History lists
  (data-source gap, not an unwired-feature gap, per Section 20).

## Correction (2026-08-12, later same day — post-sweep)

The "Next session" note above is now stale. A large structural sweep run
later the same day (session 20, roadmap Section 22) found three real,
actionable gaps this brief didn't anticipate: History rows have no
click-through to Job Detail (the real `ApplicationCard.tsx` is fully
clickable to `/jobs/:id`; the shell's `HistoryRow` has no click handler
at all), Home's real content (stats row, categories, trust-badge concept,
how-it-works) was never built, and a persistent support-access point
outside the profile menu is worth reconsidering (the shell reverted its
own footer link in session 15/16 without knowing the real `Layout.tsx`
footer link exists specifically to fix a reported gap, BUG-106). See
`session-20.md` and roadmap Section 22 for full detail.
