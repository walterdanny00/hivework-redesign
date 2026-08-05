# Hivework — Design Tokens

Reference for implementing the new visual direction in the real frontend.

## Color

| Token | Hex | Use |
|---|---|---|
| `cream` (bg) | `#F7F5F1` | Page background |
| `ink` (text) | `#1B1A1F` | Primary text, dark sections |
| `ink-soft` | `#6B6874` | Secondary text, captions |
| `violet` (primary) | `#6C5CE7` | Primary buttons, links, accents |
| `violet-deep` | `#5643D9` | Primary hover state |
| `mint` | `#2EC4B6` | Success / paid / released states |
| `coral` | `#FF6B5D` | Category accent (bug testing) |
| `butter` | `#FFC857` | Category accent (escrow/pending) |
| `line` | `#E7E3DA` | Borders, dividers |
| `card` | `#FFFFFF` | Card surfaces |

## Type

| Role | Font | Weights used |
|---|---|---|
| Display / headings | **Sora** | 600, 700, 800 |
| Body / UI | **Inter** | 400, 500, 600 |
| Data / amounts / wallet strings | **JetBrains Mono** | 400, 500 |

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap
```

Use mono specifically for Pi amounts (`10π`) and wallet addresses (`GB33VY…OFXX`) — it's a functional choice, not decoration, since those are financial/data values.

## Layout

- Card radius: `20px` (large cards), `16-18px` (small elements), `100px` (pills/buttons)
- Card border: `1px solid var(--line)`, shadow only on hover or elevated elements
- Elevated shadow: `0 20px 45px -18px rgba(27,26,31,0.18)`
- Max content width: `1180px`
- Section vertical padding: `~64-72px` desktop, collapse to `~40px` mobile

## Tailwind config equivalent

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        cream: '#F7F5F1',
        ink: { DEFAULT: '#1B1A1F', soft: '#6B6874' },
        violet: { DEFAULT: '#6C5CE7', deep: '#5643D9' },
        mint: '#2EC4B6',
        coral: '#FF6B5D',
        butter: '#FFC857',
        line: '#E7E3DA',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '20px',
      },
    },
  },
}
```

## CSS variables equivalent

```css
:root {
  --cream: #F7F5F1;
  --ink: #1B1A1F;
  --ink-soft: #6B6874;
  --violet: #6C5CE7;
  --violet-deep: #5643D9;
  --mint: #2EC4B6;
  --coral: #FF6B5D;
  --butter: #FFC857;
  --line: #E7E3DA;
  --card: #FFFFFF;
  --radius: 20px;
}
```

## Signature element

**Escrow ticker** — a stack of floating cards in the hero that auto-cycle through the real job lifecycle: *Job posted → Pi locked in escrow → Worker approved → Pi released to wallet*. Each card shows a status icon, short label, and the Pi amount in mono type. This replaces static stat blocks with a "live" feeling that's actually true to what the product does — reuse this pattern anywhere you want to show trust/activity (e.g. dashboard, landing page).

Full working reference: `hivework-concept.html`
