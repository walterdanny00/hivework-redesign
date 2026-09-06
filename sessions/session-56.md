# Session 56 — 2026-09-06

## Topic: Connect Wallet UI patched into real Onboarding.tsx

Picked up "Next session" step 1 from session 55: patch the 3-state
Connect Wallet UI (Not connected / Connecting… / Connected, KYC banner,
Testnet note, ToS checkbox) into real `Onboarding.tsx`, wiring the
`connect()` export from session 55's `usePi.ts` gate.

## Sweep before patching

Per the standing sweep rule, pulled real current state before drafting:

```
cd ~/Piwork && git pull
cat frontend/src/pages/Onboarding.tsx
cat frontend/src/lib/usePi.ts
grep -rn "wallet-card\|tos-row\|kyc-pill\|testnet-note\|wc-error-body" frontend/src --include=*.tsx --include=*.css --include=*.module.css
grep -rn "\-\-cream\|\-\-ink\|\-\-violet" frontend/src --include=*.css --include=*.module.css -l
```

Confirmed `Onboarding.tsx` had only a bare `navigate('/')` redirect effect
for not-connected visitors — no visible connect step existed in real code
at all.

## What changed

`Onboarding.tsx`'s bare redirect replaced with a `ConnectWalletStep`
component, ported from the canonical shell's `renderWelcome()` `connect`
screen state (`hivework-app-v4-3.html`).

**Design decisions made during the port, not a 1:1 copy:**
- Error state collapsed to one generic "Connection issue" rather than the
  shell's `no-pi-browser`/`failed` split — `usePi.ts`'s `runAuth()`
  doesn't distinguish those failure modes today, so the split isn't
  faked. Logged as an open gap, not designed around.
- Testnet note is now conditional on the real `PI_SANDBOX` export from
  `usePi.ts` (env-var driven) instead of the shell's always-on static
  text.
- KYC pill/detail and ToS checkbox ported as-is (no real-code equivalent
  existed to reconcile against).
- `ProfileForm` and its existing styles untouched — only the new step and
  its CSS were added.

**Biggest behavioral change, flagged at the time:** not-connected
visitors to `/onboarding` now see the Connect step in place, instead of
being redirected home. Not objected to, but not explicitly signed off
either — carried forward as an open decision (superseded in practice by
session 57's route-guard work, which changes what reaches this route in
the first place).

## Applied

```
cd ~/Piwork
cp ~/storage/downloads/Onboarding.tsx frontend/src/pages/Onboarding.tsx
```

`tsc` first caught an unused `useEffect` import (the old redirect effect
was removed but the import wasn't):

```
npx tsc --noEmit -p frontend 2>&1 | grep -i Onboarding
# frontend/src/pages/Onboarding.tsx(1,20): error TS6133: 'useEffect' is declared but its value is never read.

sed -i "s/import { useState, useEffect } from 'react'/import { useState } from 'react'/" frontend/src/pages/Onboarding.tsx

npx tsc --noEmit -p frontend 2>&1 | grep -i Onboarding
# clean, no output
```

## Files touched

`frontend/src/pages/Onboarding.tsx` — real app code, Piwork repo only.

## Pushed

```
git add frontend/src/pages/Onboarding.tsx
git commit -m "Add Connect Wallet step to Onboarding; wire connect() from usePi"
git push
```
**Confirmed clean push by user.**

## Roadmap updated

Section 67 added, documenting the port and the two deliberate deviations
from the shell (collapsed error state, conditional testnet note).

## Next session

1. Live-test Landing / Wallet Connect re-verification against a real
   logged-out state for the first time — the original session 54
   blocker, now unblocked by session 55 (gate) + this session (visible
   connect step).
2. Confirm or revisit the open decision above (redirect vs. inline
   connect step for not-connected `/onboarding` visitors).

Live-testing this immediately surfaced a larger set of gaps than
expected — see session-57.md onward for how that unfolded.
