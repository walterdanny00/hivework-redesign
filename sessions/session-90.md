# Session 90 — 2026-09-16

Small-fix cleanup pass on items carried forward from session 89's
dark-mode sweep closure. Four items picked off the open-items list,
one at a time, each verified before moving to the next.

## Closed this session

**Landing.tsx `.nav-links a:hover`** — patched, pushed (`Piwork` repo).

- Hardcoded `#EFEBE3` was a near-duplicate of `--cream-deep` (`#EFEBE1`,
  light) with no `[data-theme="dark"]` override at all — a real
  Pattern-1 bug (stays light-cream in dark mode), not a harmless
  duplicate. `--cream-deep` already has a proper dark value (`#1A1914`).
- Patched via `sed -i 's/#EFEBE3/var(--cream-deep)/' pages/Landing.tsx`.
- Build verified: `cd frontend && npm run build` — clean, 65 modules,
  17.90s.
- Committed and pushed to `Piwork` alone (real-code patch).

**`index.css` `.badge-purple`** — reviewed, left as-is (user decision).

- Not actually a dark-mode bug: already has its own working
  `[data-theme="dark"]` override (`rgba(124,108,245,.16)`, line 149)
  that exactly matches `--violet-tint`'s dark value. Only the
  light-mode hex (`#EDE9FE`) sits close-but-distinct from
  `--violet-tint`'s light value (`#F3E8FF`).
- Question posed: consolidate into `--violet-tint` (accepting a small
  light-mode shade shift), or keep as its own deliberate color.
- **User decided: leave it.** Closed as a non-issue, not a bug — no
  code change made.

**Jobs.tsx `.cat-empty`** — confirmed already gone, stale note closed.

- Flagged since Section 54 as "dead CSS, safe to remove whenever
  touched." `grep -rn "cat-empty" .` across all of `frontend/src`
  returned zero matches — the rule doesn't exist anywhere in the repo
  anymore. Also confirmed no `cat-empty` in `Jobs.tsx`'s current
  `cat-`-prefixed class list (only `.cat-clear` remains, in active
  use).
- No action needed — the open-item note itself was stale, not the
  code. Closed.

**WithdrawPanel.tsx loading skeleton** — patched, pushed (`Piwork` repo).

- Root cause: the three `.wp-skel-bar` divs used
  `rgba(255,255,255,.12)` against the near-black `--ink-fixed`
  (`#1B1A1F`) card background — 12% white on near-black is too low
  contrast to read as a shimmer, especially at the pulse animation's
  dim point (`hw-pulse-skel` drops opacity to .5 at the midpoint).
  Confirmed the loaded state's own use of the same rgba value works
  fine there only because it sits under real white text/content, not
  as a bare fill.
- Confirmed the three bars (lines 93-95) were fully contained inside
  the `if (loading)` block, distinct from an unrelated instance of the
  same rgba value elsewhere in the file, before patching.
- Patched via line-scoped `sed -i '93,95s/rgba(255,255,255,\.12)/rgba(255,255,255,.22)/'`
  on `components/WithdrawPanel.tsx`.
- Build verified: clean.
- Committed and pushed to `Piwork` alone (real-code patch).

## Open items (unchanged + closures, carried forward)

- JobDetail.tsx token-redeclaration removal — parked, no retry planned
  unless a concrete symptom resurfaces
- `PostJob.tsx` wizard step-indicator direction — undecided design
  question
- `JobDetail.tsx` owner ledger-connector / worker attachments —
  undecided design question
- `--cream`/`--line`/`--mist`/`--sand` near-white warm-grays — flagged,
  not merged, open design question
- Two documentation-only naming mismatches (shell's profile-menu
  dropdown vs. real hamburger; shell's `ui-ux-feedback` vs. real
  `ui-feedback`) — non-urgent
- ~~`.badge-purple` hardcoded hex~~ — reviewed, user decided to leave
  as-is; closed as non-issue, not carried forward as an open item
- ~~`Jobs.tsx` `.cat-empty`~~ — confirmed already removed from repo;
  closed
- ~~Landing.tsx `.nav-links a:hover`~~ — patched and pushed; closed
- ~~`WithdrawPanel.tsx` skeleton~~ — patched and pushed; closed

**Remaining open items after this session:** JobDetail token-redeclaration
(parked), PostJob step-indicator direction, JobDetail owner
ledger-connector/attachments, the four-way near-white gray merge
question, and the two doc-naming mismatches. All five are undecided
design questions or intentionally parked — none are active bugs.
