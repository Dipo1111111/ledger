import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from '../game-engine';
import type { Lobby } from '@ledger/common';

/* ─── Test Helpers ─── */

function makeLobby(playerCount: number = 2): Lobby {
  const players = Array.from({ length: playerCount }, (_, i) => ({
    id: `player-${i}`,
    name: `Player ${i + 1}`,
    isHost: i === 0,
    isReady: i === 0,
    color: ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'][i] as any,
    joinedAt: Date.now(),
  }));

  return {
    code: 'TEST01',
    hostId: 'player-0',
    players,
    settings: {
      maxPlayers: 6,
      turnTimerSeconds: 25,
    },
    createdAt: Date.now(),
  };
}

/* ─── Game Engine Tests ─── */

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    vi.useFakeTimers();
    engine = new GameEngine();
  });

  describe('startGame', () => {
    it('creates a game from lobby', () => {
      const lobby = makeLobby(2);
      const state = engine.startGame('ROOM1', lobby);

      expect(state.phase).toBe('in_progress');
      expect(state.players).toHaveLength(2);
      expect(state.players[0].lc).toBe(20); // STARTING_LC
      expect(state.players[1].lc).toBe(20);
      expect(state.turnOrder).toEqual(['player-0', 'player-1']);
      expect(state.roundNumber).toBe(1);
    });

    it('initializes market supply', () => {
      const lobby = makeLobby(2);
      const state = engine.startGame('ROOM1', lobby);

      expect(state.market.jack).toBe(8);
      expect(state.market.queen).toBe(6);
      expect(state.market.king).toBe(4);
      expect(state.market.ace).toBe(2);
    });

    it('sets first player as current', () => {
      const lobby = makeLobby(3);
      const state = engine.startGame('ROOM1', lobby);

      expect(state.currentPlayerIndex).toBe(0);
      expect(state.turnOrder[0]).toBe('player-0');
    });
  });

  describe('handleAction', () => {
    it('returns error for non-existent game', () => {
      const result = engine.handleAction('NONEXIST', 'player-0', { type: 'end_turn' });
      expect(result.error).toBe('Game not found');
    });

    it('returns error for wrong player', () => {
      const lobby = makeLobby(2);
      engine.startGame('ROOM1', lobby);

      const result = engine.handleAction('ROOM1', 'wrong-player', { type: 'end_turn' });
      expect(result.error).toContain('not found');
    });

    it('processes end_turn successfully', () => {
      const lobby = makeLobby(2);
      engine.startGame('ROOM1', lobby);

      const result = engine.handleAction('ROOM1', 'player-0', { type: 'end_turn' });
      expect(result.error).toBeUndefined();
      expect(result.state).toBeDefined();
      expect(result.state!.currentPlayerIndex).toBe(1);
    });

    it('advances round when all players have taken turns', () => {
      const lobby = makeLobby(2);
      engine.startGame('ROOM1', lobby);

      // Player 0 ends turn
      engine.handleAction('ROOM1', 'player-0', { type: 'end_turn' });
      // Player 1 ends turn
      const result = engine.handleAction('ROOM1', 'player-1', { type: 'end_turn' });

      expect(result.state).toBeDefined();
      expect(result.state!.roundNumber).toBe(2);
      expect(result.state!.currentPlayerIndex).toBe(0);
    });
  });

  describe('getGame', () => {
    it('returns undefined for non-existent game', () => {
      expect(engine.getGame('NONEXIST')).toBeUndefined();
    });

    it('returns game state after starting', () => {
      const lobby = makeLobby(2);
      engine.startGame('ROOM1', lobby);

      const state = engine.getGame('ROOM1');
      expect(state).toBeDefined();
      expect(state!.phase).toBe('in_progress');
    });
  });

  describe('setPlayerConnected', () => {
    it('updates connection status', () => {
      const lobby = makeLobby(2);
      engine.startGame('ROOM1', lobby);

      engine.setPlayerConnected('ROOM1', 'player-0', false);
      const state = engine.getGame('ROOM1');
      expect(state!.players[0].isConnected).toBe(false);

      engine.setPlayerConnected('ROOM1', 'player-0', true);
      const updated = engine.getGame('ROOM1');
      expect(updated!.players[0].isConnected).toBe(true);
    });
  });
});
