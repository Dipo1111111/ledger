import type { Player, FinancialHealth } from '@ledger/common';
import { calculateNetWorth, calculateIncome, calculateTaxes } from '@ledger/common';

export interface FinancialHealthBadgeProps {
  health: FinancialHealth;
  /** Optional player data — when provided, renders a hover tooltip with financial breakdown */
  player?: Player;
  /** If true, the dot pulses (for critical state) */
  pulsing?: boolean;
}

const healthClassMap: Record<FinancialHealth, string> = {
  healthy: 'healthy',
  stable: 'stable',
  stressed: 'stressed',
  critical: 'critical',
};

/** Human-readable explanation of each health tier */
const healthDescriptions: Record<FinancialHealth, string> = {
  healthy: 'Strong financial position — low debt, positive cash flow',
  stable: 'Good position — manageable obligations',
  stressed: 'Cash concerns — approaching danger',
  critical: 'High risk of bankruptcy — may not survive next obligation',
};

export function FinancialHealthBadge({ health, player, pulsing }: FinancialHealthBadgeProps) {
  const cls = healthClassMap[health];

  // Build tooltip content when player data is provided
  const tooltip = player && !player.isEliminated ? buildTooltip(player) : null;
  // Dot glow class for dynamic visuals
  const glowClass = health === 'critical'
    ? 'shadow-[0_0_6px_rgba(220,38,38,0.4)]'
    : health === 'stressed'
      ? 'shadow-[0_0_4px_rgba(234,160,30,0.3)]'
      : '';

  const badge = (
    <span className={`health-badge ${cls} group`}>
      <span
        className={`dot ${pulsing ? 'animate-pulse-orb' : ''} ${glowClass}`}
      />
      {health.charAt(0).toUpperCase() + health.slice(1)}
    </span>
  );

  return tooltip ? (
    <span className="relative inline-flex">
      {badge}
      {/* Tooltip — appears on hover */}
      <div className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto
        transition-opacity duration-200 z-tooltip
        min-w-[200px]
      ">
        <div className="bg-stone-900 border border-gold/20 rounded-lg p-3 shadow-xl text-left">
          {/* Header row */}
          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gold/10">
            <span className={`health-badge ${cls} text-[0.45rem] py-0 px-1.5`}>
              <span className={`dot ${glowClass}`} />
              {health.charAt(0).toUpperCase() + health.slice(1)}
            </span>
            <span className="text-[0.55rem] text-text-muted ml-auto">{player!.name}</span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[0.55rem]">
            <span className="text-text-muted">Net Worth</span>
            <span className="text-text text-right font-semibold">{tooltip!.netWorth} LC</span>

            <span className="text-text-muted">Liquid Cash</span>
            <span className="text-gold text-right font-semibold">{player!.lc} LC</span>

            <span className="text-text-muted">Total Debt</span>
            <span className={tooltip!.totalDebt > 0 ? 'text-danger text-right font-semibold' : 'text-text text-right font-semibold'}>
              {tooltip!.totalDebt} LC
            </span>

            <span className="text-text-muted">Net Income</span>
            <span className={tooltip!.netIncome < 0 ? 'text-danger text-right font-semibold' : 'text-success text-right font-semibold'}>
              {tooltip!.netIncome > 0 ? '+' : ''}{tooltip!.netIncome} LC
            </span>
          </div>

          {/* Description */}
          <p className="mt-2 pt-2 border-t border-gold/10 text-[0.5rem] text-text-muted/70 leading-relaxed">
            {healthDescriptions[health]}
          </p>
        </div>

        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-stone-900" />
      </div>
    </span>
  ) : badge;
}

/* ─── Helpers ─── */

interface TooltipData {
  netWorth: number;
  totalDebt: number;
  netIncome: number;
}

function buildTooltip(player: Player): TooltipData {
  const netWorth = calculateNetWorth(player);
  const totalDebt = player.loans
    .filter((l) => !l.isRepaid && !l.isDefaulted)
    .reduce((sum, l) => sum + l.repaymentAmount, 0);
  const income = calculateIncome(player);
  const taxes = calculateTaxes(player);
  const netIncome = income - taxes;

  return { netWorth, totalDebt, netIncome };
}
