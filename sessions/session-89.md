# Session 89 — 2026-09-16

Continuation of the dark-mode sweep (started session ~84, Section 97), picked up mid-queue from session 88. This session closes the queue.

## Closed this session

**Help.tsx** — swept, clean, no patch needed.

- No Pattern 1 (hardcoded hex shadowing a token) issues — every color in the `<style>` block already uses tokens (`var(--ink-soft)`, `var(--ink)`, `var(--violet)`, `var(--card)`, `var(--line)`). One literal, `color:#fff` on `.hw-help-step-n`, is white text on a solid `var(--violet)` circle badge — legible in both themes since the background isn't itself a token-shadowed value. Judged intentional, consistent with other colored-badge text in the app.
- No Pattern 2 (missing explicit `color`) issues — the only native control, `.hw-back-btn` (`<button>`), already sets `color:var(--ink-soft)` explicitly; everything else inherits from a parent that sets color.

**Landing.tsx** — swept, patched, pushed (`Piwork` repo).

- Pattern 1 — 6 hardcoded hex values, all confirmed against `index.css`'s actual token defs (light hex vs. dark `rgba(...)` overrides at lines 130-135, proving these are real dark-mode bugs, not harmless duplicates):
  - `#EFEAFB` (`.eyebrow` bg, `.t1 .ticker-icon` bg, `.ticker-frame` gradient) → `var(--violet-tint)`
  - `#FFE8E5` (`.cat-card:nth-child(1) .cat-blob` bg) → `var(--coral-tint)`
  - `#FFF3DC` (`.cat-card:nth-child(2) .cat-blob` bg, `.t2 .ticker-icon` bg) → `var(--pi-gold-tint)`
  - `#E4F8F6` (`.cat-card:nth-child(3) .cat-blob` bg, `.t3`/`.t4 .ticker-icon` bg) → `var(--teal-tint)`
  - `#B8860B` (`.t2 .ticker-icon` color, `.t2 .ticker-amount` color) → `var(--pi-gold)`
  - `#1A9E92` (`.t3`/`.t4 .ticker-icon` color, `.t3`/`.t4 .ticker-amount` color) → `var(--teal)`
- Applied via `sed -i` (unambiguous global hex swaps). Confirmed clean via grep for all 6 hex values afterward (empty).
- Build verified with the corrected routine (`cd frontend && npm run build`): clean, 65 modules, `built in 12.87s`.
- Committed and pushed to `Piwork` alone (real-code patch, not a docs change).
- Two hex values considered and **not** patched:
  - `#EFEBE3` (`.nav-links a:hover` background) — no matching token in `index.css`; flagged as a new open item (see below).
  - `#B4B1BC`/`#B8A9FF` (`.flow` section step text/kicker) — sit inside the `var(--ink-fixed)` panel, which is deliberately theme-constant (same convention as `.testnet-tip`). Not a bug; left as-is.

**NotFound.tsx** — swept, clean, no patch needed.

- No `<style>` block at all — only inline JSX styles (`padding`, `fontSize`, `fontWeight`, `textAlign`, `marginBottom`), none of which touch `color`. No hardcoded hex (Pattern 1 n/a); no Pattern 2 gap since nothing overrides the inherited color.

## Queue status — CLOSED

Dark-mode sweep, in order:

- [x] Onboarding.tsx — clean, no patch needed
- [x] Settings.tsx — clean, no patch needed
- [x] HistoryJobs.tsx — patched, pushed
- [x] HistoryWithdrawals.tsx — clean of Pattern 1/2 bugs; one dead unused token (`--coral`) removed; patched/pushed
- [x] HistoryWork.tsx — patched, pushed
- [x] Help.tsx — clean, no patch needed (this session)
- [x] Landing.tsx — patched, pushed (this session)
- [x] NotFound.tsx — clean, no patch needed (this session)

**All pages in the sweep queue are now closed.** No further pages queued.

## Open items (unchanged + one new, carried forward)

- JobDetail.tsx token-redeclaration removal — parked, no retry planned unless a concrete symptom resurfaces
- `index.css` line 102, `.badge-purple` — hardcoded `#EDE9FE`, flagged, not yet fixed, out of scope for the page-file sweep specifically
- **New:** Landing.tsx `.nav-links a:hover` — hardcoded `#EFEBE3`, no matching token in `index.css`, flagged, not fixed
