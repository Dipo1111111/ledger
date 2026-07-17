import { useGameStore } from '../../store/game-store';

export function DisconnectOverlay() {
  const isPaused = useGameStore((state) => state.isGamePaused);
  const pausedBy = useGameStore((state) => state.pausedByPlayerName);

  if (!isPaused) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-elimination-overlay)] flex items-center justify-center bg-black/60 backdrop-blur-md anim-overlay-in">
      <div className="flex flex-col items-center gap-6 text-center max-w-md p-8 border-2 border-gold/40 rounded-2xl bg-felt shadow-lobby-card panel-glass">
        {/* Spinner */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute w-full h-full border-4 border-gold/20 rounded-full"></div>
          <div className="absolute w-full h-full border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Text */}
        <div>
          <h2 className="text-2xl font-serif text-gold mb-2">Game Paused</h2>
          <p className="text-cream/70 text-sm">
            Waiting for <strong className="text-cream">{pausedBy || 'a player'}</strong> to reconnect...
          </p>
        </div>
      </div>
    </div>
  );
}
