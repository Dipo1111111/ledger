# Ledger — Progress Tracker

> Updated after every feature completion. Agent checks this at session start to know where to resume.

## Phase 0: Scaffold & Tooling

- [x] Feature 00: Monorepo Setup
- [x] Feature 01: Common Types
- [x] Feature 02: Constants & Validation
- [x] Feature 03: Design Tokens

## Phase 1: Infrastructure

- [x] Feature 04: Server Bootstrap
- [x] Feature 05: Lobby UI
- [x] Feature 06: Game Engine
- [x] Feature 07: Game Board UI
- [x] Feature 08: Action System
 
## Phase 2: Core Mechanics

- [x] Feature 09: Loans
- [x] Feature 10: Investments
- [x] Feature 11: Private Trading
- [x] Feature 12: Auctions

## Phase 3: Conflict Systems

- [x] Feature 13: Hostile Takeovers
- [x] Feature 14: Takeover UI
- [x] Feature 15: Bankruptcy & Elimination
- [x] Feature 16: Corporate Expansion

## Phase 4: Polish & Edge Cases

- [x] Feature 17: Chat System
- [x] Feature 18: Turn Timer
- [x] Feature 19: Disconnect Handling
- [x] Feature 20: Financial Health Display
- [x] Feature 21: Notifications
- [x] Feature 22: Game Log
- [x] Feature 23: End Screen

## Phase 4.5: UI Redesign

- [x] Feature R1: Base Font & Typography Update (Figtree + DM Serif Display, 18px base)
- [x] Feature R2: Color Palette Enhancement (richer felt, vibrant gold, higher contrast)
- [x] Feature R3: Component Scaling (cards, chips, buttons, panels, player rows)
- [x] Feature R4: Toast Z-Index & Modal Fixes
- [x] Feature R5: Animation System (15+ keyframes, stagger reveals, hover effects)
- [x] Feature R6: Animation Wiring (GameScreen entrances, turn transitions, score pops)
- [x] Feature R7: Dialog Sizing & Consistency Pass
- [x] Feature R8: Color System Fix — shifted all felt hues from blue (260) to teal (200-210)
- [x] Feature R9: Sidebar Restructure — collapsible nav with logo header, nav items, collapse toggle
- [x] Feature R10: Lobby Overhaul — complete from-scratch redesign: single column, no glass, no sidebar, no tabs

## Phase 5: Optional

- [ ] Feature 24: Hot-Seat Mode
- [ ] Feature 25: Sound Design

## Phase 6: Pre-Launch (TODO)

- [x] Feature 26: Test Suite — unit tests for validation, calculations, game engine; integration tests for socket events
- [x] Feature 27: Deployment — Dockerfile, CI/CD pipeline, production hosting config
- [x] Feature 28: Authentication — session tokens, anti-impersonation, rate limiting
- [x] Feature 29: Edge Case Hardening — disconnect under load, reconnect races, concurrent room creation
- [x] Feature 30: Mobile Responsive Pass — touch targets, viewport meta, responsive breakpoints
- [ ] Feature 31: Matchmaking — public lobby browser, player discovery, room listing

---

## Open Questions / Known Issues

- Server restarts wipe all game state (by design — in-memory only)
- Hot-seat mode (Feature 24) still needed for local playtesting
- Matchmaking (Feature 31) deferred to post-v1