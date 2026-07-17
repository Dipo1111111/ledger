# Ledger — Library Documentation

## React 19 + Vite

- **React 19 with Vite** — no Create React App
- Vite config in `packages/client/vite.config.ts`
- Dev server on port 5173, proxy API calls to server on port 3001
- JSX runtime is automatic (React 19 default)

### Key Patterns
```tsx
// Zustand store with socket integration
const useGameStore = create<GameStore>((set, get) => ({
  players: [],
  market: { jack: 8, queen: 6, king: 4, ace: 2 },
  
  // Called when server broadcasts new state
  applyServerState: (state: GameState) => set({
    players: state.players,
    market: state.market,
    roundPhase: state.roundPhase,
  }),
  
  // Optimistic update — rolls back on server rejection
  optimisticBuyAsset: (assetType: AssetType) => {
    const state = get();
    const def = ASSET_DEFINITIONS[assetType];
    // Apply locally, server will confirm or reject
  },
}));
```

## Tailwind CSS v4

- **Desktop-first** breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- All colors use CSS variables from `globals.css` (defined in `ui-tokens.md`)
- No custom CSS classes for layout — use Tailwind utilities
- Dark mode: `class` strategy (toggle via `data-theme` on `<html>`)

```html
<div class="bg-surface text-text-primary rounded-lg p-4 shadow-md">
```

## Socket.io

- **Server:** `packages/server/src/index.ts` — creates HTTP server + Socket.io
- **Client:** `packages/client/src/lib/socket.ts` — creates socket connection
- Client auto-reconnects on disconnect
- Room-based: `socket.join(roomCode)` on the server

### Event Naming
```typescript
// Namespace:category:action
'system:error'         // Server → Client: error message
'room:created'         // Server → Host: room code
'room:player_joined'   // Server → Room: player joined
'game:state_update'    // Server → Room: authoritative state broadcast
'game:action'          // Client → Server: player action request
'game:turn_change'     // Server → Room: turn changed
'takeover:initiated'   // Server → Room: takeover declared
'auction:new_bid'      // Server → Room: bid placed
'chat:message'         // Bidirectional: chat messages
```

## Zustand

- Single store per domain: `game-store.ts`, `lobby-store.ts`, `socket-store.ts`
- No slices pattern — flat stores are fine for V1
- Subscribe to socket events in store via `useEffect` in a hook
- Server state replaces client state — no merging

```tsx
import { create } from 'zustand';

interface GameStore {
  players: Player[];
  market: AssetMarket;
  applyServerState: (state: GameState) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  players: [],
  market: { jack: 8, queen: 6, king: 4, ace: 2 },
  applyServerState: (state) => set({
    players: state.players,
    market: state.market,
  }),
}));
```

## Express

- Minimal — just HTTP server for Socket.io handshake + static file serving
- No REST API for game logic (all communication via WebSocket)
- Health check endpoint: `GET /health`
- CORS configured for dev (port 5173)
