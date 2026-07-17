# Ledger — Visual Identity & Component Rules

> Design language extracted from `design-exploration/design-02-card-room.html`. All components must use Tailwind utility classes referencing the tokens in `ui-tokens.md`. **No hardcoded hex values.**

---

## Visual Identity

### The Premise
The UI is a **poker table meets boardroom** — felt green surface, gold accents, playing cards as assets, chip tokens as currency. Warm, premium, slightly dramatic. Like a high-stakes finance meeting in a casino.

### Design Pillars
1. **Dark + rich** — deep felt green background, gold highlights, cream card surfaces
2. **Textured** — felt surface with subtle noise/gradient, never flat
3. **Premium** — gold accents, subtle glow effects, clean typography
4. **Legible** — high contrast text on dark backgrounds, generous spacing
5. **Animated** — cards deal in, chips stack, elements slide up on appearance

### The Felt Background
Always `bg-felt` with the `felt-bg` class for the subtle radial gradient + noise texture overlay. This is the app's primary background.

---

## Layout

### App Shell
```
[Sidebar 48px] [Status Bar (sticky top)]
                [Main Content]
                [Overlay Panels (slide from left)]
                [Full-screen Overlays]
```

### Sidebar
- Fixed left, 48px wide, full height
- `bg-felt-dark` with backdrop blur
- Contains logo "L", settings, rules, lobby buttons
- Icons only + tooltip on hover

### Status Bar
- Sticky top, `bg-felt-dark/75` with backdrop blur
- Turn indicator (orb), round number, era name
- Timer countdown, End Turn button
- Player's total LC displayed ("Stack")

### Main Grid
- Two columns: `1fr 340px` for content + sidebar panel
- Left column: Player profile, asset hand, market
- Right column: Player standings, game log, action panel

### Overlay Panels
- Fixed position, slide from left, 340px wide
- `bg-felt-dark/95` with backdrop blur
- Used for settings, rules, player details
- Animation: slide-in-right

### Full-Screen Overlays
- Fixed fullscreen, centered content
- Used for lobby, post-game results
- Backdrop blur + noise overlay
- Lobby card: max 480px wide, centered, glass panel

---

## Component Patterns

### Playing Cards (Asset Cards)
- Aspect ratio: **5:7** (like playing cards)
- Background: `bg-card` with linear gradient (`from-amber-50 to-amber-100` equivalent)
- Border: thin subtle border
- Shadow: `shadow-card` (default), `shadow-card-hover` (hover lift -6px)
- Hover: lifts up (-6px), slight rotation (-0.5deg), gold border highlight
- Corner rank markers (top-left, bottom-right — bottom-right rotated 180°)
- Center suit icon (SVG for the card)
- Stats bar at bottom: income (+) and tax (-) values
- Owned badge: colored dot with count (top-right, matches suit color)
- Transition: `all 0.2s cubic-bezier(0.16, 1, 0.3, 1)`

### Market Cards
- Same 5:7 ratio but slightly different gradient (darker)
- No owned badge, no stats bar
- Hover: lifts -4px, gold border highlight
- Shows purchase price

### Empty Card Slots
- Dashed border, 5:7 ratio
- Shows suit icon + "Ace Slot" / "Limit 1" text
- Muted text color

### Chip Tokens (LC Display)
- **60×60px** circular token
- Double rim style: outer border + inner border via `inset box-shadow`
- Contains: icon (✦) + value numeral
- Variants: `chip-gold` (gold body), `chip-red` (red body), `chip-blue` (blue body), `chip-green` (green body)
- Used for: Balance, Income, Tax, Net Worth stats

### Health Badges
- Pill shape (`rounded-full`), small
- Colored dot + status text
- Variants: `healthy` (green), `stable` (amber), `stressed` (orange), `critical` (red, with pulsing dot)
- Capitalized, letter-spaced text
- Thin colored border + tinted background

### Buttons

| Variant | Class | Usage |
|---------|-------|-------|
| Gold primary | `btn-gold` | Main actions (buy, end turn, start game) |
| Ghost | `btn-ghost` | Secondary actions (cancel, settings) |
| Danger | `btn-danger` | Destructive actions (surrender, sell) |

- All buttons: height 36-40px, `rounded-[9px]`, Inter font
- Gold hover: lifts -2px + gold glow shadow
- Disabled: 35% opacity, `cursor-not-allowed`, no transform
- Gold: uses `bg-gold-dark` default → `bg-gold` hover

### Panels / Cards
- `bg-felt-dark/55` with `backdrop-blur`
- `rounded-[14px]`, thin border with gold variant
- Gold variant: gold border, subtle gold glow shadow
- Glass variant: lighter background, more blur
- Chronicle variant: gold border, glass blend
- Optional decorative gold corner accents (4 corners)

### Player Rows
- Flex row with avatar, name, health badge, LC
- Active turn: gold tinted background + border
- Eliminated: 30% opacity, grayscale
- Hover: subtle white overlay

### Player Avatars
- 40×40px, `rounded-[10px]`
- Colored background based on player color
- Shows initial letter, white, bold

### Tags
- Inline pill, small
- Used for "Host" badge, "Takeover" indicators, etc.

### Turn Indicator
- Gold orb, 10px diameter
- Pulses during active turn (`animate-pulse-orb`)
- Glow shadow

### Ornamental Divider
- Flex row with horizontal rule + text
- Gradient lines on either side of section title
- Gold muted color

### Progress Bars (Tracks)
- 5px height, dark background
- Fill animates width on change

### Chat Input
- `bg-black/20`, thin border
- `rounded-[9px]`, Inter font
- Gold border on focus
- Muted placeholder text

### Distress Banner
- Burgundy tinted background
- Red border, used for financial distress warnings

### Log Entries
- Horizontal rule separator between entries
- Colored dot + message text

---

## Animations

| Class | Trigger | Timing | Purpose |
|-------|---------|--------|---------|
| `animate-deal-in` | Cards appearing | 0.5s, bounce easing | Cards dealt to player |
| `animate-slide-up` | Sections appearing | 0.4s | Content sections |
| `animate-slide-right` | Panel overlay | 0.4s | Side panel slides in |
| `animate-fade-in` | Subtle appearance | 0.3s | Panels, overlays |
| `animate-chip-stack` | Chip numbers | 0.4s, bounce | LC values appear |
| `animate-pulse-orb` | Turn indicator | 2s, infinite | Active turn pulse |
| `animate-heartbeat` | Critical state | 0.6s | Danger heartbeat |

Stagger classes (`stagger-1` through `stagger-8`) add 40ms delay increments for sequential element reveals.

Respect `prefers-reduced-motion` — collapse all animations to instant.

---

## Responsive Behavior

- **Desktop-first** — primary layout targets 1280px+ wide
- Breakpoint `max-width: 1024px` — main grid becomes single column
- Breakpoint `max-width: 640px` — 4-column card grid becomes 2-columns, 2-column becomes 1-column
- Sidebar stays fixed left at all sizes
- Overlay panels may go full-width on mobile

---

## Writing Rules

- All monetary values display with "LC" suffix: "240 LC", never "240"
- Asset names are capitalized: Jack, Queen, King, Ace
- Round numbers use Roman numerals: "Round IV"
- Eras: "Foundation Era", "Growth Era", "Expansion Era", "Dominance Era", "Legacy Era"
- Player health: Healthy, Stable, Stressed, Critical
- "You" replaces player name for local player's display
