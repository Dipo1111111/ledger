export type AssetType = 'jack' | 'queen' | 'king' | 'ace';

export interface AssetDefinition {
  type: AssetType;
  purchasePrice: number;
  incomePerRound: number;
  taxPerRound: number;
  maxPerPlayer: number;
}

export const ASSET_TYPES: AssetType[] = ['jack', 'queen', 'king', 'ace'];

export interface OwnedAsset {
  id: string;
  type: AssetType;
  ownerId: string;
}

export interface AssetMarket {
  jack: number;
  queen: number;
  king: number;
  ace: number;
}
