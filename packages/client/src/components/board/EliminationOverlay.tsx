import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconSkull } from '../common/Icons';

export interface EliminationOverlayProps {
  playerName: string;
  reason: string;
  onDismiss: () => void;
}

/**
 * Full-screen elimination overlay shown when the local player is eliminated.
 * Rendered via React portal to document.body to escape felt-bg stacking context.
 * After the player dismisses it, the outer GameScreen switches to spectate mode
 * (the overlay shrinks to a persistent banner instead).
 */
export function EliminationOverlay({ playerName, reason, onDismiss }: EliminationOverlayProps) {
  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  // Track ref to avoid portal issues on unmount
  const bodyRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    bodyRef.current = document.body;
  }, []);

  const overlay = (
    <div className="fixed inset-0 z-elimination-overlay flex items-center justify-center bg-black/85 backdrop-blur-md" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="text-center max-w-md px-6">
        {/* Skull icon */}
        <div className="mb-4 flex justify-center">
          <div className="text-danger">
            <IconSkull size={64} className="opacity-80" />
          </div>
        </div>

        <h1 className="font-sans text-4xl text-danger font-bold mb-2">Eliminated</h1>

        <p className="text-lg text-text-secondary mb-1">
          {playerName}
        </p>

        <p className="text-sm text-text-muted mb-6">
          {reason}
        </p>

        <button
          onClick={handleDismiss}
          className="
            px-6 py-2.5 rounded-lg text-sm font-semibold
            border border-cream/15 text-text-secondary
            hover:text-text hover:bg-white/5
            hover:border-cream/25
            transition-all duration-150
          "
        >
          Continue Watching
        </button>
      </div>
    </div>
  );

  return bodyRef.current ? createPortal(overlay, document.body) : overlay;
}

/**
 * Persistent spectate banner shown after the full-screen overlay is dismissed.
 * Stays at the top of the screen to remind the player they're spectating.
 */
export function SpectateBanner({ playerName, reason }: EliminationOverlayProps) {
  return (
    <div className="sticky top-0 z-sticky bg-danger/15 border-b border-danger/30 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-5 h-9">
        <div className="flex items-center gap-2">
          <span className="text-danger">
            <IconSkull size={14} />
          </span>
          <span className="text-xs font-medium text-danger">
            Eliminated - spectating
          </span>
        </div>
        <span className="text-[0.55rem] text-text-muted truncate max-w-[200px] sm:max-w-none">
          {playerName} . {reason}
        </span>
      </div>
    </div>
  );
}
