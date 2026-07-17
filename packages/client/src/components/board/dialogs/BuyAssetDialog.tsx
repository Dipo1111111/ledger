import { useState } from 'react';
import type { AssetType, GameState, Player } from '@ledger/common';
import { ASSET_TYPES, ASSET_DEFINITIONS } from '@ledger/common';
import { Modal } from '../../common/Modal';

export interface BuyAssetDialogProps {
  open: boolean;
  onClose: () => void;
  player: Player;
  market: GameState['market'];
  loading?: boolean;
  onBuy: (type: AssetType) => void;
}

export function BuyAssetDialog({
  open,
  onClose,
  player,
  market,
  loading = false,
  onBuy,
}: BuyAssetDialogProps) {
  const [selected, setSelected] = useState<AssetType | null>(null);

  const handleConfirm = () => {
    if (!selected) return;
    onBuy(selected);
    setSelected(null);
    onClose();
  };

  const handleCancel = () => {
    setSelected(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleCancel} title="Buy Asset">
      <p className="text-base text-text-secondary mb-4">
        Select an asset to purchase. Your balance: <span className="font-bold text-text">{player.lc} LC</span>
      </p>

      {/* Asset grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {ASSET_TYPES.map((type) => {
          const def = ASSET_DEFINITIONS[type];
          const supply = market[type];
          const canAfford = player.lc >= def.purchasePrice;
          const inStock = supply > 0;

          return (
            <button
              key={type}
              onClick={() => inStock && canAfford && setSelected(type)}
              disabled={!inStock || !canAfford}
              className={`
                relative p-4 rounded-lg border text-left transition-all
                ${selected === type
                  ? 'border-gold bg-gold/10 ring-1 ring-gold'
                  : 'border-cream/10 bg-felt-dark/80 hover:border-cream/25'
                }
                ${(!inStock || !canAfford) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-base capitalize text-text">{type}</span>
                {selected === type && <span className="text-gold text-xs font-semibold">Selected</span>}
              </div>
              <div className="text-sm text-text-muted space-y-0.5">
                <div className="flex justify-between">
                  <span>Price</span>
                  <span className={canAfford ? 'text-text font-medium' : 'text-danger'}>
                    {def.purchasePrice} LC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Income</span>
                  <span className="text-success">▲{def.incomePerRound}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="text-danger">▼{def.taxPerRound}</span>
                </div>
                <div className="flex justify-between">
                  <span>Supply</span>
                  <span>{supply} left</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm */}
      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={!selected || loading}
          className="
            flex-1 px-5 py-2.5 rounded-lg text-base font-semibold
            bg-gold text-stone-900
            hover:brightness-110 active:brightness-90
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          {loading ? 'Processing...' : selected ? `Buy ${selected} — ${ASSET_DEFINITIONS[selected].purchasePrice} LC` : 'Select an asset'}
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
