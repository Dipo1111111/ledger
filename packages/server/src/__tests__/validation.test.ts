import { describe, it, expect } from 'vitest';
import { canBuyAsset, canBorrow, canRepayLoan } from '@ledger/common';
import { canSellAsset, canEmergencySell, canPrivateSell } from '@ledger/common';
import type { GameState } from '@ledger/common';
import type { Player } from '@ledger/common';

/* ─── Test Helpers ─── */

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

function makeState(playerOverrides: Partial<Player> = {}): GameState {
  const player = makePlayer(playerOverrides);
  return {
    roomCode: 'TEST01',
    phase: 'in_progress',
    roundNumber: 1,
    currentPlayerIndex: 0,
    turnOrder: [player.id],
    players: [player],
    market: { jack: 8, queen: 6, king: 4, ace: 2 },
    logs: [],
    startedAt: Date.now(),
    turnTimerEndsAt: null,
    activeAuction: null,
    activeTakeover: null,
    expansionVotes: null,
    winnerId: null,
  };
}

/* ─── Buy Asset Tests ─── */

describe('canBuyAsset', () => {
  it('allows buying when player has enough LC and supply exists', () => {
    const state = makeState({ lc: 100 });
    const result = canBuyAsset('p1', 'jack', state);
    expect(result.valid).toBe(true);
  });

  it('rejects unknown player', () => {
    const state = makeState();
    const result = canBuyAsset('unknown', 'jack', state);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Player not found');
  });

  it('rejects when no supply in market', () => {
    const state = makeState({ lc: 100 });
    state.market.jack = 0;
    const result = canBuyAsset('p1', 'jack', state);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('No supply left in market');
  });

  it('rejects when player at max capacity for asset type', () => {
    const state = makeState({
      lc: 200,
      assets: [
        { id: 'a1', type: 'ace', purchasedAt: Date.now() },
        { id: 'a2', type: 'ace', purchasedAt: Date.now() }, // ace maxPerPlayer = 1... wait no
      ],
    });
    // Actually ace maxPerPlayer is 1, let me use jack (maxPerPlayer = 3)
    const state2 = makeState({
      lc: 200,
      assets: [
        { id: 'a1', type: 'jack', purchasedAt: Date.now() },
        { id: 'a2', type: 'jack', purchasedAt: Date.now() },
        { id: 'a3', type: 'jack', purchasedAt: Date.now() },
      ],
    });
    const result = canBuyAsset('p1', 'jack', state2);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Already at max');
  });

  it('rejects when player cannot afford', () => {
    const state = makeState({ lc: 5 }); // jack costs 20
    const result = canBuyAsset('p1', 'jack', state);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Need');
    expect(result.reason).toContain('LC');
  });

  it('allows buying ace when player has 100+ LC and no aces', () => {
    const state = makeState({ lc: 150 });
    const result = canBuyAsset('p1', 'ace', state);
    expect(result.valid).toBe(true);
  });
});

/* ─── Borrow Tests ─── */

describe('canBorrow', () => {
  it('allows borrowing when no active loans', () => {
    const state = makeState({ lc: 0 });
    const result = canBorrow('p1', 50, state);
    expect(result.valid).toBe(true);
  });

  it('rejects zero amount', () => {
    const state = makeState();
    const result = canBorrow('p1', 0, state);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Loan amount must be positive');
  });

  it('rejects negative amount', () => {
    const state = makeState();
    const result = canBorrow('p1', -10, state);
    expect(result.valid).toBe(false);
  });

  it('rejects amount exceeding max (120 LC)', () => {
    const state = makeState();
    const result = canBorrow('p1', 121, state);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Maximum loan amount');
  });

  it('rejects when player already has an active loan', () => {
    const state = makeState({
      loans: [{
        id: 'l1',
        principal: 50,
        interestRate: 0.5,
        termRounds: 3,
        roundsRemaining: 2,
        repaymentAmount: 75,
        isRepaid: false,
        isDefaulted: false,
        takenAtRound: 1,
      }],
    });
    const result = canBorrow('p1', 30, state);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('active loan');
  });

  it('rejects when player is in default', () => {
    const state = makeState({
      loans: [{
        id: 'l1',
        principal: 50,
        interestRate: 0.5,
        termRounds: 3,
        roundsRemaining: 0,
        repaymentAmount: 75,
        isRepaid: false,
        isDefaulted: true,
        takenAtRound: 1,
      }],
    });
    const result = canBorrow('p1', 30, state);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('default');
  });
});

/* ─── Sell Asset Tests ─── */

describe('canSellAsset', () => {
  it('allows selling an owned asset', () => {
    const state = makeState({
      assets: [{ id: 'a1', type: 'jack', purchasedAt: Date.now() }],
    });
    const result = canSellAsset('p1', 'a1', state);
    expect(result.valid).toBe(true);
  });

  it('rejects selling asset not in portfolio', () => {
    const state = makeState({ assets: [] });
    const result = canSellAsset('p1', 'nonexistent', state);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Asset not found in your portfolio');
  });

  it('rejects unknown player', () => {
    const state = makeState();
    const result = canSellAsset('unknown', 'a1', state);
    expect(result.valid).toBe(false);
  });
});

/* ─── Private Sell Tests ─── */

describe('canPrivateSell', () => {
  it('allows valid private sale', () => {
    const buyer = makePlayer({ id: 'p2', lc: 200 });
    const seller = makePlayer({
      id: 'p1',
      lc: 50,
      assets: [{ id: 'a1', type: 'jack', purchasedAt: Date.now() }],
    });
    const state = makeState(seller);
    state.players.push(buyer);
    const result = canPrivateSell('p1', 'a1', 'p2', 15, state);
    expect(result.valid).toBe(true);
  });

  it('rejects self-sale', () => {
    const state = makeState({
      assets: [{ id: 'a1', type: 'jack', purchasedAt: Date.now() }],
    });
    const result = canPrivateSell('p1', 'a1', 'p1', 15, state);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('yourself');
  });

  it('rejects when buyer cannot afford', () => {
    const buyer = makePlayer({ id: 'p2', lc: 5 });
    const seller = makePlayer({
      id: 'p1',
      assets: [{ id: 'a1', type: 'jack', purchasedAt: Date.now() }],
    });
    const state = makeState(seller);
    state.players.push(buyer);
    const result = canPrivateSell('p1', 'a1', 'p2', 15, state);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('afford');
  });

  it('rejects price exceeding 5x purchase price', () => {
    const buyer = makePlayer({ id: 'p2', lc: 500 });
    const seller = makePlayer({
      id: 'p1',
      assets: [{ id: 'a1', type: 'jack', purchasedAt: Date.now() }],
    });
    const state = makeState(seller);
    state.players.push(buyer);
    // jack purchase price is 20, 5x = 100, so 101 should fail
    const result = canPrivateSell('p1', 'a1', 'p2', 101, state);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Invalid sale price');
  });

  it('rejects zero price', () => {
    const buyer = makePlayer({ id: 'p2', lc: 200 });
    const seller = makePlayer({
      id: 'p1',
      assets: [{ id: 'a1', type: 'jack', purchasedAt: Date.now() }],
    });
    const state = makeState(seller);
    state.players.push(buyer);
    const result = canPrivateSell('p1', 'a1', 'p2', 0, state);
    expect(result.valid).toBe(false);
  });
});

/* ─── Repay Loan Tests ─── */

describe('canRepayLoan', () => {
  it('allows repaying an active loan with sufficient LC', () => {
    const state = makeState({
      lc: 100,
      loans: [{
        id: 'l1',
        principal: 50,
        interestRate: 0.5,
        termRounds: 3,
        roundsRemaining: 2,
        repaymentAmount: 75,
        isRepaid: false,
        isDefaulted: false,
        takenAtRound: 1,
      }],
    });
    const result = canRepayLoan('p1', 'l1', 75, state);
    expect(result.valid).toBe(true);
  });

  it('rejects repaying already repaid loan', () => {
    const state = makeState({
      lc: 100,
      loans: [{
        id: 'l1',
        principal: 50,
        interestRate: 0.5,
        termRounds: 3,
        roundsRemaining: 2,
        repaymentAmount: 75,
        isRepaid: true,
        isDefaulted: false,
        takenAtRound: 1,
      }],
    });
    const result = canRepayLoan('p1', 'l1', 75, state);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Loan already repaid');
  });

  it('rejects repaying defaulted loan', () => {
    const state = makeState({
      lc: 100,
      loans: [{
        id: 'l1',
        principal: 50,
        interestRate: 0.5,
        termRounds: 3,
        roundsRemaining: 0,
        repaymentAmount: 75,
        isRepaid: false,
        isDefaulted: true,
        takenAtRound: 1,
      }],
    });
    const result = canRepayLoan('p1', 'l1', 75, state);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Loan is in default');
  });

  it('rejects when insufficient LC', () => {
    const state = makeState({
      lc: 10,
      loans: [{
        id: 'l1',
        principal: 50,
        interestRate: 0.5,
        termRounds: 3,
        roundsRemaining: 2,
        repaymentAmount: 75,
        isRepaid: false,
        isDefaulted: false,
        takenAtRound: 1,
      }],
    });
    const result = canRepayLoan('p1', 'l1', 75, state);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Need');
  });
});
