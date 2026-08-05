# Hivework — Onboarding Spec

Entry flow between Landing and the main app. Route: `onboarding`.
Reached from landing's "Get started" (no intent) or hero CTAs
`?intent=find` / `?intent=post`.

Not covered here because Landing already handles it: value prop / how
escrow works, fee transparency, intent selection (the click on Landing's
CTA already *is* the intent signal).

---

## Screen 1 — Connect Pi Wallet

**Headline:** Connect your Pi Wallet
**Subtext:** Hivework uses the Pi Wallet for identity and escrow. We'll
request your Pi username and payment permissions.

**Verification notice (KYC)** — distinct callout, not buried in body copy:
> Identity Verification (KYC) required for paid activity. Browsing is open
> to everyone. Posting a job or applying to paid work requires a
> KYC-verified, Mainnet-migrated Pi Wallet, since Pi's network doesn't
> support Pi transfers on unverified accounts. If you haven't completed
> KYC yet, you can still explore Hivework — you'll be prompted to verify
> when you're ready to post or apply.

**Testnet note** — quiet, lighter weight than the KYC notice (no
border/background, just muted text):
> Note: Hivework is currently on Pi Testnet — wallet activity here uses
> Test-Pi, not real Pi.

**Elements:**
- Terms of Service + Privacy Policy checkbox — required before Connect enables
- Primary action: "Connect with Pi Wallet"
- Pi Browser fallback: if Pi Browser isn't detected, swap the primary
  action for "Open in Pi Browser" with a one-line explanation (Pi SDK only
  works inside Pi Browser)
- Intent (`find` / `post` / none) carried through silently from Landing —
  no visible UI for it on this screen

---

## Screen 2 — Quick Profile *(skippable — never a dead end)*

- Username — auto-filled from Pi, read-only
- Bio — optional
- Skills / device chips — optional; feeds Home's "Recommended for you" logic
- "Skip for now" always visible

---

## Screen 3 — Notifications

- Explicit opt-in with reasoning (e.g. "Get notified when your work is
  approved or paid") — not a silent native permission prompt
- "Not now" skip option
- On completion, route by intent:
  - `intent=find` → Browse
  - `intent=post` → Post Job wizard
  - no intent → Home

---

## Policy basis (why KYC is called out explicitly)

Pi Network requires KYC verification plus Mainnet migration before a
wallet can send or receive real Pi at all — this is enforced at the
network level, not a Hivework-specific restriction. Practical effect:

- **Browsing** — open to everyone, no gate
- **Posting a job** — blocked for unverified wallets (requires locking
  real Pi in escrow)
- **Applying to paid work** — should be blocked pre-KYC too, so nobody
  does real work they can't get paid for
- **Ratings** — unverified accounts' ratings shouldn't count toward
  public trust score (cheap vector for fake-account gaming)

Principle: disclose the KYC requirement *before* someone invests effort —
here on Screen 1, not as a surprise later at withdrawal.

---

## Known open question (not yet resolved)

The real app's `Dashboard.tsx` runs its own `profileComplete` check/nudge
on mount, separate from this onboarding flow. Not yet decided whether
onboarding's skippable Screen 2 fully replaces that nudge, or whether
Dashboard still needs its own prompt for users who skipped onboarding's
profile step and never came back to it.
