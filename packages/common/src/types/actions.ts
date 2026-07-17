import type { AssetType } from './asset';

export type PlayerAction =
  | { type: 'buy_asset'; assetType: AssetType }
  | { type: 'sell_asset'; assetId: string; buyerId?: string; price?: number }
  | { type: 'borrow'; amount: number }
  | { type: 'repay_loan'; contractId: string; amount: number }
  | { type: 'propose_investment'; targetPlayerId: string; amount: number; repaymentAmount: number; deadlineRound: number }
  | { type: 'respond_investment'; offerId: string; accept: boolean }
  | { type: 'initiate_takeover'; targetPlayerId: string }
  | { type: 'create_auction'; assetId: string; startingBid: number; minimumBid: number }
  | { type: 'confirm_auction'; auctionId: string }
  | { type: 'place_bid'; auctionId: string; amount: number }
  | { type: 'cancel_auction'; auctionId: string }
  | { type: 'request_expansion' }
  | { type: 'vote_expansion'; vote: 'yes' | 'no' }
  | { type: 'surrender' }
  | { type: 'end_turn' };
