# Session 65 — Dark mode completion sweep (2026-09-07)

User arrived with a working copy of the HTML shell, already partway
into building dark mode — "was working it half way already." Goal:
assess what's actually done, find what isn't, and finish it.

**Numbering note:** this session was initially drafted as "Session
30"/"Section 35" against a roadmap the user had mistakenly uploaded —
a real snapshot, but accurate only through Section 34/session 29, not
current. Corrected once the real current `roadmap.md` (through Section
76, session 64) and real canonical shell files were provided. This
brief replaces that mistaken draft; nothing from it was pushed.

## Initial sweep — what's already built

Full read of the working file. Found the plumbing entirely complete,
further along than "half way" suggested:
- An entirely new **Settings screen** — confirmed via diff against the
  real canonical shell that this didn't exist at all before (no
  `id="settings"`, no side-drawer nav entry) — with an "Appearance"
  section and a "Dark mode" toggle row.
- FOUC-prevention boot script.
- Complete `:root`/`[data-theme="dark"]` variable swap covering the
  existing base tokens (cream, ink, ink-soft, violet, line, card,
  mist, sand) plus new infrastructure introduced specifically for this
  work: `--ink-fixed`/`--cream-fixed` (for always-dark "money moment"
  cards like `.balance-card`/`.job-head`, Section 34's idiom) and
  `--gold-tint`/`--gold-ink`/`--teal-tint`/`--teal-ink`/`--violet-tint`
  plus all five `--pastel-*` tokens — replacing 35+ previously-
  hardcoded pastel colors (status pills, chips, category tiles, ticker
  icons) scattered across nearly every screen with theme-aware
  equivalents.
- `applyTheme()`/`toggleTheme()`/`syncThemeToggleUI()`, wired to the
  new toggle, called at boot.

## Sweep 1 — hex/rgba color audit

```
grep -n "#[0-9A-Fa-f]{3,6}" hivework-app-v4-3.html
grep -n "rgba\?(" hivework-app-v4-3.html | grep -v "255,\|var(--"
grep -no "color:\s*(white|black|gray|grey)" ...
grep -n "border[^:]*:\s*[^;]*#[0-9A-Fa-f]{3,6}" ...
grep -n "<img" ...
grep -n "fill=\"#\|stroke=\"#" ... | grep -v currentColor
```

**Confirmed clean, no action needed:**
- Every `color:white` usage (30+) sits on `var(--violet)`,
  `var(--ink-fixed)`, or `var(--coral)` — all theme-stable tokens.
- `.balance-card` and `.hw-jdw`'s `.job-head`/`.job-figures` are
  deliberately always-dark money-moment cards (`--ink-fixed`) — their
  light-toned inner text is correct in both themes, not a bug.
- No `<img>` tags anywhere.
- `var(--line)` used as a border in 94 different rules, properly
  mapped light→dark (`#E7E3DA` → `#2E2C27`) — most surfaces already
  edge-defined by border, not dependent on shadow.

**Real bugs found and fixed:**
1. `.jdo .declined-row`/`.jdo .ledger-submission` — hardcoded
   `#F7F5F1`, exactly light mode's `--cream` value (barely
   distinguishable from the page background even in light mode) →
   `var(--mist)`.
2. `.jdo .close-slots-card` — hardcoded `#FDFBF7` → `var(--card)`.
3. `.hw-jdw`'s `.paid-strip`, `.verified-strip`, `.attach-icon`,
   `textarea:focus` — all hardcoded `background:#fff` → `var(--card)`.
   Would have rendered as bright white boxes on an otherwise-dark Job
   Detail (Worker) screen.
4. `.hw-onboard` — entire onboarding flow's background hardcoded
   `#EAE7DF`, zero dark override, confirmed as a live reachable
   screen → fixed to `var(--sand)` (existing token, not invented).
5. `.hw-onboard .kyc-pill` border (`#F4DFA8`) → `var(--line)`.
6. Chevron SVG (`chevIconSvg()`) — hardcoded `stroke="#8A6512"`
   instead of tracking `--gold-ink` like its sibling icons
   (`CHECK_ICON_SVG`, `SHIELD_ICON_SVG`) already do → fixed to
   `stroke="currentColor"` + new `.kyc-pill .chev{color:var(--gold-
   ink)}` rule.
7. `.hivework-landing .nav-links a:hover` — hardcoded `#EFEBE3` →
   `var(--mist)`.

## Two open design questions — resolved

**Should the landing/marketing page follow dark mode, or stay fixed
light?** It was already wired to `var(--cream)`/`var(--ink)` (only the
hover bug above was broken). Decision: keep it theme-responsive.
Forcing perpetual light would mean a jarring bright page for a
dark-mode user landing on the marketing screen — consistency wins.

**Should dark mode use a different shadow treatment**, since
ink-tinted shadows may not read well on an already-dark background?
Checked how surfaces get edge-defined app-wide first — `var(--line)`
borders already carry most of that job (94 rules, properly mapped).
Decision: leave shadows as-is; not actually a gap.

## Sweep 2 — JS-generated dynamic screens

User asked to sweep further. Checked the parts of the app built via
JS string concatenation for the same class of hardcoded-color issue:

```
grep -n 'style="[^"]*#[0-9A-Fa-f]{3,6}' ...
grep -n 'style="[^"]*rgba?(' ... | grep -v "var(--"
grep -n "\.style\.(background|color|borderColor)\s*=\s*['\"]#" ...
grep -n "_COLOR\s*=\s*{" ...
```

No hardcoded inline styles or DOM-set colors found — dynamic screens
route entirely through CSS classes, already covered by Sweep 1.

**One more real bug found:** `TRUST_COLOR` map —
`{ Gold:'var(--butter)', Silver:'#9CA3AF', Bronze:'#B45309',
Unverified:'var(--ink-soft)' }`. Gold/Unverified already used tokens;
Silver/Bronze didn't. Applied as inline text color on `.jdo`'s
applicant/ledger list rows — regular page-background rows, not
fixed-dark cards. Confirmed identical in the real canonical file (not
just the working copy) — a real pre-existing bug, not introduced by
dark-mode work. Bronze specifically was a genuine contrast failure:
readable dark-on-cream in light mode, unreadable dark-amber-on-near-
black in dark mode. Fixed by adding `--trust-silver`/`--trust-bronze`
tokens (same light→dark lightening pattern as `--gold-ink`:
`#9CA3AF`→`#C7CBD1`, `#B45309`→`#E0995E`).

## Reconciliation against real canonical files

User provided the correct current `roadmap.md` (through Section 76)
and real canonical `HiveworkApp.jsx`/`hivework-app-v4-3.html` after
the numbering mix-up. Diffed the real canonical HTML against this
session's fixed working copy to confirm nothing unrelated had drifted:
the only differences were the new Settings screen, the boot script,
the token system, and the seven fixes above. Confirmed token names
(base palette) matched exactly; confirmed the new tint/fixed tokens
had no prior existence anywhere in the real file (definition or
usage) — genuinely new infrastructure, not divergence from an
undocumented earlier state.

**Side-finding, unrelated to dark mode:** while diffing, noticed the
shell's Dashboard budget-tracker demo data (`HW_DASH_BUDGET_TRACKER`,
`HW_DASH_JOBS_POSTED_COUNT`, both from Section 34) has drifted behind
what Section 43 actually shipped to the real app — a real backend
field `jobs_posted_count` (an actual Supabase count query) and an
`earnings_pending`/"Pending" stat pill exist in production but not in
either shell. Not touched this session; logged as an open item.

## Verification

Div open/close balance held at 686/686 through every edit pass across
both sweeps; parses clean via `lxml`, confirmed after each pass; final
diff against real canonical confirmed clean (see above).

## Filename

Canonical name `hivework-app-v4-3.html` unchanged.

## Files touched

`hivework-app-v4-3.html`, `roadmap.md` (new Section 77), this session
brief.

## Next session

1. Port every fix in this session into `HiveworkApp.jsx` — it wasn't
   touched this session and has no dark mode work at all (plumbing or
   fixes). Confirm scope with user before starting: likely the full
   token system + all seven fixes, not a partial port.
2. Shell's Dashboard budget-tracker demo data reconciliation against
   Section 43's real, shipped implementation — unrelated to dark
   mode, not blocking, needs its own pass eventually.
3. Building dark mode into the real main-app project (`Piwork`/
   `frontend`) once both shells are complete — Section 30-methodology
   territory (a real feature patch, not a restyle). Needs its own
   sweep of whether real code has any existing theme-hookable pattern.
