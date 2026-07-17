# Memory — UI Overhaul: Color System + Lobby + Sidebar

Last updated: 2026-07-17

## What was built

**Color System Fix (Feature R8)**
- `packages/client/src/globals.css` — Shifted ALL felt/navy/cream/text/card surface hues from 260 (blue) to 200-210 (teal). This was the root cause of the "stupid blue" the user hated. Every surface, border, shadow, and gradient that used hue 260 is now hue 200. Only `--color-blue` raw accent retains hue 240+.
- Also fixed: chip-blue (265→240), suit tints (270→240), shimmer gradients, empty-slot borders, felt-bg radial gradients.

**Sidebar Restructure (Feature R9)**
- `packages/client/src/components/sidebar/GameSidebar.tsx` — Complete rewrite. Replaced thin hover-expand rail (w-14→w-44 on hover) with structured collapsible sidebar:
  - Logo header section with border-bottom
  - "Navigation" section label
  - Nav items with icon+label (or icon-only when collapsed)
  - Danger-styled "Leave" item separated by divider
  - Collapse toggle button at bottom (chevron icon, rotates)
  - Defaults to collapsed (w-14, matching ml-14 on content)
  - No more hover-expand — user controls collapse explicitly

**Lobby Overhaul (Feature R10)**
- `packages/client/src/screens/LobbyScreen.tsx` — Full rewrite:
  - Pre-room state: centered form with logo icon, serif heading, pill tab switcher, felt-light/60 surface card (NOT blue-tinted)
  - In-room state: proper two-column layout — player list + actions (left), settings sidebar (right, sticky)
  - Header bar with room code pill (copy button), player count subtitle
  - Actions moved inline below player list (not in a separate card)
  - All surfaces use `bg-felt-light/60 border-cream/[0.08]` — consistent teal-tinted, not blue
  - Error messages use `bg-danger/8` (subtle) not `bg-danger/10`

**Form Input Fix**
- `packages/client/src/components/lobby/CreateRoom.tsx` — Input: `bg-felt-dark/60 border-cream/15 text-text` (was `bg-black/20 border-cream/10 text-cream`)
- `packages/client/src/components/lobby/JoinRoom.tsx` — Same treatment for both name and room code inputs

**PlayerList Fix**
- `packages/client/src/components/lobby/PlayerList.tsx` — Host row: `border-gold/20 bg-gold/[0.04]` (was glow shadow). Normal row: `border-cream/[0.06] bg-felt-light/30`

**Card Component Update**
- `packages/client/src/components/common/Card.tsx` — Default variant: `bg-felt-light/80 border-cream/[0.08] shadow-card` (was `bg-felt-light/60 border-cream/10`)

**Progress Tracker Update**
- `context/progress-tracker.md` — Added R8/R9/R10 as complete. Added Phase 6 (Pre-Launch TODO) with Features 26-31: Test Suite, Deployment, Authentication, Edge Case Hardening, Mobile Responsive Pass, Matchmaking.

**UI Registry Update**
- `context/ui-registry.md` — Added GameSidebar entry, updated Card description, updated LobbyScreen description.

## Decisions made

1. **Hue 200 (teal) is the ONLY surface color** — no more blue (260). The entire UI now uses a single hue family for all felt/navy/cream surfaces. The only exceptions are card suit colors (spade=240, heart=350, club=160, diamond=30) and the raw `--color-blue` accent.
2. **Sidebar is click-to-collapse, not hover-expand** — hover-expand was disorienting and caused layout shifts. User controls it explicitly via toggle button.
3. **Sidebar defaults collapsed (w-14)** — matches the `ml-14` margin on content areas. Expanding to w-48 requires content areas to also use ml-48, which would need shared state. For now, collapsed is the default.
4. **Lobby uses two-column layout, not centered cards** — in-room state: players+actions left, settings right. Pre-room state remains centered (it's a simple form).
5. **No separate Card component for lobby surfaces** — lobby uses inline divs with consistent `bg-felt-light/60 border-cream/[0.08]` styling instead of the Card component. This avoids nested cards (impeccable anti-pattern).
6. **Product register applies** — this is app UI, not marketing. Restrained color strategy: tinted neutrals + one accent (teal/gold) ≤10% surface coverage.

## Problems solved

- **Blue tint on all surfaces**: Root cause was hue 260 in every felt/navy/cream token. Fixed by shifting all to hue 200-210.
- **Lobby cards looked "wrong"**: Cards had `bg-felt-light/60` against `bg-felt-dark` with poor contrast. Now uses `bg-felt-light/80` with `shadow-card` for elevation.
- **Sidebar felt disconnected**: Was a thin rail that expanded on hover. Now a proper collapsible nav with clear sections.
- **Form inputs had low contrast**: `bg-black/20` on dark bg was nearly invisible. Now `bg-felt-dark/60` with `border-cream/15`.

## Current state

- All 10 redesign features (R1-R10) complete
- All 25 features complete (Phases 0-5)
- Phase 6 (Pre-Launch) items defined but not started
- Build passes clean (TypeScript + Vite)
- Color system is now consistent: teal-only surfaces, gold accent, no stray blue

## Next session starts with

Options:
1. **Visual verification** — launch the app and verify the color overhaul renders correctly (the felt should now be teal-charcoal, not blue-slate)
2. **GameScreen layout fix** — the void-at-top issue (sticky header + sidebar disconnect) was partially addressed but may need refinement
3. **Phase 6 work** — tests, deployment, or mobile responsive pass
4. **Phase 5 features** — Hot-Seat Mode or Sound Design

## Open questions

- The sidebar collapse state is local to each sidebar instance. If we want shared state (sidebar collapsed in lobby = collapsed in game), we'd need to lift state to App or a store. Currently each screen has its own sidebar instance.
- GameScreen still has `ml-14` hardcoded. If sidebar is ever expanded (w-48), content won't adapt without shared state.
- User mentioned wanting to update `context/ui-tokens.md` to match the new teal-only color system (it still references old blue hues).
