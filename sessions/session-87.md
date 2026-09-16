# Session 87 (2026-09-16) — Dark mode sweep: HistoryWithdrawals.tsx clean, build-verification gap caught

## Starting point

Picked up mid-sweep from session 86, which had closed Onboarding.tsx
(KYC pill, live-verified), Settings.tsx (clean, no patch), and
HistoryJobs.tsx (patched and pushed), and flagged HistoryWithdrawals.tsx,
HistoryWork.tsx, Help.tsx, Landing.tsx, and NotFound.tsx as the
remaining unchecked files in the dark-mode sweep queue.

## What was done

**1. HistoryWithdrawals.tsx swept.** Found via
`grep -n "_STYLES\|<style"` → inline block at line 49. File is short
(93 lines), pulled in full via `sed -n '1,120p'`. Findings:
- Pattern 1 (hardcoded hex shadowing a token): none — every rule
  already routes through `var(--violet-deep)`, `var(--card)`,
  `var(--line)`, `var(--ink-soft)`, `var(--pi-gold-tint)`,
  `var(--teal-tint)`, `var(--mist)`, `var(--ink)`.
- Pattern 2 (missing explicit `color`): none — `.hw-loadmore`, the
  only native `<button>`, already sets `color:var(--ink)`.
- Structural note: this file locally redeclares `--violet-deep`,
  `--coral`, `--ink-soft`, `--line`, `--card` in its own
  `:root{}`/`[data-theme="dark"]{}` blocks instead of relying solely
  on `index.css` globals — deliberate, per an in-file comment
  (`WithdrawalRow` normally inherits these from `Dashboard.tsx`'s
  shared `:root`, but this page can be reached standalone).
- Checked the local redeclaration against the global `index.css`
  source of truth for value drift — all four tokens matched exactly,
  light and dark. No drift found.
- Found one dead token: `--coral:#FF6B5D` was declared in both local
  blocks but never referenced anywhere in the file. Removed via
  `sed -i` from both blocks; follow-up grep for "coral" came back
  empty, confirming full removal.

**2. Build-verification gap caught and corrected.** The first
build/push attempt reused the established `npx tsc && npx vite build`
shorthand from `~/Piwork` root. Because no tsconfig is present at that
root, bare `tsc` silently fell back to printing its `--help` usage
text (exit 0) instead of type-checking anything — so the commit and
push initially went out with no real build verification, only caught
because the pasted terminal output was obviously a help dump rather
than compiler output. Re-ran correctly: confirmed
`frontend/tsconfig.json` is where the project config lives, then ran
`npx tsc --noEmit` and `npx vite build` from `frontend/`, both
producing genuine results (clean typecheck, `✓ 65 modules
transformed`, `✓ built in 12.79s`). Also confirmed
`frontend/package.json`'s `scripts.build` is `tsc && vite build` —
`cd frontend && npm run build` is the reliable one-liner to use for
future sweeps instead of the raw two-command shorthand from repo root.

## Files touched

`frontend/src/pages/HistoryWithdrawals.tsx` (dead `--coral` token
removed). No backend, no index.css changes.

## Status: closed (HistoryWithdrawals.tsx fully swept, dead code
removed, genuinely build-verified, committed `2fde915`, and pushed)

## Open items carried forward

1. JobDetail token-redeclaration removal (`bd53c30`, reverted
   `5b13ca8`, session 71) — investigated session 75 (Section 87), no
   code-level cause found; parked, no retry planned unless a concrete
   symptom resurfaces.
2. Dark-mode sweep still incomplete: HistoryWork.tsx (next — style-block
   check already queued), Help.tsx, Landing.tsx, NotFound.tsx.
3. `index.css` line 102 `.badge-purple` hardcoded `#EDE9FE` — flagged,
   not part of the page-file sweep scope, needs its own pass.
4. Process note for future sweeps: prefer `cd frontend && npm run build`
   over raw `npx tsc && npx vite build` from `~/Piwork` root — the
   latter can silently no-op on the typecheck step if run from a
   directory with no tsconfig in scope.
