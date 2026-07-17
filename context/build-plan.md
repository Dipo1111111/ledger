# Ledger — Build Plan

> **25 features across 5 phases.** Each feature is defined, scoped, and sequenced. Follow this order.

---

## Phase 0: Scaffold & Tooling

- [ ] **Feature 00: Monorepo Setup** — npm workspaces, TypeScript config, Vite + Tailwind, package scaffolding
- [ ] **Feature 01: Common Types** — All shared TypeScript types in `packages/common/src/types/`
- [ ] **Feature 02: Constants & Validation** — Asset table, loan terms, validation functions, calculations
- [ ] **Feature 03: Design Tokens** — CSS variables for colors, spacing, typography in globals.css

## Phase 1: Infrastructure

- [ ] **Feature 04: Server Bootstrap** — Express + Socket.io server, room creation/joining
- [ ] **Feature 05: Lobby UI** — Home screen (create/join), lobby with player list, host controls
- [ ] **Feature 06: Game Engine** — State machine, turn cycle, income/tax collection
- [ ] **Feature 07: Game Board UI** — Main game screen, player boards, market panel, turn indicator
- [ ] **Feature 08: Action System** — Action panel, buy/sell assets, validation routing

## Phase 2: Core Mechanics

- [ ] **Feature 09: Loans** — Borrow, repay, default, interest calculation, loan UI
- [ ] **Feature 10: Investments** — Invest in player contracts, repayment tracking, legal claims
- [ ] **Feature 11: Private Trading** — Player-to-player asset sales, trade window
- [ ] **Feature 12: Auctions** — Create auction, place bids, cancel rules, auction UI

## Phase 3: Conflict Systems

- [ ] **Feature 13: Hostile Takeovers** — Declare, defense round, resolution, immunity tracking
- [ ] **Feature 14: Takeover UI** — Declaration flow, defense panel, notifications, elimination screen
- [ ] **Feature 15: Bankruptcy & Elimination** — Financial distress, recovery options, liquidation
- [ ] **Feature 16: Corporate Expansion** — Trigger detection, voting, new asset batch

## Phase 4: Polish & Edge Cases

- [ ] **Feature 17: Chat System** — In-game text chat, takeover freeze on chat
- [ ] **Feature 18: Turn Timer** — Countdown, auto-end-turn, AFK detection, surrender
- [ ] **Feature 19: Disconnect Handling** — Grace timer, AI simple control, forfeit
- [ ] **Feature 20: Financial Health Display** — Dynamic health badges, tooltips
- [ ] **Feature 21: Notifications** — Income collection animation, tax warnings, takeover alerts
- [ ] **Feature 22: Game Log** — Scrollable event log, round-by-round history
- [ ] **Feature 23: End Screen** — Winner announcement, match summary, play again

## Phase 5: Optional (If Time Permits)

- [ ] **Feature 24: Hot-Seat Mode** — Single-screen pass-the-keyboard for local playtesting
- [ ] **Feature 25: Sound Design** — UI sounds for actions, income, takeovers
