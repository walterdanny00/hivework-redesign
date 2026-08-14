# Session 26 — 2026-08-14

**Focus:** Section 22 item 3 — the last open item from the 2026-08-12
structural sweep. Deciding whether/how a persistent support access point
belongs outside the profile menu, and building it into both shells.

## Starting-state check

Read `roadmap.md` (all 28 sections) and `session-25.md` before starting,
per standing rule. Confirmed item 2 (Home hero reconciliation) was
genuinely closed as of Section 28, leaving item 3 as the only open piece
of Section 22.

## Sweep, per standing rule

Session 25's own "next session" note flagged that this item needed a
fresh Termux sweep of the real `Layout.tsx`, not just Section 17/22's
secondhand summary. User pulled it directly:

```
cd ~/Piwork && git pull
find frontend/src -iname "Layout.tsx"
cat -n frontend/src/components/Layout.tsx
```

plus a second grep across `frontend/src/` for any other support-link
precedent (`contact.support|BUG-106|support@|help@`).

Findings, all new detail beyond what Sections 17/22 had secondhand:
- The `BUG-106` footer is its own row between `<main>` and the bottom tab
  nav, **always rendered regardless of `connected` state** — unlike
  Post/Dashboard/Bell, which do hide when logged out.
- Deliberately low-key: 11px muted text, centered, "Need help? Contact
  support" as plain text-into-link.
- It's the *only* real clickable support entry point anywhere in the
  app — five other "contact support" mentions across `WithdrawPanel.tsx`,
  `JobDetail.tsx` (×2), `PostJob.tsx`, `HistoryWithdrawals.tsx` are all
  inline error text, no link.
- `Layout.tsx` wraps every route via `<Outlet/>`, so the footer is
  present on all real pages — not scoped to a subset of "main"
  destinations.

That last point mattered most for the design call below.

## Decision process — discussed with user before building

Confirmed this wasn't actually redundant with the shell's existing
profile-menu "Contact support" entry (session 15/16's reasoning for
reverting an earlier footer attempt): the profile menu itself has no
real counterpart at all — real `Layout.tsx` has no dropdown behind the
avatar (Section 8). So the profile-menu entry is a pure shell invention;
keeping it *and* adding this doesn't duplicate one real thing twice.

Design call: rather than gate visibility on `segnav`'s 4 `MAIN_SCREENS`
(which intentionally hides on drill-in screens — Job Detail, History,
Profile, Help), matched the real `<Outlet/>` scope — visible on all 10
in-app screens. In both shells this turned out to need no JS/state
toggle: placing the strip as a single static element inside the same
container that's already hidden during fullpage flows (landing/welcome/
onboarding) and shown for every real screen gets the "every-page"
behavior for free, without segnav's own `mainScreens.includes(id)` logic.

Reused the existing centered contact-support modal (session 17/18)
rather than building a second instance — `openContactModal()` in the
HTML shell, `setContactModalOpen(true)` in JSX.

## Built — both shells

- `.help-strip`: centered, 11.5px, `var(--ink-soft)`, top border in
  `var(--line)`, "Contact support" styled `var(--violet-deep)`
  700-weight — same link-color convention as `.see-all` elsewhere in the
  design system.
- Placed once, after the last screen block, inside the shell's app
  container — no per-screen markup duplication, no new toggle function.

## Verification

- Playwright screenshots (local `file://`) on Home (main tab, confirms
  it shows alongside segnav) and Help (drill-in screen, confirms it's
  NOT limited to the 4 main tabs).
- Confirmed absent on landing: `.help-strip` present in DOM but
  `is_visible() === False` when the fullpage landing screen is active.
- Clicked the new link and confirmed the modal opens correctly
  (dimmed backdrop, form immediately visible, same instance as the
  profile-menu entry).
- Diffed the full `showScreen('...')` call list (sorted) against the
  pre-edit file to positively rule out a repeat of Section 28's `sed`
  regression, rather than trusting a clean re-grep alone.
- JSX brace/paren/bracket balance net-zero after edit (no build tool in
  this sandbox, same standing limitation as every prior session).

## Roadmap changes

Section 22's status line updated — all three items now closed. Section
29 added.

## Files touched

`HiveworkApp.jsx`, `hivework-app-v4-3.html`, `roadmap.md`, this session
brief (`session-26.md`).

## Next session

Section 22's sweep is now fully closed out — all three items done. No
specific next item flagged yet; next session should open with a fresh
read of `roadmap.md` in full (per standing rule) to pick the next
priority, since nothing in the backlog is currently pre-selected.
