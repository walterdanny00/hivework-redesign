# Session 200 — Hivework

2026-11-21. Code commit `545aeba`. Described in Section 233 of `roadmap.md`.

> **Standing rule (top of `roadmap.md`).** Grep the roadmap before proposing any test; an item logged as "not built" may have shipped in a later section, so grep the feature name across the whole roadmap first; list **every** use of a flag, type or message before changing it; narrowest patch; `tsc` and `git diff --stat` before commit; deliver the **complete** `roadmap.md`, never a section-only file.

## Focus
Hackathon readiness, continuing Section 232's list. The owner asked that every session read the roadmap properly. First item taken: the Help FAQ and how-to text.

## Starting-state check
Reported and matching the brief: HEAD `94b700c`; the polish commit is `0f3d71b`; 81 untracked; no drift between the two docs repos; `roadmap.md` 11696 lines, `admin.ts` 197.

## Decisions
- **Owner:** hackathon deadline is Jan 5, 2027, 23:59 PST (Jan 6, 07:59 UTC). The owner is registered for Pi Next; no app is entered yet (a separate step on the Hackathon page, up to 3 apps).
- **Assistant's proposed order, first item accepted by the owner going ahead:** Help text, placeholder sweep, dispute chat, dispute number and search bar, reviewer delegation last (not decided beyond the first).
- **Owner (end of session):** Pi sign-in (using the app outside Pi Browser and signing in by redirect) is optional, not required; the app already authenticates with Pi authentication inside Pi Browser and the Landing page already lets visitors browse before connecting. The owner also said only Mainnet apps can be submitted; the official rules (section 3 and 6) confirm it.

## Work
- **Roadmap grep first:** Help FAQ placeholder entries (Sections 27, 40); the Home and Landing placeholder items already closed or held on purpose (not re-proposed).
- **Sweep (owner's Termux output):** `Help.tsx` in full (81 lines); `/help` routed at `App.tsx` 35, linked from `Home.tsx` 268 and `Layout.tsx` 85; `withdrawals.ts` 9, 19, 58 to 60, 95 to 102; `JobDetail.tsx` 150 to 262, 316 to 319, 625 to 629, 1353, 1388 to 1396, 1575; `jobs.ts` 940 to 960 and 990 to 1000; `PostJob.tsx` 196, 397, 596.
- **What was wrong in the old Help text:** payment "instantly, straight to your wallet" (it is a balance credit; withdrawing is separate); "Pi stays locked until the client acts" (silence auto-pays the worker after the review window); the rejected-application claim was never on record; request changes, refund request, dispute, review window, fees and file limits were missing.
- **Patch (`patch200a.py`, `Help.tsx` +31 / -23, `545aeba`):** constants block and the submission card replaced; layout and CSS untouched; dry run first; build clean; four How-it-works steps, three task types with the file limits (4 files, 10MB per image, 150MB per video, 200MB total), eight FAQ entries. Withdrawal minimum and fee are not written as numbers (configurable, shown on the withdraw screen).
- **Live check (owner's screenshots, light and dark): pass.** FAQ entries start closed (the owner opened them).
- **Docs:** Section 233 added; update pointer added after Section 232's Status.

## Hackathon requirements (Section 233 has the full list and the sources)
- **Mainnet only:** a Mainnet Pi app via the Developer Web Console, or a SoloHost app; at most 3 apps per team. Hivework runs on Testnet today, so Mainnet readiness is the largest item.
- **Deadline:** Jan 5, 2027 23:59 PT. Register in the Developer Web Console (every team member); a separate Submission Form arrives by email; rules can change on `minepi.com/pi-next`.
- **Every app needs:** English name and description, a logo that follows the Trademark Guidelines, preview images, PiNet integration, a privacy policy, a public demo video of 3 minutes or less. Mainnet Listing Requirements: working polished app, developer KYC, a URL or domain that does not start with "pi", Pi authentication only, Pi-only transactions, no external redirects, minimal data collection.
- **Domain flag:** the frontend is `piwork-frontend.vercel.app`, whose hostname starts with "pi" (not yet checked how the Portal treats it).
- **Developer Terms of Use (last updated Jan 9, 2023) and Trademark Guidelines, read in full (owner's paste; not legal advice):** do not share user IDs, usernames, UIDs, the access token or the secret key except with a service provider that helps build or run the app; do not store or cache other users' Pi login credentials; keep industry-standard security; "Pi" in an app name, domain or handle needs a Trademark Licensing Agreement; the app may say it works on the Pi Network, should carry "___ is a trademark of PI Community Company" when using a Pi trademark, must not alter the Pi logo and must not use Pi's brand color palette. Section 233 has the detail and the assistant's readings.
- **Not read:** the Terms of Service (`socialchain.app/tos`), the Privacy Policy (`socialchain.app/privacy`) and "Launching on Pi Mainnet".

## Findings
- Closed: Help page text.
- Still open: Mainnet readiness and the required hackathon items above; whole-frontend placeholder sweep (commands below, not run); Pi Sign-in outside Pi Browser (optional); entering an app on the Pi Next Hackathon page before Jan 5, 2027; dispute chat; dispute number and search bar; reviewer delegation; resolving a dispute from the admin page never run live; Section 231's list and Section 232's "seen, not changed" items stand unchanged. Held: Survey / Data.
- Loose ends (unchanged, not looked at): "Skills draft test" (`e6b81ddf-2306-4574-86e6-d4dade2bbdb2`) still a draft; Olawalt's application to "Rec test match"; `lizzybeth00` incomplete (0 skills).

## Not verified
Where the "Contact support" link on Help comes from; the Dashboard withdraw screen showing the minimum and fee; that withdrawing starts on the Dashboard (roadmap only); the exact "not selected" notification wording; the effective `MIN_WITHDRAWAL_PI` and `WITHDRAWAL_FEE_PI` in Render (code defaults 1 and 0.01); the Help page on other screen widths.

## Files touched
Code: `frontend/src/pages/Help.tsx`. Docs: `roadmap.md` (Section 233, complete file); `sessions/session-200.md`.

## Next session
Start with `cd ~/Piwork && git pull && git --no-pager log --oneline -4` (HEAD should be the session 200 docs commit or later, then `545aeba`, then `94b700c`; last code commit is `545aeba`) and `git status --short | wc -l` (expected 82, not confirmed), then `cd ~/hivework-redesign && git pull`, then `diff -rq ~/Piwork/hivework-redesign/ ~/hivework-redesign/ --exclude=.git`, then `wc -l ~/Piwork/hivework-redesign/roadmap.md` (11757 for the file delivered with this session; confirm the copy in the repo). Read the standing rule at the top of `roadmap.md`. Then, owner's choice, with the assistant's revised order (not decided): (a) Mainnet readiness: read "Launching on Pi Mainnet" and the Developer Portal checklist, then sweep every testnet-specific use (`Pi.init`, `sandbox`, the Pi API base, app wallet, signing service, environment variables, the Testnet badge and Test-Pi copy) before changing anything; the two open payment items (throw-on-error in the payment path, `requireAuth` ignoring `sessions.expires_at`) matter more on Mainnet; (b) a domain that does not start with "pi", verified in the Portal; (c) listing assets: privacy policy page, Terms page, logo, preview images, English description, developer KYC (first run the checks proposed in Section 233: `cd ~/Piwork`, then `grep -rn -i "access_token\|accessToken" backend/src frontend/src --include=*.ts --include=*.tsx | cut -c1-170`, `grep -rn "\-\-violet\s*:" frontend/src --include=*.tsx --include=*.ts --include=*.css | cut -c1-170`, `ls frontend/public`, `grep -rln -i "logo" frontend/src --include=*.tsx`, and in the Supabase SQL editor `select table_name, column_name from information_schema.columns where table_schema='public' order by table_name, ordinal_position;`; ask the owner to paste the Developer Portal checklist and, if possible, the Terms of Service and Privacy Policy texts); (d) the public demo video of 3 minutes or less; (e) the placeholder sweep: `cd ~/Piwork`, then `grep -rn -i "demo\|lorem\|sample\|fake\|mock\|dummy\|todo\|fixme\|coming soon\|example\.com" frontend/src --include=*.tsx --include=*.ts | wc -l`, then the same with `| cut -c1-170`, skipping the items already on record in Section 233; (f) later, optional: Pi Sign-in outside Pi Browser, dispute chat, dispute number and search bar, reviewer delegation, the debugging list. Remind the owner to enter an app on the Pi Next Hackathon page well before Jan 5, 2027.

Termux notes: untracked, not to be committed: 82 files expected (81 plus `Help.tsx.bak200a`); confirm with `git status --short | wc -l`. Start every command block with `cd ~/Piwork`. Backend check: `npx tsc --noEmit` in `backend`; frontend check: `npm run build` in `frontend`. Patch scripts (`~/patch199a.py` to `~/patch199e.py`, `~/patch200a.py`) and `~/Help.dry.tsx` live outside the repos and are not committed. Use `git --no-pager` for every diff and log.
