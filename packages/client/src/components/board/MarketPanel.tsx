import type { AssetType, AssetMarket } from '@ledger/common';
import { ASSET_TYPES, ASSET_DEFINITIONS } from '@ledger/common';
import { AssetCard } from './AssetCard';

export interface MarketPanelProps {
  market: AssetMarket;
  /** Is it the local player's turn? */
  canBuy: boolean;
  onBuy: (type: AssetType) => void;
}

export function MarketPanel({ market, canBuy, onBuy }: MarketPanelProps) {
  const hasAny = ASSET_TYPES.some((t) => market[t] > 0);

  return (
    <div>
      {/* Ornament heading matching inspo */}
      <div className="ornament mb-4">
        <span className="font-serif text-base font-bold text-gold tracking-wide">The Market</span>
        <span className="text-[0.6rem] text-text-muted">Bank supply</span>
      </div>

      {!hasAny ? (
        <div className="panel-glass py-10 text-center">
          <p className="text-text-muted text-base">All assets have been purchased</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ASSET_TYPES.map((type) => {
            const def = ASSET_DEFINITIONS[type];
            const supply = market[type];

            if (supply <= 0) {
              return (
                <div key={type} className="relative">
                  <AssetCard type={type} empty />
                  <p className="text-center text-[0.55rem] text-text-muted mt-1.5 uppercase tracking-wider">
                    Sold out
                  </p>
                </div>
              );
            }

            return (
              <div key={type} className="relative">
                <AssetCard
                  type={type}
                  showBuy
                  buyDisabled={!canBuy}
                  onBuy={onBuy}
                />
                <p className="text-center text-[0.55rem] text-text-muted mt-1.5">
                  {supply} remaining
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
