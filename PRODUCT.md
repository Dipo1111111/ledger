# Product

## Register

product

## Users

Strategy gamers, friend groups, chess/poker players, finance enthusiasts, streamers/content creators. Age 13+, 2–6 players per match. They play in browser sessions with friends — no accounts, no login. Each session is a fresh lobby.

The primary context is **social and competitive**: players are in a voice call or chat, negotiating trades, reacting to takeovers, and watching each other's boards. The UI needs to communicate state clearly at a glance so players can strategize without digging.

## Product Purpose

Ledger is a competitive online multiplayer business strategy game where players build corporate empires through investing, asset acquisition, financial management, negotiation, calculated risk-taking, and corporate warfare. No dice, no chance cards — every victory is earned through decisions.

Success means players feel like founders, not accountants: excitement building something, pressure from taxes and competition, crisis from hostile takeovers, and victory from outplaying everyone.

## Brand Personality

**Confident, premium, dramatic.** A poker table meets a boardroom — high-stakes finance in a casino. Warm felt green, gold accents, playing cards as assets, chip tokens as currency. The UI should feel rich and tactile, never sterile or "app-like."

Three words: **Prestige. Tension. Craft.**

## Anti-references

- **Monopoly** — dice-driven, luck-based, random chance cards. Ledger is the opposite.
- **SaaS/corporate dashboards** — clean white backgrounds, blue buttons, data-table-heavy. No sterile admin UIs.
- **Mobile freemium games** — bright cartoony colors, simplified mechanics, microtransaction feel. Ledger is premium and uncompromising.
- **The "AI app" monoculture** — cream/sand body backgrounds, gradient text, glassmorphism, tiny uppercase tracked eyebrows, hero-metric templates. None of these belong here.

## Design Principles

1. **Server is truth, client is window.** All game state is authoritative server-side. The client never trusts its own state for game-critical decisions.
2. **Every mechanic creates meaningful decisions.** If a mechanic removes meaningful choices, remove it. If it creates them, keep it.
3. **At-a-glance clarity.** Players need to understand their financial position, turn state, and available actions without hunting through menus. The board is always visible.
4. **Tension is content.** The emotional journey (building → risk → pressure → crisis → recovery → victory) is the product. The UI should amplify these moments, not flatten them.
5. **No accounts, no persistence.** Every match is a fresh lobby with a shareable room code. Zero friction to start playing.

## Accessibility & Inclusion

- WCAG AA contrast minimums on all text
- Respect `prefers-reduced-motion` — collapse animations to instant
- Server-enforced turn timers prevent any player from holding the game hostage
- Text-based UI (no audio-dependent interactions)
- Keyboard-operable dialogs (Escape to close, Tab through fields)
