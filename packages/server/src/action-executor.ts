import type {
  GameState,
  PlayerAction,
  OwnedAsset,
  LoanContract,
  InvestmentContract,
  InvestmentOffer,
  TakeoverState,
  AuctionState,
  AssetType,
} from '@ledger/common';
import {
  ASSET_DEFINITIONS,
  ASSET_TYPES,
  LOAN_INTEREST_RATE,
  LOAN_TERM_ROUNDS,
  TAKEOVER_FILING_FEE,
  TAKEOVER_REWARD_LC,
  EXPANSION_CONTRIBUTION,
  EXPANSION_MARKET_BATCH,
} from '@ledger/common';
import { calculateTakeoverReserve } from '@ledger/common';

/* ─── Helpers ─── */

function genId(): string {
  return crypto.randomUUID();
}

function findPlayer(state: GameState, playerId: string) {
  return state.players.find((p) => p.id === playerId)!;
}

function addLog(state: GameState, playerId: string | null, message: string): void {
  state.logs.push({
    round: state.roundNumber,
    playerId,
    message,
    timestamp: Date.now(),
  });
}

/* ─── Individual Action Executors ─── */

export function executeBuyAsset(state: GameState, playerId: string, assetType: AssetType): void {
  const player = findPlayer(state, playerId);
  const def = ASSET_DEFINITIONS[assetType];

  player.lc -= def.purchasePrice;

  const asset: OwnedAsset = {
    id: genId(),
    type: assetType,
    ownerId: playerId,
  };
  player.assets.push(asset);
  state.market[assetType]--;

  addLog(state, playerId, `${player.name} bought ${assetType.toUpperCase()} for ${def.purchasePrice} LC`);
}

export function executeSellAsset(state: GameState, playerId: string, assetId: string): void {
  const player = findPlayer(state, playerId);
  const idx = player.assets.findIndex((a) => a.id === assetId);
  if (idx === -1) return; // should not happen after validation

  const asset = player.assets[idx];
  const def = ASSET_DEFINITIONS[asset.type];

  player.lc += def.purchasePrice;
  player.assets.splice(idx, 1);
  state.market[asset.type]++;

  addLog(state, playerId, `${player.name} sold ${asset.type.toUpperCase()} for ${def.purchasePrice} LC`);
}

export function executePrivateSell(
  state: GameState,
  playerId: string,
  assetId: string,
  buyerId: string,
  price: number,
): void {
  const seller = findPlayer(state, playerId);
  const buyer = findPlayer(state, buyerId);

  const idx = seller.assets.findIndex((a) => a.id === assetId);
  if (idx === -1) return;

  const asset = seller.assets[idx];

  // Remove from seller
  seller.assets.splice(idx, 1);

  // Transfer LC from buyer to seller
  buyer.lc -= price;
  seller.lc += price;

  // Give asset to buyer (new owner)
  const transferred: OwnedAsset = {
    id: asset.id,
    type: asset.type,
    ownerId: buyerId,
  };
  buyer.assets.push(transferred);

  addLog(state, playerId, `${seller.name} sold ${asset.type.toUpperCase()} to ${buyer.name} for ${price} LC`);
}

export function executeBorrow(state: GameState, playerId: string, amount: number): void {
  const player = findPlayer(state, playerId);

  player.lc += amount;

  const contract: LoanContract = {
    id: genId(),
    type: 'loan',
    borrowerId: playerId,
    amount,
    interestRate: LOAN_INTEREST_RATE,
    repaymentAmount: Math.round(amount * (1 + LOAN_INTEREST_RATE)),
    deadlineRound: state.roundNumber + LOAN_TERM_ROUNDS,
    createdAtRound: state.roundNumber,
    isDefaulted: false,
    isRepaid: false,
  };
  player.loans.push(contract);

  addLog(state, playerId, `${player.name} borrowed ${amount} LC (repay ${contract.repaymentAmount} by round ${contract.deadlineRound})`);
}

export function executeRepayLoan(state: GameState, playerId: string, contractId: string, amount: number): void {
  const player = findPlayer(state, playerId);
  const contract = player.loans.find((l) => l.id === contractId);
  if (!contract) return; // should not happen after validation

  const remaining = contract.repaymentAmount - (contract.isRepaid ? contract.repaymentAmount : 0);
  const payAmount = Math.min(amount, remaining);

  player.lc -= payAmount;

  if (payAmount >= contract.repaymentAmount) {
    contract.isRepaid = true;
    addLog(state, playerId, `${player.name} fully repaid loan (${contract.repaymentAmount} LC)`);
  } else {
    addLog(state, playerId, `${player.name} repaid ${payAmount} LC toward loan`);
  }
}

export function executeProposeInvestment(
  state: GameState,
  playerId: string,
  targetPlayerId: string,
  amount: number,
  repaymentAmount: number,
  deadlineRound: number,
): void {
  const investor = findPlayer(state, playerId);
  const receiver = findPlayer(state, targetPlayerId);

  const offer: InvestmentOffer = {
    id: genId(),
    investorId: playerId,
    receiverId: targetPlayerId,
    amount,
    repaymentAmount,
    deadlineRound,
    createdAtRound: state.roundNumber,
  };
  state.investmentOffers.push(offer);

  addLog(state, playerId, `${investor.name} proposed investing ${amount} LC in ${receiver.name} (awaiting acceptance)`);
}

export function executeAcceptInvestment(state: GameState, offerId: string): void {
  const offerIdx = state.investmentOffers.findIndex((o) => o.id === offerId);
  if (offerIdx === -1) return;
  const offer = state.investmentOffers[offerIdx];

  const investor = findPlayer(state, offer.investorId);
  const receiver = findPlayer(state, offer.receiverId);

  // Transfer money
  investor.lc -= offer.amount;
  receiver.lc += offer.amount;

  // Create the permanent contract
  const contract: InvestmentContract = {
    id: genId(),
    type: 'investment',
    investorId: offer.investorId,
    receiverId: offer.receiverId,
    amount: offer.amount,
    repaymentAmount: offer.repaymentAmount,
    deadlineRound: offer.deadlineRound,
    createdAtRound: offer.createdAtRound,
    isDefaulted: false,
    isRepaid: false,
  };
  investor.investments.push(contract);
  receiver.investments.push(contract);

  // Remove the offer
  state.investmentOffers.splice(offerIdx, 1);

  addLog(state, offer.investorId, `${receiver.name} accepted ${investor.name}'s investment of ${offer.amount} LC`);
}

export function executeDeclineInvestment(state: GameState, offerId: string): void {
  const offerIdx = state.investmentOffers.findIndex((o) => o.id === offerId);
  if (offerIdx === -1) return;
  const offer = state.investmentOffers[offerIdx];

  const receiver = findPlayer(state, offer.receiverId);
  const investor = findPlayer(state, offer.investorId);

  state.investmentOffers.splice(offerIdx, 1);

  addLog(state, offer.investorId, `${receiver.name} declined ${investor.name}'s investment proposal`);
}

/* ─── Takeover Executors ─── */

export function executeInitiateTakeover(
  state: GameState,
  playerId: string,
  targetPlayerId: string,
): void {
  const attacker = findPlayer(state, playerId);
  const defender = findPlayer(state, targetPlayerId);

  // Deduct the filing fee
  attacker.lc -= TAKEOVER_FILING_FEE;

  const requiredReserve = calculateTakeoverReserve(defender);

  state.activeTakeover = {
    attackerId: playerId,
    defenderId: targetPlayerId,
    phase: 'defense',
    requiredReserve,
    currentProgress: defender.lc,
    defenseDeadlineRound: state.roundNumber + 1,
    resolutionRound: null,
  };

  addLog(
    state,
    playerId,
    `${attacker.name} initiated a hostile takeover of ${defender.name} (${TAKEOVER_FILING_FEE} LC filing fee paid)`,
  );
}

/* ─── Auction Executors ─── */

export function executeCreateAuction(
  state: GameState,
  playerId: string,
  assetId: string,
  startingBid: number,
  minimumBid: number,
): void {
  const player = findPlayer(state, playerId);
  const asset = player.assets.find((a) => a.id === assetId)!;
  const def = ASSET_DEFINITIONS[asset.type];

  state.activeAuction = {
    id: genId(),
    sellerId: playerId,
    assetId,
    assetType: asset.type,
    startingBid,
    minimumBid,
    currentBid: null,
    highestBidderId: null,
    bids: [],
    phase: 'active',
  };

  addLog(state, playerId, `${player.name} started auction for ${asset.type.toUpperCase()} (starting at ${startingBid} LC)`);
}

export function executeConfirmAuction(state: GameState, _playerId: string): void {
  const auction = state.activeAuction!;
  const seller = findPlayer(state, auction.sellerId);
  const buyer = findPlayer(state, auction.highestBidderId!);
  const finalPrice = auction.currentBid!;

  // Find the asset in seller's hand
  const idx = seller.assets.findIndex((a) => a.id === auction.assetId);
  if (idx === -1) {
    // Asset vanished — cancel auction silently
    state.activeAuction = null;
    return;
  }

  const asset = seller.assets[idx];

  // Transfer asset to buyer
  const transferred: OwnedAsset = {
    id: asset.id,
    type: asset.type,
    ownerId: auction.highestBidderId!,
  };
  seller.assets.splice(idx, 1);
  buyer.assets.push(transferred);

  // Transfer LC from buyer to seller
  buyer.lc -= finalPrice;
  seller.lc += finalPrice;

  state.activeAuction = {
    ...auction,
    phase: 'completed',
  };

  addLog(state, auction.sellerId, `${seller.name} sold ${asset.type.toUpperCase()} to ${buyer.name} for ${finalPrice} LC (auction)`);
}

export function executeCancelAuction(state: GameState, _playerId: string): void {
  const auction = state.activeAuction!;
  const seller = findPlayer(state, auction.sellerId);

  state.activeAuction = {
    ...auction,
    phase: 'cancelled',
  };

  addLog(state, auction.sellerId, `${seller.name} cancelled the auction for their asset`);
}

export function executePlaceBid(state: GameState, playerId: string, amount: number): void {
  const auction = state.activeAuction!;
  const player = findPlayer(state, playerId);

  auction.currentBid = amount;
  auction.highestBidderId = playerId;
  auction.bids.push({
    playerId,
    amount,
    timestamp: Date.now(),
  });

  addLog(state, playerId, `${player.name} bid ${amount} LC on auction`);
}

/* ─── Elimination ─── */

/**
 * Centralized elimination handler. Called when a player is removed from the game
 * by any means (insolvency, loan default, takeover, surrender).
 *
 * - Liquidates all remaining assets to the market
 * - Defaults all active loans and investments
 * - Cancels any active auction/takeover involving this player
 * - Removes any pending investment offers
 *
 * Does NOT handle takeover-specific rewards (attacker gets best asset + LC reward)
 * — the takeover executor handles that before calling this for cleanup.
 */
export function eliminatePlayer(state: GameState, playerId: string, reason: string): void {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.isEliminated) return;

  player.isEliminated = true;
  player.lc = 0;

  // Liquidate remaining assets to the market
  for (const asset of [...player.assets]) {
    state.market[asset.type]++;
  }
  player.assets = [];

  // Default all active loans
  for (const loan of player.loans) {
    if (!loan.isRepaid && !loan.isDefaulted) {
      loan.isDefaulted = true;
    }
  }

  // Default all active investments (shared contract — both sides)
  for (const inv of player.investments) {
    if (!inv.isRepaid && !inv.isDefaulted) {
      inv.isDefaulted = true;
    }
  }

  // Remove investment offers involving this player
  state.investmentOffers = state.investmentOffers.filter((o) => {
    if (o.investorId === playerId || o.receiverId === playerId) {
      return false;
    }
    return true;
  });

  // Cancel active auction if this player is the seller or highest bidder
  if (
    state.activeAuction &&
    (state.activeAuction.sellerId === playerId ||
      state.activeAuction.highestBidderId === playerId)
  ) {
    state.activeAuction = {
      ...state.activeAuction,
      phase: 'cancelled',
    };
  }

  // Cancel active takeover if this player is involved
  if (
    state.activeTakeover &&
    (state.activeTakeover.attackerId === playerId ||
      state.activeTakeover.defenderId === playerId)
  ) {
    state.activeTakeover = null;
  }

  addLog(state, playerId, `${player.name} eliminated — ${reason}`);
}

/* ─── Surrender ─── */

export function executeSurrender(state: GameState, playerId: string): void {
  eliminatePlayer(state, playerId, 'surrendered');
}

/* ─── Corporate Expansion ─── */

export function executeRequestExpansion(state: GameState, playerId: string): void {
  const player = findPlayer(state, playerId);

  state.expansionVotes = {
    requestedBy: playerId,
    votes: { [playerId]: 'yes' },
    isResolved: false,
    passes: false,
  };

  addLog(state, playerId, `${player.name} called for Corporate Expansion — vote begins!`);
}

export function executeVoteExpansion(state: GameState, playerId: string, vote: 'yes' | 'no'): void {
  const player = findPlayer(state, playerId);
  const votes = state.expansionVotes!;

  votes.votes[playerId] = vote;

  addLog(state, playerId, `${player.name} voted ${vote.toUpperCase()} on Corporate Expansion`);

  // Check if all alive players have voted
  const alivePlayers = state.players.filter((p) => !p.isEliminated);
  const allVoted = alivePlayers.every((p) => votes.votes[p.id]);

  if (!allVoted) return;

  // Resolve the vote
  votes.isResolved = true;
  const yesCount = alivePlayers.filter((p) => votes.votes[p.id] === 'yes').length;
  votes.passes = yesCount > alivePlayers.length / 2;

  if (votes.passes) {
    // Collect contribution from YES voters
    for (const p of alivePlayers) {
      if (votes.votes[p.id] === 'yes') {
        p.lc -= EXPANSION_CONTRIBUTION;
      }
    }

    // Add expansion batch to the market
    for (const type of ASSET_TYPES) {
      state.market[type] += EXPANSION_MARKET_BATCH[type];
    }

    state.expansionsUsed++;

    const yayVoters = alivePlayers.filter((p) => votes.votes[p.id] === 'yes').map((p) => p.name).join(', ');
    addLog(state, null, `Corporate Expansion PASSED! ${EXPANSION_CONTRIBUTION} LC collected from: ${yayVoters}`);
    addLog(state, null, `New assets available: +${EXPANSION_MARKET_BATCH.jack} Jacks, +${EXPANSION_MARKET_BATCH.queen} Queens, +${EXPANSION_MARKET_BATCH.king} Kings, +${EXPANSION_MARKET_BATCH.ace} Ace`);
  } else {
    addLog(state, null, 'Corporate Expansion REJECTED — not enough votes');
  }
}

/* ─── Dispatcher ─── */

/**
 * Apply a validated player action to the game state.
 * Mutates `state` in place — no deep clone.
 */
export function executeAction(state: GameState, playerId: string, action: PlayerAction): void {
  switch (action.type) {
    case 'buy_asset':
      return executeBuyAsset(state, playerId, action.assetType);
    case 'sell_asset':
      if (action.buyerId && action.price) {
        return executePrivateSell(state, playerId, action.assetId, action.buyerId, action.price);
      }
      return executeSellAsset(state, playerId, action.assetId);
    case 'borrow':
      return executeBorrow(state, playerId, action.amount);
    case 'repay_loan':
      return executeRepayLoan(state, playerId, action.contractId, action.amount);
    case 'propose_investment':
      return executeProposeInvestment(
        state,
        playerId,
        action.targetPlayerId,
        action.amount,
        action.repaymentAmount,
        action.deadlineRound,
      );
    case 'respond_investment':
      if (action.accept) {
        return executeAcceptInvestment(state, action.offerId);
      }
      return executeDeclineInvestment(state, action.offerId);
    case 'create_auction':
      return executeCreateAuction(state, playerId, action.assetId, action.startingBid, action.minimumBid);
    case 'confirm_auction':
      return executeConfirmAuction(state, playerId);
    case 'cancel_auction':
      return executeCancelAuction(state, playerId);
    case 'place_bid':
      return executePlaceBid(state, playerId, action.amount);
    case 'initiate_takeover':
      return executeInitiateTakeover(state, playerId, action.targetPlayerId);
    case 'surrender':
      return executeSurrender(state, playerId);
    case 'request_expansion':
      return executeRequestExpansion(state, playerId);
    case 'vote_expansion':
      return executeVoteExpansion(state, playerId, action.vote);
    /* end_turn is handled by the engine directly */
    default:
      break;
  }
}
