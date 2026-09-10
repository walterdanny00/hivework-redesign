# Session 75 — JobDetail token-redeclaration regression investigated, no retry (2026-09-10)

Picked up open item 2 from Session 74.

## Work done

**`bd53c30` regression — investigated in depth, root cause not found,
retry declined.** Traced every custom property removed from
`.hw-jdw`/`.jdo`'s local block (`--cream`, `--ink`, `--ink-soft`,
`--violet`, `--violet-deep`, `--mint`, `--coral`, `--butter`, `--line`,
`--card`) against `frontend/src/index.css`. All 10 have global
`:root` values byte-identical to what was removed, and 5 have
dark-mode overrides at `[data-theme="dark"]` (`--violet`,
`--violet-deep`, `--line`, `--card`, plus `--ink`/`--cream`/`--ink-soft`)
that would only take effect once the local override was gone —
consistent with the removal being a correct fix, not the bug.

Checked whether theme application itself was the problem:
`ThemeContext.tsx`'s `ThemeProvider` sets `data-theme` on
`document.documentElement` inside a `useLayoutEffect` (synchronous,
pre-paint), wraps the entire app in `App.tsx`. No missing/late
wiring found. Checked for Shadow DOM or other style-isolation
boundaries in `JobDetail.tsx`/`Layout.tsx` — none (earlier
`box-shadow` grep hits were false positives, not `attachShadow`).

Re-examined the one substantive value change bundled into the same
commit — `.jdo .ledger-submission`'s background,
`#F7F5F1` (== `--cream` exactly, i.e. originally invisible
cream-on-cream) → `var(--mist)` (a legitimate, slightly-darker tint
consistent with the `--mist`/`--sand` pattern used elsewhere). Doesn't
look like a contrast regression on inspection.

Pulled the actual bug report from `session-71.md`: user reported only
"it's worse" on live-test, no further detail (element, view, theme) —
reverted immediately, no diagnostic breadcrumb beyond that. With
theme plumbing, token resolution, and the bundled value change all
checking out clean, there's no remaining code-level theory to test
without a live reproduction.

**Decision: no retry.** Recommended reapplying as an isolated `git
revert 5b13ca8` and live-testing to get a concrete symptom, but user
declined — app is currently stable and not worth the risk on a
"probably fine" theory. Item stays parked as diagnosed-but-unresolved;
only worth revisiting if a concrete symptom resurfaces on its own.

## Files touched

None (investigation only, no code changes). Docs: `session-75.md`
(this brief), `roadmap.md`.

## Still open, unresolved

1. Shell's Dashboard budget-tracker demo data (Section 34-era) vs.
   Section 43's real shipped implementation — not blocking.
2. JobDetail token-redeclaration removal (`bd53c30`, reverted
   `5b13ca8`) — investigated this session, no code-level cause found;
   parked, no retry planned unless a concrete symptom resurfaces.
3. Home.tsx welcome heading + "Your standing" hero number sizing
   (`.hw-page-head h2` → `28px`/`-.7px`; `.hw-hero-num` → `52px`/
   `-2px`) — diagnosed, fix applied (`326e035`) then reverted
   (`044d8de`) session 72 at user's request, fix unchanged, still
   deferred.

All items from session 74 and earlier remain closed except those
carried forward above.
