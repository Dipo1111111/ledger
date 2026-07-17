import { useState } from 'react';
import type { GameState } from '@ledger/common';
import { calculateNetWorth, calculateIncome } from '@ledger/common';
import { useLobbyStore } from '../store/lobby-store';
import { useGameStore } from '../store/game-store';
import { getSocket } from '../lib/socket';
import { SocketEvents } from '@ledger/common';
import { IconTrophy, IconTarget } from '../components/common/Icons';

export interface EndScreenProps {
  gameState: GameState;
}

/**
 * End-of-game screen showing winner, final standings, match stats,
 * and options to play again or return to the lobby.
 */
export function EndScreen({ gameState }: EndScreenProps) {
  const roomCode = useLobbyStore((s) => s.roomCode);
  const myPlayerId = useLobbyStore((s) => s.playerId);
  const [leaving, setLeaving] = useState(false);

  const winner = gameState.winnerId
    ? gameState.players.find((p) => p.id === gameState.winnerId)
    : null;

  const isWinner = winner?.id === myPlayerId;

  // Final standings — sort all players by net worth descending
  const standings = [...gameState.players]
    .map((p) => ({
      ...p,
      netWorth: p.isEliminated ? 0 : calculateNetWorth(p),
    }))
    .sort((a, b) => b.netWorth - a.netWorth);

  // Stats
  const elapsed = Math.floor((Date.now() - gameState.startedAt) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const totalRounds = gameState.roundNumber;

  const handlePlayAgain = () => {
    // Leave the old game and go back to lobby
    useLobbyStore.getState().reset();
    useGameStore.getState().reset();
    window.location.reload();
  };

  const handleLeave = () => {
    setLeaving(true);
    getSocket().emit(SocketEvents.LEAVE_ROOM);
    import('../lib/socket').then(({ clearSessionToken }) => clearSessionToken());
    useLobbyStore.getState().reset();
    useGameStore.getState().reset();
  };

  if (leaving) {
    return (
      <div className="felt-bg min-h-screen flex items-center justify-center">
        <p className="text-text-muted text-lg">Leaving game...</p>
      </div>
    );
  }

  return (
    <div className="felt-bg min-h-screen flex items-center justify-center p-4 sm:p-6 safe-area-top safe-area-bottom">
      <div className="max-w-lg w-full">
        {/* Winner announcement */}
        <div className="panel-glass p-5 sm:p-8 text-center mb-5 sm:mb-6">
          <span className="block mb-3 sm:mb-4 flex justify-center"><IconTrophy size={48} className="text-gold" /></span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gold mb-2">
            {winner ? `${winner.name} Wins!` : 'Game Over'}
          </h1>
          {isWinner && (
            <p className="text-text-secondary text-sm mb-4">
              Your empire stands supreme. All bow before your financial dominance.
            </p>
          )}
          {winner && (
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3 sm:mt-4 text-sm">
              <div className="text-center">
                <div className="text-gold font-bold text-base sm:text-lg">{winner.lc}</div>
                <div className="text-text-muted text-[0.5rem] sm:text-[0.55rem] uppercase tracking-wider">Final LC</div>
              </div>
              <div className="w-px h-8 sm:h-10 bg-cream/10" />
              <div className="text-center">
                <div className="text-text font-bold text-base sm:text-lg">{winner.assets.length}</div>
                <div className="text-text-muted text-[0.5rem] sm:text-[0.55rem] uppercase tracking-wider">Assets</div>
              </div>
              <div className="w-px h-8 sm:h-10 bg-cream/10" />
              <div className="text-center">
                <div className="text-text font-bold text-base sm:text-lg">{calculateNetWorth(winner)}</div>
                <div className="text-text-muted text-[0.5rem] sm:text-[0.55rem] uppercase tracking-wider">Net Worth</div>
              </div>
            </div>
          )}
        </div>

        {/* Final Standings */}
        <div className="panel-glass p-3 sm:p-4 mb-5 sm:mb-6">
          <div className="ornament mb-3">
            <span className="font-serif text-sm font-bold text-gold tracking-wide">Final Standings</span>
          </div>
          <div className="space-y-1">
            {standings.map((p, i) => {
              const isMe = p.id === myPlayerId;
              const isWin = p.id === winner?.id;
              const rankSvg = (n: number) => n === 0 ? '1st' : n === 1 ? '2nd' : '3rd';

              return (
                <div
                  key={p.id}
                  className={`
                    flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg
                    ${isWin ? 'bg-gold/10 border border-gold/20' : ''}
                    ${isMe && !isWin ? 'bg-felt-light/30 border border-cream/5' : ''}
                  `}
                >
                  {/* Rank */}
                  <span className="text-base sm:text-lg w-5 sm:w-6 text-center shrink-0">
                    {i < 3 ? rankSvg(i) : `#${i + 1}`}
                  </span>

                  {/* Avatar */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/15 flex items-center justify-center font-semibold text-[0.6rem] sm:text-xs text-text shrink-0 bg-black/10">
                    {p.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[0.65rem] sm:text-[0.7rem] font-semibold truncate ${isMe ? 'text-gold' : 'text-text'}`}>
                        {p.name}
                      </span>
                      {p.isEliminated && (
                        <span className="tag tag-eliminated text-[0.5rem]">Eliminated</span>
                      )}
                    </div>
                    <div className="text-[0.45rem] sm:text-[0.5rem] text-text-muted">
                      LC: {p.lc} · Assets: {p.assets.length} · Net Worth: {p.netWorth}
                    </div>
                  </div>

                  {/* Rank badge */}
                  <div className="text-[0.5rem] sm:text-[0.6rem] font-semibold text-text-muted/50">
                    {i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `${i + 1}th`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Match Stats */}
        <div className="panel-glass p-3 sm:p-4 mb-5 sm:mb-6">
          <div className="ornament mb-3">
            <span className="font-serif text-sm font-bold text-gold tracking-wide">Match Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-[0.55rem] sm:text-[0.6rem]">
            <div className="flex flex-col gap-1 p-2 rounded-lg bg-felt-dark/30">
              <span className="text-text-muted uppercase tracking-wider">Duration</span>
              <span className="text-text font-semibold">{minutes}m {seconds}s</span>
            </div>
            <div className="flex flex-col gap-1 p-2 rounded-lg bg-felt-dark/30">
              <span className="text-text-muted uppercase tracking-wider">Rounds</span>
              <span className="text-text font-semibold">{totalRounds}</span>
            </div>
            <div className="flex flex-col gap-1 p-2 rounded-lg bg-felt-dark/30">
              <span className="text-text-muted uppercase tracking-wider">Players</span>
              <span className="text-text font-semibold">{gameState.players.length}</span>
            </div>
            <div className="flex flex-col gap-1 p-2 rounded-lg bg-felt-dark/30">
              <span className="text-text-muted uppercase tracking-wider">Eliminated</span>
              <span className="text-text font-semibold">{gameState.players.filter((p) => p.isEliminated).length}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handlePlayAgain}
            className="
              px-6 py-3.5 sm:py-3 rounded-lg text-sm font-semibold
              bg-gold-dark text-stone-900 border border-gold
              hover:bg-gold active:bg-gold-dark
              transition-all duration-150 min-h-[48px] sm:min-h-0
            "
          >
            Play Again
          </button>
          <button
            onClick={handleLeave}
            className="
              px-6 py-3.5 sm:py-3 rounded-lg text-sm font-semibold
              bg-felt-dark/50 text-text-muted border border-cream/10
              hover:bg-felt-dark hover:text-text
              transition-all duration-150 min-h-[48px] sm:min-h-0
            "
          >
            Leave Game
          </button>
        </div>
      </div>
    </div>
  );
}
