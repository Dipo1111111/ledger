import type { Player, AssetType } from '@ledger/common';
import { ASSET_TYPES, ASSET_DEFINITIONS, calculateNetWorth, calculateIncome, calculateTaxes } from '@ledger/common';
import { AssetCard } from './AssetCard';
import { FinancialHealthBadge } from './FinancialHealthBadge';
import { type ReactNode } from 'react';
import { IconDiamond, IconChartDown, IconTarget, IconWarning } from '../common/Icons';

export interface PlayerBoardProps {
  player: Player;
  /** Is this the local player? */
  isLocal?: boolean;
  /** Show action buttons (buy/sell/end turn) */
  showActions?: boolean;
  /** Buy asset handler */
  onBuy?: (type: AssetType) => void;
  /** Sell asset handler */
  onSell?: (assetId: string) => void;
  /** End turn handler */
  onEndTurn?: () => void;
  /** Are buy actions enabled? */
  canAct?: boolean;
}

export function PlayerBoard({
  player,
  isLocal = false,
}: PlayerBoardProps) {
  const groupedAssets = new Map<AssetType, number>();
  for (const asset of player.assets) {
    groupedAssets.set(asset.type, (groupedAssets.get(asset.type) ?? 0) + 1);
  }

  const hasAssets = player.assets.length > 0;
  const netWorth = player.isEliminated ? 0 : calculateNetWorth(player);
  const income = player.isEliminated ? 0 : calculateIncome(player);
  const tax = player.isEliminated ? 0 : calculateTaxes(player);
  const totalDebt = player.isEliminated
    ? 0
    : player.loans
        .filter((l) => !l.isRepaid && !l.isDefaulted)
        .reduce((sum, l) => sum + l.repaymentAmount, 0);
  const outgoingInvestments = player.investments.filter(
    (inv) => inv.investorId === player.id && !inv.isRepaid,
  );
  const incomingInvestments = player.investments.filter(
    (inv) => inv.receiverId === player.id && !inv.isRepaid && !inv.isDefaulted,
  );
  const outgoingTotal = outgoingInvestments.reduce((sum, i) => sum + i.amount, 0);
  const incomingTotal = incomingInvestments.reduce((sum, i) => sum + i.repaymentAmount, 0);
  const hasInvestments = outgoingInvestments.length > 0 || incomingInvestments.length > 0;
  const avatarLetter = player.name.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* ─── Profile / Chip Summary — Gold panel matching inspo ─── */}
      <div className="panel panel-gold p-6">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        {/* Header row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gold-dark flex items-center justify-center font-extrabold text-xl text-stone-900 border border-gold shrink-0">
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg text-text truncate">{player.name}</span>
              {/* {!player.isEliminated && <FinancialHealthBadge health={player.financialHealth} player={player} />} */}
              {player.isEliminated && (
                <span className="text-[0.6rem] text-danger font-semibold uppercase tracking-wider">Eliminated</span>
              )}
            </div>
            {isLocal && <p className="text-[0.65rem] text-text-muted">Your corporation · CEO: You</p>}
          </div>
        </div>

        {/* Chip token display */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
          <ChipBox icon={<IconTarget size={14} className="opacity-70" />} value={player.lc} label="Balance" variant="gold" animate />
          <ChipBox icon={<IconChartDown size={14} className="opacity-70" />} value={`+${income}`} label="Income" variant="green" />
          <ChipBox icon={<IconChartDown size={14} className="opacity-70 rotate-180" />} value={`-${tax}`} label="Tax" variant="red" />
          <ChipBox icon={<IconDiamond size={14} className="opacity-70" />} value={netWorth} label="Net Worth" variant="blue" />
          <ChipBox
            icon={totalDebt > 0 ? <IconWarning size={14} className="opacity-70" /> : <IconDiamond size={14} className="opacity-70" />}
            value={totalDebt}
            label="Debt"
            variant={totalDebt > 0 ? 'red' : 'blue'}
          />
        </div>
      </div>

      {/* ─── Investments ─── */}
      {isLocal && hasInvestments && (
        <div className="panel-glass px-5 py-3.5">
          <div className="flex items-center gap-4 text-[0.6rem]">
            {outgoingInvestments.length > 0 && (
              <span className="text-text-muted">
                Lent: <span className="text-gold font-semibold">{outgoingTotal} LC</span>
                {' · '}
                <span className="text-text-muted/60">{outgoingInvestments.length} contract{outgoingInvestments.length > 1 ? 's' : ''}</span>
              </span>
            )}
            {incomingInvestments.length > 0 && (
              <span className="text-text-muted">
                Owe: <span className="text-danger font-semibold">{incomingTotal} LC</span>
                {' · '}
                <span className="text-text-muted/60">{incomingInvestments.length} contract{incomingInvestments.length > 1 ? 's' : ''}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* ─── Your Hand ─── */}
      {isLocal && (
        <div>
          <div className="ornament mb-3">
            <span className="font-serif text-base font-bold text-gold tracking-wide">Your Hand</span>
            <span className="text-[0.6rem] text-text-muted">
              {player.assets.length} assets · {player.assets.reduce((sum, a) => sum + ASSET_DEFINITIONS[a.type].purchasePrice, 0)} LC value
            </span>
          </div>

          {!hasAssets ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ASSET_TYPES.map((type) => (
                <AssetCard key={type} type={type} empty />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ASSET_TYPES.map((type) => {
                const count = groupedAssets.get(type) ?? 0;
                if (count === 0) {
                  return <AssetCard key={type} type={type} empty />;
                }
                const asset = player.assets.find((a) => a.type === type);
                if (!asset) return null;
                return (
                  <AssetCard
                    key={type}
                    type={type}
                    ownedCount={count}
                  />
                );
              })}
            </div>
          )}

          {/* Sellable count per type */}
          {hasAssets && (
            <div className="flex gap-3 mt-2 flex-wrap">
              {ASSET_TYPES.map((type) => {
                const count = groupedAssets.get(type) ?? 0;
                if (count === 0) return null;
                return (
                  <span key={type} className="text-[0.5rem] font-semibold uppercase tracking-wider text-text-muted">
                    {type}: {count}/{ASSET_DEFINITIONS[type].maxPerPlayer}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Chip token sub-component ─── */

function ChipBox({
  icon,
  value,
  label,
  variant,
  animate = false,
}: {
  icon: ReactNode;
  value: number | string;
  label: string;
  variant: 'gold' | 'red' | 'green' | 'blue';
  animate?: boolean;
}) {
  const chipContent = (
    <>
      <span className="chip-icon">{icon}</span>
      <span className="chip-value">{value}</span>
    </>
  );

  return (
    <div className="text-center bg-black/10 rounded-[12px] p-3">
      <div
        className={`chip chip-${variant} mx-auto mb-2${animate ? ' animate-score-pop' : ''}`}
        key={animate ? `${value}` : undefined}
      >
        {chipContent}
      </div>
      <div className="text-[0.5rem] uppercase tracking-widest text-text-muted">{label}</div>
    </div>
  );
}
