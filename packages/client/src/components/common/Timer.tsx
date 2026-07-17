import { useEffect, useState } from 'react';

export interface TimerProps {
  /** Unix timestamp (ms) when the turn ends */
  endsAt: number | null;
  /** Called when the timer naturally reaches 0 */
  onExpire?: () => void;
}

/**
 * Countdown timer that ticks every second.
 * Shows mm:ss format. When endsAt is null, renders a placeholder.
 */
export function Timer({ endsAt, onExpire }: TimerProps) {
  const [remaining, setRemaining] = useState<number>(() =>
    endsAt ? Math.max(0, endsAt - Date.now()) : 0,
  );

  useEffect(() => {
    if (!endsAt) {
      setRemaining(0);
      return;
    }

    const id = setInterval(() => {
      const rem = Math.max(0, endsAt - Date.now());
      setRemaining(rem);
      if (rem <= 0) {
        clearInterval(id);
        onExpire?.();
      }
    }, 500);

    return () => clearInterval(id);
  }, [endsAt, onExpire]);

  const totalSec = Math.ceil(remaining / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const display = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  const isUrgent = totalSec < 15;
  const isCritical = totalSec < 5;

  return (
    <div className="flex items-center gap-1.5" title={isUrgent ? 'Time is running out!' : endsAt ? 'Time remaining this turn' : 'Timer paused'}>
      {/* Clock SVG icon matching inspo */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-text-secondary">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span
        className={`
          font-semibold font-variant-numeric:tabular-nums
          text-base transition-colors
          ${!endsAt ? 'text-text-muted' : ''}
          ${!isUrgent && endsAt ? 'text-text' : ''}
          ${isUrgent && !isCritical ? 'text-warning animate-pulse' : ''}
          ${isCritical ? 'text-danger animate-heartbeat' : ''}
        `}
      >
        {endsAt ? display : '--:--'}
      </span>
    </div>
  );
}
