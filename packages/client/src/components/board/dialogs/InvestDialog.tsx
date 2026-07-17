import { useState } from 'react';
import type { Player } from '@ledger/common';
import { LOAN_INTEREST_RATE, LOAN_TERM_ROUNDS } from '@ledger/common';
import { Modal } from '../../common/Modal';

export interface InvestDialogProps {
  open: boolean;
  onClose: () => void;
  player: Player;
  otherPlayers: Player[];
  currentRound: number;
  loading?: boolean;
  onPropose: (targetPlayerId: string, amount: number, repaymentAmount: number, deadlineRound: number) => void;
}

const STEP = 5;

export function InvestDialog({
  open,
  onClose,
  player,
  otherPlayers,
  currentRound,
  loading = false,
  onPropose,
}: InvestDialogProps) {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [amount, setAmount] = useState(20);

  const repaymentAmount = Math.round(amount * (1 + LOAN_INTEREST_RATE));
  const deadlineRound = currentRound + LOAN_TERM_ROUNDS;
  const canAfford = amount <= player.lc;

  const targetPlayer = targetId
    ? otherPlayers.find((p) => p.id === targetId) ?? null
    : null;

  const handleConfirm = () => {
    if (!targetId || amount <= 0 || !canAfford) return;
    onPropose(targetId, amount, repaymentAmount, deadlineRound);
    setTargetId(null);
    setAmount(20);
    onClose();
  };

  const handleCancel = () => {
    setTargetId(null);
    setAmount(20);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleCancel} title="Invest">
      <p className="text-sm text-text-secondary mb-4">
        Fund another player in exchange for future repayment.
      </p>

      {/* Target player selection */}
      <div className="mb-4">
        <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2 block">
          Target Player
        </label>

        {otherPlayers.length === 0 ? (
          <p className="text-sm text-text-muted">No eligible players to invest in.</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {otherPlayers.map((p) => (
              <button
                key={p.id}
                onClick={() => setTargetId(p.id)}
                disabled={p.isEliminated}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                  ${targetId === p.id
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-cream/10 text-text-secondary hover:border-cream/25'
                  }
                  ${p.isEliminated ? 'opacity-40 cursor-not-allowed' : ''}
                `}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Amount */}
      {targetId && (
        <>
          <div className="mb-4">
            <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2 block">
              Investment Amount
            </label>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setAmount((a) => Math.max(STEP, a - STEP))}
                disabled={amount <= STEP}
                className="
                  w-9 h-9 flex items-center justify-center rounded-lg
                  border border-cream/15 text-lg font-bold text-text
                  hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all
                "
              >
                −
              </button>

              <div className="flex-1 text-center">
                <span className="text-2xl font-extrabold text-gold tabular-nums">{amount}</span>
                <span className="text-sm text-text-muted ml-1">LC</span>
              </div>

              <button
                onClick={() => setAmount((a) => Math.min(player.lc, a + STEP))}
                disabled={amount >= player.lc}
                className="
                  w-9 h-9 flex items-center justify-center rounded-lg
                  border border-cream/15 text-lg font-bold text-text
                  hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all
                "
              >
                +
              </button>
            </div>

            {!canAfford && (
              <p className="text-danger text-xs mt-1">Amount exceeds your current balance ({player.lc} LC)</p>
            )}
          </div>

          {/* Terms */}
          <div className="rounded-lg border border-cream/10 bg-felt-dark/80 p-3 mb-4 space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Investment Terms
            </h4>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Amount</span>
              <span className="text-text font-medium">{amount} LC</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Return</span>
              <span className="text-success font-medium">+{repaymentAmount - amount} LC ({Math.round(LOAN_INTEREST_RATE * 100)}%)</span>
            </div>
            <div className="flex justify-between text-xs border-t border-cream/10 pt-1.5 mt-1.5">
              <span className="text-text-muted font-semibold">Total Repayment</span>
              <span className="text-gold font-bold">{repaymentAmount} LC</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Deadline</span>
              <span className="text-text font-medium">Round {deadlineRound}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Target</span>
              <span className="text-text font-medium">{targetPlayer?.name ?? '—'}</span>
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={!targetId || amount <= 0 || !canAfford || loading}
          className="
            flex-1 px-5 py-2.5 rounded-lg text-base font-semibold
            bg-gold text-stone-900
            hover:brightness-110 active:brightness-90
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          {loading
            ? 'Processing...'
            : targetId
              ? `Propose ${amount} LC → ${targetPlayer?.name ?? '—'}`
              : 'Select a player'
          }
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
