# Session 13 — 2026-08-11

**Focus:** `WithdrawPanel.tsx`/`HistoryWithdrawals.tsx` real-detail parity,
picked up after reconciling with the actual repo files (user pulled and
pasted both from Termux). This closes two items from the running gap list:
the plain-text "contact support" bug and the WithdrawPanel parity gap,
which turned out to be the same component.

## Swept first, per standing workflow rule

Read `WithdrawPanel.tsx` and `HistoryWithdrawals.tsx` directly before
building anything. Confirmed real: dynamic fee/net preview, "Withdraw all,"
a wallet note (whose real meaning corrects an earlier assumption — see
roadmap Section 15), status badges (queued/processing/completed/failed),
fee/net split + shortened address on every history row, and the actual
plain-text "contact support" bug in the failed-row error line.

## Built, both shells

- Real `WithdrawPanel` (React component / vanilla-JS render function)
  replacing the old static balance-card markup: live fee/net preview,
  "Withdraw all," the corrected wallet-note copy, real validation-gated
  Withdraw button, and a "Demo: simulate failed request" trigger (same
  reviewer-visibility convention as session 11's wallet-connect states).
  A real submit decrements the balance and prepends a new `queued` row to
  history.
- Withdrawal history rows (Dashboard mini-preview + full History page, one
  shared renderer) upgraded to the real shape: status badge (reusing
  existing violet/teal/coral tint pairs, no new colors), fee/net split,
  address, and the real Contact Support widget mounted inline on failed
  rows — Bug Fix Log #14.
- Flat 0.01π fee flagged in-code as demo data, not a confirmed real number
  (the real value is API-driven, not a frontend constant).

## A mistake caught mid-build

Drafted an `instanceKey` prop for the JSX shell's Contact Support usage,
carrying over the vanilla-JS shell's id-collision fix by habit. Checked the
real `HiveworkContactSupport` component before shipping it — it uses local
`useState`, so React already scopes every mounted instance's state
automatically. Removed the unnecessary prop. The HTML shell still needed
its own fix (ctx-prefixed container ids), since that's a real collision
risk in vanilla JS.

## Verification

- HTML shell: full headless-browser test — fee/net preview updates live
  with focus retained while typing, submit button enables/disables
  correctly, "Withdraw all," demo-fail trigger, a real submit decrementing
  balance + adding a `queued` row, all 4 status badge colors, and the
  failed row's Contact Support widget opening/typing/sending from both the
  Dashboard preview and the full History page at once with no id
  collision. One console message (403 on the Google Fonts CDN fetch)
  confirmed pre-existing/unrelated — no network access in this sandbox.
- JSX shell: brace/paren/bracket balance check only (net-zero) — same
  standing limitation, no JSX build/lint tool available here.

## Roadmap changes

New Section 15 with the full writeup above. Section 6's original gap note
marked fixed with a pointer to it. Section 5 updated — both the profile-menu
wiring (already done in session 12, previously left unmarked) and this
session's WithdrawPanel parity now show ✅. New Bug Fix Log entry #14.

## Files touched

`hivework-app-v4-3.html`, `HiveworkApp.jsx`, `roadmap.md`, this session
brief (`session-13.md`).

## Next session

Two real product gaps remain from the original session-10 list:

- Single-worker Post Job has no deadline field anywhere in real code
  (`deadline_mode` etc. only exist inside the multi-worker conditional)
- Rejected-application state has no owner-side render branch in Job Detail
  — correction from prior phrasing: the worker-side "Not selected" panel
  is already fully built in both shells (state meta, ledger styling, CTA),
  just not reachable via a demo trigger yet. The real untouched gap is on
  the owner side — declining an applicant in the Applicants tab just
  silently removes them, with no confirmation, undo, or record of who was
  declined.

Also still open, not part of the original flagged list:
- Real `Layout.tsx` logged-out-hides-nav-items behavior (Post Job/
  Dashboard/NotificationBell should disappear when disconnected — relevant
  again since Log out exists)
- `WithdrawPanel`'s `refund` kind (client refund balance, same component/
  copy variant) isn't demoed in either shell — only `earnings` kind shown
- `JobCard.tsx`'s "↩ Xπ refunded" badge, still unbuilt
