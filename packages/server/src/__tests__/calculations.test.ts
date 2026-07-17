import { describe, it, expect } from 'vitest';
import { calculateNetWorth, calculateIncome } from '@ledger/common';
import type { Player } from '@ledger/common';

/* ─── Test Helper ─── */

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Test Player',
    lc: 100,
    assets: [],
    loans: [],
    investments: [],
    financialHealth: 'healthy',
    takeoverImmunityRounds: 0,
    isEliminated: false,
    isHost: true,
    isConnected: true,
    ...overrides,
  };
}

/* ─── Net Worth Tests ─── */

describe('calculateNetWorth', () => {
  it('returns LC when player has no assets', () => {
    const player = makePlayer({ lc: 100 });
    expect(calculateNetWorth(player)).toBe(100);
  });

  it('returns 0 for eliminated player', () => {
    const player = makePlayer({ isEliminated: true, lc: 500 });
    expect(calculateNetWorth(player)).toBe(0);
  });

  it('sums LC + asset purchase prices', () => {
    const player = makePlayer({
      lc: 50,
      assets: [
        { id: 'a1', type: 'jack', purchasedAt: Date.now() },  // 20 LC
        { id: 'a2', type: 'queen', purchasedAt: Date.now() }, // 40 LC
      ],
    });
    // 50 + 20 + 40 = 110
    expect(calculateNetWorth(player)).toBe(110);
  });

  it('handles high-value portfolio', () => {
    const player = makePlayer({
      lc: 20,
      assets: [
        { id: 'a1', type: 'ace', purchasedAt: Date.now() },   // 100 LC
        { id: 'a2', type: 'king', purchasedAt: Date.now() },   // 60 LC
        { id: 'a3', type: 'queen', purchasedAt: Date.now() },  // 40 LC
      ],
    });
    // 20 + 100 + 60 + 40 = 220
    expect(calculateNetWorth(player)).toBe(220);
  });

  it('returns 0 when LC is 0 and no assets', () => {
    const player = makePlayer({ lc: 0 });
    expect(calculateNetWorth(player)).toBe(0);
  });
});

/* ─── Income Tests ─── */

describe('calculateIncome', () => {
  it('returns 0 for player with no assets', () => {
    const player = makePlayer();
    expect(calculateIncome(player)).toBe(0);
  });

  it('returns 0 for eliminated player', () => {
    const player = makePlayer({ isEliminated: true });
    expect(calculateIncome(player)).toBe(0);
  });

  it('calculates income from single asset', () => {
    const player = makePlayer({
      assets: [{ id: 'a1', type: 'jack', purchasedAt: Date.now() }], // 10 LC/round
    });
    expect(calculateIncome(player)).toBe(10);
  });

  it('sums income from multiple assets', () => {
    const player = makePlayer({
      assets: [
        { id: 'a1', type: 'jack', purchasedAt: Date.now() },   // 10
        { id: 'a2', type: 'queen', purchasedAt: Date.now() },  // 20
        { id: 'a3', type: 'king', purchasedAt: Date.now() },   // 30
      ],
    });
    // 10 + 20 + 30 = 60
    expect(calculateIncome(player)).toBe(60);
  });

  it('handles duplicate asset types', () => {
    const player = makePlayer({
      assets: [
        { id: 'a1', type: 'jack', purchasedAt: Date.now() },
        { id: 'a2', type: 'jack', purchasedAt: Date.now() },
        { id: 'a3', type: 'jack', purchasedAt: Date.now() },
      ],
    });
    // 3 jacks * 10 = 30
    expect(calculateIncome(player)).toBe(30);
  });

  it('handles ace income (highest per round)', () => {
    const player = makePlayer({
      assets: [{ id: 'a1', type: 'ace', purchasedAt: Date.now() }], // 50 LC/round
    });
    expect(calculateIncome(player)).toBe(50);
  });
});
