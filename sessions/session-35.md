# Session 35 — History screens patched into real code (2026-09-02)

Picked up the three remaining History screens, given no shared scope forced
an order and these were the cheapest of the remaining set (Profile.tsx,
Onboarding.tsx being the other two) — `ApplicationCard`/`JobCard`/
`WithdrawPanel` were already restyled in Session 34, so `HistoryWork.tsx`
and `HistoryJobs.tsx` only needed page chrome.

## Pre-patch sweep

Swept `HistoryWork.tsx`, `HistoryJobs.tsx`, `HistoryWithdrawals.tsx`,
`RangeFilter.tsx` (shared by all three), and `backend/src/routes/history.ts`
before writing anything. Two real gaps surfaced:

- **`HistoryWithdrawals.tsx` duplicated `WithdrawPanel`'s list logic**
  instead of sharing it — its own inline `STATUS_STYLE` map, own
  `shortAddr()`, still fully old-theme markup, while `WithdrawPanel`
  (restyled Session 34) already had its own internal withdrawal-history
  list on the same `/api/withdrawals` data. Same shape of issue as Section
  43's `ApplicationCard`/`JobCard` duplication risk, just not yet fixed for
  withdrawals specifically.
- **`JobCard`'s refund badge could never render on History → Jobs** —
  `/api/history/jobs` didn't select a `refunded` field at all, while
  Dashboard's client tab (same `JobCard` component) does show it. Same
  component, silently different capability depending on which screen
  mounted it.

## Decisions made before building

- Withdrawals: extract a shared `WithdrawalRow.tsx` component (same
  precedent as `ApplicationCard`/`JobCard`) rather than leaving the
  duplication or trying to reuse `WithdrawPanel`'s private internal JSX
  directly (not viable — not an exported unit).
- Refund badge: fix at the backend, not the frontend — add real
  `refunded` data to `/api/history/jobs` rather than hiding the badge
  conditionally per-screen. Same call as Section 43's `jobs_posted_count`:
  correctness over a shortcut, and it keeps `JobCard` behaving identically
  everywhere it's mounted.

## Bug caught before shipping — `refunded` isn't a column

First backend draft added `refunded` directly to the `/jobs` `select()`,
assuming it was a real column on `jobs` since Dashboard's client tab
already displayed it. **It is not a column at all.** A user-run
`grep -n "refunded" backend/src/routes/dashboard.ts` sweep showed it's
computed in `dashboard.ts` by querying `balance_transactions`
(`kind = 'refund'`, `worker_id = <client's own user id>` — table is a
generic ledger keyed by whoever gets credited, not literally "worker"),
grouped by `job_id`, and merged onto each job in JS. A direct column
`select()` would have thrown a query error in production.

Corrected `history.ts`'s `/jobs` route to replicate the same computation:
pull the current page's `job_id`s, query `balance_transactions` scoped to
those ids (`.in('job_id', jobIds)`), sum by `job_id`, merge onto each item.
Scoped to just the current page rather than the client's full refund
history (unlike `dashboard.ts`, which needs an all-jobs total for its
budget tracker) — no such aggregate is needed here.

**Verified against Supabase directly** (user ran the SQL, not just trusted
the code comment):
- Confirmed `jobs` table genuinely has no `refunded` column.
- Confirmed every `balance_transactions` refund row's `worker_id` matches
  the corresponding job's `client_id` (10/10 sample rows) — the
  `.eq('worker_id', user_id)` filter is filtering on the right identity.
- Confirmed refunds land as **multiple rows per job**, not one row per job
  (two test jobs had 4 refund transactions each, summing to 8π) — this is
  why both `dashboard.ts`'s original logic and the `history.ts` fix
  `reduce`/accumulate rather than assume a 1:1 job-to-refund-row
  relationship. A naive "take the first match" implementation would have
  silently undercounted these exact jobs.

## Patch — RangeFilter.tsx

Shared by all three History pages. Old theme: `var(--pi-purple)` filled
active state, `var(--radius-sm)` (6px), `var(--text-muted)`. Restyled to
match Dashboard's `toggle-row`/`toggle-btn` pattern exactly — same track
color (`#EFECE5`), same active treatment (white pill + soft shadow, not a
solid violet fill; violet stays reserved for primary actions/amounts),
same 100px pill radius used everywhere else in the system. One fix here
covers the filter row on all three screens.

## Patch — WithdrawalRow.tsx (new) + WithdrawPanel.tsx

Extracted the row markup that was living inline inside `WithdrawPanel`'s
history-list render into a new standalone `components/WithdrawalRow.tsx`
— same shape and role as `ApplicationCard`/`JobCard`: takes one
`WithdrawalRowItem`, no fetching logic of its own. `WithdrawPanel.tsx`
updated to import and render it instead of its old inline JSX; behavior
unchanged, purely a lift-and-share refactor.

## Patch — HistoryWork.tsx / HistoryJobs.tsx / HistoryWithdrawals.tsx

All three: page-head pattern matching Dashboard's `kicker` + `h1`
(`WALLET & JOBS` → `HISTORY` kicker equivalent), skeleton loaders restyled
to token colors, empty/error states given icons matching Dashboard's
convention, "Load more" restyled to a pill button rather than relying on
the ambiguous/possibly-still-old-theme global `.btn-ghost` class. Each
gets its own `.hw-histwork` / `.hw-histjobs` / `.hw-histwd`-prefixed
scoped `<style>` block, per the Section 43 standing rule.

`HistoryWithdrawals.tsx` additionally switched from its own inline
row-rendering to `WithdrawalRow`, and — since this page can be reached
directly (deep link, refresh) rather than only via Dashboard — its style
block redeclares the `.hist-row`/`.status-pill` rules `WithdrawalRow`
depends on, rather than assuming `.hw-dash`'s block is already mounted on
the page. Same reasoning as the Section 43 root-cause fix, applied
proactively here instead of being caught as a live bug.

## Build

Frontend: `npx tsc && npx vite build` clean, 58 modules, 307.92 kB (up
from 303.88 kB post-Dashboard baseline — consistent with the new
`WithdrawalRow.tsx` plus three restyled pages' scoped style blocks).
Backend: `npx tsc` clean, no errors.

(Note: first build attempt reported `tsc: command not installed` — a
Termux PATH issue, not a real problem. `npx tsc` resolved it correctly
through the project's own `node_modules`. Commit/push had already
happened before this was caught and re-verified after the fact; build
gate held, but out of its usual order this session.)

## Live verification (Pi Browser, piwork-frontend.vercel.app)

- Dashboard → refund panel + refund history list render correctly through
  the new shared `WithdrawalRow` (screenshot-confirmed: amount, status
  pill, fee/net breakdown, address, date all correct).
- History → Jobs: multi-refund jobs (`f799d04c...`, `27374fbe...`, each
  with 4 separate 2π refund transactions) show the correctly **summed**
  8π badge, not a single transaction's amount.
- History → Withdrawals confirmed rendering via shared `WithdrawalRow`,
  visually matching `WithdrawPanel`'s own list.
- Filter pills, empty states, and page chrome confirmed working across
  all three screens.

**Status: shipped, build-verified, refund-sum math verified directly
against Supabase (not just code inspection), live-verified in Pi Browser
— confirmed working by the user, no open issues.**

## Screen inventory status (post-roadmap Section 44)

| Screen | Status |
|---|---|
| Layout.tsx | ✅ shipped, live-verified |
| Home.tsx + Help.tsx | ✅ shipped, live-verified |
| Job Detail (worker + owner) | ✅ shipped, live-verified |
| Jobs.tsx (Browse) | ✅ shipped, live-verified |
| PostJob.tsx | ✅ shipped, live-verified |
| Dashboard.tsx | ✅ shipped, live-verified |
| WithdrawPanel / ApplicationCard / JobCard (shared) | ✅ shipped, live-verified |
| WithdrawalRow (shared, new this session) | ✅ shipped, live-verified |
| HistoryWork.tsx / HistoryJobs.tsx / HistoryWithdrawals.tsx | ✅ shipped, live-verified |
| Profile.tsx | Not yet patched |
| Onboarding.tsx | Not yet patched |

## Files touched

`roadmap.md` (Section 44 to add, screen inventory updated), this session
brief, `RangeFilter.tsx`, `WithdrawalRow.tsx` (new), `WithdrawPanel.tsx`,
`HistoryWork.tsx`, `HistoryJobs.tsx`, `HistoryWithdrawals.tsx`,
`backend/src/routes/history.ts`.

## Next session

Only two real screens remain: `Profile.tsx` and `Onboarding.tsx`. No
shared scope between them — either order works.

## Addendum — Post Job icon fix (same session, follow-on)

After Section 46's Browse fixes shipped, user spotted the identical
missing-icon symptom on Post Job's category grid. Confirmed same root
cause: `PostJob.tsx`'s `CATEGORIES` icons use the same `strokeWidth`-set,
no-`stroke`-color pattern as `Jobs.tsx`, and `POST_JOB_STYLES` had no
`.cat-opt svg{stroke:...}` rule. Fixed with two CSS lines matching the
shell's own rule for this element exactly (static `var(--ink-soft)`
unselected / `var(--violet-deep)` selected, not `currentColor` — Post
Job's shell treats these as two distinct static colors, unlike Browse).
Build clean, user-confirmed live in Pi Browser.

Two files now confirmed sharing this exact bug pattern independently —
worth a `grep strokeWidth` sweep for a missing paired `stroke` rule on any
other file reusing this icon convention, rather than waiting for a third
screenshot to catch it.
