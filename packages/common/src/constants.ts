import type { AssetDefinition, AssetType } from './types/asset';

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

/* ─── Loans ─── */
export const LOAN_MAX_AMOUNT = 120;
export const LOAN_INTEREST_RATE = 0.5; // 50%
export const LOAN_TERM_ROUNDS = 3;
export const MAX_ACTIVE_LOANS = 1;

/* ─── Hostile Takeovers ─── */
export const TAKEOVER_MIN_WEALTH = 120;
export const TAKEOVER_FILING_FEE = 40;
export const TAKEOVER_ATTACKER_COOLDOWN_ROUNDS = 3;
export const TAKEOVER_DEFENDER_IMMUNITY_ROUNDS = 4;
export const TAKEOVER_REWARD_LC = 20;

/* ─── Emergency Sale ─── */
export const EMERGENCY_SALE_MULTIPLIER = 0.5;

/* ─── Corporate Expansion ─── */
export const EXPANSION_CONTRIBUTION = 10;
export const MAX_EXPANSIONS_PER_GAME = 1;
/** Half the initial market supply, maintaining 4:3:2:1 proportion */
export const EXPANSION_MARKET_BATCH: Record<AssetType, number> = {
  jack: 4,
  queen: 3,
  king: 2,
  ace: 1,
};

/* ─── Turn Timer / AFK ─── */
/** Consecutive timeouts before auto-surrender kicks in */
export const AFK_MAX_TIMEOUTS = 2;

/* ─── Players ─── */
export const PLAYER_MIN = 2;
export const PLAYER_MAX = 6;

/* ─── Timer ─── */
export const TURN_TIMER_SECONDS = 25;
export const DISCONNECT_GRACE_SECONDS = 60;

/* ─── Room ─── */
export const ROOM_CODE_LENGTH = 6;
