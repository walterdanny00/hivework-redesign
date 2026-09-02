# Session 34 — Dashboard.tsx patched into real code

**Shipped:** `Dashboard.tsx` + shared components `WithdrawPanel.tsx`,
`ApplicationCard.tsx`, `JobCard.tsx` — all restyled from the old Pi-purple/
gold dark theme to the redesign's cream/ink/violet tokens. Build clean on
both backend and frontend, live-verified in Pi Browser via screenshots.

**Two real data decisions made (user's call, both applied):**
1. `earnings_pending` (real, previously unsurfaced backend field) — now
   shown as a third "Pending" stat pill, worker tab only.
2. Jobs-posted count — no real total existed anywhere (client tab's `jobs`
   array is capped at 5 for pagination). Added a small backend count-only
   query rather than approximate or drop the number. New field:
   `jobs_posted_count`.

**Bug hit and fixed mid-session:** first deploy shipped fully unstyled.
Root cause: this codebase has no shared stylesheet — every patched real
page embeds its own scoped `<style>` block (prefixed per-file, e.g.
`.hw-layout`, `.jdo`, `.hw-post-job`). Dashboard.tsx referenced the right
class names but never got a `<style>` block written into it. Fixed by
adding a `.hw-dash`-prefixed block matching the established pattern. Full
root-cause writeup and the standing rule this creates are in roadmap
Section 43.

**Also corrected:** job status pill mapping — initially guessed as
`open`/`escrow`/`closed` from shell demo data; real enum (confirmed via
`jobs.ts`) is `open`/`in_progress`/`completed`. Fixed before shipping.

**Screen inventory:** Dashboard.tsx and its three shared components move to
✅ shipped, live-verified. Remaining: Profile.tsx, Onboarding.tsx,
HistoryWork/Jobs/Withdrawals.tsx — History screens are now cheaper than
before since ApplicationCard/JobCard/WithdrawPanel are already restyled.

**Next session:** no shared scope forcing an order among the four remaining
screens. Recommend starting with the History screens given the reduced
lift, but open to any.
