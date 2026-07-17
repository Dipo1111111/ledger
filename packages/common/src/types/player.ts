import type { OwnedAsset } from './asset';
import type { LoanContract, InvestmentContract } from './contract';

export type FinancialHealth = 'healthy' | 'stable' | 'stressed' | 'critical';

export const FINANCIAL_HEALTH_TIERS: FinancialHealth[] = [
  'healthy',
  'stable',
  'stressed',
  'critical',
];

export interface Player {
  id: string;
  name: string;
  lc: number;
  assets: OwnedAsset[];
  loans: LoanContract[];
  investments: InvestmentContract[];
  financialHealth: FinancialHealth;
  takeoverImmunityRounds: number;
  isEliminated: boolean;
  isHost: boolean;
  isConnected: boolean;
}
