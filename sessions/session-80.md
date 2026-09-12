# Session 80 (2026-09-12) — Submission-display redesign: design locked, token-anchor validated

## Starting point

Picked up session 79's deferred item: `composeSubmission()`
(`JobDetail.tsx`) emits `### Header`-style text with no renderer anywhere
in the app. Termux sweep confirmed:

- Fixed, closed shape — 4 possible sections (`What was done`, `Evidence`,
  `Environment` for bug-testing only, `Notes`), each `### Label\ncontent`,
  joined with `\n\n`. Not arbitrary user markdown.
- Storage is plain text, untouched end-to-end (`jobs.ts` lines ~79, 92,
  481-482).
- No markdown library anywhere in either `package.json`; no existing
  renderer.
- A real screenshot from the live app (job #4471, `@Olawalt`) surfaced a
  **second, compounding bug** during review: the render div has no
  `white-space: pre-wrap`, so the `\n\n`-joined sections collapse into one
  run-on line even before the `###` marks are considered. Two separate
  bugs, not one.

## Design process

Five iterations, moving from patching the existing shape to a ground-up
rebuild once the real screenshot exposed the actual problem worth solving:

- **A — Labeled stack.** Fields kept, rendered as caption + body pairs
  in one quiet card.
- **B — Segmented ledger.** Same fields, reusing the app's existing
  `.ledger` rail-and-dot vocabulary as a rail-and-segment layout.
  Rejected the coral-rail-for-bug-category detail on review — decorative
  color reuse that risked reading as an error state, not real information.
- **C — Evidence-first ticket.** Media strip leads, mono key/value spec
  rows follow, receipt-style perforated seam between them. **User caught
  a real flaw**: right-aligned monospace breaks down once Evidence holds
  a full paragraph instead of a short token like "iOS." Revised in place
  — left-aligned proportional body text, mono reserved for field labels
  only.
- **D — Requirement-anchored, category-weighted.** Added: (1) a quoted
  one-line echo of the job's `requirements` field above the submission,
  so review reads as "asked vs. delivered"; (2) primary-field promotion
  by category, keyed off the already-existing `getSubmissionKind()` —
  Evidence promoted for bug-testing, other fields demoted to a quieter
  secondary group. Flagged, not yet solved: translation jobs currently
  blend original text + translation into one free-text field by
  convention (`SUBMISSION_EVIDENCE_HINT`), which a category-weighted
  layout doesn't fix on its own.
- **E — Ground-up, design system discarded.** A real screenshot ("Stack
  trace attached as the second screenshot") exposed the actual bug this
  whole pass needed to solve: submission text references attachments *by
  position*, with no way for a reviewer to tell which file that means.
  Rebuilt from the premise that this is a field-inspection report, not a
  card: evidence captured inline, captioned at the point of attachment,
  in a typed field-log aesthetic (IBM Plex Mono narrative, IBM Plex Sans
  UI chrome, single verification-green accent reserved for confirmed
  states only) — deliberately steering clear of both common AI-generated-
  design tells (warm-cream-serif-terracotta; near-black-plus-neon).

## Real-precedent research

Before committing past a mockup: GitHub's own issue-template maintainers
have an open, unresolved discussion on exactly this question — screenshot
as a separate field, or placed inline in the description where it's
relevant. GitLab/HackerOne vulnerability reports (a high-bar example,
since researcher payment depends on report clarity) do both at once —
screenshots embedded inline inside numbered "Steps to reproduce," plus a
separate, always-present Attachments list covering every file regardless
of inline reference. This directly validated merging D and E rather than
treating them as competing options.

## Final design, locked

- **Labeled sections retained** — completeness scaffolding a free-text
  box would otherwise lose.
- **Inline, captioned evidence** inside the relevant section — a photo
  sits directly beneath the claim it supports.
- **Full attachments record at the bottom, always present** — every file
  listed, referenced ones checked off, so nothing a worker forgets to
  reference inline gets lost from review. Mirrors GitLab's Attachments
  tab pattern.
- Requirement echo and category-weighted primary field (both from D)
  carry forward unchanged.

## Category field sets, locked

| Category | Fields | Primary |
|---|---|---|
| Bug testing | What was done · Evidence · Environment | Evidence |
| Translation | Original text · Translation · Notes | Translation |
| UI feedback | What was reviewed · Findings/Verdict · Notes | Findings/Verdict |

Translation now splits into two structured fields instead of one blended
one — the reviewer's real question is a side-by-side comparison, the same
"which claim does this evidence support" problem the inline-anchor work
was already solving for images, just for text. UI feedback's shape is
backed by the app's own existing `SUBMISSION_EVIDENCE_HINT` copy and by
`Landing.tsx`'s category description, not invented — but Termux sweep
confirmed **no real `ui-feedback` submissions exist yet**, so this is a
first-precedent decision, not a confirmed pattern the way bug-testing and
translation were.

## Token-anchor mechanism — decided and live-validated

Evidence anchors to a token embedded in the text (`{{fig:xxxx}}`), not a
numeric character-position offset — a coordinate drifts on every edit
before it; a text-embedded token moves naturally with surrounding edits.
Flagged as the single riskiest decision the schema/composer design
depends on, so it was prototyped standalone before committing further:

- Throwaway, client-side-only prototype (`inline-evidence-prototype.html`)
  — no backend, no upload, isolating the interaction itself.
- **Live-tested in Pi Browser** via `npx serve` + `http://localhost:8080`
  (`file://` unreliable in this WebView, consistent with session 79's
  findings).
- **All four checks passed:**
  1. Cursor position (`textarea.selectionStart`) survived the native
     file-picker interruption — the same category of WebView behavior
     that broke `window.alert` and blob downloads in session 79 did
     *not* break this.
  2. Token landed exactly at the captured cursor position; text typed
     immediately after the token appended cleanly without corrupting it
     — an edit-adjacent-to-token case beyond what the test script
     prescribed, caught by live testing rather than the script itself.
  3. `FileReader`/`readAsDataURL` local preview rendered correctly (an
     initial read of the small thumbnail as "broken" was a misread on
     review — confirmed via a zoomed-in screenshot to be a correctly
     rendered dark image at 56×56px).
  4. Token-to-image resolution in the rendered preview worked cleanly.
- **Conclusion:** token-anchor approach is confirmed safe to build the
  real schema and composer around.

## Not yet done — queued for session 81

1. Real composer UI: insert-at-cursor within each labeled field
   (deliberately scoped as insertion within/between fixed field
   boundaries, not a full rich-text/contenteditable editor — the cheaper,
   more WebView-reliable approach, chosen deliberately rather than
   discovered as a gap mid-build).
2. Schema change: `attachments` (flat `jsonb` array as of session 79)
   becomes `{path, filename, caption, token}`, scoped per labeled field.
3. Migration path for submissions/attachments already stored under the
   old flat-array shape — not yet decided.
4. `composeSubmission()` refactor: fixed 4-field function → per-`kind`
   field config.
5. Composer placeholder/hint copy per category (UI feedback specifically
   should draw on Landing.tsx's "confusing before it ships" framing).
6. Real implementation of the attachments-record fallback UI, including
   referenced/unreferenced checkmark logic.

## Files touched

Design exploration only — no application code changed this session.
`Piwork/frontend/src/pages/JobDetail.tsx` untouched. Mockups produced:
`submission-mockup.html`, `submission-mockup-c.html`,
`submission-mockup-c-v2.html`, `submission-mockup-d.html`,
`submission-mockup-e.html`, `submission-mockup-merged.html`,
`inline-evidence-prototype.html`. Not yet copied into
`hivework-redesign/screens/` — pending next session's decision on where
finalized mockups should live in that repo's structure.
