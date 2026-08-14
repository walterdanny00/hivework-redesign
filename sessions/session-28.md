# Session 28 — 2026-08-14

**Focus:** Section 31's account-verification gate — building the two
states session 27 flagged as missing (`verifying` loading state, and
a success confirmation), then two mid-session discoveries: (1) the
gate was already partially built in the canonical mockup file, just
never reconciled back into the roadmap; (2) the canonical file's
work-submission case had drifted stale against the shell. Ran across
two chat sessions due to a sandbox outage partway through — this brief
covers the whole arc.

## Starting-state check

Continued directly from session 27's findings — no fresh full roadmap
read this session, since the two open items (wallet gate, `LEVEL_MAP`)
were already identified and this session picked up the first of the
two.

## Wallet-verification gate — designed, then found partially pre-built

Pulled the real `JobDetail.tsx` conditional chain via Termux
(`grep -n -B 3 -A 40 "hasWallet"`) to confirm exact structure before
designing. Confirmed the "null/null double-loading state" session 27
flagged isn't a separate screen — it's the fallback Apply button
disabled while `hasWallet`/`profileComplete` resolve.

**Standing decision surfaced** (discussed previously, never written
down): Sentinel is a separate security project, to be integrated in
the future, and is deliberately kept out of this redesign's visual
language. The "🛡️ Client wallet verified by Sentinel" banner text
session 27 flagged should not appear in any wallet-verification UI —
only generic wording ("Wallet verified").

Before designing from scratch, pulled the canonical
`HiveworkJobDetailWorker.jsx` for the actual class/component
conventions (`.card`, `.btn`, icon sizing) — and discovered the gate
was **already substantially built**: `wallet_off`/`wallet_error`
states existed in the `STAGES`/`Panel` system since session 8, with
generic, non-Sentinel copy. Session 27's "undesigned" framing in
Section 31 was correct that the real `hasWallet` gate was undocumented
in the roadmap, but hadn't cross-checked whether a canonical mockup
file already covered it.

What was actually still missing:
- No `verifying` loading state (real code swaps the button text to
  "Confirm in Pi Wallet..." while awaiting payment confirmation)
- No success/confirmation panel — jumped straight from
  wallet_off/wallet_error to profile_off with no transitional state

**Built, in the canonical file and both shells**
(`HiveworkJobDetailWorker.jsx`, `HiveworkApp.jsx`,
`hivework-app-v4-3.html`):
- New `wallet_verified` state — mint checkmark strip ("Wallet
  verified"), reusing the existing `.paid-strip` visual convention
  (new `.verified-strip`/`.verified-icon`/`.verified-text` classes)
- `verifying` prop/flag threaded through the wallet gate panel —
  button disables and swaps text to "Confirm in Pi Wallet..." during
  verification
- New `handleVerifyWallet` handler sequencing
  `verifying → wallet_verified → profile_off`, matching the existing
  apply/submit/rate transition pattern already used elsewhere in this
  file
- The HTML shell got the same logic ported to its vanilla-JS pattern
  (`verifyWallet()` with a `setTimeout`-based sequence, matching the
  JSX shell's pacing)

Shell recompile done as its own explicit step per the roadmap's
workflow, per the user's decision to recompile immediately rather than
defer.

## Discovery — submission composer, canonical file vs. shell

While verifying the wallet-gate edit hadn't regressed anything nearby,
a second, unrelated drift surfaced: canonical
`HiveworkJobDetailWorker.jsx`'s `'approved'` (work submission) case
still had the **old single-field** submission (`submission`/
`onSubmissionChange`, plain "Report / findings" textarea, a
live-looking attachment mockup showing "2.1 MB · uploaded"). The shell
(`HiveworkApp.jsx` / `hivework-app-v4-3.html`) had already moved to a
newer **structured 4-field composer** ("Section 27" per its own code
comments): "What was done" / "Evidence" / conditional "Environment"
(bug jobs only) / optional "Notes", branching placeholder copy via
`getSubmissionKind()` (bug/translation/feedback, classified from the
job's `cat` label), composed into one string via `composeSubmission()`
before submit — the real `/api/jobs/:id/submit-work` endpoint only
ever accepts one plain-text field, so the structure is UI-only.
Attachments explicitly tagged "Coming soon" and disabled, rather than
shown as a live mockup.

This is the reverse of the project's normal drift direction — the
shell had a real feature the canonical standalone file never received.
Confirmed via diff this predates this session's work entirely and is
unrelated to (not caused by) the wallet-gate edit — the `'approved'`
case is a different stage (3) from the wallet gate (stage 0), untouched
by either edit.

Also confirmed, at the user's prompting after a mid-session
correction: the *shell* files already delivered this session
(`HiveworkApp.jsx`, `hivework-app-v4-3.html`) preserve the newer
submission composer byte-for-byte versus the user's own freshly
re-uploaded copies — only line numbers shifted, from the new
wallet-gate code inserted earlier in the file. Nothing about the
composer flow was touched or regressed by the wallet-verification
recompile.

**User decision:** reconcile the canonical file to match the shell's
newer composer.

### Sandbox outage

The CSS addition (`.sub-composer-hint`, `.sub-field`, `.sub-field-sm`,
`.sub-soon-tag`, `.attach-disabled`, `.attach-add-wide:disabled`) was
queued but the sandbox became unresponsive (bash tool and file-view
tool both failing identically across many retries, spanning several
user messages) before the three helper functions
(`getSubmissionKind`, `SUBMISSION_EVIDENCE_HINT`, `composeSubmission`)
or the `'approved'` case rewrite could be applied — treated as a
stuck/dead sandbox tied to that conversation session rather than a
transient blip. Roadmap/session-brief updates for that point in time
were written out directly in-chat rather than saved as files, since
the file tools were down. That chat was continued here.

### Reconciliation completed (this session, fresh sandbox)

Working from the user's freshly re-uploaded `HiveworkJobDetailWorker.jsx`
(the wallet-gate-complete version) and the shell's known-good composer
code as the source of truth:
- Added the CSS classes above
- Added `getSubmissionKind`, `SUBMISSION_EVIDENCE_HINT`,
  `composeSubmission` (verbatim from the shell), placed after `STAGES`
- Replaced the `'approved'` case with the structured 4-field version
- Updated `Panel`'s signature to take `submissionKind`, `subWhat`/
  `subEvidence`/`subEnvironment`/`subNotes` + their `onChange`
  handlers, and `canSubmitWork`, in place of `submission`/
  `onSubmissionChange`
- Replaced the component's `submission` state with `subWhat`/
  `subEvidence`/`subEnvironment`/`subNotes`, derived `submissionKind`
  (from `job.cat`), derived `submission` string (via
  `composeSubmission`), and derived `canSubmitWork`
- Added `cat: 'Usability Testing'` to the file's default demo `job`
  object so `getSubmissionKind` has a real value to classify (matches
  the eyebrow's "UI Testing" framing)
- Rewired the `<Panel>` invocation to pass the new composer props

## Verification

- Diffed the reconciled file against the wallet-gate-complete upload
  before presenting: confirmed the diff is scoped exactly to the CSS
  block, the three helper functions, `Panel`'s signature, the
  `'approved'` case, and the component's state/props wiring — the
  wallet-gate cases (`wallet_off`/`wallet_error`/`wallet_verified`)
  and `handleVerifyWallet` are untouched
- Brace/paren/bracket balance checked after the edit — all balanced
  (233/233 braces, 190/190 parens, 17/17 brackets)
- No headless-browser check available in this sandbox (same standing
  limitation noted in prior sessions)
- Shells not re-touched this session — they already have the newer
  composer natively (confirmed last session), so no shell edit was
  needed for this specific fix

## Submission-composer reconciliation — HTML snapshot (follow-up, same day)

After the push commands were drafted, the user flagged that the
standalone canonical HTML snapshot, `hivework-job-detail-worker.html`,
had never been checked or uploaded this session. Requested and
received it via Termux copy + manual upload.

Confirmed it was stale in the same way the JSX had been: a static
single-state snapshot (per its own comment, deliberately demonstrating
only the `'approved'` state — no wallet-gate markup exists here at
all, and that scope decision still stands) still showing the **old**
single-field "Report / findings" textarea plus a live-looking two-item
attachment list with an upload progress bar (`.attach-progress-fill`,
"Uploading · 64%").

**Reconciled to match the JSX composer:**
- Added the same CSS classes (`.sub-composer-hint`, `.sub-field`,
  `.sub-field-sm`, `.sub-soon-tag`, `.attach-disabled`,
  `.attach-add-wide:disabled`) to the file's self-contained
  `<style>` block
- Replaced the panel body with the structured fields: "What was done",
  "Evidence" (with the feedback-kind hint, since this file's demo job
  — "UI Testing · Job #4471" — classifies as "feedback" not "bug" under
  `getSubmissionKind`), and optional "Notes" — no Environment field,
  matching the JSX's conditional (bug jobs only)
- Attachments changed to the static "Coming soon" disabled treatment,
  dropping the old uploaded/uploading mockup rows entirely
- Updated the file's own header comment, which still described the
  old "attachments are a proposed addition" framing

**Verification:** diffed against the user's upload — scoped to the CSS
addition, the comment update, and the panel body; div tags balanced
(43 open / 43 close); parses as valid HTML (`lxml.etree.HTML`, no
errors).

## Files touched (updated)

`HiveworkJobDetailWorker.jsx`, `hivework-job-detail-worker.html`
(canonical pair — both now reconciled), `roadmap.md`, this session
brief. `HiveworkApp.jsx` and `hivework-app-v4-3.html` untouched this
session (already current).

## Next session

1. Push: this file, the updated `roadmap.md`, and the reconciled
   `HiveworkJobDetailWorker.jsx` all need to go through the roadmap's
   standard two-repo push routine (see top of `roadmap.md`) —
   `hivework-redesign` content, not a `Piwork`-only patch, since
   nothing has moved into the real app yet (Section 30 hasn't started).
2. `LEVEL_MAP` badge (Profile + Dashboard) — still fully open,
   untouched across sessions 27 and 28. This is now the only item
   blocking a first-patch pilot decision for Section 30.
3. Once `LEVEL_MAP` is designed, Section 30's first patch can proceed
   — starting candidate is still a reconciled screen; Job Detail
   (worker view) is back in consideration as a pilot now that its
   wallet-gate logic is fully reconciled with the real code.
