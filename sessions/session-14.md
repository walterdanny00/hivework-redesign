# Session 14 — 2026-08-11

**Focus:** owner-side decline-applicant flow, the last item picked from
session 13's "Next session" list — no confirmation, undo, or record when
an owner declines an applicant in the Applicants tab.

## Swept first, per standing workflow rule

Read `JobDetail.tsx`'s approve/reject logic directly (`handleApprove` and
the surrounding applicant-card render block). Finding: real production has
**no explicit decline/reject feature at all** — no endpoint, no handler.
`status: 'rejected'` only gets set as a side effect of approving someone
else, and only for single-worker jobs. The only owner-facing button on a
pending applicant today is "Approve & Assign." This reclassifies the item
from a parity gap to a **proposed pattern** (same category as Wallet
Connect) — see roadmap Section 16 for the full writeup.

## Design decisions confirmed with the user before building

- Declined applicants move into a **persistent, collapsed "Declined (N)"
  section** with a per-row Undo — not a transient toast, since an owner
  may check back much later and needs an actual record, not a narrow
  recovery window.
- Confirmation is an **inline "Sure?/Cancel" swap on the button**, not a
  modal — keeps flow unbroken across a list of applicants, matches the
  existing inline-confirm pattern used elsewhere (e.g. Close-unfilled-slots).
- If this pattern were ever built for real, it would need **permanent
  backend storage**, not just session state — confirmed explicitly with
  the user. Narrow but real value flagged: slot-reopening after a
  drop-out, dispute resolution, an owner recalling past decisions across
  jobs. Not proposed for worker-side exposure or as an analytics surface.

## Built, both shells

- Two-step decline: `requestDecline` → inline confirm swap →
  `confirmDecline` moves the applicant out of `applicants` and into a new
  `declined` array; `cancelDecline` backs out without side effects.
- Collapsed "Declined (N)" footer section under the Applicants tab
  (`declinedExpanded` toggle), each row with an `undoDecline` action that
  restores the applicant to the live list.
- New CSS for `.decline-confirm`/`.decline-cancel`/`.undo` buttons and the
  `.declined-section`/`.declined-toggle`/`.declined-row` block, reusing
  the existing coral danger token — no new colors introduced.

## Verification

- HTML shell: full headless-browser test — Decline arms the inline
  confirm swap, Confirm moves the applicant into a "Declined (1)" section
  that expands on click, Undo restores them to the live list and the
  section disappears cleanly once empty again.
- JSX shell: brace/paren balance check only (net-zero) — same standing
  limitation, no JSX build tool in this sandbox.

## Roadmap changes

New Section 16 with the full writeup above.

## Files touched

`hivework-app-v4-3.html`, `HiveworkApp.jsx`, `roadmap.md`, this session
brief (`session-14.md`).

## Next session

Two items remain open, not part of the original session-10 list:

- Real `Layout.tsx` logged-out-hides-nav-items behavior (Post Job/
  Dashboard/NotificationBell should disappear when disconnected)
- `WithdrawPanel`'s `refund` kind (client refund balance, same component/
  copy variant) isn't demoed in either shell — only `earnings` kind shown
- `JobCard.tsx`'s "↩ Xπ refunded" badge, still unbuilt

The original session-10 gap list (Post Job single-worker deadline field,
owner-side decline flow) is now fully closed.
