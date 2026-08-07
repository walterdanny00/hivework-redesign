# Session 04 — Profile Complete JSX port

**Date:** 2026-08-07

## What happened

- Ported `hivework-profile-complete.html` to `HiveworkProfileComplete.jsx`,
  matching established screen-file conventions: `hwpc-` class-prefixed
  scoping, `STYLES` template string, single-file `export default function`
  + `useState`, no external CSS/Tailwind.
- Skills implemented as a free-form chip input (Enter/comma to commit,
  Backspace-on-empty pops last chip, × removes any) — no suggestion list,
  matching the real field's open-ended nature.
- Built a shared `Combobox` sub-component inside the file for Devices and
  Languages — same suggestion lists and custom "Add '...'" behavior as the
  HTML version, and structurally the same pattern already used for these
  two fields on Post Job.
- Bio stayed a plain textarea + live 200-char counter (turns red past 180),
  matching the real field's hard limit.
- Save button gated on ≥1 skill; Skip button always enabled, with a hint
  line shown only while the gate is unmet.

## Bug found and fixed

Standalone preview showed a blank head-icon: the violet gradient background
and the white-stroked SVG inside it both resolved to nothing, because the
file didn't define its own design-token `:root` block and was relying on
the real app shell's global `hivework-tokens.css`, which isn't present in
isolated preview.

Fixed by adding the `:root` token block directly into the file's `STYLES`
string. Checked `HiveworkJobDetail.jsx` and `HiveworkPostJob.jsx` directly
to see whether this was already the convention — confirmed both already
self-contain their own `:root` block. So the real convention (now
confirmed, not assumed) is: **every screen file defines its own design
tokens**, none of them depend on the external `hivework-tokens.css` at
render time. `HiveworkProfileComplete.jsx` was the one file missing it;
now fixed and consistent with the other two.

Noted, left as-is (minor, not worth aligning): JobDetail's body background
is a raw `#EAE7DF` instead of `var(--cream)`, and its `:root` block omits
`--danger` — small inconsistency vs. the other two files' token blocks,
not a bug.

## Status

Real `/onboarding` (profile-completion) screen is now **done** in both
HTML and JSX — matches the other completed screens' file pairs.

## Files touched

- `hivework-profile-complete.html` (no change this session, built prior)
- `HiveworkProfileComplete.jsx` (new)
