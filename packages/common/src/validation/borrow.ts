import type { GameState } from '../types/game-state';
import { LOAN_MAX_AMOUNT, MAX_ACTIVE_LOANS } from '../constants';
import type { ValidationResult } from './validation-result';

export function canBorrow(
  playerId: string,
  amount: number,
  state: GameState,
): ValidationResult {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { valid: false, reason: 'Player not found' };

  if (amount <= 0) {
    return { valid: false, reason: 'Loan amount must be positive' };
  }

  if (amount > LOAN_MAX_AMOUNT) {
    return {
      valid: false,
      reason: `Maximum loan amount is ${LOAN_MAX_AMOUNT} LC`,
    };
  }

  const activeLoans = player.loans.filter((l) => !l.isRepaid && !l.isDefaulted);
  if (activeLoans.length >= MAX_ACTIVE_LOANS) {
    return {
      valid: false,
      reason: `Already have ${MAX_ACTIVE_LOANS} active loan(s)`,
    };
  }

  const hasDefaulted = player.loans.some((l) => l.isDefaulted && !l.isRepaid);
  if (hasDefaulted) {
    return { valid: false, reason: 'Cannot borrow while in default' };
  }

  return { valid: true };
}

export function canRepayLoan(
  playerId: string,
  contractId: string,
  amount: number,
  state: GameState,
): ValidationResult {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { valid: false, reason: 'Player not found' };

  const loan = player.loans.find((l) => l.id === contractId);
  if (!loan) return { valid: false, reason: 'Loan not found' };

  if (loan.isRepaid) return { valid: false, reason: 'Loan already repaid' };
  if (loan.isDefaulted) return { valid: false, reason: 'Loan is in default' };

  if (amount <= 0 || amount > loan.repaymentAmount) {
    return { valid: false, reason: 'Invalid repayment amount' };
  }

  if (player.lc < amount) {
    return {
      valid: false,
      reason: `Need ${amount} LC, have ${player.lc} LC`,
    };
  }

  return { valid: true };
}
