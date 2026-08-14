# Session 27 — 2026-08-14

**Focus:** Section 30 pre-flight sweep — checking the real app for
anything not yet gated behind KYC/auth, or otherwise undesigned, before
the patching-into-main-app phase begins. Not a screen-design session;
a reconnaissance sweep per Section 30's own stated requirement.

## Starting-state check

Read `roadmap.md` (all 30 sections at the time) and `session-26.md`
before starting, per standing rule. Confirmed Section 22's three items
were fully closed as of session 26, and nothing was pre-selected for
this session — session 26's own "next session" note said the next
priority should come from a fresh full read of the roadmap, which is
what surfaced Section 30's pre-flight requirement as the logical next
step.

## Sweep, per Section 30's checklist

Full-file reads (not grep-only, per the checklist's explicit
instruction) across `frontend/src`, pulled via Termux across several
rounds:

- `App.tsx` — route table, confirmed flat, no router-level guards
  (`ProtectedRoute`/`AuthGuard` pattern doesn't exist; all gating is
  inline component logic)
- `JobDetail.tsx` — full read surfaced the session's main finding (see
  below)
- `Dashboard.tsx`, `Profile.tsx` — surfaced the second finding
  (`LEVEL_MAP`)
- `WithdrawPanel.tsx` — full read, matches existing Section 19/20
  refund-kind design, no gaps
- `ApplicationCard.tsx`, `JobCard.tsx` — full reads, match existing
  roadmap notes, no surprises
- `lib/api.ts` — session-token pattern (`localStorage` → `x-session-
  token` header), worth remembering for Section 30's real patches
- `lib/usePi.ts` — clarified that wallet attachment is automatic on
  login (`Pi.Wallet.getUserMigratedWalletAddresses()`), which reframed
  finding #1 (see below)
- `lib/RoutePersistence.tsx` — real navigation logic (Pi Browser
  refresh workaround), no UI, never surfaced in this project before
- `lib/support.ts`, `lib/usePaginatedList.ts` — both clean, match
  existing roadmap coverage
- `Layout.tsx`'s `incompletePayment` handling — checked directly,
  confirmed a silent fire-and-forget cleanup call, correctly invisible
  by design, not a gap

## Findings

**1. Account verification gate (Job Detail apply flow) — undesigned.**
Originally logged as "wallet verification," corrected after reading
`usePi.ts`: the wallet itself is already attached automatically during
normal Pi login, no gate involved. What's actually gated is a separate
account-level anti-fraud/spam check (`hasWallet` from
`/api/users/me/wallet-status`) requiring a real 0.01π payment — and it
runs *before* the already-known profile-complete gate in the same
conditional chain. Has its own loading state, error state (wired to a
6th, previously uncounted `ContactSupport` usage), and success banner
("🛡️ Client wallet verified by Sentinel"). Job Detail was named a
low-risk reconciled pilot in Section 30 on the assumption its logic
already matched what's designed — this finding means that's no longer
fully true.

**2. `LEVEL_MAP` progression badge — undesigned, distinct from the
already-covered trust badge.** Confirmed via `Profile.tsx` that
`LEVEL_MAP[profile.level]` (pioneer/verified/expert/validator) and
`TRUST_COLOR[profile.trust_tier]` (Gold/Silver/Bronze/Unverified,
already ✅ Done via Job Detail owner view) are two separate fields,
rendered in two separate JSX blocks. `LEVEL_MAP` had only ever been
mentioned once before, as a throwaway phrase in Section 8
(2026-08-10), and never revisited as its own design item. Confirmed
purely read-only/display — no setter anywhere in the frontend, so no
interactive design is needed, just a visual treatment. Appears on both
Profile and Dashboard.

**Confirmed clean, no further gaps:** exactly 10 pages (unchanged),
`WithdrawPanel.tsx`, `ApplicationCard.tsx`/`JobCard.tsx`, `api.ts`,
`support.ts`, `usePaginatedList.ts`, incomplete-payment recovery flow.

**Non-screen finding worth remembering for Section 30's patch phase:**
`RoutePersistence.tsx` — a Pi-Browser-only refresh/navigation
workaround with no UI of its own. No design decision needed, but it's
real behavior that must survive patching since nothing about it is
visible in any screen file.

## Roadmap changes

Section 31 added: "Account verification gate — newly discovered,
undesigned" (retitled from an initial "Wallet Verification" label once
the `usePi.ts` read clarified the distinction). Documents both findings
above, the terminology correction, everything confirmed clean, and the
`RoutePersistence.tsx` note. Section 30's status line updated to point
to Section 31 and mark the pre-flight sweep complete for this session.

## Verification

No build/lint/test step — this was a documentation/reconnaissance
session, no code was touched. Verification here means: every file
under `frontend/src` was either read in full or confirmed already
covered by an earlier full read this session (pages, all 6 non-page
components, all 5 lib files) — cross-checked against `find frontend/src
-iname "*.tsx"` output from Section 30's own sweep-checklist item 1 to
make sure nothing was skipped.

## Files touched

`roadmap.md`, this session brief (`session-27.md`). No screen files,
no shell files — this session didn't touch `HiveworkApp.jsx` or
`hivework-app-v4-3.html` at all.

## Next session

Pre-flight sweep is complete per Section 30's requirement. Two real
findings need a design decision before the first patch:
(1) the account-verification gate's screen states (its own card,
loading state, error state) — likely a state variant of the existing
Job Detail canonical file rather than a new screen file, since it's
the same route/component, just an earlier branch in the same
conditional chain already handling the profile-complete gate; (2) the
`LEVEL_MAP` badge's visual treatment on Profile and Dashboard. Once
those are designed, Section 30's first patch can proceed — starting
candidate is still a reconciled screen, though Job Detail's pilot
status should be revisited given finding #1.
