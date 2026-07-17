import type { AssetType } from './asset';

export type AuctionPhase = 'active' | 'completed' | 'cancelled';

export interface Bid {
  playerId: string;
  amount: number;
  timestamp: number;
}

export interface AuctionState {
  id: string;
  sellerId: string;
  assetId: string;
  assetType: AssetType;
  startingBid: number;
  minimumBid: number;
  currentBid: number | null;
  highestBidderId: string | null;
  bids: Bid[];
  phase: AuctionPhase;
}
