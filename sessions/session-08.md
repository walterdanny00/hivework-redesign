# Session 08 — Job Detail (Worker view), merged and canonical

## What happened

Reconciled the worker (non-owner) branch of `JobDetail.tsx` against two
competing designs (a discrete-state-card version and a ledger/timeline
version), merged them, then stripped the result down to a shipping-clean
canonical file. This closes the "Worker (non-owner) view not yet
redesigned" item from the Screen Inventory.

## State map (11 total, reconciled against `JobDetail.tsx`)

The worker branch is a single dynamic slot; exactly one of these renders
at a time, in this priority order in the real code:

1. **Wallet unverified** (`hasWallet === false`)
2. **Wallet verify — error** (`verifyError` set) — real state, uses `ContactSupport`
3. **Profile incomplete** (`profileComplete === false`) — routes to `/onboarding?returnTo=...`
4. **Ready to apply** (default, job open, all gates passed)
5. **Apply form open** (`showApplyForm`)
6. **Application pending** (`applied || myApp?.status === 'pending'`) — now also fires while job is still `open`, not just `in_progress` (BUG-103 fix)
7. **Not selected** — ⚠️ **proposed, not a real render state.** The live code has no branch for `myApp?.status === 'rejected'`; a rejected worker currently falls through to the default Apply button as if they'd never applied. Flagged back as a real product gap, same bucket as the missing log-out feature and the missing single-worker deadline field. Kept in the design as a deliberate improvement, not shipped as "already exists."
8. **Approved — submit work** (`mySlotState === 'approved'`)
9. **Work submitted** (`mySlotState === 'submitted'`)
10. **Slot paid — rate now** (`mySlotState === 'completed'`, no `myRating` yet)
11. **Slot paid — already rated** (`myRating` present)

## Design decision: ledger/timeline over discrete cards

Two competing structures were built:
- **v4** — isolated state cards (icon + heading + body), generic-clean but
  visually could belong to any app
- **v2** — a 5-stage ledger (verify → profile → apply → work → paid) with
  only the current stage expanded into a panel; done stages collapse,
  upcoming stages dim

**Decision: ledger structure wins**, kept as canonical. It ties into the
app's own signature idiom (escrow ticker, mono-type amounts, dark
statement-style header) rather than reading as generic. It also better
matches the real code's actual gating order (wallet → profile → apply →
work → paid falls out naturally from stage progression, vs. re-deriving
which isolated card to show).

## Real gap found: rejected application has no UI state

See item 7 above. Worth raising as an actual implementation task
(add a `myApp?.status === 'rejected'` branch server/client-side), separate
from this redesign pass.

## Attachments — kept as proposed, not real

`submit-work` in the real code (`handleSubmitWork`) only ever sends a
plain-text `submission` field — no file upload exists anywhere in
`JobDetail.tsx` or its API calls. The attachments UI (file list, upload
progress, add button) is kept in the canonical file as a deliberate UX
addition, same precedent as the Wallet Connect flow (Section 3) — not a
redesign of an existing feature. Flagged here rather than in the shipping
UI itself.

## Fixed during merge

- Amount formatting corrected to 4 decimal places (`3.7000π`) to match the
  real code's `.toFixed(4)` on `perSlotBudget` — the ledger draft had used
  3 decimals.
- Token palette corrected to the canonical set (`--violet:#6C5CE7`,
  `--ink:#1B1A1F`, `--mint`/`--coral`/`--butter`) — the ledger draft had
  used an entirely different, non-canonical palette (`--gold`, `--safe`,
  `--danger`, different cream/ink/violet hexes).
- `.amt` gold-on-dark color adjusted (`#F4D584`, lighter than the original
  `--butter`) for legibility against the ink header background — flagged
  as a contrast concern in review, fixed in the canonical file.

## Status

**Done, canonical.** `hivework-job-detail-worker.html` is the shipping
file — dev harness (state-switcher pills) and in-UI "Proposed" badges
removed; that context now lives in this session brief instead. The file
shows the "approved — submit work" state as the representative example;
the other 10 states follow the identical entry/panel pattern documented
above. Not yet ported to JSX or recompiled into the shell. Owner view
(`hivework-job-detail.html`/`HiveworkJobDetail.jsx`) is unchanged by this
session — still provisional, pending the user's own comparison version.

## Files touched

- `hivework-job-detail-worker.html` (new — canonical, shipping-clean)
- `hivework-job-detail-worker-merged.html` (intermediate merge, kept the
  dev harness — superseded by the canonical file above, not shipping)
