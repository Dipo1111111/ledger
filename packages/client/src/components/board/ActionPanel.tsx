import type { Player, LoanContract } from '@ledger/common';
import { MAX_ACTIVE_LOANS, TAKEOVER_MIN_WEALTH } from '@ledger/common';
import { calculateNetWorth } from '@ledger/common';

export type DialogType = 'buy' | 'sell' | 'borrow' | 'repay' | 'invest' | 'auction' | 'takeover' | 'surrender' | null;

export interface ActionPanelProps {
  player: Player;
  otherPlayers: Player[];
  onOpenDialog: (type: Exclude<DialogType, null>) => void;
  onEndTurn: () => void;
  onRequestExpansion?: () => void;
  expansionAvailable?: boolean;
  disabled?: boolean;
}

export function ActionPanel({
  player,
  otherPlayers,
  onOpenDialog,
  onEndTurn,
  onRequestExpansion,
  expansionAvailable = false,
  disabled = false,
}: ActionPanelProps) {
  const hasAssets = player.assets.length > 0;
  const activeLoanCount = player.loans.filter((l: LoanContract) => !l.isRepaid && !l.isDefaulted).length;
  const canBorrow = activeLoanCount < MAX_ACTIVE_LOANS;
  const hasLoans = activeLoanCount > 0;
  const hasOtherPlayers = otherPlayers.length > 0;
  const canTakeover = calculateNetWorth(player) >= TAKEOVER_MIN_WEALTH;
  const hasTakeoverTargets = otherPlayers.some((p) => !p.isEliminated);

  return (
    <div className="panel panel-gold px-3 sm:px-5 py-3 sm:py-4 flex flex-wrap items-center gap-1.5 sm:gap-1.5">
      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />

      {/* Label */}
      <span className="hidden sm:inline text-[0.6rem] font-semibold uppercase tracking-widest text-text-muted mr-1.5">
        Actions
      </span>
      <span className="hidden sm:inline w-px h-5 bg-cream/10 mx-1" />

      {/* Action buttons — btn-ghost style matching inspo */}
      <GhostButton
        label="Buy"
        disabled={disabled}
        disabledReason={disabled ? "It's not your turn" : undefined}
        onClick={() => onOpenDialog('buy')}
      />
      <GhostButton
        label="Sell"
        disabled={disabled || !hasAssets}
        disabledReason={!hasAssets ? 'No assets to sell' : disabled ? "It's not your turn" : undefined}
        onClick={() => onOpenDialog('sell')}
      />
      <GhostButton
        label="Borrow"
        disabled={disabled || !canBorrow}
        disabledReason={!canBorrow ? 'Maximum active loans reached' : disabled ? "It's not your turn" : undefined}
        onClick={() => onOpenDialog('borrow')}
      />
      <GhostButton
        label="Repay"
        disabled={disabled || !hasLoans}
        disabledReason={!hasLoans ? 'No active loans' : disabled ? "It's not your turn" : undefined}
        onClick={() => onOpenDialog('repay')}
      />
      <GhostButton
        label="Invest"
        disabled={disabled || !hasOtherPlayers}
        disabledReason={!hasOtherPlayers ? 'No other players to invest in' : disabled ? "It's not your turn" : undefined}
        onClick={() => onOpenDialog('invest')}
      />
      <GhostButton
        label="Auction"
        disabled={disabled || !hasAssets}
        disabledReason={!hasAssets ? 'No assets to auction' : disabled ? "It's not your turn" : undefined}
        onClick={() => onOpenDialog('auction')}
      />
      <GhostButton
        label="Takeover"
        disabled={disabled || !canTakeover || !hasTakeoverTargets}
        disabledReason={
          !canTakeover ? `Need ${TAKEOVER_MIN_WEALTH} LC net worth for takeovers`
          : !hasTakeoverTargets ? 'No other players to target'
          : disabled ? "It's not your turn"
          : undefined
        }
        onClick={() => onOpenDialog('takeover')}
      />

      <span className="w-px h-4 bg-cream/10 mx-0.5" />

      <GhostButton
        label="Surrender"
        disabled={disabled}
        disabledReason={disabled ? "It's not your turn" : undefined}
        onClick={() => onOpenDialog('surrender')}
      />

      <span className="w-px h-4 bg-cream/10 mx-0.5" />

      {onRequestExpansion && (
        <>
          <GhostButton
            label="Expand"
            disabled={disabled || !expansionAvailable}
            disabledReason={!expansionAvailable ? 'Expansion already used or vote in progress' : disabled ? "It's not your turn" : undefined}
            onClick={onRequestExpansion}
          />
          <span className="w-px h-4 bg-cream/10 mx-0.5" />
        </>
      )}

      {/* End Turn — styled as btn-gold */}
      <button
        onClick={onEndTurn}
        disabled={disabled}
        className="px-5 py-2 rounded-lg text-[0.7rem] font-semibold bg-gold-dark text-stone-900 border border-gold hover:bg-gold hover:-translate-y-0.5 hover:shadow-btn-gold active:translate-y-0 disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 transition-all duration-150"
      >
        End Turn
      </button>
    </div>
  );
}

function GhostButton({
  label,
  disabled,
  onClick,
  disabledReason,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  disabledReason?: string;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        className="px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg text-[0.7rem] font-medium text-text-secondary border border-cream/15 bg-transparent hover:border-gold-dark hover:text-text hover:bg-gold/5 active:bg-gold/10 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-cream/15 disabled:hover:text-text-secondary disabled:hover:bg-transparent transition-all duration-150 min-h-[44px] sm:min-h-0"
      >
        {label}
      </button>
      {disabled && disabledReason && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block pointer-events-none z-dropdown">
          <div className="bg-stone-900 text-cream/80 text-[0.55rem] font-medium px-2.5 py-1.5 rounded whitespace-nowrap shadow-lg border border-cream/10">
            {disabledReason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-stone-900" />
          </div>
        </div>
      )}
    </div>
  );
}
