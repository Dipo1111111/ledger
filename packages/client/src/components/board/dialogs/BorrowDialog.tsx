import { useState } from 'react';
import { LOAN_MAX_AMOUNT, LOAN_INTEREST_RATE, LOAN_TERM_ROUNDS } from '@ledger/common';
import { Modal } from '../../common/Modal';

export interface BorrowDialogProps {
  open: boolean;
  onClose: () => void;
  currentRound: number;
  loading?: boolean;
  onBorrow: (amount: number) => void;
}

const STEP = 10;

export function BorrowDialog({
  open,
  onClose,
  currentRound,
  loading = false,
  onBorrow,
}: BorrowDialogProps) {
  const [amount, setAmount] = useState(STEP);

  const repaymentAmount = Math.round(amount * (1 + LOAN_INTEREST_RATE));
  const deadlineRound = currentRound + LOAN_TERM_ROUNDS;

  const handleConfirm = () => {
    if (amount < STEP) return;
    onBorrow(amount);
    setAmount(STEP);
    onClose();
  };

  const handleCancel = () => {
    setAmount(STEP);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleCancel} title="Borrow">
      <p className="text-base text-text-secondary mb-5">
        Take a loan from the bank. Interest accrues immediately.
      </p>

      {/* Amount slider-like control */}
      <div className="mb-5">
        <label className="text-sm text-text-muted uppercase tracking-wider font-semibold mb-2 block">
          Loan Amount
        </label>

        <div className="flex items-center gap-4">
          {/* Decrement */}
          <button
            onClick={() => setAmount((a) => Math.max(STEP, a - STEP))}
            disabled={amount <= STEP}
            className="
              w-11 h-11 flex items-center justify-center rounded-lg
              border border-cream/15 text-xl font-bold text-text
              hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed
              transition-all
            "
          >
            −
          </button>

          {/* Amount display */}
          <div className="flex-1 text-center">
            <span className="text-3xl font-extrabold text-gold tabular-nums">{amount}</span>
            <span className="text-base text-text-muted ml-1">LC</span>
          </div>

          {/* Increment */}
          <button
            onClick={() => setAmount((a) => Math.min(LOAN_MAX_AMOUNT, a + STEP))}
            disabled={amount >= LOAN_MAX_AMOUNT}
            className="
              w-11 h-11 flex items-center justify-center rounded-lg
              border border-cream/15 text-xl font-bold text-text
              hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed
              transition-all
            "
          >
            +
          </button>
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2 mt-4 justify-center">
          {[30, 60, 90, 120].map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val)}
              className={`
                px-4 py-1.5 rounded-md text-sm font-medium transition-all
                ${amount === val
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'bg-cream/5 text-text-muted border border-cream/10 hover:bg-cream/10'
                }
              `}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Loan terms */}
      <div className="rounded-lg border border-cream/10 bg-felt-dark/80 p-4 mb-5 space-y-1.5">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-2">Repayment Terms</h4>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Principal</span>
          <span className="text-text font-medium">{amount} LC</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Interest</span>
          <span className="text-warning font-medium">{Math.round(amount * LOAN_INTEREST_RATE)} LC ({Math.round(LOAN_INTEREST_RATE * 100)}%)</span>
        </div>
        <div className="flex justify-between text-sm border-t border-cream/10 pt-1.5 mt-1.5">
          <span className="text-text-muted font-semibold">Total Repayment</span>
          <span className="text-gold font-bold">{repaymentAmount} LC</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Deadline</span>
          <span className="text-text font-medium">Round {deadlineRound} ({LOAN_TERM_ROUNDS} rounds)</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={amount < STEP || loading}
          className="
            flex-1 px-5 py-2.5 rounded-lg text-base font-semibold
            bg-gold text-stone-900
            hover:brightness-110 active:brightness-90
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          {loading ? 'Processing...' : `Borrow ${amount} LC`}
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
