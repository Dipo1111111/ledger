import type { ExpansionVotes, Player } from '@ledger/common';
import { EXPANSION_CONTRIBUTION, SocketEvents } from '@ledger/common';
import { getSocket } from '../../lib/socket';
import { useGameStore } from '../../store/game-store';
import { useLobbyStore } from '../../store/lobby-store';
import { IconBuilding, IconCheck, IconX } from '../common/Icons';

export interface ExpansionVotePanelProps {
  expansionVotes: ExpansionVotes;
  players: Player[];
}

/**
 * Panel shown on the right column when a Corporate Expansion vote is in progress
 * or has been resolved. Matches the visual style of AuctionPanel / TakeoverPanel.
 */
export function ExpansionVotePanel({ expansionVotes, players }: ExpansionVotePanelProps) {
  const gameState = useGameStore((s) => s.gameState);
  const playerId = useLobbyStore((s) => s.playerId);

  const requester = players.find((p) => p.id === expansionVotes.requestedBy);
  const isResolved = expansionVotes.isResolved;
  const passed = expansionVotes.passes;

  const myVote = playerId ? expansionVotes.votes[playerId] : undefined;
  const canVote = !isResolved && !myVote && !!playerId;

  // Tally
  const alivePlayers = players.filter((p) => !p.isEliminated);
  const yesCount = alivePlayers.filter((p) => expansionVotes.votes[p.id] === 'yes').length;
  const noCount = alivePlayers.filter((p) => expansionVotes.votes[p.id] === 'no').length;
  const totalVotes = yesCount + noCount;
  const totalAlive = alivePlayers.length;

  const handleVote = (vote: 'yes' | 'no') => {
    if (!canVote) return;
    getSocket().emit(SocketEvents.GAME_ACTION, {
      action: { type: 'vote_expansion', vote },
    });
  };

  return (
    <div className={`panel p-4 ${isResolved ? (passed ? 'panel' : 'panel') : 'panel-gold'}`}>
      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-gold"><IconBuilding size={16} /></span>
          <span className="font-serif text-sm font-bold text-gold tracking-wide">
            {isResolved ? 'Expansion Vote' : 'Corporate Expansion'}
          </span>
        </div>
        <span className={`text-[0.45rem] uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${
          isResolved
            ? passed
              ? 'text-success border-success/30 bg-success/10'
              : 'text-danger border-danger/30 bg-danger/10'
            : 'text-warning border-warning/30 bg-warning/10'
        }`}>
          {isResolved ? (passed ? 'Passed' : 'Rejected') : 'Voting'}
        </span>
      </div>

      {/* Who requested */}
      <div className="bg-felt-dark/60 rounded-lg p-3 mb-3">
        <div className="text-[0.55rem] text-text-muted mb-1">
          Requested by <span className="font-semibold text-text">{requester?.name ?? 'Unknown'}</span>
        </div>
        <div className="text-[0.5rem] text-text-muted">
          YES voters pay {EXPANSION_CONTRIBUTION} LC each · NO voters pay nothing
        </div>
      </div>

      {/* Vote progress — bars when active, outcome when resolved */}
      {isResolved ? (
        <div className={`rounded-lg p-3 mb-3 text-center ${
          passed
            ? 'bg-success/10 border border-success/20'
            : 'bg-danger/10 border border-danger/20'
        }`}>
          <p className={`text-sm font-bold ${passed ? 'text-success' : 'text-danger'}`}>
            {passed
              ? 'Corporate Expansion passed! New assets available.'
              : 'Corporate Expansion was rejected.'}
          </p>
          {passed && (
            <p className="text-xs text-text-muted mt-1">
              +4 Jacks · +3 Queens · +2 Kings · +1 Ace added to market
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Vote tally bar */}
          <div className="mb-3">
            <div className="flex justify-between text-[0.55rem] text-text-muted mb-1">
              <span className="text-success font-medium">{yesCount} YES</span>
              <span className="text-text-muted">{totalVotes}/{totalAlive} voted</span>
              <span className="text-danger font-medium">{noCount} NO</span>
            </div>
            <div className="h-2 rounded-full bg-felt-dark/60 overflow-hidden flex">
              {totalVotes > 0 && (
                <>
                  <div
                    className="bg-success/70 h-full transition-all duration-500"
                    style={{ width: `${(yesCount / totalAlive) * 100}%` }}
                  />
                  <div
                    className="bg-danger/70 h-full transition-all duration-500"
                    style={{ width: `${(noCount / totalAlive) * 100}%` }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Vote buttons */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => handleVote('yes')}
              disabled={!canVote}
              className={`
                flex-1 py-2 rounded-lg text-sm font-semibold
                transition-all duration-150
                ${myVote === 'yes'
                  ? 'bg-success text-white border border-success'
                  : 'border border-cream/15 text-text-secondary hover:text-text hover:bg-white/5'
                }
                disabled:opacity-40 disabled:cursor-not-allowed
              `}
            >
              {myVote === 'yes' ? <span className="inline-flex items-center gap-1"><IconCheck size={12} /> Voted YES</span> : 'Vote YES'}
            </button>
            <button
              onClick={() => handleVote('no')}
              disabled={!canVote}
              className={`
                flex-1 py-2 rounded-lg text-sm font-semibold
                transition-all duration-150
                ${myVote === 'no'
                  ? 'bg-danger text-white border border-danger'
                  : 'border border-cream/15 text-text-secondary hover:text-text hover:bg-white/5'
                }
                disabled:opacity-40 disabled:cursor-not-allowed
              `}
            >
              {myVote === 'no' ? <span className="inline-flex items-center gap-1"><IconX size={12} /> Voted NO</span> : 'Vote NO'}
            </button>
          </div>

          {/* Cost reminder */}
          <div className="text-[0.5rem] text-text-muted text-center">
            YES = pay {EXPANSION_CONTRIBUTION} LC · NO = pay nothing
          </div>
        </>
      )}

      {/* Voter list */}
      {totalVotes > 0 && (
        <div className="mt-3 border-t border-cream/10 pt-2 space-y-1">
          {alivePlayers.map((p) => {
            const vote = expansionVotes.votes[p.id];
            if (!vote) return null;
            return (
              <div key={p.id} className="flex justify-between text-[0.55rem] text-text-muted">
                <span className={p.id === playerId ? 'text-gold font-semibold' : ''}>
                  {p.name}
                </span>
                <span className={`font-semibold ${
                  vote === 'yes' ? 'text-success' : 'text-danger'
                }`}>
                  {vote === 'yes' ? 'YES' : 'NO'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
