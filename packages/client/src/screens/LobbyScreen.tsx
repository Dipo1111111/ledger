import { useState, useCallback, useEffect } from 'react';
import { SocketEvents } from '@ledger/common';
import { getSocket } from '../lib/socket';
import { useLobbyStore } from '../store/lobby-store';
import { Button } from '../components/common/Button';
import { PlayerList } from '../components/lobby/PlayerList';
import { GameSettings } from '../components/lobby/GameSettings';
import { CreateRoom } from '../components/lobby/CreateRoom';
import { JoinRoom } from '../components/lobby/JoinRoom';

interface LobbyScreenProps {
  onBack: () => void;
}

export function LobbyScreen({ onBack }: LobbyScreenProps) {
  const { roomCode, playerId, players, settings, isGameStarting, errors, dismissError } =
    useLobbyStore();

  const player = players.find((p) => p.id === playerId);
  const isHost = player?.isHost ?? false;
  const isReady = player?.isReady ?? false;
  const allReady = players.length >= 2 && players.every((p) => p.isHost || p.isReady);

  const [readyLoading, setReadyLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReady = useCallback(() => {
    setReadyLoading(true);
    getSocket().emit(SocketEvents.SET_READY, { isReady: !isReady });
    setTimeout(() => setReadyLoading(false), 500);
  }, [isReady]);

  const handleStart = useCallback(() => {
    setStartLoading(true);
    getSocket().emit(SocketEvents.START_GAME);
  }, []);

  const handleLeave = useCallback(() => {
    getSocket().emit(SocketEvents.LEAVE_ROOM);
    import('../lib/socket').then(({ clearSessionToken }) => clearSessionToken());
    useLobbyStore.getState().reset();
    onBack();
  }, [onBack]);

  const handleCopyCode = useCallback(() => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode).then(() => {
        setCopied(true);
      }).catch(() => {});
    }
  }, [roomCode]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <div className="min-h-dvh bg-felt flex items-center justify-center p-4 sm:p-6 safe-area-top safe-area-bottom">

      {/* ═══════ PRE-ROOM ═══════ */}
      {!roomCode && <PreRoom onBack={onBack} />}

      {/* ═══════ IN-ROOM ═══════ */}
      {roomCode && (
        <div className="w-full max-w-lg animate-fade-scale-in">

          {/* Room code */}
          <div className="text-center mb-6 sm:mb-8">
            <h1
              className="text-2xl sm:text-3xl font-bold text-gold mb-1"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Ledger
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mb-4 sm:mb-5">
              {players.length} of {settings?.maxPlayers ?? '?'} seated
            </p>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-baseline gap-2 sm:gap-3 group cursor-pointer min-h-[44px]"
              title="Click to copy room code"
            >
              <span className="font-mono text-3xl sm:text-4xl font-bold tracking-[0.15em] text-text">
                {roomCode}
              </span>
              <span className="text-[0.65rem] sm:text-xs text-text-muted group-hover:text-text-secondary transition-colors">
                {copied ? 'Copied!' : 'Copy code'}
              </span>
            </button>
          </div>

          {/* Players */}
          <div className="mb-6">
            <PlayerList players={players} currentPlayerId={playerId} />
          </div>

          {/* Settings — only for host, inline */}
          {settings && isHost && (
            <div className="mb-6">
              <GameSettings settings={settings} isHost={isHost} />
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-6 space-y-2">
              {errors.map((err) => (
                <div
                  key={err.id}
                  className="flex items-center justify-between rounded-lg border border-danger/25 bg-danger/8 px-4 py-3 text-sm text-danger animate-slide-up"
                >
                  <span>{err.message}</span>
                  <button
                    onClick={() => dismissError(err.id)}
                    className="ml-3 text-danger/60 hover:text-danger transition-colors cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            {isHost ? (
              <>
                <button
                  onClick={handleLeave}
                  className="text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer min-h-[44px]"
                >
                  Leave table
                </button>
                <Button
                  variant="primary"
                  size="lg"
                  loading={startLoading}
                  disabled={!allReady || isGameStarting}
                  onClick={handleStart}
                  className="w-full sm:w-auto"
                >
                  {isGameStarting ? 'Starting...' : 'Start Game'}
                </Button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLeave}
                  className="text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer min-h-[44px]"
                >
                  Leave table
                </button>
                <Button
                  variant={isReady ? 'secondary' : 'primary'}
                  size="lg"
                  loading={readyLoading}
                  onClick={handleReady}
                  className="w-full sm:w-auto"
                >
                  {isReady ? 'Not Ready' : 'Ready'}
                </Button>
              </>
            )}
          </div>

          {/* Status text */}
          {isHost && players.length < 2 && (
            <p className="text-center text-xs text-text-muted/50 mt-4">
              Waiting for at least one more player
            </p>
          )}
          {isHost && players.length >= 2 && !allReady && (
            <p className="text-center text-xs text-warning/70 mt-4">
              Waiting for all players to ready up
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════ PRE-ROOM COMPONENT ═══════ */

type PreRoomChoice = null | 'create' | 'join';

function PreRoom({ onBack }: { onBack: () => void }) {
  const [choice, setChoice] = useState<PreRoomChoice>(null);

  return (
    <div className="w-full max-w-sm animate-fade-scale-in">

      {/* Back link */}
      <button
        onClick={onBack}
        className="block mb-10 text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
      >
        &larr; Back
      </button>

      {/* Title */}
      <h1
        className="text-4xl font-bold text-gold mb-2"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        Ledger
      </h1>
      <p className="text-sm text-text-secondary mb-10">
        Create a table or join one
      </p>

      {/* Choice buttons — stacked, solid, no glass */}
      {choice === null && (
        <div className="space-y-3 animate-slide-up">
          <button
            onClick={() => setChoice('create')}
            className="w-full py-4 rounded-xl bg-gold text-stone-900 text-base font-semibold
              hover:brightness-110 active:brightness-90 transition-all duration-150 cursor-pointer"
          >
            Create Game
          </button>
          <button
            onClick={() => setChoice('join')}
            className="w-full py-4 rounded-xl border border-cream/15 text-text text-base font-semibold
              hover:bg-cream/[0.04] active:bg-cream/[0.08] transition-all duration-150 cursor-pointer"
          >
            Join Game
          </button>
        </div>
      )}

      {/* Create form — slides in below */}
      {choice === 'create' && (
        <div className="animate-slide-up">
          <CreateRoom />
          <button
            onClick={() => setChoice(null)}
            className="mt-4 text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          >
            &larr; Back
          </button>
        </div>
      )}

      {/* Join form — slides in below */}
      {choice === 'join' && (
        <div className="animate-slide-up">
          <JoinRoom />
          <button
            onClick={() => setChoice(null)}
            className="mt-4 text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          >
            &larr; Back
          </button>
        </div>
      )}

      <p className="mt-8 text-xs text-text-muted/40 text-center">
        2 to 6 players
      </p>
    </div>
  );
}
