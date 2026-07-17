import type { GameState, AssetTier, MarketAsset } from './types';

const playerNames = [
  { name: 'Nexus Corp', color: '#6C5CE7' },
  { name: 'Ironhold Ltd', color: '#E74C3C' },
  { name: 'Veridian Ent.', color: '#2ECC71' },
  { name: 'Onyx Partners', color: '#F39C12' },
  { name: 'Cascade Inc.', color: '#3498DB' },
  { name: 'Titan Group', color: '#E91E63' },
];

const ASSET_DEFS: Record<AssetTier, { price: number; income: number; tax: number; max: number; icon: string }> = {
  jack: { price: 20, income: 10, tax: 5, max: 3, icon: '♠' },
  queen: { price: 40, income: 20, tax: 10, max: 2, icon: '♥' },
  king: { price: 60, income: 30, tax: 15, max: 2, icon: '♦' },
  ace: { price: 100, income: 50, tax: 25, max: 1, icon: '♣' },
};

function generatePlayerAssets(count: number): { id: string; type: AssetTier }[] {
  const assets: { id: string; type: AssetTier }[] = [];
  const tiers: AssetTier[] = ['jack', 'queen', 'king', 'ace'];
  for (let i = 0; i < count; i++) {
    assets.push({ id: `asset-${i}`, type: tiers[i % tiers.length] });
  }
  return assets;
}

const players = [
  {
    id: 'p1',
    name: playerNames[0].name,
    lc: 145,
    assets: generatePlayerAssets(4),
    financialHealth: 'healthy' as const,
    isEliminated: false,
    isCurrentTurn: true,
    color: playerNames[0].color,
    income: 90,
    tax: 40,
    netWorth: 245,
  },
  {
    id: 'p2',
    name: playerNames[1].name,
    lc: 62,
    assets: generatePlayerAssets(3),
    financialHealth: 'stressed' as const,
    isEliminated: false,
    isCurrentTurn: false,
    color: playerNames[1].color,
    income: 55,
    tax: 25,
    netWorth: 122,
  },
  {
    id: 'p3',
    name: playerNames[2].name,
    lc: 210,
    assets: generatePlayerAssets(5),
    financialHealth: 'healthy' as const,
    isEliminated: false,
    isCurrentTurn: false,
    color: playerNames[2].color,
    income: 110,
    tax: 50,
    netWorth: 310,
  },
  {
    id: 'p4',
    name: playerNames[3].name,
    lc: 18,
    assets: generatePlayerAssets(2),
    financialHealth: 'critical' as const,
    isEliminated: false,
    isCurrentTurn: false,
    color: playerNames[3].color,
    income: 30,
    tax: 15,
    netWorth: 58,
  },
  {
    id: 'p5',
    name: playerNames[4].name,
    lc: 88,
    assets: generatePlayerAssets(3),
    financialHealth: 'stable' as const,
    isEliminated: false,
    isCurrentTurn: false,
    color: playerNames[4].color,
    income: 60,
    tax: 25,
    netWorth: 148,
  },
];

const marketAssets: MarketAsset[] = [
  { type: 'jack', price: 20, income: 10, tax: 5, max: 3, remaining: 6 },
  { type: 'queen', price: 40, income: 20, tax: 10, max: 2, remaining: 4 },
  { type: 'king', price: 60, income: 30, tax: 15, max: 2, remaining: 3 },
  { type: 'ace', price: 100, income: 50, tax: 25, max: 1, remaining: 1 },
];

const gameLogs = [
  'Round 4 — Taxes collected',
  'Nexus Corp acquired King asset',
  'Ironhold Ltd borrowed 80 LC',
  'Veridian Ent. invested in Onyx Partners',
  'Round 3 — Taxes collected',
  'Cascade Inc. sold Queen to Ironhold Ltd',
  'Onyx Partners missed loan payment',
];

export const MOCK_GAME_STATE: GameState = {
  round: 4,
  phase: 'actions',
  currentPlayerIndex: 0,
  roomCode: 'LGE-427',
  players: players.map(p => ({
    ...p,
    assets: p.assets,
  })),
  market: marketAssets,
  logs: gameLogs,
};

export { ASSET_DEFS, playerNames };
