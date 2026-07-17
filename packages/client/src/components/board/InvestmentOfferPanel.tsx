import type { InvestmentOffer, GameState, Player } from '@ledger/common';
import { SocketEvents } from '@ledger/common';
import { getSocket } from '../../lib/socket';
import { useGameStore } from '../../store/game-store';
import { useLobbyStore } from '../../store/lobby-store';
import { IconBriefcase } from '../common/Icons';

export interface InvestmentOfferPanelProps {
  /** All pending offers (filtered to those targeting the local player in the component) */
  offers: InvestmentOffer[];
}

/**
 * Panel showing pending investment offers from other players.
 * The local player can accept or decline each offer.
 */
export function InvestmentOfferPanel({ offers }: InvestmentOfferPanelProps) {
  const gameState = useGameStore((s) => s.gameState);
  const playerId = useLobbyStore((s) => s.playerId);

  if (offers.length === 0) return null;

  const handleRespond = (offerId: string, accept: boolean) => {
    getSocket().emit(SocketEvents.GAME_ACTION, {
      action: { type: 'respond_investment', offerId, accept },
    });
  };

  return (
    <div className="panel panel-gold p-4">
      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gold"><IconBriefcase size={16} /></span>
        <span className="font-serif text-sm font-bold text-gold tracking-wide">Investment Offers</span>
        <span className="ml-auto text-[0.5rem] text-text-muted uppercase tracking-wider">
          {offers.length} pending
        </span>
      </div>

      <div className="space-y-2">
        {offers.map((offer) => {
          const investor = gameState?.players.find((p) => p.id === offer.investorId);
          return (
            <div
              key={offer.id}
              className="bg-felt-dark/60 rounded-lg p-3 border border-cream/10"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-text">
                  {investor?.name ?? 'Unknown'}
                </span>
                <span className="text-xs font-extrabold text-gold">
                  {offer.amount} <span className="text-[0.5rem] text-text-muted font-medium">LC</span>
                </span>
              </div>

              <div className="flex justify-between text-[0.55rem] text-text-muted mb-2">
                <span>Repay: <span className="font-semibold text-text">{offer.repaymentAmount} LC</span></span>
                <span>Due: Round {offer.deadlineRound}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRespond(offer.id, true)}
                  className="
                    flex-1 py-1.5 rounded-lg text-[0.6rem] font-semibold
                    bg-gold-dark text-stone-900 border border-gold
                    hover:bg-gold hover:-translate-y-0.5 hover:shadow-btn-gold
                    active:translate-y-0
                    transition-all duration-150
                  "
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRespond(offer.id, false)}
                  className="
                    px-3 py-1.5 rounded-lg text-[0.6rem] font-medium
                    border border-cream/15 text-text-secondary
                    hover:text-text hover:bg-white/5
                    transition-all duration-150
                  "
                >
                  Decline
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
