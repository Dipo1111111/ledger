# Ledger — Design Tokens

> Design tokens extracted from `design-exploration/design-02-card-room.html`. Wired into Tailwind v4 via `@theme` in `packages/client/src/globals.css`.

---

## Color Palette (OKLCH)

All colors use **OKLCH** color space for perceptual uniformity. No hex values, no HSL.

### Surface — The Felt Table

| Token | Tailwind Class | Value |
|-------|---------------|-------|
| `--felt` | `bg-felt` | `oklch(0.18 0.035 160)` |
| `--felt-dark` | `bg-felt-dark` | `oklch(0.13 0.03 160)` |
| `--felt-light` | `bg-felt-light` | `oklch(0.28 0.04 150)` |

### Gold Accent

| Token | Tailwind Class | Value |
|-------|---------------|-------|
| `--gold` | `text-gold` / `bg-gold` / `border-gold` | `oklch(0.887 0.182 95.3)` |
| `--gold-light` | `text-gold-light` / `bg-gold-light` | `oklch(0.92 0.14 95.3)` |
| `--gold-dark` | `text-gold-dark` / `bg-gold-dark` | `oklch(0.72 0.20 88)` |
| `--gold-muted` | `text-gold-muted` / `bg-gold-muted` | `oklch(0.80 0.10 95.3 / 0.6)` |

### Card Suit Colors

| Token | Tailwind Class | Value |
|-------|---------------|-------|
| `--spade` | `text-spade` / `bg-spade` | `oklch(0.50 0.15 250)` — Blue |
| `--heart` | `text-heart` / `bg-heart` | `oklch(0.55 0.18 350)` — Pink |
| `--club` | `text-club` / `bg-club` | `oklch(0.72 0.20 88)` — Gold |
| `--diamond` | `text-diamond` / `bg-diamond` | `oklch(0.55 0.18 25)` — Red |

### Text Hierarchy

| Token | Tailwind Class | Value |
|-------|---------------|-------|
| `--text` | `text-text` | `oklch(0.92 0.01 85)` |
| `--text-secondary` | `text-text-secondary` | `oklch(0.72 0.02 80)` |
| `--text-muted` | `text-text-muted` | `oklch(0.55 0.03 80)` |

### Semantic Status Colors

| Token | Tailwind Class | Value | Usage |
|-------|---------------|-------|-------|
| `--success` | `text-success` / `bg-success` | `oklch(0.55 0.15 150)` | Healthy, paid, positive |
| `--warning` | `text-warning` / `bg-warning` | `oklch(0.70 0.18 75)` | Stable, caution |
| `--danger` | `text-danger` / `bg-danger` | `oklch(0.55 0.20 30)` | Critical, overdue, eliminated |
| `--danger-bg` | `bg-danger-bg` | `oklch(0.30 0.08 25 / 0.25)` | Danger background overlay |

### Raw Accents

| Token | Tailwind Class | Value |
|-------|---------------|-------|
| `--red` | `text-red` / `bg-red` | `oklch(0.55 0.18 25)` |
| `--green` | `text-green` / `bg-green` | `oklch(0.55 0.15 150)` |
| `--blue` | `text-blue` / `bg-blue` | `oklch(0.50 0.15 250)` |
| `--pink` | `text-pink` / `bg-pink` | `oklch(0.55 0.18 350)` |
| `--amber` | `text-amber` / `bg-amber` | `oklch(0.70 0.18 75)` |
| `--orange` | `text-orange` / `bg-orange` | `oklch(0.62 0.16 45)` |

### Card Surface

| Token | Tailwind Class | Value |
|-------|---------------|-------|
| `--card` | `bg-card` | `oklch(0.92 0.012 85)` |
| `--card-text` | `text-card-text` | `oklch(0.25 0.02 85)` |
| `--card-shadow` | — | `oklch(0 0 0 / 0.35)` |

### Cream / Warm Neutrals

| Token | Tailwind Class | Value |
|-------|---------------|-------|
| `--cream` | `bg-cream` | `oklch(0.93 0.01 80)` |
| `--cream-muted` | `bg-cream-muted` | `oklch(0.75 0.02 70)` |

### Burgundy

| Token | Tailwind Class | Value |
|-------|---------------|-------|
| `--burgundy` | `bg-burgundy` | `oklch(0.28 0.10 25)` |
| `--burgundy-light` | `bg-burgundy-light` | `oklch(0.45 0.12 28)` |

### White

| Token | Tailwind Class | Value |
|-------|---------------|-------|
| `--white` | `text-white` | `oklch(0.96 0.005 85)` |

---

## Typography

| Property | Value |
|----------|-------|
| **Body font** | `Inter`, system-ui, -apple-system, sans-serif |
| **Heading font** | `Playfair Display`, Georgia, serif |
| **Tailwind font classes** | `font-sans` → Inter, `font-serif` → Playfair Display |

### Font Weights

| Weight | Usage |
|--------|-------|
| 400 | Body text |
| 500 | Buttons, small labels |
| 600 | Strong labels, badges, card stats |
| 700 | Headings, player names |
| 800 | Room codes, chip values, scores |
| 900 | Display headings (rare) |

### Type Scale (rem)

| Size | rem | Tailwind | Common Usage |
|------|-----|----------|-------------|
| 10 | 0.5rem | `text-[0.5rem]` | Caps labels, stat labels |
| 11 | 0.55rem | `text-[0.55rem]` | Tags, tiny meta |
| 12 | 0.6rem | `text-xs` | Footers, timestamps |
| 13 | 0.65rem | `text-[0.65rem]` | Card stats, sub-meta |
| 14 | 0.7rem | `text-sm` | Rule text, secondary labels |
| 15 | 0.75rem | `text-[0.75rem]` | Timer numbers |
| 16 | 0.8rem | `text-base` | Buttons, body text |
| 18 | 0.9rem | `text-lg` | Avatar initials |
| 20 | 1rem | `text-xl` | Panel headings |
| 24 | 1.2rem | `text-2xl` | Player names, section headings |
| 28 | 1.4rem | `text-3xl` | Room codes, turn indicators |
| 32 | 1.6rem | `text-4xl` | "Ledger" title |
| 36 | 1.8rem | `text-5xl` | Display headings |
| 48 | 2rem | `text-6xl` | Welcome screen title |

---

## Spacing

Tailwind's standard spacing scale works well. These are the most-used values in practice:

| px | Tailwind | Common Usage |
|----|----------|-------------|
| 2 | `gap-0.5`, `p-0.5` | Dot spacing |
| 4 | `gap-1`, `p-1` | Tight icon gaps |
| 6 | `gap-1.5`, `p-1.5` | Tag padding |
| 8 | `gap-2`, `p-2` | Card content inset |
| 10 | `gap-2.5`, `p-2.5` | Player row padding |
| 12 | `gap-3`, `p-3` | General item spacing |
| 14 | `gap-3.5`, `p-3.5` | Card grid gaps |
| 16 | `gap-4`, `p-4` | Section spacing |
| 18 | `gap-4.5`, `p-4.5` | Panel header padding |
| 20 | `gap-5`, `p-5` | Panel body padding |
| 24 | `gap-6`, `p-6` | Layout gutters |
| 28 | `gap-7`, `p-7` | Large gaps |
| 32 | `gap-8`, `p-8` | Section separation |
| 40 | `gap-10`, `p-10` | Lobby card padding |
| 48 | `gap-12`, `p-12` | Layout margins |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | 4px | Tiny corners (ornament edges) |
| `--radius-sm` | 6px | Small elements (tags) |
| `--radius-md` | 8px | Inputs, player rows |
| `--radius-btn` | 9px | All buttons |
| `--radius-card` | 10px | Playing cards, market cards, panels |
| `--radius-panel` | 14px | Panel containers |
| `--radius-lg` | 16px | Lobby card, full overlays |
| `--radius-pill` | 99px | Health badges, turn orbs |

Tailwind classes: `rounded-xs`, `rounded-sm`, `rounded-md`, `rounded-[9px]`, `rounded-[10px]`, `rounded-[14px]`, `rounded-lg`, `rounded-full`

---

## Shadows

| Token | Tailwind | Value | Usage |
|-------|----------|-------|-------|
| `--shadow-card` | `shadow-card` | `0 4px 16px var(--color-card-shadow)` | Default card elevation |
| `--shadow-card-hover` | `shadow-card-hover` | `0 12px 40px var(--color-card-shadow)` | Card hover lift |
| `--shadow-btn-gold` | `shadow-btn-gold` | `0 8px 24px oklch(0.72 0.15 85 / 0.25)` | Gold button hover |
| `--shadow-chip` | `shadow-chip` | `0 2px 6px oklch(0 0 0 / 0.3)` | Chip tokens |
| `--shadow-panel-glow` | `shadow-panel-glow` | `0 0 20px oklch(0.72 0.15 85 / 0.04)` | Gold panel glow |
| `--shadow-lobby-card` | `shadow-lobby-card` | `0 0 60px oklch(0.72 0.15 85 / 0.06)` | Lobby overlay card |

Also use standard Tailwind `shadow-sm`, `shadow-md`, `shadow-lg` for general UI.

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-sticky` | 100 | Sticky header/status bar |
| `--z-dropdown` | 200 | Dropdown menus |
| `--z-modal-backdrop` | 300 | Modal backdrop overlay |
| `--z-modal` | 400 | Modal dialogs |
| `--z-toast` | 500 | Toast notifications |
| `--z-tooltip` | 600 | Tooltips |

---

## Icons

Use Unicode / text symbols for icons. No icon library for V1.

| Icon | Character | Usage |
|------|-----------|-------|
| Income | `▲` or `↑` | Income stat |
| Tax | `▼` or `↓` | Tax stat |
| Chip | `✦` | Chip icon |
| Asset | `◈` | Net worth icon |
| Heart | `♥` | Suit |
| Spade | `♠` | Suit |
| Club | `♣` | Suit |
| Diamond | `♦` | Suit |
| Trophy | `🏆` | Winner screen |
| Settings | `⚙` | Settings button |
| Lobby | `⌂` | Lobby/home button |
| Fullscreen | `⛶` | Fullscreen toggle |
