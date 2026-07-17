import type { RoundPhase } from '@ledger/common';
import { formatRoundNumber } from '../../store/game-store';

export interface TurnIndicatorProps {
  roundNumber: number;
  roundPhase: RoundPhase;
  currentPlayerName: string;
  /** Is it the local player's turn? */
  isMyTurn: boolean;
}

export function TurnIndicator({
  roundNumber,
  roundPhase,
  currentPlayerName,
  isMyTurn,
}: TurnIndicatorProps) {
  const isTaxPhase = roundPhase === 'taxes';

  return (
    <div className="flex items-center gap-3">
      {/* Turn orb */}
      <div
        className={`turn-orb ${isMyTurn ? 'pulse' : ''}`}
      />

      {/* Round number (Roman numeral) */}
      <span className="font-serif text-base font-bold text-text">
        Round {formatRoundNumber(roundNumber)}
      </span>

      <span className="text-text-muted/30 text-base">·</span>

      {/* Phase / turn info */}
      {isTaxPhase ? (
        <span className="text-warning text-base font-semibold tracking-wide uppercase">
          Tax Phase
        </span>
      ) : (
        <span className="text-text-secondary text-base">
          {isMyTurn ? (
            <span className="text-gold font-semibold">Your Turn</span>
          ) : (
            <span>
              <span className="text-text-muted">{currentPlayerName}'s</span>{' '}
              <span className="font-semibold text-text">Turn</span>
            </span>
          )}
        </span>
      )}
    </div>
  );
}
