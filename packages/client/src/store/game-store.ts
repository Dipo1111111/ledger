import { create } from 'zustand';
import type { GameState, Player } from '@ledger/common';
import { calculateNetWorth } from '@ledger/common';

/* ─── Store Type ─── */

export interface GameStoreState {
  /** Authoritative game state from server broadcasts */
  gameState: GameState | null;
  /** True while an action is pending server response (used for dialog loading states) */
  isSubmittingAction: boolean;
  /** True when a player has disconnected during a game */
  isGamePaused: boolean;
  /** Name of the player who caused the pause (used in UI overlay) */
  pausedByPlayerName: string | null;
}

export interface GameStoreActions {
  /** Replace the full game state (on GAME_STARTING / STATE_UPDATE) */
  setGameState: (state: GameState) => void;
  /** Set submitting action state */
  setSubmittingAction: (submitting: boolean) => void;
  /** Patch the activeAuction (from AUCTION_UPDATE) */
  setActiveAuction: (auction: import('@ledger/common').AuctionState | null) => void;
  /** Reset to null (on leave / disconnect) */
  reset: () => void;
  /** Support for GAME_PAUSED / GAME_RESUMED */
  setGamePaused: (paused: boolean, pausedByPlayerName?: string | null) => void;
}

export type GameStore = GameStoreState & GameStoreActions;

/* ─── Store ─── */

const initialState: GameStoreState = {
  gameState: null,
  isSubmittingAction: false,
  isGamePaused: false,
  pausedByPlayerName: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setGameState: (gameState) => set({ gameState, isSubmittingAction: false }),

  setSubmittingAction: (submitting) => set({ isSubmittingAction: submitting }),

  setActiveAuction: (auction) =>
    set((s) => ({
      gameState: s.gameState ? { ...s.gameState, activeAuction: auction } : null,
    })),

  setGamePaused: (paused: boolean, pausedByPlayerName: string | null = null) =>
    set({ isGamePaused: paused, pausedByPlayerName }),

  reset: () => set(initialState),
}));

/* ─── Derived Selectors (exported as functions, to be used inside React components) ─── */

/**
 * Find the local player's Player object.
 */
export function selectMyPlayer(
  state: GameState | null,
  playerId: string | null,
): Player | null {
  if (!state || !playerId) return null;
  return state.players.find((p) => p.id === playerId) ?? null;
}

/**
 * Is it the local player's turn?
 */
export function selectIsMyTurn(
  state: GameState | null,
  playerId: string | null,
): boolean {
  if (!state || !playerId) return false;
  const currentId = state.turnOrder[state.currentPlayerIndex];
  return currentId === playerId;
}

/**
 * Return the Player whose turn it currently is.
 */
export function selectCurrentPlayer(state: GameState | null): Player | null {
  if (!state) return null;
  const currentId = state.turnOrder[state.currentPlayerIndex];
  return state.players.find((p) => p.id === currentId) ?? null;
}

/**
 * All alive players sorted by net worth descending.
 */
export function selectSortedPlayers(
  state: GameState | null,
): (Player & { netWorth: number })[] {
  if (!state) return [];
  return [...state.players]
    .filter((p) => !p.isEliminated)
    .map((p) => ({ ...p, netWorth: calculateNetWorth(p) }))
    .sort((a, b) => b.netWorth - a.netWorth);
}

/**
 * Round number as Roman numeral (e.g. 3 → "III").
 */
export function formatRoundNumber(n: number): string {
  const map: [number, string][] = [
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let result = '';
  let remaining = n;
  for (const [value, numeral] of map) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }
  return result;
}
