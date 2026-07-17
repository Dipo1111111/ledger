import { useState } from 'react';
import type { Player, LoanContract } from '@ledger/common';
import { Modal } from '../../common/Modal';
import { IconCheck, IconX } from '../../common/Icons';

export interface RepayLoanDialogProps {
  open: boolean;
  onClose: () => void;
  player: Player;
  currentRound: number;
  loading?: boolean;
  onRepay: (contractId: string, amount: number) => void;
}

export function RepayLoanDialog({
  open,
  onClose,
  player,
  currentRound,
  loading = false,
  onRepay,
}: RepayLoanDialogProps) {
  const activeLoans = player.loans.filter(
    (l) => !l.isRepaid && !l.isDefaulted,
  ) as LoanContract[];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);

  const selectedContract = selectedId
    ? activeLoans.find((l) => l.id === selectedId) ?? null
    : null;

  const handleSelectLoan = (id: string) => {
    setSelectedId(id);
    const contract = activeLoans.find((l) => l.id === id);
    if (contract) setPayAmount(contract.repaymentAmount);
  };

  const handleConfirm = () => {
    if (!selectedId || payAmount <= 0) return;
    onRepay(selectedId, payAmount);
    setSelectedId(null);
    setPayAmount(0);
    onClose();
  };

  const handleCancel = () => {
    setSelectedId(null);
    setPayAmount(0);
    onClose();
  };

  if (activeLoans.length === 0) {
    return (
      <Modal open={open} onClose={handleCancel} title="Repay Loan">
        <p className="text-base text-text-muted text-center py-8">
          No active loans to repay.
        </p>
        <div className="flex justify-center">
          <button
            onClick={handleCancel}
            className="
              px-5 py-2.5 rounded-lg text-base font-medium
              border border-cream/15 text-text-secondary
              hover:text-text hover:bg-white/5
              transition-all duration-150
            "
          >
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleCancel} title="Repay Loan">
      {/* Loan selection */}
      <p className="text-base text-text-secondary mb-4">Select a loan to repay.</p>

      <div className="space-y-2 mb-5">
        {activeLoans.map((loan) => {
          const isOverdue = currentRound > loan.deadlineRound;
          return (
            <button
              key={loan.id}
              onClick={() => handleSelectLoan(loan.id)}
              className={`
                w-full p-4 rounded-lg border text-left transition-all
                ${selectedId === loan.id
                  ? 'border-gold bg-gold/10 ring-1 ring-gold'
                  : 'border-cream/10 bg-felt-dark/80 hover:border-cream/25'
                }
              `}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base font-semibold text-text">
                  Loan — {loan.amount} LC
                </span>
                {selectedId === loan.id && (
                  <span className="text-gold text-xs font-semibold">Selected</span>
                )}
              </div>
              <div className="flex justify-between text-sm text-text-muted">
                <span>Repay: {loan.repaymentAmount} LC</span>
                <span className={isOverdue ? 'text-danger' : ''}>
                  Due: Round {loan.deadlineRound}
                  {isOverdue ? ' (overdue)' : ''}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Repayment amount */}
      {selectedContract && (
        <div className="mb-5">
          <label className="text-sm text-text-muted uppercase tracking-wider font-semibold mb-2.5 block">
            Repayment Amount
          </label>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={selectedContract.repaymentAmount}
              step={5}
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              className="flex-1 accent-gold h-2.5 rounded-full appearance-none bg-cream/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:shadow-sm"
            />
            <span className="text-xl font-bold text-gold tabular-nums w-20 text-right">
              {payAmount}
            </span>
          </div>

          <div className="flex justify-between text-sm text-text-muted mt-1.5">
            <span>0 LC</span>
            <span>{selectedContract.repaymentAmount} LC (full)</span>
          </div>

          {payAmount > player.lc && (
            <p className="text-danger text-sm mt-1.5 font-medium">
              <span className="inline-flex items-center gap-1"><IconX size={12} /> Your balance ({player.lc} LC) is too low for this repayment</span>
            </p>
          )}

          {payAmount >= selectedContract.repaymentAmount && payAmount <= player.lc && (
            <p className="text-success text-sm mt-1.5 font-medium">
              <span className="inline-flex items-center gap-1"><IconCheck size={12} /> Full repayment. Loan will be cleared.</span>
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={!selectedId || payAmount <= 0 || payAmount > player.lc || loading}
          className="
            flex-1 px-5 py-2.5 rounded-lg text-base font-semibold
            bg-gold text-stone-900
            hover:brightness-110 active:brightness-90
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          {loading ? 'Processing...'
            : selectedContract && payAmount >= selectedContract.repaymentAmount
              ? `Repay Full — ${payAmount} LC`
              : selectedId
                ? `Repay ${payAmount} LC`
                : 'Select a loan'
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
