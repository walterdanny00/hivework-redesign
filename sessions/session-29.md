# Session 29 — 2026-08-14

**Focus:** Section 31's remaining open item — the `LEVEL_MAP` progression
badge (Profile + Dashboard) — designed, built, then revised twice on
user feedback. Closes Section 31; opens and closes Section 32.

## Starting-state check

Continued directly from session 28. No fresh full roadmap read — the
one open item (`LEVEL_MAP`) was already identified as the last thing
blocking a Section 30 pilot decision.

## Sweep — real LEVEL_MAP definition

Per the roadmap's standing sweep-before-designing rule, pulled the
real code via Termux before designing:

```
cd ~/Piwork/frontend/src
grep -n -B 3 -A 15 "LEVEL_MAP" pages/Profile.tsx
grep -n -B 3 -A 15 "LEVEL_MAP" pages/Dashboard.tsx
```

**Confirmed:** one `LEVEL_MAP` (🥉 Pioneer / 🥈 Verified / 🥇 Expert /
💎 Validator, gold-colored text) rendered directly under `@username` on
both `Profile.tsx` and `Dashboard.tsx` — bare colored text with an
emoji prefix, no container, no pill.

## Discovery — undocumented chip infrastructure already in the shell

Before designing from scratch, found three hardcoded spots in
`HiveworkApp.jsx` (profile-menu dropdown, profile-edit cover, profile-
view cover) with a static `chip-verified`/`chip-gold` pill pair next to
`@Olawalt`. "Verified" is literally one of the four real `LEVEL_MAP`
values; "Gold" is literally a real `trust_tier` value (already ✅ Done
elsewhere as the `TRUST_COLOR` badge) — same precedent-matching pattern
as the session 28 wallet-gate discovery (a canonical file quietly
already covering ground the roadmap hadn't caught up to).

Confirmed via a further Termux pull that the HTML shell is at parity
(same three hardcoded spots) and that **Dashboard has no identity
header at all** — real `Dashboard.tsx` puts avatar + `@username` +
`LEVEL_MAP` + `total_earned` in a card at the top; the shell's
Dashboard page-head is just a plain title, no card to attach a badge
to.

## User decisions

- Existing chip infrastructure: **wire it to the real 4-state data,
  don't redesign it** — this is a wiring job, not a new design.
- Dashboard's missing identity block: **don't add a full identity
  card** — just get the level chip and earned total onto the screen,
  handled on its own terms rather than copying the real card 1:1.
  Earned total explicitly called out as something to surface again,
  since Section 28 had removed it from the Home hero.

## Pass 1 — wired, not redesigned (superseded, see below)

Added `LEVEL_MAP`→chip-class/label maps (`chip-pioneer` neutral outline,
`chip-verified` reused mint, `chip-expert` reused violet-tint,
`chip-validator` new solid violet) and the matching trust-tier set
(`chip-silver`/`chip-bronze`/`chip-unverified` alongside the existing
`chip-gold`). Wired all three existing profile chip spots to real data.
Added a right-aligned corner block to Dashboard's page-head: level chip
over a `116π · Earned` mono figure, reusing the same `116π` value
Section 28 had promoted out of the Home hero (so Profile's stat-pill
and Dashboard now read one shared value instead of two independent
hardcoded figures).

Verified balanced in both files at this checkpoint; logged as a new
roadmap Section 32 candidate, closing Section 31.

**User feedback: rejected both halves.** Pastel-pill treatment felt
generic, and the Dashboard corner tuck read as an afterthought.

## Pass 2 — tiered chip + bordered strip (superseded, see below)

Revised direction: Pioneer as a bare outline chip; Verified/Expert kept
their existing mint/violet fills; Validator became a dark ink+gold chip
pulled from `.job-head`/`.amt` (Job Detail's header card — the design
system's actual "money moment," identified via a Termux grep as the
closest existing precedent for a top-tier treatment). Dashboard's
corner block was replaced with a full-width bordered strip below the
page-head, matching the `.hw-trust-row` card language, level chip and
earned total as two columns.

**User pushback, mid-explanation:** asked directly whether Dashboard's
existing design was being changed. Clarified this wasn't a Dashboard
redesign — the page-head, nudge banner, toggle row, `WithdrawPanel`,
and history rows were untouched; only the new content (chip + earned
total, which never had a home before) was getting a designed spot
using an existing pattern. User approved proceeding on that basis.

Built and verified (balanced, no dead class references) in both files.

**User feedback: still rejected.** Preferred the original Home hero
treatment for "Total earned" (big bold number, thin label above, violet
π as an accent) over the compact strip, and said they'd send a
reference image.

## Pass 3 — reuse `.hero-block` verbatim (final, landed)

User's reference image matched typography already in the codebase:
`.hero-block`/`.hero-num`/`.hero-sub` — the same classes Home's rating
stat ("★ 4.3 · 17 jobs completed") now uses after Section 28 moved the
earned figure off Home. Rather than approximate the look, reused the
block verbatim on Dashboard:

- `.hero-label` "Total earned" / `.hero-num` big Sora figure with a
  violet `π` unit / `.hero-sub` now holds the level chip quietly
  underneath, instead of competing with the number for weight
- The bordered strip from Pass 2 was removed entirely rather than left
  dormant
- Tiered chip treatment from Pass 2 (Pioneer outline / Validator dark
  ink+gold pulled from `.job-head`/`.amt`) was kept as final — that
  part of Pass 2 wasn't part of the rejection
- No emoji used anywhere in the chip treatment (real code's 🥉🥈🥇💎
  prefixes were dropped) — consistent with this project's existing
  SVG-icons-not-emoji convention from Post Job (Section 9)

**Ported to both files** (`HiveworkApp.jsx` canonical, then
`hivework-app-v4-3.html` vanilla-JS pattern via a shared `PROFILE_DATA`
object + `levelChipHtml()`/`trustChipHtml()` helpers, populated at
boot into `#dash-earned-num`/`#dash-level-chip`).

## Verification

- `HiveworkApp.jsx`: braces 1869/1869, parens 1913/1913, brackets
  217/217
- `hivework-app-v4-3.html`: 664/664 `<div>`/`</div>`, parses clean
- Confirmed both files at parity: same `LEVEL_CHIP_CLASS`/`LEVEL_LABEL`
  maps, same `.chip-pioneer`/`.chip-validator` CSS, same `.hero-block`
  reuse on Dashboard, no leftover Pass-1/Pass-2 class references
  (corner block, bordered strip) in either file

## Open flag, unresolved

Whether real `Dashboard.tsx`'s `total_earned` is a top-level field on
the same payload as `level`/`trust_tier`, or a separate call — designed
off session 28's terminal pull, which showed it inline, but not
re-verified this session. Doesn't block anything currently (nothing
patched into the real app yet), but worth confirming before Section 30
touches Dashboard specifically.

## Files touched

`HiveworkApp.jsx`, `hivework-app-v4-3.html` (canonical shells — both
now reconciled, LEVEL_MAP fully wired), `roadmap.md`, this session
brief. Note: `roadmap.md` and this brief were written in-chat but the
push commands were never issued before the session ended — see below.

## Continued, same day — Dashboard identity block completed (Section 33)

After the pass-3 landing above, user flagged the Dashboard build
couldn't be called complete without the username actually visible, and
asked whether star rating/tier badge had come up anywhere in the
interrupted chat file. A targeted search of the recovered chat found
nothing on that specific question, which prompted a wider Termux sweep
of real `Dashboard.tsx` than Section 32's original narrow
`LEVEL_MAP`-scoped grep:

```
cd ~/Piwork/frontend/src
grep -n -B 5 -A 40 "LEVEL_MAP" pages/Dashboard.tsx
```

**Confirmed:** the identity card is exactly `avatar + @username +
LEVEL_MAP` / `total_earned` — no `trust_tier` in it at all, settling
Section 31's open question for Dashboard specifically (trust badge is
Profile-only, confirmed by real code). A separate 3-pill stat row sits
just below the card in the real component: `jobs_completed`, `rating`
(⭐), `total_earned` again. Rating hadn't been part of any Dashboard
design in this project before this point. Flagged for the record: this
doesn't overturn Section 28's earlier design reasoning that
rating/jobs-completed is Home's territory — that stands as a design
call — but it is a technical fact worth logging that the real app
shows rating on both screens, not on an exclusive split.

**Built:** identity elements (avatar, `@Olawalt`, level chip) grouped
as `.dash-id`; a two-pill stat row (Jobs done / Rating) reusing the
existing `.stat-pill` component from Profile, same demo figures (17 /
4.3★). Deliberately dropped a third "Earned" pill that the real card
has — already shown big in the hero-block, would've read as redundant
directly underneath it. Logged as an intentional divergence, not an
oversight.

**Placement iterated live, three positions:**
1. Standalone row above the hero-block — first build.
2. Moved into the page-head, right-aligned against "Wallet & jobs /
   Dashboard." — per direct request.
3. **Final:** moved to the right side of the hero-block's own row,
   level with "Total earned," page-head reverted to its original plain
   form. `.dash-head` class fully removed (not left dormant) once
   superseded.

**Verification:** `HiveworkApp.jsx` braces 1875/1875, parens
1917/1917, brackets 217/217; `hivework-app-v4-3.html` 676/676 div
open/close, parses clean; no leftover `.dash-head` references in
either file after the final move.

## Files touched (final)

`HiveworkApp.jsx`, `hivework-app-v4-3.html` (canonical shells —
LEVEL_MAP wired + Dashboard identity block complete), `roadmap.md`
(Sections 32 and 33), this session brief.

## Next session

1. **Push now.** This file, `roadmap.md`, `HiveworkApp.jsx`, and
   `hivework-app-v4-3.html` all need the roadmap's standard two-repo
   push routine — `hivework-redesign` content only, nothing has moved
   into the real app yet.
2. Section 31 is fully closed (wallet-verify gate + `LEVEL_MAP`, both
   designed and built). Section 30's first-patch pilot decision is
   unblocked — Job Detail (worker view) is the standing candidate.
3. Confirm the `total_earned` payload-shape flag noted above (whether
   it's on the same payload as `level`/`trust_tier`, or a separate
   call) before Dashboard specifically becomes a Section 30 patch
   target — still unverified, doesn't block anything currently.
