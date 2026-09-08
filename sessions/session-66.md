# Session 66 — Dark mode port into `HiveworkApp.jsx` (2026-09-08)

Continuation of Session 65's next-step item 1: port the completed
dark mode work from `hivework-app-v4-3.html` into the compiled JSX
shell — full token plumbing plus all seven fixes, not a partial port,
matching the scope Session 65 flagged for confirmation.

## Token plumbing

- Extended the main `.hw-app` `:root` block with the full Session 65
  token set and added a matching `[data-theme="dark"]` override
  block, copied 1:1 from the HTML shell's light/dark mapping.
- Adapted the HTML shell's pre-paint inline boot script for a React
  component: a lazy `useState` initializer reads
  `localStorage['hw-theme']` (falling back to
  `prefers-color-scheme`), and a `useLayoutEffect` applies
  `data-theme` to `<html>` and persists changes. Same storage key and
  fallback behavior as the HTML shell — React has no equivalent of a
  document-head script that runs before first paint, so this is the
  earliest safe point available in a mounted component.
- Added `.toggle-switch`/`.knob` and `.settings-row*` CSS to the main
  style block.
- Added a **Settings** side-drawer nav entry (above Help) and the
  Settings screen itself (Appearance section, dark mode toggle row,
  "More" placeholder) — structurally identical to the HTML shell.

## Structural fix the port required

`HW_JDW_STYLES`, `HW_LANDING_STYLES`, `HWPC_STYLES`, and
`HW_ONBOARD_STYLES` each carried a local redeclaration of the base
tokens (`--cream`, `--ink`, `--violet`, etc.) — an established,
previously-harmless convention noted in earlier session comments as
"same convention as other canonical files." Harmless when every
`:root`/local block agreed on the same light values. Not harmless for
dark mode: these sub-blocks render after the main style block in DOM
order, and share `:root`'s exact CSS specificity, so their
light-only values would silently have overridden the dark theme on
every screen except the main `.hw-app` shell itself (Landing,
Onboarding, Post Job, Profile Complete, Job Detail Worker).

Fixed by stripping each block down to only its genuinely unique
additions and letting the base tokens inherit from the main
`:root`/`[data-theme="dark"]` block instead:
- `HW_JDW_STYLES`: kept `--radius`, `--radius-sm`, `--cream-deep`
  (scoped on `.hw-jdw` directly, matching the HTML canonical's
  approach exactly — verified against it).
- `HW_LANDING_STYLES`: kept `--radius:18px`.
- `HWPC_STYLES`: kept `--danger`.
- `HW_ONBOARD_STYLES`: no unique additions — removed the `:root`
  block entirely.
- `POST_JOB_STYLES` was already clean (`--danger` only, no base-token
  duplication) — left untouched.

## Seven fixes, ported 1:1

1. `.jdo .declined-row` / `.jdo .ledger-submission` background
   (`#F7F5F1`) → `var(--mist)`
2. `.jdo .close-slots-card` background (`#FDFBF7`) → `var(--card)`
3. `.hw-jdw`'s `.paid-strip`, `.verified-strip`, `.attach-icon`,
   `textarea:focus` — hardcoded `background:#fff` → `var(--card)`
4. `.hw-onboard` background (`#EAE7DF`) → `var(--sand)`
5. `.hw-onboard .kyc-pill` — border (`#F4DFA8` → `var(--line)`, the
   specific Session 65 fix) and background (`#FFF3DC` →
   `var(--gold-tint)`, tokenized to match the HTML canonical's
   current state — needed for the same dark-mode reason even though
   Session 65's fix list only called out the border)
6. Chevron icon (`ChevIcon` component, the JSX equivalent of
   `chevIconSvg()`) — hardcoded `stroke="#8A6512"` → `currentColor`,
   plus a new `.kyc-pill .chev{color:var(--gold-ink)}` rule. Confirmed
   `ChevIcon` has exactly one usage site (the kyc-pill), so this is a
   safe global change.
7. `.hivework-landing .nav-links a:hover` background (`#EFEBE3`) →
   `var(--mist)`

Also fixed in the same pass (same root cause as fix #5, found via the
`TRUST_COLOR` map referenced in Session 65's Sweep 2): `Silver`
(`#9CA3AF`) and `Bronze` (`#B45309`) → `var(--trust-silver)`/
`var(--trust-bronze)`.

**Deliberately left unchanged:** `.hw-onboard .kyc-pill span`'s
hardcoded text color (`#8A6512`). Checked the HTML canonical file
directly — it still has this exact same un-tokenized value, so the
JSX now matches the reference precisely rather than fixing something
the canonical itself hasn't.

## Flagged, not fixed — out of this session's scope

While confirming `.jdo`-scoped rules for the fixes above, found that
`JOB_DETAIL_OWNER_STYLES`'s `.jdo .status-chip` and `.jdo
.toggle-row` still use raw hex (`#FFF3DC`/`#B8860B`, `#F1EFEA`,
`#E4F8F6`/`#1A9E92`, `#EFECE5`) where the HTML canonical already uses
tokens (`--gold-tint`/`--gold-ink`, `--mist`, `--teal-tint`/
`--teal-ink`, `--sand`) from what appears to be an earlier
tokenization pass (Section 54/55-era, done on the HTML shell but
evidently never ported into the JSX shell). This is real drift, and
it means Job Detail Owner's status chips and view toggle won't
respond to dark mode in the JSX shell as ported. Not part of Session
65's specific seven fixes, and fixing it would mean auditing
`JOB_DETAIL_OWNER_STYLES` more broadly rather than a scoped port —
left untouched pending a confirmed-scope decision, per the project's
standing pattern of logging gaps rather than silently expanding
scope.

## Verification

No network access and no JSX/Babel tooling available in this
environment, so the file could not be compiled or run. Checked
instead: brace/paren/backtick counts in the full file balanced before
and after all edits; every fix target re-grepped to confirm no
leftover raw hex remained (except the one deliberately-kept
`kyc-pill span` line, confirmed above); the Settings screen JSX
structure and side-nav entry checked directly against the HTML
canonical's equivalent markup. An actual build/browser check is the
outstanding verification step — flagged as an open item below.

## Files touched

`HiveworkApp.jsx`, `roadmap.md` (new Section 78), this session brief.

## Still open, unresolved

1. `JOB_DETAIL_OWNER_STYLES` hex/token drift vs. HTML canonical
   (`.status-chip`, `.toggle-row`) — flagged, not fixed, needs a
   confirmed-scope pass.
2. Shell's Dashboard budget-tracker demo data (Section 34-era) vs.
   Section 43's real shipped implementation — unrelated to dark
   mode, not blocking.
3. Building dark mode into the real `Piwork`/`frontend` app — not
   started, needs its own sweep for an existing theme-hookable
   pattern.
4. This session's port is unverified in an actual build/browser —
   worth a visual pass before treating it as fully confirmed.
