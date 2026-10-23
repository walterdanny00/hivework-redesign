# Session 137 — Piwork

## Focus
Single-worker auto-pay verified live, then single-slot `refund_owner` verified through the admin dispute route. Also closed the "48h review window" observation. Verification only; no code changes.

## Starting-state check
- `git pull`, `git status --short`, `git log --oneline -3` in `~/Piwork` (HEAD `9fc8a30`, docs: session 136, roadmap section 151), `git pull` in `~/hivework-redesign`, and the `diff -rq` drift check: all clean, drift check silent.

## Code read
- `backend/src/lib/settlement.ts` lines 85-150 (`paySubmittedSlot`, single-slot branch); `backend/src/lib/slotDeadlineChecker.ts` lines 626-757 (`AUTOPAY_LIVE`, `autoPayExpiredReviews`, `remindOwnersBeforeAutoPay`) and 760-780 (`checkSlotDeadlines`, `startSlotDeadlineChecker`). The checker lives in `lib/`, not `jobs/`.
- `routes/jobs.ts` lines 229-236 (`reviewWindowHours`, default 72, allowed 48-336 hours) and 801-804 (`review_due_at = submitted_at + review_window_hours`; null window gives no timer); `PostJob.tsx` default `'72'`, chips 48h / 72h / 7d / 14d.
- `routes/admin.ts` lines 40-105 (resolve handler) and `settlement.ts` lines 1-90 (`refundSubmittedSlot`) for the single-slot refund path.

## Single-worker auto-pay (live)
- `REVIEW_AUTOPAY_LIVE` was already `true` on Render; a pre-check for overdue submitted applications returned no rows.
- Job `07f84581-35fd-4a59-8d06-d6d8b03eb6a8` ("Fuicthf", 1π, 1 slot, 48h window), `Olawalt`, application `14fc6ec8-a2f7-463c-8d58-5d786476d73a`. Backdated `review_due_at` to one minute ago; the credit landed at 17:01:34 UTC and Render logged "Review auto-pay: paid." at 17:01:36 UTC.
- After: application `completed`, `review_due_at` null (`slot_status` stays `active` by design); job `completed`, `payout_claimed` true; one 1.0000 `job_completion` credit. `Olawalt` 1754π / 92 / 1π pending / 1064π to 1755π / 93 / 0π / 1065π; owner balance unchanged at 58.3334π.
- Notices: owner "Review window ended" naming @Olawalt; worker "Payment sent: You were paid 1π for "Fuicthf"." **Pass.**

## 48h review window (closed)
- Jobs `6116e803-d5c6-4b35-9e2c-938f1e5d2ca0`, `22d995e1-f676-4978-95bd-a132ce08d23c` and `07f84581-…` all store `review_window_hours = 48`. Backend and form defaults are 72 and nothing converts 72 to 48, so 48 was sent explicitly (the form's 48-hour chip). Which chip was tapped was not asked. No bug.

## Single-slot `refund_owner`
- Job `44fad615-4ff8-41fd-a1cf-e9c25bead12b` ("Sujxgc", 1π, 1 slot), `Olawalt`, application `5abb59a1-ac0f-47ce-8f4e-a8454e245b26`, dispute `2878c54b-9207-4fcb-9e57-4a0629fcc96e`.
- Resolved `refund_owner`: `{"ok":true,"outcome":"refund_owner","amount":1}`, HTTP 200. Repeat: 409 "This dispute is already resolved.", nothing moved.
- After: application `approved`/`missed`, `closed_reason = 'dispute_refund'`; job `closed`, `payout_claimed` false; one 1.0000 `refund` credit tied to the application, no `job_completion` row.
- Dashboards: owner 58.3334π to 59.3334π, earned 160π / 16 jobs unchanged. `Olawalt` pending 1π to 0π (the Pending drop is now observed for a single-slot `missed` slot), earned 1755π / 93 jobs / 1065π unchanged.
- Notices: owner "Dispute resolved … refunded to you" and "Refund available: 1.00π from "Sujxgc"…"; worker "Dispute resolved … decided for the client, and the slot was refunded to them." Owner My Jobs shows "Sujxgc" Closed with a "1π refunded" chip. **Pass.**

## Not verified
- The `released` close reason; the 24h/6h `review_reminder` notices; the revision-return path.
- Auto-pay's dry-run branch and its skip on an open dispute.
- `Eliza1914`'s "Payment sent" notice for the in-app completion.
- Payments page edge cases; worker `submitted` panel history; the rest of Section 145's naming list.
- `version_no` sort with 2+ versions; versions endpoint 403 path; version-insert failure branch.
- Job `37301bfd…` 0.6667 rows; the My Jobs "posted" total against `jobs`.

## Observations (not fixed)
- `returnLapsedRevisions` falls back to `review_window_hours || 72` while submit gives a null-window job no timer (legacy jobs only).
- The server allows any integer 48-336 hours; the form offers four chips.
- Single-slot applications keep `slot_status = 'active'` after payment.
- Earlier accepted limits unchanged.

## Files touched
`roadmap.md` (Section 152), `sessions/session-137.md`. No backend or frontend changes.

## Closed this session
- Single-worker auto-pay (live, end to end); `review_auto_paid` notice; single-slot `refund_owner` via the admin route; the `missed`-slot Pending drop; the 48h review window observation.

## Next session
Start with `git pull` and `git status --short` in `~/Piwork` (HEAD should be the session 137 docs commit or later), then the two-repo drift check. Then test the 24h/6h owner reminders: read `remindOwnersBeforeAutoPay` (`slotDeadlineChecker.ts` lines 696-757) first, then create a fresh 1-slot job, have the worker submit, set `review_due_at` inside the 24h window (and later inside 6h) in SQL, wait one 5-minute poll and check the `review_reminder` notice and the `review_reminded_*_for` columns. After that: the revision-return path, the `released` reason, the rest of Section 145's list, the worker `submitted` panel history, an admin page, reviewer delegation (`job_reviewers`) and dispute chat.

Termux reminder: `export BASE=https://hivework-backend.onrender.com`, then check `echo "BASE=[$BASE]"; echo "key length: ${#ADMIN_KEY}"`; use `curl -sS -w "\nHTTP %{http_code}\n"` with `-H "x-admin-key: $ADMIN_KEY"` and the `/api/admin` prefix. When a file path is a guess, run `grep -rn` first.

Deliver the **complete, updated `roadmap.md`** as one downloadable file (standing rule at the top of the roadmap) — never a section-only file or a `cat >>` instruction — plus the session brief.
