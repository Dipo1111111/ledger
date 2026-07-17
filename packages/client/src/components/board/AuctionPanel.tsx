import { useState } from 'react';
import type { AuctionState } from '@ledger/common';
import { ASSET_DEFINITIONS, SocketEvents } from '@ledger/common';
import { getSocket } from '../../lib/socket';
import { useGameStore, selectMyPlayer } from '../../store/game-store';
import { useLobbyStore } from '../../store/lobby-store';
import { IconHammer } from '../common/Icons';

export interface AuctionPanelProps {
  auction: AuctionState;
}

/**
 * Live auction panel shown when an auction is active.
 * Shows the asset being auctioned, current highest bid,
 * and allows non-seller players to place bids.
 */
export function AuctionPanel({ auction }: AuctionPanelProps) {
  const gameState = useGameStore((s) => s.gameState);
  const playerId = useLobbyStore((s) => s.playerId);
  const myPlayer = selectMyPlayer(gameState, playerId);

  const isSeller = playerId === auction.sellerId;
  const isHighestBidder = playerId === auction.highestBidderId;
  const canBid = !isSeller && myPlayer && !myPlayer.isEliminated;

  const [bidAmount, setBidAmount] = useState(
    (auction.currentBid ?? auction.startingBid) + 5,
  );
  const minNextBid = (auction.currentBid ?? auction.startingBid) + 1;
  const def = ASSET_DEFINITIONS[auction.assetType];
  const seller = gameState?.players.find((p) => p.id === auction.sellerId);
  const highestBidder = auction.highestBidderId
    ? gameState?.players.find((p) => p.id === auction.highestBidderId)
    : null;

  const handlePlaceBid = () => {
    if (!canBid || bidAmount < minNextBid) return;
    getSocket().emit(SocketEvents.AUCTION_PLACE_BID, {
      auctionId: auction.id,
      amount: bidAmount,
    });
  };

  const handleConfirm = () => {
    if (!isSeller) return;
    getSocket().emit(SocketEvents.GAME_ACTION, {
      action: { type: 'confirm_auction', auctionId: auction.id },
    });
  };

  const handleCancel = () => {
    if (!isSeller) return;
    getSocket().emit(SocketEvents.GAME_ACTION, {
      action: { type: 'cancel_auction', auctionId: auction.id },
    });
  };

  const bidCount = auction.bids.length;

  return (
    <div className="panel panel-gold p-4">
      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-gold"><IconHammer size={16} /></span>
          <span className="font-serif text-sm font-bold text-gold tracking-wide">Live Auction</span>
        </div>
        <span className="text-[0.5rem] text-text-muted uppercase tracking-wider">
          {bidCount} bid{bidCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Asset info */}
      <div className="bg-felt-dark/60 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="capitalize font-bold text-sm text-text">{auction.assetType}</span>
          <span className="text-[0.55rem] text-text-muted">Value: {def.purchasePrice} LC</span>
        </div>
        <div className="text-[0.55rem] text-text-muted">
          Seller: <span className="font-semibold text-text">{seller?.name ?? 'Unknown'}</span>
        </div>
      </div>

      {/* Current bid display */}
      <div className="text-center mb-4">
        <div className="text-[0.55rem] text-text-muted uppercase tracking-wider mb-1">
          {auction.currentBid ? 'Current Bid' : 'Starting Bid'}
        </div>
        <div className="text-3xl font-extrabold text-gold tabular-nums">
          {auction.currentBid ?? auction.startingBid}
          <span className="text-sm text-text-muted ml-1 font-medium">LC</span>
        </div>
        {highestBidder && (
          <div className="text-[0.55rem] text-text-muted mt-1">
            by {isHighestBidder ? 'You' : highestBidder.name}
          </div>
        )}
      </div>

      {/* Bid controls (for non-sellers) */}
      {canBid && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <button
              onClick={() => setBidAmount((a) => Math.max(minNextBid, a - 5))}
              disabled={bidAmount <= minNextBid}
              className="
                w-8 h-8 flex items-center justify-center rounded-lg
                border border-cream/15 text-base font-bold text-text
                hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed
                transition-all
              "
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-xl font-extrabold text-gold tabular-nums">{bidAmount}</span>
              <span className="text-xs text-text-muted ml-1">LC</span>
            </div>
            <button
              onClick={() => setBidAmount((a) => Math.min(myPlayer?.lc ?? 999, a + 5))}
              disabled={bidAmount >= (myPlayer?.lc ?? 999)}
              className="
                w-8 h-8 flex items-center justify-center rounded-lg
                border border-cream/15 text-base font-bold text-text
                hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed
                transition-all
              "
            >
              +
            </button>
          </div>
          <button
            onClick={handlePlaceBid}
            disabled={bidAmount < minNextBid || bidAmount > (myPlayer?.lc ?? 0)}
            className="
              w-full py-2 rounded-lg text-sm font-semibold
              bg-gold-dark text-stone-900 border border-gold
              hover:bg-gold hover:-translate-y-0.5 hover:shadow-btn-gold
              active:translate-y-0
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
              transition-all duration-150
            "
          >
            {myPlayer && bidAmount > myPlayer.lc
              ? `Need ${bidAmount} LC (have ${myPlayer.lc})`
              : `Bid ${bidAmount} LC`
            }
          </button>
        </div>
      )}

      {/* Seller controls */}
      {isSeller && (
        <div className="flex gap-2">
          {auction.highestBidderId ? (
            <button
              onClick={handleConfirm}
              className="
                flex-1 py-2 rounded-lg text-sm font-semibold
                bg-gold text-stone-900
                hover:brightness-110 active:brightness-90
                transition-all duration-150
              "
            >
              Confirm Sale — {auction.currentBid} LC
            </button>
          ) : (
            <p className="flex-1 text-center text-[0.6rem] text-text-muted py-2">
              Waiting for bids...
            </p>
          )}
          <button
            onClick={handleCancel}
            className="
              px-4 py-2 rounded-lg text-sm font-medium
              border border-cream/15 text-text-secondary
              hover:text-text hover:bg-white/5
              transition-all duration-150
            "
          >
            Cancel
          </button>
        </div>
      )}

      {/* Recent bids feed */}
      {bidCount > 0 && (
        <div className="mt-3 border-t border-cream/10 pt-2">
          <div className="text-[0.45rem] uppercase tracking-widest text-text-muted mb-1.5">
            Bid History
          </div>
          <div className="max-h-[100px] overflow-y-auto space-y-1">
            {[...auction.bids].reverse().slice(0, 5).map((bid, i) => {
              const bidder = gameState?.players.find((p) => p.id === bid.playerId);
              return (
                <div key={i} className="flex justify-between text-[0.55rem] text-text-muted">
                  <span>{bidder?.name ?? 'Unknown'}</span>
                  <span className="font-semibold text-text">{bid.amount} LC</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
