import type { Player } from '../types/player';
import { calculateNetWorth } from './net-worth';
import { calculateIncome } from './income';

/**
 * Calculate the LC reserve the defender must reach to survive
 * a hostile takeover. Scaled to defender's position so targets
 * with more assets need a higher reserve.
 */
export function calculateTakeoverReserve(defender: Player): number {
  if (defender.isEliminated) return 0;

  const netWorth = calculateNetWorth(defender);
  const income = calculateIncome(defender);

  // Base: 60% of net worth + 1x income as buffer
  const base = Math.round(netWorth * 0.6);
  const buffer = Math.max(income, 20);

  return Math.max(base + buffer, 60);
}
