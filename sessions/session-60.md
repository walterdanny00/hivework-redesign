# Session 60 — 2026-09-06

## Topic: KYC pill styling matched to shell; profile-complete skip check added

Session 59's live test surfaced two gaps in `Onboarding.tsx`, both
pointed out via screenshots comparing the shell to the real app.

## Gap 1: KYC pill styling

The "KYC required for paid activity" section rendered as a plain,
improvised pill — session 56's original port never actually checked the
shell's CSS for this element, just approximated it. The shell's real
version has a shield icon, a gold/butter color scheme, and a rotating
chevron indicating open/closed state.

**Fixed:** matched the shell's shield icon, gold/butter colors, and
chevron rotation. The pill's **text** was deliberately left as the
rewritten version from session 57 (not reverted to the shell's original
"Browsing is open to everyone" copy) — that line became false once
Browse was gated in session 57, and reverting the copy while fixing only
the visuals would reintroduce an inaccurate claim. Flagged and confirmed
this was the right call before proceeding (user's note was about the
"required for paid activity" section specifically, not the browsing
line).

## Gap 2: Profile-complete skip check

Every user connecting saw the profile-completion form, even ones with an
already-complete saved profile — the shell has a "returning user, skip
setup" demo path with no real equivalent in `Onboarding.tsx`.

Reused the existing check rather than inventing anything new:
`Dashboard.tsx` already calls `/api/users/me/profile` and reads
`profile_complete`. Added the same fetch/check to `Onboarding.tsx`'s
connect flow — skips straight to `returnTo` if the profile already reads
complete.

Needed an import fix mid-build: `useEffect` wasn't currently imported
(dropped back in session 56 when the old redirect effect was removed).

## Applied

```
cd ~/Piwork
cp ~/storage/downloads/Onboarding.tsx frontend/src/pages/Onboarding.tsx
npx tsc --noEmit -p frontend
# clean
```

Flagged one UX detail before testing, not fixed pre-emptively: since a
first-time and returning-user connect look identical until the
`/api/users/me/profile` fetch resolves, there's a brief blank moment
right after connecting (`return null` while `profileChecked` is false, to
avoid flashing the form before redirecting a returning user).

## Files touched

`frontend/src/pages/Onboarding.tsx` — real app code, Piwork repo only.

## Pushed

```
git add frontend/src/pages/Onboarding.tsx
git commit -m "Fix KYC pill styling to match shell (shield icon, chevron, colors); skip profile form for users with an existing complete profile"
git push
```
**Confirmed clean push by user.**

## Live test — surfaced a further bug

Tested with an account confirmed to genuinely have a complete profile
(skills present, saved via the main `Profile.tsx` page rather than the
onboarding form) — **still showed the profile form**, i.e. the skip
check appeared not to work.

Ruled out a separate-save-path bug by checking both real files:
```
grep -n "profile_complete" backend/src/routes/*.ts
grep -n -B3 -A15 "/api/users/me/profile" frontend/src/pages/Profile.tsx
```
Confirmed `profile_complete` is computed server-side as
`cleanedSkills.length > 0` regardless of which page triggered the save —
not a wrong-endpoint bug. Pointed to a timing race instead — root-caused
and fixed in session 61.

## Roadmap updated

Section 71 added.

## Next session

Diagnose and fix the profile-check race — see session-61.md.
