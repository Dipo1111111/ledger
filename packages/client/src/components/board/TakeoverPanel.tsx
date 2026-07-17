import type { TakeoverState } from '@ledger/common';
import { useGameStore } from '../../store/game-store';
import { useLobbyStore } from '../../store/lobby-store';
import { IconSwords } from '../common/Icons';

export interface TakeoverPanelProps {
  takeover: TakeoverState;
}

/**
 * Live takeover status panel shown when a hostile takeover is in progress.
 * All players can see the attacker, defender, required reserve, and current progress.
 * The defender's current LC is read live from the game state, not the stored value.
 */
export function TakeoverPanel({ takeover }: TakeoverPanelProps) {
  const gameState = useGameStore((s) => s.gameState);
  const playerId = useLobbyStore((s) => s.playerId);

  const attacker = gameState?.players.find((p) => p.id === takeover.attackerId);
  const defender = gameState?.players.find((p) => p.id === takeover.defenderId);
  const isDefender = playerId === takeover.defenderId;

  // Use the live defender LC from game state, falling back to stored currentProgress
  const defenderLC = defender?.lc ?? takeover.currentProgress;
  const progressPct = takeover.requiredReserve > 0
    ? Math.min(100, Math.round((defenderLC / takeover.requiredReserve) * 100))
    : 0;

  const isResolved = takeover.phase === 'succeeded' || takeover.phase === 'failed';

  return (
    <div className={`panel p-4 ${isResolved ? 'panel' : 'panel-gold'}`}>
      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-danger"><IconSwords size={16} /></span>
          <span className="font-serif text-sm font-bold text-gold tracking-wide">
            {isResolved ? 'Takeover Resolved' : 'Hostile Takeover'}
          </span>
        </div>
        <span className={`text-[0.45rem] uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${
          takeover.phase === 'succeeded'
            ? 'text-danger border-danger/30 bg-danger/10'
            : takeover.phase === 'failed'
              ? 'text-success border-success/30 bg-success/10'
              : 'text-warning border-warning/30 bg-warning/10'
        }`}>
          {takeover.phase}
        </span>
      </div>

      {/* Players involved */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <div className="text-center flex-1">
          <div className="text-[0.55rem] text-text-muted uppercase tracking-wider mb-1">Attacker</div>
          <div className="font-bold text-danger">{attacker?.name ?? 'Unknown'}</div>
        </div>
        <div className="text-text-muted px-3"><IconSwords size={20} /></div>
        <div className="text-center flex-1">
          <div className="text-[0.55rem] text-text-muted uppercase tracking-wider mb-1">Defender</div>
          <div className={`font-bold ${isDefender ? 'text-gold' : 'text-text'}`}>
            {defender?.name ?? 'Unknown'}
            {isDefender && <span className="text-[0.45rem] text-gold ml-1">(You)</span>}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {!isResolved && (
        <div className="mb-3">
          <div className="flex justify-between text-[0.55rem] text-text-muted mb-1">
            <span>Required Reserve</span>
            <span>{defenderLC} / {takeover.requiredReserve} LC</span>
          </div>
          <div className="h-2 rounded-full bg-felt-dark/60 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPct >= 100 ? 'bg-success' : 'bg-warning'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Outcome (resolved) */}
      {isResolved && (
        <div className={`rounded-lg p-3 mb-2 text-center ${
          takeover.phase === 'succeeded'
            ? 'bg-danger/10 border border-danger/20'
            : 'bg-success/10 border border-success/20'
        }`}>
          <p className={`text-sm font-bold ${
            takeover.phase === 'succeeded' ? 'text-danger' : 'text-success'
          }`}>
            {takeover.phase === 'succeeded'
              ? `${attacker?.name ?? 'Attacker'} won — ${defender?.name ?? 'Defender'} eliminated`
              : `${defender?.name ?? 'Defender'} survived the takeover attempt`
            }
          </p>
        </div>
      )}

      {/* Deadline */}
      {!isResolved && (
        <div className="text-[0.5rem] text-text-muted text-center">
          Deadline: Round {takeover.defenseDeadlineRound}
        </div>
      )}
    </div>
  );
}
