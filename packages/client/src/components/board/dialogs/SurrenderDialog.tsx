import { useState } from 'react';
import { Modal } from '../../common/Modal';

export interface SurrenderDialogProps {
  open: boolean;
  onClose: () => void;
  playerName: string;
  loading?: boolean;
  onSurrender: () => void;
}

export function SurrenderDialog({
  open,
  onClose,
  playerName,
  loading = false,
  onSurrender,
}: SurrenderDialogProps) {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!confirmed) return;
    onSurrender();
    setConfirmed(false);
    onClose();
  };

  const handleCancel = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleCancel} title="Surrender">
      <div className="space-y-5">
        <p className="text-base text-text-secondary">
          Are you sure you want to surrender? <strong className="text-text">{playerName}</strong> will be eliminated from the game.
        </p>

        {/* Consequences */}
        <div className="rounded-lg border border-danger/20 bg-danger/5 p-4 space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-danger mb-1.5">Consequences</h4>
          <ul className="text-sm text-text-secondary space-y-1.5">
            <li className="flex items-start gap-1.5">
              <span className="text-danger mt-0.5 shrink-0">•</span>
              <span>All assets liquidated back to the market</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-danger mt-0.5 shrink-0">•</span>
              <span>All active loans defaulted</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-danger mt-0.5 shrink-0">•</span>
              <span>All investment contracts closed</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-danger mt-0.5 shrink-0">•</span>
              <span>Any active auctions or takeover bids cancelled</span>
            </li>
          </ul>
        </div>

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-danger"
          />
          <span className="text-sm text-text-secondary group-hover:text-text transition-colors">
            I understand that surrendering eliminates me from the game permanently.
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleConfirm}
            disabled={!confirmed || loading}
            className="
              flex-1 px-5 py-2.5 rounded-lg text-base font-semibold
              bg-danger text-white
              hover:brightness-110 active:brightness-90
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-150
            "
          >
            {loading ? 'Surrendering...' : 'Surrender'}
          </button>
          <button
            onClick={handleCancel}
            className="
              px-5 py-2.5 rounded-lg text-base font-medium
              border border-cream/15 text-text-secondary
              hover:text-text hover:bg-white/5
              transition-all duration-150
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
