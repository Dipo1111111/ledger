import { create } from 'zustand';
import type { LobbyPlayer, LobbySettings } from '@ledger/common';
import type { GameState } from '@ledger/common';

/** Error entry with a unique id so React can key it for animation exit */
export interface ErrorEntry {
  id: string;
  message: string;
  timestamp: number;
}

export interface LobbyState {
  /** Room code when we are in a lobby */
  roomCode: string | null;
  /** This player's assigned id */
  playerId: string | null;
  /** All players in the lobby */
  players: LobbyPlayer[];
  /** Current lobby settings */
  settings: LobbySettings | null;
  /** Is the game starting? (brief transition state) */
  isGameStarting: boolean;
  /** When the game has started, the initial GameState */
  gameState: GameState | null;
  /** Transient error messages displayed in the lobby */
  errors: ErrorEntry[];
}

export interface LobbyActions {
  /** Save the room code & playerId after creating/joining */
  enterRoom: (roomCode: string, playerId: string) => void;
  /** Update the full lobby (players + settings), clearing stary state */
  updateLobby: (players: LobbyPlayer[], settings: LobbySettings) => void;
  /** Game is starting — store the initial state */
  onGameStarting: (gameState: GameState) => void;
  /** Push a transient error */
  pushError: (message: string) => void;
  /** Dismiss an error by id */
  dismissError: (id: string) => void;
  /** Reset everything on leave / disconnect */
  reset: () => void;
}

export type LobbyStore = LobbyState & LobbyActions;

const initialState: LobbyState = {
  roomCode: null,
  playerId: null,
  players: [],
  settings: null,
  isGameStarting: false,
  gameState: null,
  errors: [],
};

let errorCounter = 0;

export const useLobbyStore = create<LobbyStore>((set) => ({
  ...initialState,

  enterRoom: (roomCode, playerId) =>
    set({ roomCode, playerId, isGameStarting: false, gameState: null }),

  updateLobby: (players, settings) =>
    set({ players, settings }),

  onGameStarting: (gameState) =>
    set({ isGameStarting: true, gameState }),

  pushError: (message) => {
    const id = `err-${++errorCounter}`;
    set((s) => ({
      errors: [...s.errors, { id, message, timestamp: Date.now() }],
    }));
  },

  dismissError: (id) =>
    set((s) => ({
      errors: s.errors.filter((e) => e.id !== id),
    })),

  reset: () => set(initialState),
}));
