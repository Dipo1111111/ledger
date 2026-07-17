import type { PlayerAction } from '../types/actions';
import type { GameState } from '../types/game-state';
import { canBuyAsset } from './buy-asset';
import { canSellAsset, canPrivateSell } from './sell-asset';
import { canBorrow, canRepayLoan } from './borrow';
import { canInitiateTakeover } from './takeover';
import type { ValidationResult } from './validation-result';

export function validateAction(
  playerId: string,
  action: PlayerAction,
  state: GameState,
): ValidationResult {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { valid: false, reason: 'Player not found' };

  if (player.isEliminated) {
    return { valid: false, reason: 'You have been eliminated' };
  }

  switch (action.type) {
    case 'buy_asset':
      return canBuyAsset(playerId, action.assetType, state);

    case 'sell_asset':
      if (action.buyerId && action.price) {
        return canPrivateSell(playerId, action.assetId, action.buyerId, action.price, state);
      }
      return canSellAsset(playerId, action.assetId, state);

    case 'borrow':
      return canBorrow(playerId, action.amount, state);

    case 'repay_loan':
      return canRepayLoan(playerId, action.contractId, action.amount, state);

    case 'propose_investment': {
      const target = state.players.find((p) => p.id === action.targetPlayerId);
      if (!target) return { valid: false, reason: 'Target player not found' };
      if (target.isEliminated) {
        return { valid: false, reason: 'Cannot invest in an eliminated player' };
      }
      if (action.amount <= 0) {
        return { valid: false, reason: 'Investment must be positive' };
      }
      if (player.lc < action.amount) {
        return {
          valid: false,
          reason: `Need ${action.amount} LC, have ${player.lc} LC`,
        };
      }
      // Prevent multiple pending offers to the same target
      const existing = state.investmentOffers.find(
        (o) => o.investorId === playerId && o.receiverId === action.targetPlayerId,
      );
      if (existing) {
        return { valid: false, reason: 'You already have a pending offer to this player' };
      }
      return { valid: true };
    }

    case 'respond_investment': {
      const offer = state.investmentOffers.find((o) => o.id === action.offerId);
      if (!offer) return { valid: false, reason: 'Investment offer not found' };
      if (offer.receiverId !== playerId) {
        return { valid: false, reason: 'This offer is not addressed to you' };
      }
      if (action.accept) {
        // If accepting, check investor can still afford it
        const investor = state.players.find((p) => p.id === offer.investorId);
        if (!investor || investor.isEliminated) {
          return { valid: false, reason: 'Investor is no longer available' };
        }
        if (investor.lc < offer.amount) {
          return { valid: false, reason: 'Investor no longer has enough LC' };
        }
      }
      return { valid: true };
    }

    case 'initiate_takeover':
      return canInitiateTakeover(playerId, action.targetPlayerId, state);

    case 'create_auction': {
      if (state.activeAuction) {
        return { valid: false, reason: 'An auction is already in progress' };
      }
      const asset = player.assets.find((a) => a.id === action.assetId);
      if (!asset) return { valid: false, reason: 'Asset not found' };
      if (action.startingBid < 1) {
        return { valid: false, reason: 'Starting bid must be at least 1 LC' };
      }
      if (action.minimumBid < action.startingBid) {
        return { valid: false, reason: 'Minimum bid must be at least the starting bid' };
      }
      return { valid: true };
    }

    case 'confirm_auction': {
      if (!state.activeAuction) {
        return { valid: false, reason: 'No active auction' };
      }
      if (state.activeAuction.sellerId !== playerId) {
        return { valid: false, reason: 'Only the seller can confirm the auction' };
      }
      if (state.activeAuction.phase !== 'active') {
        return { valid: false, reason: 'Auction is not active' };
      }
      if (!state.activeAuction.highestBidderId) {
        return { valid: false, reason: 'No bids have been placed' };
      }
      return { valid: true };
    }

    case 'cancel_auction': {
      if (!state.activeAuction) {
        return { valid: false, reason: 'No active auction' };
      }
      if (state.activeAuction.sellerId !== playerId) {
        return { valid: false, reason: 'Only the seller can cancel the auction' };
      }
      return { valid: true };
    }

    case 'place_bid': {
      if (!state.activeAuction) {
        return { valid: false, reason: 'No active auction' };
      }
      if (action.amount <= (state.activeAuction.currentBid ?? state.activeAuction.startingBid)) {
        return { valid: false, reason: 'Bid must exceed current highest bid' };
      }
      if (player.lc < action.amount) {
        return {
          valid: false,
          reason: `Need ${action.amount} LC, have ${player.lc} LC`,
        };
      }
      return { valid: true };
    }

    case 'request_expansion': {
      if (state.expansionsUsed >= 1) {
        return { valid: false, reason: 'Expansion already used this game' };
      }
      if (state.expansionVotes && !state.expansionVotes.isResolved) {
        return { valid: false, reason: 'Expansion vote already in progress' };
      }
      return { valid: true };
    }

    case 'vote_expansion': {
      if (!state.expansionVotes || state.expansionVotes.isResolved) {
        return { valid: false, reason: 'No active expansion vote' };
      }
      if (state.expansionVotes.votes[playerId]) {
        return { valid: false, reason: 'You have already voted' };
      }
      return { valid: true };
    }

    case 'surrender':
      return { valid: true };

    case 'end_turn':
      return { valid: true };

    default:
      return { valid: false, reason: 'Unknown action type' };
  }
}
