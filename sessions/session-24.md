# Session 24 — 2026-08-13

**Focus:** finishing Section 22 item 2 (Home's real content set) — the
trust-badge pill, 3-stat row, and "How it works" flagged as missing at
the end of session 23 — plus a user-driven detour into designing a
standard submission structure.

## Starting-state check

Read `roadmap.md` (all 26 sections) and `session-22.md`/`session-23.md`
before starting, per standing rule. Confirmed both shells were at the
state session 23 left them: Home has categories (teaser + filtering)
but not the trust badge, stat row, or how-it-works content.

## Sweep — real `Home.tsx`

Per the standing "sweep before designing" rule, pulled the real
`Home.tsx` from Termux before building anything. Found all three
missing pieces already exist there verbatim — trust badge pill,
3-stat row (open jobs / platform fee / category count), and a 3-step
"How it works" card — so nothing to invent, only port and re-style.

Also surfaced a real discrepancy: `Home.tsx`'s own category list only
has 3 items (bug-testing, translation, ui-feedback), unlike the 7 used
elsewhere in the redesign. Confirmed via `grep -rln CATEGORY_OPTIONS`
that the 7-category system is a real (if `Home.tsx`-stale) part of the
real app, not something the redesign invented — it lives in
`PostJob.tsx`/`Jobs.tsx`/`Home.tsx` itself. Decided to keep session 23's
top-3 teaser rather than shrink to match Home's stale 3-item list.

## Overkill check (user-requested)

Before building, ran targeted greps to check none of the three pieces
duplicated something that already existed:
- Categories → filtered Browse: not new, real `Home.tsx` already does
  this (`navigate('/jobs?category=slug')`).
- "How it works": no matches anywhere else in the real app.
- Trust badge: appears in both `Home.tsx` and `JobDetail.tsx`, but as
  two different-scoped claims (platform-wide vs. job-specific wallet
  verification) — a family, not a duplicate.

Also found the shell already has design-system-native patterns for all
three on the Landing screen (`.eyebrow`, `.trust-row`, `.flow-steps`) —
built compact `.hw-app`-scoped versions of the same visual language
instead of inventing new styles.

## Built — both shells

- **Home:** trust badge (`.hw-eyebrow`) + 3-stat row (`.hw-trust-row`),
  plus a single link row into a new **Help** screen, rather than
  stacking all three educational sections directly onto a
  returning-user-focused Home.
- **Help screen** (new, drill-in from Home only): "How it works" (3
  steps, Landing's copy), a submission-structure guide, and a 4-item
  FAQ (flagged as invented placeholder content).

## Submission structure — user follow-up, both shells

User asked directly for a standard way to submit valid proof of work.
Swept the real `JobDetail.tsx` submit handler first — confirmed the
actual API only accepts one field (`submission`, plain string), no
structured or attachment endpoint exists.

Replaced the worker Job Detail's single generic textarea with a
templated composer: **What was done** + **Evidence** (required,
placeholder varies by job type) + **Environment** (bug-testing jobs
only) + **Notes** (optional) — concatenated into one `###`-headed
string on submit via `composeSubmission()`, staying inside the real
one-field constraint. Job type classified from the job's `cat` label
via `getSubmissionKind()`.

**Bug found and fixed, JSX only:** the `job` object built for
`JobDetailWorker` was missing a `cat` field, which would have made
`getSubmissionKind()` silently fall through to the generic kind for
every job, including bug-testing ones. Fixed by adding `cat: job.cat`
to the constructed object.

**Attachments block:** kept visually but relabeled "Coming soon" and
disabled, since it was never backed by a real upload endpoint.

## Verification

JSX — brace/paren/bracket balance (net-zero) after every edit. HTML —
`node --check` on the extracted inline script. Both — a standalone
Node logic test of `getSubmissionKind()`/`composeSubmission()`/
`canSubmitWork()` across bug/translation/feedback job kinds, confirming
correct field composition and submit-gate behavior in each case. No
`jsdom`/headless-browser run this session (not installed, no network
access) — logic-level testing substituted, a first for this project.

## Roadmap changes

Section 27 added.

## Files touched

`HiveworkApp.jsx`, `hivework-app-v4-3.html`, `roadmap.md`, this session
brief (`session-24.md`).

## Next session

- Section 22 item 2 (Home's real content set) is now fully done.
- Section 22 item 3 — support access point placement outside the
  profile menu — is the only remaining open item from that original
  scope. Not yet started.
