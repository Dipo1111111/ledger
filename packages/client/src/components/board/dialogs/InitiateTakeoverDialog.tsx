import { useState } from 'react';
import type { Player } from '@ledger/common';
import {
  TAKEOVER_FILING_FEE,
  TAKEOVER_MIN_WEALTH,
  TAKEOVER_ATTACKER_COOLDOWN_ROUNDS,
} from '@ledger/common';
import { calculateNetWorth } from '@ledger/common';
import { Modal } from '../../common/Modal';
import { IconWarning } from '../../common/Icons';

export interface InitiateTakeoverDialogProps {
  open: boolean;
  onClose: () => void;
  player: Player;
  otherPlayers: Player[];
  loading?: boolean;
  onInitiateTakeover: (targetPlayerId: string) => void;
}

export function InitiateTakeoverDialog({
  open,
  onClose,
  player,
  otherPlayers,
  loading = false,
  onInitiateTakeover,
}: InitiateTakeoverDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const eligibleTargets = otherPlayers.filter((p) => !p.isEliminated);
  const selected = selectedId ? eligibleTargets.find((p) => p.id === selectedId) ?? null : null;

  const canAfford = player.lc >= TAKEOVER_FILING_FEE;
  const playerNetWorth = calculateNetWorth(player);
  const meetsWealthReq = playerNetWorth >= TAKEOVER_MIN_WEALTH;

  const handleConfirm = () => {
    if (!selectedId) return;
    onInitiateTakeover(selectedId);
    setSelectedId(null);
    onClose();
  };

  const handleCancel = () => {
    setSelectedId(null);
    onClose();
  };

  const isDisabled = !selectedId || !canAfford || !meetsWealthReq || loading;

  return (
    <Modal open={open} onClose={handleCancel} title="Initiate Takeover">
      <p className="text-sm text-text-secondary mb-4">
        Declare a hostile takeover against another player. If they can't meet the LC reserve by their next turn, they're eliminated and you claim their best asset.
      </p>

      {/* Attacker's eligibility summary */}
      <div className="rounded-lg border border-cream/10 bg-felt-dark/80 p-3 mb-4 space-y-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">Your Status</h4>
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">Net Worth</span>
          <span className={`font-medium ${meetsWealthReq ? 'text-success' : 'text-danger'}`}>
            {playerNetWorth} LC {!meetsWealthReq && `(need ${TAKEOVER_MIN_WEALTH})`}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">Filing Fee</span>
          <span className={`font-medium ${canAfford ? 'text-success' : 'text-danger'}`}>
            {TAKEOVER_FILING_FEE} LC
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">Current LC</span>
          <span className="text-text font-medium">{player.lc} LC</span>
        </div>
        <div className="flex justify-between text-xs border-t border-cream/10 pt-1 mt-1">
          <span className="text-text-muted">Cooldown</span>
          <span className="text-text-muted">{TAKEOVER_ATTACKER_COOLDOWN_ROUNDS} rounds between takeovers</span>
        </div>
      </div>

      {/* Target selection */}
      <div className="mb-4">
        <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2 block">
          Target Player
        </label>

        {eligibleTargets.length === 0 ? (
          <p className="text-sm text-text-muted">No eligible targets.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {eligibleTargets.map((p) => {
              const netWorth = calculateNetWorth(p);
              const isSelected = selectedId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium border transition-all
                    ${isSelected
                      ? 'border-danger bg-danger/10 text-danger'
                      : 'border-cream/10 text-text-secondary hover:border-cream/25'
                    }
                  `}
                >
                  <span>{p.name}</span>
                  <span className="text-xs text-text-muted">{netWorth} LC net worth</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="mb-4 rounded-lg border border-warning/20 bg-warning/5 p-2.5">
        <p className="text-[0.55rem] text-warning font-medium">
          <span className="inline-flex items-center gap-1.5"><IconWarning size={12} /> A failed takeover costs the full {TAKEOVER_FILING_FEE} LC filing fee. If the defender survives, you get nothing back.</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={isDisabled}
          className="
            flex-1 px-5 py-2.5 rounded-lg text-base font-semibold
            bg-danger text-white
            hover:brightness-110 active:brightness-90
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          {loading
            ? 'Declaring...'
            : selected
              ? `Takeover ${selected.name} (${TAKEOVER_FILING_FEE} LC fee)`
              : 'Select a target'}
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
    </Modal>
  );
}
