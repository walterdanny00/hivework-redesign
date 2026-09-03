# Session 38 — Fixed `index.css` legacy-token bug from session 37 (2026-09-03)

Picked up session 37's single open item: retarget `index.css`'s `:root`
off the pre-redesign dark theme and onto the new cream/ink/violet system.

## Fix

Retargeted every token in `frontend/src/index.css`'s `:root`:

| Old (dark theme) | New (design system) |
|---|---|
| `--pi-purple` | `--violet #6C5CE7` |
| `--pi-purple-light` (hover) | `--violet-deep #5643D9` — matches the shell's own `.btn-primary:hover` convention exactly |
| `--bg`, `--bg-card`, `--bg-elevated` | `--cream` / `--card` |
| `--border` | `--line` |
| `--text-primary` | `--ink` |
| `--text-secondary` | `--ink-soft` |
| `--safe`/`--caution`/`--danger` | `--mint`/`--butter`/`--coral` |

Global classes (`.btn`, `.btn-primary`, `.btn-ghost`, `.card`, `.label`,
`.form-group`, bare `input/textarea/select`) now reference the new tokens
throughout. No structural/layout changes — pure value swap, per the
roadmap's rule that redesign work never touches structure unless asked.

**One fix made beyond session 37's explicit findings:** `.badge-purple`/
`-gold`/`-green`/`-red` background tints were still opaque near-black
values built for the old dark card background (e.g. `#2d1f5e`) — same bug
class as the `.card` issue, just not called out by name in session 37.
Replaced with light pastel tints of the corresponding new-system color so
badges stay legible on cream. Flagged for extra scrutiny during
verification since it wasn't a pre-confirmed target.

## Verified

Confirmed via `grep -n "<style>" -A ... | grep -E "btn-primary|btn-ghost|\.card"`
against `Jobs.tsx`, `PostJob.tsx`, `Dashboard.tsx`, and `ContactSupport.tsx`
(the four files session 37 left unconfirmed) — none has its own scoped
override for these classes, so all four were fully exposed to the bug and
are now fixed by the `index.css` retarget alone, no per-file patch needed.

`components/Layout.tsx`'s live `:root` block was pulled and confirmed
identical to the shell's tokens before writing the fix, so the retarget
values are verified against real running code, not just the shell/session
notes' description of it.

## Build & push

```
npx tsc && npx vite build
```
Clean, no errors. Bundle unchanged at 320.56 kB / 60 modules — pure CSS
token swap, no JS touched. Pushed straight to `main` (low-risk fix to
already-reconciled screens, per session 36's branch policy).

## Live-verified (Pi Browser, piwork-frontend.vercel.app)

All confirmed consumers checked clean:
- `Home.tsx` — "Post a Job" ghost button
- `JobDetail.tsx` — Back button + "Open slot — awaiting an applicant" label
- `Profile.tsx` — the three previously-dark `.card` sections
- `Jobs.tsx` / `PostJob.tsx` / `Dashboard.tsx` / `ContactSupport.tsx` —
  primary/ghost buttons
- `.badge-*` instances — the extra fix above, checked and legible

This closes out the `index.css` bug from Section 48/session 37 entirely.
No per-file patches were needed — the source-level retarget handled every
confirmed consumer.

## Next session

Resume the visual re-verification pass (session 36/37's original
oldest-patched-first order) at **`Jobs.tsx` (Browse)** next — `Layout.tsx`
and `Home.tsx` were already re-verified clean in session 37 before the bug
was found. Still to go after `Jobs.tsx`: `PostJob.tsx`, `JobDetail.tsx`
(worker + owner views), `Dashboard.tsx`, History screens (`HistoryWork`/
`HistoryJobs`/`HistoryWithdrawals` + shared `WithdrawalRow`),
`Profile.tsx`/`Onboarding.tsx`.

Documentation-only, still open: shell's stale profile-menu dropdown
should eventually reflect the real hamburger side-menu pattern
(`Layout.tsx`) — not urgent.

No due date set — open decision for the user.
