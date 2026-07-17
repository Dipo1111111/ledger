import type { Player, FinancialHealth } from '../types/player';
import { calculateIncome } from './income';
import { calculateTaxes } from './taxes';

/**
 * Determine a player's financial health tier based on their
 * liquid cash, debt burden, and net income.
 *
 * healthy   → LC >= 60, no debt, positive net income
 * stable    → LC >= 30, manageable debt, income covers taxes
 * stressed  → LC < 30, high debt, income barely covers taxes
 * critical  → LC <= 0, in default, income negative or zero
 */
export function determineFinancialHealth(player: Player): FinancialHealth {
  if (player.isEliminated) return 'critical';

  const income = calculateIncome(player);
  const taxes = calculateTaxes(player);
  const netIncome = income - taxes;
  const totalDebt = player.loans
    .filter((l) => !l.isRepaid && !l.isDefaulted)
    .reduce((sum, l) => sum + l.repaymentAmount, 0);
  const hasDefaulted = player.loans.some(
    (l) => l.isDefaulted && !l.isRepaid,
  );

  if (
    player.lc <= 0 ||
    hasDefaulted ||
    (player.lc < totalDebt && totalDebt > 0)
  ) {
    return 'critical';
  }

  if (player.lc < 30 || totalDebt > player.lc || netIncome <= 0) {
    return 'stressed';
  }

  if (player.lc < 60 || totalDebt > 0) {
    return 'stable';
  }

  return 'healthy';
}
