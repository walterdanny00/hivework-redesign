# Session 42 (2026-09-04)

Closed out the item carried from session 41 (History-screens sweep), then
continued oldest-first to `Profile.tsx`/`Onboarding.tsx`, where a real bug
was found and fixed same session.

## History-screens sweep — closed out: `WithdrawalRow.tsx` / `RangeFilter.tsx` both checked, clean

Pulled `WithdrawalRow.tsx` (shared row component used by both
`WithdrawPanel`'s inline summary and `HistoryWithdrawals.tsx`'s full
list). Clean: every class it renders — `.hist-row`, `.hist-row h4`,
`.hist-sub`, `.status-pill` plus `.open`/`.closed` variants — is already
declared in `HistoryWithdrawals.tsx`'s own `<style>` block, which already
redeclares `.hist-row`/`.status-pill` locally with a comment citing the
Section 43 standing rule directly. Inline styles reference
`var(--violet-deep)` and `var(--coral)`, both defined in that same file's
local `:root` redeclaration. So `HistoryWithdrawals.tsx` +
`WithdrawalRow.tsx` don't have the missing-class bug that hit
`HistoryWork.tsx`/`HistoryJobs.tsx` in session 41.

Also pulled `RangeFilter.tsx` (rendered by `HistoryWithdrawals.tsx`, and
by extension all 3 History screens) for full coverage per the "sweep
before designing" standing rule. Logic is clean (calendar-based
week/month cutoffs, not rolling windows — deliberate, documented in its
own comment). But it hardcodes raw hex (`#EFECE5`, `#FFFFFF`, `#1B1A1F`,
`#6B6874`) instead of `var(--...)` tokens — same tokenization gap already
flagged for `HistoryWork.tsx`/`HistoryJobs.tsx`, now a third file for that
follow-up pass. Not fixed this session.

**History-screens sweep is now fully done** — all of `HistoryWork.tsx`,
`HistoryJobs.tsx`, `HistoryWithdrawals.tsx`, `ApplicationCard.tsx`,
`JobCard.tsx`, `WithdrawalRow.tsx`, and `RangeFilter.tsx` re-verified.

## `Profile.tsx` / `Onboarding.tsx` — real bug found and fixed: inverted cream/card tokens on shared `ProfileForm`

Continuing the sweep oldest-first, pulled `Profile.tsx` and
`Onboarding.tsx` together (both already patched live in Section 47 — this
was a regression/token-fidelity check, not a first pass).

**Bug:** `Profile.tsx`'s `PROFILE_STYLES` and `Onboarding.tsx`'s
`ONBOARDING_STYLES` each independently declare CSS for the same shared
`ProfileForm` component (`Profile.tsx` imports it directly from the
Onboarding file — correct host-supplied-CSS structure on both sides).
But 3 of the shared `.pf-*` rules have their background tokens exactly
inverted between the two files:

- `.pf-field textarea` — `--cream` (Profile) vs. `--card` (Onboarding)
- `.pf-skills-box` — `--cream` (Profile) vs. `--card` (Onboarding)
- `.pf-chip` — `--card` (Profile) vs. `--cream` (Onboarding)

Same form fields, different shade depending on whether you're editing an
existing profile or completing onboarding for the first time — not a
documented deliberate choice, just drift.

Checked the canonical shell's `.hwpc-*` rules (ported from
`HiveworkProfileComplete.jsx`) to settle which side was correct:
`textarea`/skills-box on `--card`, chip on `--cream`. `Onboarding.tsx`
matches canonical exactly. `Profile.tsx` had it backwards on all 3.

**A 4th candidate divergence, investigated but left unresolved:**
`.pj-combo input` background (`--cream` in Profile vs. `--card` in
Onboarding) has no equivalent class in `hivework-app-v4-3.html` at all,
so it couldn't be checked against the shell. Instead pulled
`Combobox.tsx` (the shared component — confirmed it carries no styling of
its own; the host page's `<style>` block governs, same "no shared
stylesheet" convention as the rest of the codebase) and grepped
`PostJob.tsx`'s own `.pj-combo` CSS block (the component's original
source, per `Combobox.tsx`'s extraction comment). Result: `PostJob.tsx`
has **no** background rule for `.pj-combo input` at all — the origin file
never styled it. So neither `Profile.tsx` nor `Onboarding.tsx` is
"matching canonical" here; both added a background where the original
had none, in opposite directions. Not a bug with a clear fix — flagged as
an open design question (should the combo input have a background, and
if so which token) rather than guessed at.

**Fix applied:** patch script (backup + unique-anchor-check, per the
user's standing preference over manual `nano` edits) swapped the 3
confirmed tokens in `Profile.tsx`'s `PROFILE_STYLES` to match
`ONBOARDING_STYLES`/canonical:

```python
fixes = [
    ('.pf-field textarea{...background:var(--cream);', '...background:var(--card);'),
    ('.pf-skills-box{...background:var(--cream);', '...background:var(--card);'),
    ('.pf-chip{...background:var(--card);}', '...background:var(--cream);}'),
]
```

Diff confirmed clean — exactly the 3 one-word token swaps, nothing else
touched.

**Build hiccup:** `npx tsc` run from `~/Piwork` printed its help screen
instead of compiling — no `tsconfig.json` there. Confirmed via
`ls ~/Piwork/tsconfig.json ~/Piwork/frontend/tsconfig.json` that the
actual project root is `~/Piwork/frontend`, not `~/Piwork`. Rebuilt from
the correct root: clean, no TypeScript errors, `324.97 kB` JS /
`2.23 kB` CSS — identical to session 41's bundle sizes, as expected since
this was a pure CSS-value swap with no code or size change.

Pushed and deployed:

```
cd ~/Piwork
git add frontend/src/pages/Profile.tsx
git commit -m "fix: correct swapped cream/card tokens on ProfileForm fields in Profile.tsx"
git push
```

Live-verified by the user afterward: profile edit mode now shows the
textarea/skills-box/chip backgrounds matching Onboarding's shade —
confirmed good.

## Carried into next session

1. Open design question, no canonical answer exists: should `.pj-combo
   input` have a background at all, and if so `--cream` or `--card`?
   Needs a decision, not a silent fix.
2. Continue the oldest-first re-verification sweep to the next
   not-yet-reverified screen — Landing / Wallet Connect / Browse are the
   remaining candidates; confirm order before starting.
3. Black-rectangle glitch: explained (session 41), not fixed —
   `WithdrawPanel.tsx`'s loading skeleton is a plain unstyled bar; worth
   a design pass (shimmer/shape) if picked up, otherwise no functional
   issue remains.
4. Decide the `PostJob.tsx` wizard step-indicator direction (session 39)
   and the `JobDetail.tsx` owner-view ledger-connector / worker-view
   dead-CSS-and-attachments items (session 40) — none fixed yet, no due
   dates set.
5. Tokenize hardcoded hex literals to `:root` custom properties:
   `HistoryWork.tsx`/`HistoryJobs.tsx` (session 41) and now also
   `RangeFilter.tsx` (session 42) — same follow-up pass, three files.
6. Documentation-only, still open: shell's stale profile-menu dropdown
   vs. real hamburger pattern; shell's `ui-ux-feedback` vs. real
   `ui-feedback` category-value naming mismatch. Neither urgent.

No due date set on any of the above — open decision for the user.
