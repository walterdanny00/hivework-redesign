# Hivework — Design Tokens (App v3)

Reference for the current app build (`hivework-app-v3.html`). Same core palette as the original landing-page tokens doc, plus the component patterns introduced since.

## Color

| Token | Hex | Use |
|---|---|---|
| `cream` (bg) | `#F7F5F1` | Page background |
| `ink` (text) | `#1B1A1F` | Primary text, dark surfaces (balance card, dock/segnav active states) |
| `ink-soft` | `#6B6874` | Secondary text, captions |
| `violet` | `#6C5CE7` | Primary buttons, links, active accents |
| `violet-deep` | `#5643D9` | Primary hover/pressed state, gradient end |
| `mint` | `#2EC4B6` | Success / verified / completed states |
| `coral` | `#FF6B5D` | Bug-testing category accent |
| `butter` | `#FFC857` | Pending / gold badge / escrow-locked accent |
| `line` | `#E7E3DA` | Borders, dividers, dashed separators |
| `card` | `#FFFFFF` | Card surfaces |

Tint pairs used for soft backgrounds (category tiles, status pills, chips):
- coral: bg `#FFE8E5`, text `#C24A3E`
- butter: bg `#FFF3DC`, text `#B8860B`
- mint: bg `#E4F8F6`, text `#1A9E92`
- violet: bg `#EFEAFB`, text `#5643D9`

## Type

| Role | Font | Weights |
|---|---|---|
| Display / headings | **Sora** | 600, 700, 800 |
| Body / UI | **Inter** | 400, 500, 600 |
| Pi amounts, wallet strings, timestamps in data rows | **JetBrains Mono** | 400, 500 |

```
https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap
```

## Layout

- Card radius: `16-20px`. Pills/buttons/nav: `100px` (full round).
- Card border: `1px solid var(--line)`, shadow on card elevation, not border alone.
- Standard card shadow: `0 12-14px 26-30px -18px rgba(27,26,31,.14-.2)`
- Elevated/hero shadow (balance card, cover, sticky CTA): `0 20-24px 40-50px -14-20px`
- Content max-width: `560px` (was `1180px` on the marketing page — app is single-column mobile-first)

## Navigation pattern (current)

Top **segmented pill nav**, sticky under the header — not a bottom tab bar.
- 4 primary destinations only: Home, Browse, Post, Earnings
- Profile is reached via the avatar menu ("View profile"), not the segmented nav
- Inactive: `background:#EFECE5; color:ink-soft`. Active segment: `background:ink; color:white`
- Sub-screens (Job Detail, Applicants) hide the segnav and use a text "← Back" control instead, since they aren't top-level destinations

## Signature components

**Job ticket** (Home) — the user's active job rendered as a boarding-pass-style card: title/amount on top, a dashed divider, then a status stub below. Ties visually to escrow being a sequential, stamped process.

**Ledger** (Earnings → My Work) — withdrawal history as a connected vertical timeline (dot + line), not repeated boxed rows.

**My Work / My Jobs toggle** (Earnings) — segmented control switching between your own earnings/withdrawals and jobs you've posted as an employer, each posted job showing status + "Review applicants →".

**Step wizard** (Post a job) — labeled segments with a connecting line (Basics → Details → Review), not plain dots.

**Job detail** — full description, requirements as a checklist, device/language as outline chips, CTA text changes contextually ("Apply now" vs "Submit report" for your own active job).

Full working reference: `hivework-app-v3.html`
