# Session 49 (2026-09-05)

Picked up open item #2 carried from session 48's list: decide whether
`--cream`/`--line`/`--mist`/`--sand` (4 very close near-white warm-grays)
should merge, or whether the layering is intentional.

## Investigation

Per the standing sweep-before-designing rule, pulled token definitions and
every usage site via Termux, across both `~/hivework-redesign/screens/`
(canonical) and `~/Piwork/frontend/src/` (real, patched code).

**First finding — `--mist`/`--sand` aren't canonical at all.** Neither
token appears anywhere in `hivework-app-v4-3.html` or any file under
`screens/`. Every canonical file's `:root` block defines only `--cream`
and `--line` (plus per-screen extras like `--danger`/`--radius` where
needed). `--mist` (`#F1EFEA`) and `--sand` (`#EFECE5`) exist solely in the
real app's `index.css`, evidently introduced during the patching-into-
main-app phase and never carried back into the canonical shell.

**Usage is fully non-overlapping, one job each:**
- `--mist`: always paired identically as `background:var(--mist);
  color:var(--ink-soft)`, used only for closed/inactive status states —
  `JobDetail.tsx`'s `.status-chip.closed`, `Dashboard.tsx`'s
  `.status-pill.closed`, `HistoryJobs.tsx`/`HistoryWithdrawals.tsx`'s same
  pattern, and `Profile.tsx`'s `.chip-unverified`.
- `--sand`: used for grouped-control-surface backgrounds — segnav track
  (`Layout.tsx`), toggle-row tracks (`JobDetail.tsx`, `Dashboard.tsx`),
  `RangeFilter.tsx`'s track, `JobDetail.tsx`'s `.app-chip` pills, and the
  disabled Decline button.

Ordered by lightness, the four form a tonal ramp:
`--cream` `#F7F5F1` (page background) → `--mist` `#F1EFEA` (muted status
fill) → `--sand` `#EFECE5` (control-track fill) → `--line` `#E7E3DA`
(border/divider).

## Decision

**Keep all four — no merge.** Each token has exactly one distinct,
consistently-applied role; the closeness in value is deliberate (a subtle
warm-neutral depth ramp, not visual noise), not drift or accidental
duplication.

**Separate real finding, logged as a new open item:** `--mist`/`--sand`
are live in production (`index.css`) but were never migrated into the
canonical shell's `:root` block, so `hivework-app-v4-3.html` is technically
out of sync with what's shipped, even though nothing is visually wrong.
Documentation-only fix — add both tokens to the shell's `:root` so it
stays the accurate single source of truth. Not fixed this session; no
code changes made.

## Patch, applied

None — this session was investigation-and-decision only, no code touched
on either side (canonical or real).

## Files touched

None.

## Carried into next session

1. Landing / Wallet Connect re-verification remains blocked — no way
   found yet to actualize a real logged-out state to test against.
2. New: add `--mist`/`--sand` to `hivework-app-v4-3.html`'s `:root` block
   so the canonical shell matches what's actually live in `index.css`.
   Documentation-only, no visual change.
3. Minor, not fixed: `Jobs.tsx`'s `.cat-empty` rule in `BROWSE_STYLES` is
   dead CSS (unused). Safe to remove whenever this file is touched next.
4. Documentation-only, still open: shell's stale profile-menu dropdown vs.
   real hamburger pattern; shell's `ui-ux-feedback` vs. real `ui-feedback`
   category-value naming mismatch. Neither urgent.

Item #2 from session 48's list (`--cream`/`--line`/`--mist`/`--sand`
merge-or-keep decision) is now **closed** — resolved this session, decided
to keep all four as-is.

No due date set on any of the above — open decision for the user.
