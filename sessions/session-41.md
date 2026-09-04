# Session 41 (2026-09-04)

Continued the visual re-verification pass, oldest-first, starting at
`Dashboard.tsx` (per session 40's order). Clean sweep there, and it
explained session 40's unresolved black-rectangle glitch. Moving on to
History screens surfaced a real bug in `HistoryWork.tsx`/`HistoryJobs.tsx`,
fixed and shipped live same session.

## `Dashboard.tsx` — clean sweep, black-rectangle glitch explained

No standalone canonical file exists for Dashboard — confirmed via
`ls ~/hivework-redesign/screens/` (no `*dashboard*`/`*earning*` match) —
same pattern as Browse: it only ever lived inside the compiled shell
(`HiveworkApp.jsx`'s embedded `WithdrawPanel` function,
`hivework-app-v4-3.html`'s Earnings screen). The shell itself served as
the reference.

Checked `Dashboard.tsx`, `WithdrawPanel.tsx`, `ApplicationCard.tsx`,
`JobCard.tsx` — all four clean: no orphan classes, no unscoped tokens, no
dead code. `statusPillClass`/`statusLabel` in `JobCard.tsx` already
reflect the corrected `open`/`in_progress`/`completed` enum from Section
43.

**Black-rectangle glitch (open since session 40), explained:** a grep for
`background:.*#000|background:.*black|background:var(--ink)` across
`Dashboard.tsx`/`WithdrawPanel.tsx`/`ApplicationCard.tsx` found only one
hit — `Dashboard.tsx`'s `.dash-escrow-ticker`, which renders in
`ClientView` ("My Jobs" tab), not `WorkerView` ("My Work" tab, where the
bug was seen) — ruling that out. The actual source: `WithdrawPanel`
renders unconditionally at the top of `WorkerView`, before the
applications section — exactly the position described — and runs its own
independent fetch/loading state, separate from `Dashboard.tsx`'s. Its
loading placeholder is a plain `background:'var(--ink)'` rounded bar with
no shimmer, no shape hinting at the real balance-card layout. Once
`/api/withdrawals?limit=5` resolves, it's replaced by the real card. So:
real, but a one-time loading flash, not a persistent bug — consistent with
the user's own note that it wasn't reliably reproducible. Not fixed
(design-polish opinion, not a functional bug); worth a shimmer/shape pass
if picked up later.

Two apparent shell-vs-real differences noted along the way — a third
"Pending" stat-pill, and `WithdrawPanel`'s self-contained history list vs.
the shell's separate "Withdrawals" section — cross-checked against the
roadmap and confirmed as documented deliberate real-code evolutions past
the shell (Sections 43/44), not gaps to fix.

## History screens — real bug found and fixed: `HistoryWork.tsx` / `HistoryJobs.tsx` shipped fully unstyled

Continuing the sweep to History screens + `WithdrawalRow.tsx` per the
standing order, pulled `HistoryWork.tsx` and `HistoryJobs.tsx` first.

**Bug:** neither file's own `<style>` block declares the classes their
rendered children need. `HistoryWork.tsx` renders `<ApplicationCard>`,
which needs `.hist-row`/`.hist-sub`/`.hist-sub.pos`/`.hist-amt`.
`HistoryJobs.tsx` renders `<JobCard>`, which needs `.job-post-row`/
`.jp-top`/`.jp-amt`/`.jp-status-row`/`.jp-applicants`/`.jp-refund-badge`/
`.status-pill` (+ variants). Both files' own `<style>` blocks only define
`.skel-*`/`.hw-empty*`/`.hw-loadmore` — nothing else. Those missing
classes exist today only inside `Dashboard.tsx`'s embedded `<style>`
block. A JSX `<style>` tag is tied to its component instance, so when
`Dashboard` unmounts on `navigate('/history/work')` it takes that
`<style>` element out of the DOM with it. Not an edge case like a
deep-link refresh — every single "See all →" click from Dashboard lands
on a fully unstyled `ApplicationCard`/`JobCard` list, same failure mode as
Section 43's original "Dashboard shipped fully unstyled" incident.

`HistoryWithdrawals.tsx` is the control case that proves it: it already
redeclares `.hist-row`/`.status-pill` itself, with a comment citing
Section 43's standing rule directly ("this page can be reached
standalone... so they're redeclared here too"). Whoever patched
`HistoryWork.tsx`/`HistoryJobs.tsx` in the same session missed applying
that same rule to those two files.

Confirmed live before fixing: flat stacked text, no cards, no borders, no
color coding, no amount styling on both `/history/work` and
`/history/jobs`.

**Fix:** copied the missing rules 1:1 from `Dashboard.tsx`'s existing
declarations into each file's own `<style>` block (reprefixed
`.hw-histwork`/`.hw-histjobs` to match each file's existing convention),
following `HistoryWithdrawals.tsx`'s exact precedent. At the user's
request — manual `nano` edits flagged as risky — applied via a Python
patch script instead of hand-editing: reads the file, refuses to touch
anything if the anchor line isn't found exactly once (guards against
silent corruption), takes a `.bak` copy, then inserts the new rules right
after the anchor.

Execution needed two retries: the script initially failed to run because
it landed at `~/patch_history.py` (home directory) rather than inside
`~/Piwork`, so the bare `python patch_history.py` call from within
`~/Piwork` couldn't resolve it — fixed by calling it with the full path
(`python ~/patch_history.py`). Both files then patched cleanly (`OK:
patched ...` for each). Diffs confirmed clean single-block insertions
right after each file's `.skel-pill` rule, nothing else touched. Build
clean (`npx tsc && npx vite build` — dist bumped to a 324.97 kB total JS
bundle plus a 2.23 kB CSS file, no errors). Pushed and deployed (user's
setup deploys from the push rather than serving `dist/` locally);
live-verified on both routes afterward: bordered rows, mono-font amounts,
status pills, and refund badges all render correctly — check confirmed
good.

Committed: `frontend/src/pages/HistoryWork.tsx` +
`frontend/src/pages/HistoryJobs.tsx`, message: "fix: add missing CSS
classes to HistoryWork/HistoryJobs (unstyled ApplicationCard/JobCard)".

**Minor, not fixed this session:** both files hardcode hex literals
(`#1B1A1F`, `#5643D9`, `#E7E3DA`, `#6B6874`, `#FFFFFF`) instead of `:root`
custom properties — values are correct, but it breaks from the tokenized
pattern `HistoryWithdrawals.tsx` (and every other patched file) uses.
Worth tokenizing in a follow-up pass, same trip.

## Carried into next session

1. Finish the History-screens sweep: pull and diff `WithdrawalRow.tsx`,
   and re-confirm `HistoryWithdrawals.tsx` stays clean (both were queued
   but not pulled this session — session ended on doc updates instead).
   Then continue oldest-first to `Profile.tsx`/`Onboarding.tsx`.
2. Black-rectangle glitch: explained, not fixed — `WithdrawPanel.tsx`'s
   loading skeleton is a plain unstyled bar with no shimmer or shape.
   Worth a design pass if picked up; otherwise no functional issue
   remains.
3. Decide the `PostJob.tsx` wizard step-indicator direction (session 39)
   and the `JobDetail.tsx` owner-view ledger-connector /
   worker-view dead-CSS-and-attachments items (session 40) — none fixed
   yet, no due dates set.
4. Tokenize `HistoryWork.tsx`/`HistoryJobs.tsx`'s hardcoded hex literals to
   `:root` custom properties, matching the pattern every other patched
   file uses.
5. Documentation-only, still open: shell's stale profile-menu dropdown vs.
   real hamburger pattern; shell's `ui-ux-feedback` vs. real `ui-feedback`
   category-value naming mismatch. Neither urgent.

No due date set on any of the above — open decision for the user.
