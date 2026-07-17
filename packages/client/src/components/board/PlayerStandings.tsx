import type { Player, AssetType } from '@ledger/common';
import { calculateNetWorth, calculateIncome, calculateTaxes } from '@ledger/common';
import { FinancialHealthBadge } from './FinancialHealthBadge';

export interface PlayerStandingsProps {
  players: Player[];
  currentPlayerId: string | null;
  myPlayerId: string | null;
}

/* ─── Suit color classes ─── */

const SUIT_TEXT: Record<AssetType, { symbol: string; className: string }> = {
  jack: { symbol: '♠', className: 'text-text-muted/70 font-semibold' },
  queen: { symbol: '♥', className: 'text-text-muted/70 font-semibold' },
  king: { symbol: '♣', className: 'text-text-muted/70 font-semibold' },
  ace: { symbol: '♦', className: 'text-text-muted/70 font-semibold' },
};

/**
 * Sidebar list of all players styled as "At the Table" matching the card room design.
 * Highlights the current turn's player and the local player.
 */
export function PlayerStandings({
  players,
  currentPlayerId,
  myPlayerId,
}: PlayerStandingsProps) {
  const activePlayers = players.filter((p) => !p.isEliminated);
  const eliminatedPlayers = players.filter((p) => p.isEliminated);

  // Sort active by net worth descending
  const sorted = [...activePlayers].sort(
    (a, b) => calculateNetWorth(b) - calculateNetWorth(a),
  );

  const isCritical = (p: Player) => p.financialHealth === 'critical';

  return (
    <div>
      {/* Header matching inspo */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-text-muted">
          At the Table
        </span>
        <span className="text-[0.6rem] text-text-muted">
          {activePlayers.length} / {players.length} seated
        </span>
      </div>

      {players.length === 0 ? (
        <div className="panel-glass py-8 text-center">
          <p className="text-text-muted text-sm">No players</p>
        </div>
      ) : (
        <div className="flex flex-col gap-px">
          {sorted.map((player, index) => {
            const isCurrent = player.id === currentPlayerId;
            const isMe = player.id === myPlayerId;
            const netWorth = calculateNetWorth(player);
            const income = calculateIncome(player);
            const tax = calculateTaxes(player);
            const avatarLetter = player.name.charAt(0).toUpperCase();

            // Build suit portfolio tags
            const suitCounts = new Map<AssetType, number>();
            for (const asset of player.assets) {
              suitCounts.set(asset.type, (suitCounts.get(asset.type) ?? 0) + 1);
            }
            const suitTags = Array.from(suitCounts.entries())
              .filter(([, count]) => count > 0)
              .sort(([a], [b]) => a.localeCompare(b));

            return (
              <div
                key={player.id}
                className={`player-row ${isCurrent ? 'active-turn' : ''} ${isCritical(player) && !isCurrent ? 'player-row-critical' : ''}`}
              >
                {/* Avatar — clean circle, no gradients */}
                <div className="w-12 h-12 rounded-xl border border-white/15 flex items-center justify-center font-bold text-base text-text shrink-0 bg-black/10">
                  {avatarLetter}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[0.8rem] font-semibold ${isMe ? 'text-gold' : 'text-text'} truncate`}>
                      {player.name}
                    </span>
                    {!player.isConnected && !player.isEliminated && (
                      <span className="text-[0.45rem] uppercase tracking-widest text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/15">
                        Disconnected
                      </span>
                    )}
                    {/* {!player.isEliminated && (
                      <FinancialHealthBadge health={player.financialHealth} player={player} />
                    )} */}
                    {isCurrent && (
                      <span className="turn-badge">
                        Turn
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[0.6rem] text-text-muted mt-0.5 flex-wrap">
                    <span className="text-gold font-semibold" title="Current LC balance">{player.lc}</span>
                    <span className="text-success" title="Income per round">+{income}</span>
                    <span className="text-danger" title="Tax per round">-{tax}</span>
                    <span className="text-text-muted/30">·</span>
                    {suitTags.map(([type, count]) => {
                      const s = SUIT_TEXT[type];
                      return (
                        <span key={type} className={s.className}>
                          {s.symbol}{count}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Distress badge for critical */}
                {isCritical(player) && (
                  <span className="tag tag-distress" title="Player is in critical financial health — at risk of bankruptcy">
                    Distress
                  </span>
                )}
              </div>
            );
          })}

          {/* Eliminated players at bottom */}
          {eliminatedPlayers.length > 0 && (
            <div className="mt-2 space-y-px">
              {eliminatedPlayers.map((player) => {
                const avatarLetter = player.name.charAt(0).toUpperCase();
                return (
                  <div key={player.id} className="player-row eliminated">
                    <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center font-bold text-base text-text-muted/50 shrink-0 bg-black/5">
                      {avatarLetter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[0.8rem] font-semibold text-text-muted/60 truncate">
                          {player.name}
                        </span>
                        <span className="tag tag-eliminated">
                          Eliminated
                        </span>
                      </div>
                      <div className="text-[0.6rem] text-text-muted/50">
                        Bankrupt
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
