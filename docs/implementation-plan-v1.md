# LEDGER — Implementation Plan V1

> **Status:** Ready to build
> **Date:** 2026-07-05
> **Goal:** A fully playable web-based multiplayer prototype of Ledger (lobby-based, desktop-first, server-authoritative)

## What We Are Building

A competitive multiplayer business strategy web game. Players create/join lobbies via room codes, build corporate empires by buying income-generating assets (Jack, Queen, King, Ace), take loans, invest in each other, negotiate trades, auction assets, and launch Hostile Takeovers. The game ends when only one corporation remains. Server-authoritative with local-first optimistic UI, built as a monorepo with shared Typescript types.

## Language We Agreed On

- **Turn:** One player's Income → Actions → End Turn sequence
- **Round:** All players complete their turns → simultaneous tax phase → next round
- **Local-first:** Client holds Zustand state with optimistic updates; server validates and broadcasts authoritative state; rollback on rejection
- **Lobby:** Room code + display names + host controls. No accounts, no matchmaking
- **Asset:** Permanent income-generating investment (Jack/Queen/King/Ace) with per-round income and tax
- **Desktop-first responsive:** Primary layout for 1280px+; mobile playable but secondary priority

## Decisions Made

- **No game engine** — React SPA is the right fit for a turn-based strategy board game
- **Socket.io** for real-time — built-in rooms, fallback polling, auto-reconnect
- **Monorepo with npm workspaces** — shared `common` package for types/validation
- **No database in V1** — game state lives in server memory, discarded when game ends
- **Room codes over matchmaking** — 6-char codes + shareable URLs. Jackbox model
- **Phase-based build order** — infrastructure first (lobby, turn cycle), then game mechanics layered in
- **Hot-seat dev mode** — single-screen pass-the-keyboard mode for fast iteration before networking

## Assumptions

- Players use modern browsers (Chrome, Firefox, Safari, Edge)
- Target match length 30–60 minutes is acceptable
- Server restarts lose in-progress games (acceptable for V1)
- No voice chat in V1 — in-game text chat only
- No AI opponents in V1

---

## Project Structure

```
ledger/
  package.json                       # Root: npm workspaces config
  turbo.json                         # Turborepo config (optional, npm workspaces also fine)
  tsconfig.base.json                 # Shared TS config
  .gitignore
  
  packages/
    common/
      package.json
      tsconfig.json
      index.ts                       # Re-exports everything
      src/
        types/
          asset.ts                   # Asset, AssetType (Jack|Queen|King|Ace)
          player.ts                  # Player, FinancialHealth
          game-state.ts              # GameState, GamePhase, RoundPhase
          actions.ts                 # All possible player actions + payloads
          contract.ts                # LoanContract, InvestmentContract
          takeover.ts                # TakeoverState
          auction.ts                 # AuctionState
          lobby.ts                   # Lobby, LobbyPlayer, LobbySettings
          events.ts                  # All Socket.io event names + payloads
        constants.ts                 # Asset table (prices, income, tax, caps), loan terms
        validation/
          buy-asset.ts               # Can player buy this asset?
          sell-asset.ts              # Can player sell this asset?
          borrow.ts                  # Can player borrow?
          takeover.ts                # Can player initiate takeover?
          actions.ts                 # Generic action router
        calculations/
          income.ts                  # Calculate player's total income
          taxes.ts                   # Calculate player's total tax obligation
          net-worth.ts               # Calculate player's net worth
          financial-health.ts        # Determine financial health tier
          takeover-defense.ts        # Calculate required LC reserve

    server/
      package.json
      tsconfig.json
      src/
        index.ts                     # Express + Socket.io bootstrap
        room-manager.ts              # Create/join/leave rooms, room lifecycle
        game-engine.ts               # Core game loop runner, turn management
        handlers/
          lobby.events.ts            # create_room, join_room, start_game
          game.events.ts             # buy_asset, sell_asset, borrow, repay, etc.
          takeover.events.ts         # initiate_takeover, defense_actions
          auction.events.ts          # create_auction, place_bid, etc.
          chat.events.ts             # In-game text chat
        game-state-machine.ts        # State transitions, round advancement, tax phase
        validation-layer.ts          # Routes actions to validation before applying
        action-executor.ts           # Applies validated actions to game state
        timer-manager.ts             # Turn timers, AFK detection

    client/
      package.json
      tsconfig.json
      vite.config.ts
      tailwind.config.js
      postcss.config.js
      index.html
      public/
      src/
        main.tsx                     # React entry point
        App.tsx                      # Router: LobbyScreen | GameScreen
        store/
          game-store.ts              # Zustand store — local game state
          lobby-store.ts             # Zustand store — lobby state
          socket-store.ts            # Zustand store — socket connection status
        hooks/
          use-socket.ts              # Socket.io connection + event listeners
          use-game-actions.ts        # Send action to server + optimistic update
          use-timer.ts               # Turn countdown timer
        screens/
          HomeScreen.tsx             # Create or join a game
          LobbyScreen.tsx            # Pre-game lobby with players + settings
          GameScreen.tsx             # Main game board
        components/
          layout/
            GameLayout.tsx           # Main game grid layout
            Sidebar.tsx              # Player list, standings, financial health
          board/
            PlayerBoard.tsx          # Individual player's corporation view
            AssetCard.tsx            # Single asset display
            MarketPanel.tsx          # Available assets to buy
            TurnIndicator.tsx        # Whose turn, current phase
          actions/
            ActionPanel.tsx          # Available actions for current player
            BuyAssetDialog.tsx       # Buy asset modal
            SellAssetDialog.tsx      # Sell asset modal
            BorrowDialog.tsx         # Borrow loan modal
            InvestDialog.tsx         # Invest in player modal
            TakeoverDialog.tsx       # Initiate takeover modal
            AuctionPanel.tsx         # Auction creation + bidding
          status/
            FinancialHealthBadge.tsx # Health indicator (Healthy/Stable/Stressed/Critical)
            PlayerStandings.tsx      # Wealth ranking
          takeover/
            TakeoverNotification.tsx # Takeover announced banner
            DefensePanel.tsx         # Defender's survival options
          chat/
            ChatPanel.tsx            # In-game text chat
          lobby/
            CreateRoom.tsx           # Create game form
            JoinRoom.tsx             # Join game form
            PlayerList.tsx           # Lobby player list
            GameSettings.tsx         # Timer, max players, etc.
          common/
            Button.tsx
            Modal.tsx
            Card.tsx
            Badge.tsx
            Timer.tsx
        lib/
          socket.ts                  # Socket.io client initialization
          format.ts                  # LC formatting, asset names
        types/
          index.ts                   # Re-exports from common
```

---

## Build Phases

### Phase 0: Scaffold (Monorepo + Tooling)

Set up the monorepo structure with npm workspaces, TypeScript, Vite, Tailwind, and the shared `common` package.

**Files to create:**
- `package.json` (root)
- `tsconfig.base.json`
- `.gitignore`
- `packages/common/package.json`
- `packages/common/tsconfig.json`
- `packages/server/package.json`
- `packages/server/tsconfig.json`
- `packages/client/package.json`
- `packages/client/tsconfig.json`
- `packages/client/vite.config.ts`
- `packages/client/tailwind.config.js`
- `packages/client/postcss.config.js`
- `packages/client/index.html`

**Commands to run:**
```bash
npm install -w packages/common
npm install -w packages/server
npm install -w packages/client
npm install -D -w packages/client tailwindcss postcss autoprefixer
npx tailwindcss init -p --ts
```

Deliverable: Three packages that build independently with shared types.

---

### Phase 1: Common Types + Constants

Define every TypeScript type, constant, and validation function in `packages/common`. This is the contract the server and client both use.

**Files to create:**
- `packages/common/src/types/asset.ts`
- `packages/common/src/types/player.ts`
- `packages/common/src/types/game-state.ts`
- `packages/common/src/types/actions.ts`
- `packages/common/src/types/contract.ts`
- `packages/common/src/types/takeover.ts`
- `packages/common/src/types/auction.ts`
- `packages/common/src/types/lobby.ts`
- `packages/common/src/types/events.ts`
- `packages/common/src/constants.ts`
- `packages/common/src/validation/buy-asset.ts`
- `packages/common/src/validation/sell-asset.ts`
- `packages/common/src/validation/borrow.ts`
- `packages/common/src/validation/takeover.ts`
- `packages/common/src/validation/actions.ts`
- `packages/common/src/calculations/income.ts`
- `packages/common/src/calculations/taxes.ts`
- `packages/common/src/calculations/net-worth.ts`
- `packages/common/src/calculations/financial-health.ts`
- `packages/common/src/calculations/takeover-defense.ts`

Deliverable: A complete type-safe game specification that the client and server both import from.

---

### Phase 2: Server — Lobby + Socket Infrastructure

Set up the Node.js server with Express + Socket.io. Implement room creation, joining, and lobby lifecycle.

**Files to create:**
- `packages/server/src/index.ts`
- `packages/server/src/room-manager.ts`
- `packages/server/src/handlers/lobby.events.ts`

Deliverable: A running server where players can create rooms, join with display names, and see each other in a lobby.

---

### Phase 3: Client — Home + Lobby Screens

Build the frontend for creating and joining games. Socket.io client connection. Lobby display.

**Files to create:**
- `packages/client/src/main.tsx`
- `packages/client/src/App.tsx`
- `packages/client/src/store/lobby-store.ts`
- `packages/client/src/store/socket-store.ts`
- `packages/client/src/hooks/use-socket.ts`
- `packages/client/src/lib/socket.ts`
- `packages/client/src/screens/HomeScreen.tsx`
- `packages/client/src/screens/LobbyScreen.tsx`
- `packages/client/src/components/lobby/CreateRoom.tsx`
- `packages/client/src/components/lobby/JoinRoom.tsx`
- `packages/client/src/components/lobby/PlayerList.tsx`
- `packages/client/src/components/lobby/GameSettings.tsx`
- `packages/client/src/components/common/Button.tsx`
- `packages/client/src/components/common/Card.tsx`
- `packages/client/src/components/common/Modal.tsx`

Deliverable: A working web app where you can create a room, share the code, and see friends join.

---

### Phase 4: Server — Core Game Engine + Turn Cycle

Build the game state machine that runs the game loop: start game → turn cycle → income collection → actions → end turn → round end → taxes.

**Files to create:**
- `packages/server/src/game-engine.ts`
- `packages/server/src/game-state-machine.ts`
- `packages/server/src/handlers/game.events.ts`
- `packages/server/src/action-executor.ts`
- `packages/server/src/validation-layer.ts`
- `packages/server/src/timer-manager.ts`

Deliverable: A server that runs a full game with turn order, income, taxes, and action validation.

---

### Phase 5: Client — Game Board UI

Build the main game screen showing all players, assets, standings, the market, and action buttons. Turn indicator, income animation, player boards.

**Files to create:**
- `packages/client/src/screens/GameScreen.tsx`
- `packages/client/src/store/game-store.ts`
- `packages/client/src/hooks/use-game-actions.ts`
- `packages/client/src/hooks/use-timer.ts`
- `packages/client/src/components/layout/GameLayout.tsx`
- `packages/client/src/components/layout/Sidebar.tsx`
- `packages/client/src/components/board/PlayerBoard.tsx`
- `packages/client/src/components/board/AssetCard.tsx`
- `packages/client/src/components/board/MarketPanel.tsx`
- `packages/client/src/components/board/TurnIndicator.tsx`
- `packages/client/src/components/actions/ActionPanel.tsx`
- `packages/client/src/components/actions/BuyAssetDialog.tsx`
- `packages/client/src/components/status/FinancialHealthBadge.tsx`
- `packages/client/src/components/status/PlayerStandings.tsx`
- `packages/client/src/components/common/Badge.tsx`
- `packages/client/src/components/common/Timer.tsx`

Deliverable: A working game loop in the browser where players can take turns, buy assets, see income, and watch taxes deducted.

---

### Phase 6: Game Mechanics — Loans, Investments, Selling, Auctions

Layer in the remaining mechanical systems.

**Files to create/modify:**
- `packages/client/src/components/actions/SellAssetDialog.tsx`
- `packages/client/src/components/actions/BorrowDialog.tsx`
- `packages/client/src/components/actions/InvestDialog.tsx`
- `packages/client/src/components/actions/AuctionPanel.tsx`
- Plus handler updates in `packages/server/src/handlers/game.events.ts`

Deliverable: Players can borrow, invest in each other, sell assets privately, auction assets, and buy from each other.

---

### Phase 7: Hostile Takeovers

Build the takeover system — eligibility, declaration, defense phase, resolution.

**Files to create/modify:**
- `packages/server/src/handlers/takeover.events.ts`
- `packages/client/src/components/actions/TakeoverDialog.tsx`
- `packages/client/src/components/takeover/TakeoverNotification.tsx`
- `packages/client/src/components/takeover/DefensePanel.tsx`

Deliverable: Full hostile takeover flow works — declare, defend, survive or be eliminated.

---

### Phase 8: Corporate Expansion

Build the expansion vote system and second-economy phase.

**Files to modify:**
- Server game state machine: expansion trigger detection
- Client: expansion request button, voting UI, new asset batch announcement

Deliverable: Late-game expansion vote adds new assets to the market.

---

### Phase 9: Chat, Polish, Edge Cases

- In-game text chat
- Turn timer countdown with auto-end-turn
- Disconnect handling + grace timer
- AFK detection
- Surrender button
- Financial health display
- Net worth tiebreaker
- Notification system (takeover warnings, tax due, loan due)
- Visual feedback for actions (income collection animation, takeover alert)

**Files to create:**
- `packages/client/src/components/chat/ChatPanel.tsx`
- Plus polish throughout existing components

Deliverable: A complete, polished multiplayer game.

---

### Phase 10: Hot-Seat Dev Mode (Optional, Build If Useful)

A version of the game where 2–6 players play on a single screen, passing the keyboard/clicking "next player." Useful for rapid testing without needing multiple browser tabs.

This is built as a flag on the client (`?mode=hotseat`) — it skips the server entirely and runs the game engine inline.

Deliverable: Single-browser playtesting mode for quick iteration.

---

## Task N — Build Sequence (Concrete First Steps)

### Task 1: Initialize Monorepo

```bash
mkdir ledger
cd ledger
npx git init
```

**Root `package.json`:**
```json
{
  "name": "ledger",
  "private": true,
  "workspaces": [
    "packages/common",
    "packages/server",
    "packages/client"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces",
    "dev:server": "npm run dev -w packages/server",
    "dev:client": "npm run dev -w packages/client"
  }
}
```

**`tsconfig.base.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

**`.gitignore`:**
```
node_modules
dist
.env
*.tsbuildinfo
```

### Task 2: Define Core Types (Common Package)

All types go in `packages/common/src/types/`.

```typescript
// packages/common/src/types/asset.ts
export type AssetType = 'jack' | 'queen' | 'king' | 'ace';

export interface AssetDefinition {
  type: AssetType;
  purchasePrice: number;
  incomePerRound: number;
  taxPerRound: number;
  maxPerPlayer: number;
}

export interface OwnedAsset {
  id: string;
  type: AssetType;
  ownerId: string;
}
```

```typescript
// packages/common/src/types/player.ts
export type FinancialHealth = 'healthy' | 'stable' | 'stressed' | 'critical';

export interface Player {
  id: string;
  name: string;
  lc: number;
  assets: OwnedAsset[];
  loans: LoanContract[];
  investments: InvestmentContract[];
  financialHealth: FinancialHealth;
  takeoverImmunityRounds: number;
  isEliminated: boolean;
  isHost: boolean;
}
```

```typescript
// packages/common/src/types/game-state.ts
export type GamePhase = 'lobby' | 'in_progress' | 'finished';
export type RoundPhase = 'income' | 'actions' | 'round_end' | 'taxes' | 'takeover_defense';

export interface GameState {
  id: string;
  phase: GamePhase;
  roundPhase: RoundPhase;
  roundNumber: number;
  players: Player[];
  market: AssetMarket;
  currentPlayerIndex: number;
  turnOrder: string[];
  turnTimerEndsAt: number | null;
  activeTakeover: TakeoverState | null;
  activeAuction: AuctionState | null;
  expansionsUsed: number;
  logs: GameLogEntry[];
  winner: string | null;
}

export interface AssetMarket {
  jack: number;  // remaining supply
  queen: number;
  king: number;
  ace: number;
}

export interface GameLogEntry {
  round: number;
  message: string;
  timestamp: number;
}
```

```typescript
// packages/common/src/constants.ts
import { AssetDefinition, AssetType } from './types/asset';

export const ASSET_DEFINITIONS: Record<AssetType, AssetDefinition> = {
  jack: {
    type: 'jack',
    purchasePrice: 20,
    incomePerRound: 10,
    taxPerRound: 5,
    maxPerPlayer: 3,
  },
  queen: {
    type: 'queen',
    purchasePrice: 40,
    incomePerRound: 20,
    taxPerRound: 10,
    maxPerPlayer: 2,
  },
  king: {
    type: 'king',
    purchasePrice: 60,
    incomePerRound: 30,
    taxPerRound: 15,
    maxPerPlayer: 2,
  },
  ace: {
    type: 'ace',
    purchasePrice: 100,
    incomePerRound: 50,
    taxPerRound: 25,
    maxPerPlayer: 1,
  },
};

export const STARTING_LC = 20;
export const INITIAL_MARKET_SUPPLY: Record<AssetType, number> = {
  jack: 8,
  queen: 6,
  king: 4,
  ace: 2,
};

export const LOAN_MAX = 120;
export const LOAN_INTEREST_RATE = 0.5;
export const LOAN_TERM_ROUNDS = 3;
export const MAX_ACTIVE_LOANS = 1;

export const TAKEOVER_MIN_WEALTH = 120;
export const TAKEOVER_FILING_FEE = 40;
export const TAKEOVER_ATTACKER_COOLDOWN = 3;
export const TAKEOVER_DEFENDER_IMMUNITY = 4;

export const EMERGENCY_SALE_MULTIPLIER = 0.5;

export const EXPANSION_COST = 10;
export const EXPANSION_TRIGGER_THRESHOLD = 0.5; // % of assets owned by players
export const MAX_EXPANSIONS_PER_GAME = 1;

export const PLAYER_MIN = 2;
export const PLAYER_MAX = 6;

export const TURN_TIMER_SECONDS = 120; // 2 min per turn
```

```typescript
// packages/common/src/validation/buy-asset.ts
import { AssetType } from '../types/asset';
import { GameState } from '../types/game-state';
import { ASSET_DEFINITIONS } from '../constants';
import { calculateIncome } from '../calculations/income';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function canBuyAsset(playerId: string, assetType: AssetType, state: GameState): ValidationResult {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return { valid: false, reason: 'Player not found' };

  const def = ASSET_DEFINITIONS[assetType];
  if (!def) return { valid: false, reason: 'Unknown asset type' };

  // Check market supply
  if (state.market[assetType] <= 0) return { valid: false, reason: 'No supply left in market' };

  // Check per-player cap
  const owned = player.assets.filter(a => a.type === assetType).length;
  if (owned >= def.maxPerPlayer) return { valid: false, reason: `Already at max ${assetType}s (${def.maxPerPlayer})` };

  // Check affordability
  if (player.lc < def.purchasePrice) return { valid: false, reason: `Need ${def.purchasePrice} LC, have ${player.lc} LC` };

  return { valid: true };
}
```

And similarly for all other validation functions (`canBorrow`, `canSellAsset`, `canInitiateTakeover`, etc.).

---

## How to Run the Build

```bash
# Install everything
npm install

# Dev mode (both server + client)
npm run dev:server  # Terminal 1 — runs on :3001
npm run dev:client  # Terminal 2 — runs on :5173

# Build
npm run build -w packages/common
npm run build -w packages/server
npm run build -w packages/client
```

---

## Next Steps

This is the full plan. Let me know if you want me to:

1. **Start writing all the files now** — I'll create every file in sequence
2. **Adjust anything** — stack choice, structure, or approach
3. **Start with the hot-seat mode first** — get a local playable version before adding networking

Which path do you want?
