import type { LobbyPlayer } from '@ledger/common';

export interface PlayerListProps {
  players: LobbyPlayer[];
  currentPlayerId: string | null;
}

function PlayerRow({ player, isSelf }: { player: LobbyPlayer; isSelf: boolean }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-cream/[0.06] last:border-b-0">
      {/* Color dot */}
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: player.color }}
      />

      {/* Name */}
      <span className="flex-1 text-sm text-text">
        {player.name}
        {isSelf && <span className="ml-1 text-xs text-text-muted">(you)</span>}
      </span>

      {/* Status */}
      {!player.isHost && (
        <span
          className={`h-2 w-2 rounded-full ${
            player.isReady
              ? 'bg-success'
              : 'bg-cream/20'
          }`}
          title={player.isReady ? 'Ready' : 'Not ready'}
        />
      )}

      {player.isHost && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gold/70">
          Host
        </span>
      )}
    </div>
  );
}

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  if (players.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-text-muted/50">
        Waiting for players...
      </div>
    );
  }

  return (
    <div>
      {players.map((player) => (
        <PlayerRow
          key={player.id}
          player={player}
          isSelf={player.id === currentPlayerId}
        />
      ))}
    </div>
  );
}
