import type { LobbySettings } from '@ledger/common';
import { SocketEvents } from '@ledger/common';
import { getSocket } from '../../lib/socket';

export interface GameSettingsProps {
  settings: LobbySettings;
  isHost: boolean;
}

export function GameSettings({ settings, isHost }: GameSettingsProps) {
  const handleMaxPlayersChange = (delta: number) => {
    const next = Math.max(2, Math.min(6, settings.maxPlayers + delta));
    if (next === settings.maxPlayers) return;
    getSocket().emit(SocketEvents.SETTINGS_UPDATE, { maxPlayers: next });
  };

  const handleTimerChange = (delta: number) => {
    const next = Math.max(25, Math.min(300, settings.turnTimerSeconds + delta));
    if (next === settings.turnTimerSeconds) return;
    getSocket().emit(SocketEvents.SETTINGS_UPDATE, { turnTimerSeconds: next });
  };

  return (
    <div className="space-y-3">
      {/* Max Players */}
      <div className="flex items-center justify-between py-2 border-b border-cream/[0.06]">
        <span className="text-sm text-text-secondary">Max players</span>
        <div className="flex items-center gap-3">
          {isHost ? (
            <>
              <button
                onClick={() => handleMaxPlayersChange(-1)}
                disabled={settings.maxPlayers <= 2}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-cream/10
                  text-text-muted hover:text-text-secondary hover:bg-cream/[0.04]
                  disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                &minus;
              </button>
              <span className="w-5 text-center font-mono text-sm text-text">
                {settings.maxPlayers}
              </span>
              <button
                onClick={() => handleMaxPlayersChange(1)}
                disabled={settings.maxPlayers >= 6}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-cream/10
                  text-text-muted hover:text-text-secondary hover:bg-cream/[0.04]
                  disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                +
              </button>
            </>
          ) : (
            <span className="font-mono text-sm text-text">{settings.maxPlayers}</span>
          )}
        </div>
      </div>

      {/* Turn Timer */}
      <div className="flex items-center justify-between py-2 border-b border-cream/[0.06]">
        <span className="text-sm text-text-secondary">Turn timer</span>
        <div className="flex items-center gap-3">
          {isHost ? (
            <>
              <button
                onClick={() => handleTimerChange(-5)}
                disabled={settings.turnTimerSeconds <= 25}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-cream/10
                  text-text-muted hover:text-text-secondary hover:bg-cream/[0.04]
                  disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                &minus;
              </button>
              <span className="w-10 text-center font-mono text-sm text-text">
                {settings.turnTimerSeconds}s
              </span>
              <button
                onClick={() => handleTimerChange(5)}
                disabled={settings.turnTimerSeconds >= 300}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-cream/10
                  text-text-muted hover:text-text-secondary hover:bg-cream/[0.04]
                  disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                +
              </button>
            </>
          ) : (
            <span className="font-mono text-sm text-text">{settings.turnTimerSeconds}s</span>
          )}
        </div>
      </div>
    </div>
  );
}
