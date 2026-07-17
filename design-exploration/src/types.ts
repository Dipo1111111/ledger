export type AssetTier = 'jack' | 'queen' | 'king' | 'ace';
export type FinancialHealth = 'healthy' | 'stable' | 'stressed' | 'critical';
export type RoundPhase = 'income' | 'actions' | 'taxes' | 'takeover_defense';

export interface OwnedAsset {
  id: string;
  type: AssetTier;
  ownerId: string;
}

export interface Player {
  id: string;
  name: string;
  lc: number;
  assets: OwnedAsset[];
  income: number;
  tax: number;
  financialHealth: FinancialHealth;
  isEliminated: boolean;
  isCurrentTurn: boolean;
  color: string;
  netWorth: number;
}

export interface AssetDefinition {
  type: AssetTier;
  purchasePrice: number;
  incomePerRound: number;
  taxPerRound: number;
  maxPerPlayer: number;
  icon: string;
}

export interface MarketAsset {
  type: AssetTier;
  price: number;
  income: number;
  tax: number;
  max: number;
  remaining: number;
}

export interface GameState {
  round: number;
  phase: RoundPhase;
  currentPlayerIndex: number;
  roomCode: string;
  players: Player[];
  market: MarketAsset[];
  logs: string[];
}

export interface NavItem {
  id: string;
  label: string;
  component: React.FC;
}
