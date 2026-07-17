# Ledger — Architecture

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React 19 + TypeScript + Vite | Best ecosystem for complex stateful UIs |
| **Styling** | Tailwind CSS v4 | Consistent design tokens, responsive |
| **Client State** | Zustand | Minimal boilerplate, snapshot-friendly |
| **Real-time** | Socket.io (WebSocket) | Built-in rooms, auto-reconnect, fallback polling |
| **Backend** | Node.js + TypeScript + Express | Shared types with client |
| **Build** | npm workspaces (monorepo) | Shared common package |

## Project Structure

```
ledger/
  package.json                  # Root: npm workspaces
  tsconfig.base.json            # Shared TS config
  .gitignore
  CLAUDE.md                     # Agent instruction manual
  context/                      # Context files for agentic development
    project-overview.md
    architecture.md
    build-plan.md
    code-standards.md
    library-docs.md
    ui-tokens.md
    ui-rules.md
    ui-registry.md
    progress-tracker.md
    designs/                    # Visual references
  docs/
    LEDGER_GDD_v1.md            # Complete game design document
    implementation-plan-v1.md   # Technical build plan

  packages/
    common/                     # Shared types + validation
      src/
        types/                  # All TypeScript types
        constants.ts            # Asset table, loan terms, etc.
        validation/             # Action validation functions
        calculations/           # Income, tax, net worth, health
    server/                     # Node.js + Socket.io backend
      src/
        index.ts                # Express + Socket.io bootstrap
        room-manager.ts         # Create/join/leave rooms
        game-engine.ts          # Core game loop
        handlers/               # Event handlers (lobby, game, takeover)
        game-state-machine.ts   # State transitions, round advancement
        validation-layer.ts     # Routes actions to validation
        action-executor.ts      # Applies validated actions
        timer-manager.ts        # Turn timers, AFK
    client/                     # React + Vite + Tailwind
      src/
        App.tsx                 # Router
        store/                  # Zustand stores
        hooks/                  # use-socket, use-game-actions, use-timer
        screens/                # Home, Lobby, Game
        components/             # UI components by domain
        lib/                    # Socket init, formatting
```

## System Boundaries

### Server is the Authority
- Server **validates every action** before applying it
- Server calculates all game state (income, taxes, takeover outcomes)
- Server **broadcasts authoritative state** to all clients
- Client never trusts its own state for game-critical decisions

### Client is the UI
- Client renders game state from server
- Client performs **optimistic updates** for instant feedback
- Client **rolls back** if server rejects an action
- Client sends intent, server executes

### Data Flow
```
Player clicks "Buy Ace"
  → Client optimistic update (Zustand)
  → Client sends {action: "buy_asset", asset: "ace"} via Socket.io
  → Server validates (enough LC? cap not reached? correct turn?)
  → Server updates authoritative GameState
  → Server broadcasts new GameState to ALL players
  → All clients replace local state with authoritative state
```

### No Database
Game state lives in **server memory** for the duration of the match. When the game ends, state is discarded. No database needed for V1.

## Game State Machine

```
LOBBY → IN_PROGRESS → FINISHED

Within IN_PROGRESS:
  INCOME → ACTIONS → ROUND_END → TAXES → (repeat)
  
  During ACTIONS, a player may trigger:
    TAKEOVER_DEFENSE (when targeted)
    AUCTION (when hosting/bidding)
```

## Room System (Lobby-based)

```
Host clicks "Create Game"
  → Server generates room code (e.g., "LGE-427")
  → Host shares code/link with friends
  → Friends join with display name (no accounts)
  → Host clicks "Start Game"
  → Game begins
```

## Key Rules (Never Violate)

1. **Server-authoritative economy** — all LC changes must be validated server-side
2. **No crypto/randomness** — no dice, no chance cards, no randomness in game logic
3. **Turn order is sacred** — actions outside a player's turn are rejected (except negotiation)
4. **Negotiation freeze during takeover** — no trades/deals during active takeover countdown
5. **Asset caps are hard** — cannot exceed max per player, enforced server-side
6. **Client never stores permanent game state** — everything comes from server broadcasts
7. **WebSocket is primary** — no polling for game state; server pushes state on every change
8. **In-memory only** — no database, no persistence between matches
