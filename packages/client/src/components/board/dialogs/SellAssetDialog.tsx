import { useState } from 'react';
import type { Player, OwnedAsset, AssetType } from '@ledger/common';
import { ASSET_DEFINITIONS } from '@ledger/common';
import { Modal } from '../../common/Modal';
import { IconWarning } from '../../common/Icons';

type SellMode = 'bank' | 'player';

export interface SellAssetDialogProps {
  open: boolean;
  onClose: () => void;
  player: Player;
  otherPlayers: Player[];
  loading?: boolean;
  onSell: (assetId: string, buyerId?: string, price?: number) => void;
}

export function SellAssetDialog({
  open,
  onClose,
  player,
  otherPlayers,
  loading = false,
  onSell,
}: SellAssetDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<SellMode>('bank');
  const [buyerId, setBuyerId] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);

  const selectedAsset = selectedId
    ? player.assets.find((a) => a.id === selectedId) ?? null
    : null;

  const resetState = () => {
    setSelectedId(null);
    setMode('bank');
    setBuyerId(null);
    setPrice(0);
  };

  const handleConfirm = () => {
    if (!selectedId) return;
    if (mode === 'bank') {
      onSell(selectedId);
    } else if (buyerId && price > 0) {
      onSell(selectedId, buyerId, price);
    } else {
      return;
    }
    resetState();
    onClose();
  };

  const handleCancel = () => {
    resetState();
    onClose();
  };

  if (player.assets.length === 0) {
    return (
      <Modal open={open} onClose={handleCancel} title="Sell Asset">
        <p className="text-sm text-text-muted text-center py-6">
          You have no assets to sell.
        </p>
        <div className="flex justify-center">
          <button
            onClick={handleCancel}
            className="
              px-4 py-2 rounded-lg text-sm font-medium
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

  const selectedDef = selectedAsset ? ASSET_DEFINITIONS[selectedAsset.type] : null;
  const maxPrice = selectedDef ? selectedDef.purchasePrice * 5 : 0;
  const buyerCanAfford = buyerId ? (otherPlayers.find((p) => p.id === buyerId)?.lc ?? 0) >= price : false;

  return (
    <Modal open={open} onClose={handleCancel} title="Sell Asset">
      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('bank')}
          className={`
            flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
            ${mode === 'bank'
              ? 'bg-gold/20 text-gold border border-gold/30'
              : 'bg-cream/5 text-text-muted border border-cream/10 hover:bg-cream/10'
            }
          `}
        >
          Sell to Bank
        </button>
        <button
          onClick={() => setMode('player')}
          disabled={otherPlayers.length === 0}
          className={`
            flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
            ${mode === 'player'
              ? 'bg-gold/20 text-gold border border-gold/30'
              : 'bg-cream/5 text-text-muted border border-cream/10 hover:bg-cream/10'
            }
            ${otherPlayers.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}
          `}
        >
          Sell to Player
        </button>
      </div>

      <p className="text-sm text-text-secondary mb-3">
        {mode === 'bank'
          ? 'Select an asset to sell. You get the full purchase price back.'
          : 'Select an asset and set a price for another player to buy.'
        }
      </p>

      {/* Asset list */}
      <div className="space-y-2 mb-4 max-h-[220px] overflow-y-auto">
        {player.assets.map((asset) => {
          const def = ASSET_DEFINITIONS[asset.type];
          return (
            <button
              key={asset.id}
              onClick={() => {
                setSelectedId(asset.id);
                if (mode === 'player') setPrice(def.purchasePrice);
              }}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all
                ${selectedId === asset.id
                  ? 'border-gold bg-gold/10 ring-1 ring-gold'
                  : 'border-cream/10 bg-felt-dark/80 hover:border-cream/25'
                }
              `}
            >
              <div>
                <span className="capitalize font-semibold text-sm text-text">{asset.type}</span>
                <span className="text-xs text-text-muted ml-2">
                  ◈{def.purchasePrice} LC
                </span>
              </div>
              {selectedId === asset.id && (
                <span className="text-gold text-xs font-semibold">Selected</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Player mode: buyer + price */}
      {mode === 'player' && selectedAsset && (
        <>
          {/* Buyer selection */}
          <div className="mb-3">
            <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2 block">
              Buyer
            </label>
            <div className="flex gap-2 flex-wrap">
              {otherPlayers.filter((p) => !p.isEliminated).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setBuyerId(p.id)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                    ${buyerId === p.id
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-cream/10 text-text-secondary hover:border-cream/25'
                    }
                  `}
                >
                  {p.name} ({p.lc} LC)
                </button>
              ))}
            </div>
          </div>

          {/* Price input */}
          {buyerId && (
            <div className="mb-3">
              <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2 block">
                Sale Price
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPrice((p) => Math.max(1, p - 5))}
                  disabled={price <= 1}
                  className="
                    w-9 h-9 flex items-center justify-center rounded-lg
                    border border-cream/15 text-lg font-bold text-text
                    hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed
                    transition-all
                  "
                >
                  −
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-extrabold text-gold tabular-nums">{price}</span>
                  <span className="text-sm text-text-muted ml-1">LC</span>
                </div>
                <button
                  onClick={() => setPrice((p) => Math.min(maxPrice, p + 5))}
                  disabled={price >= maxPrice}
                  className="
                    w-9 h-9 flex items-center justify-center rounded-lg
                    border border-cream/15 text-lg font-bold text-text
                    hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed
                    transition-all
                  "
                >
                  +
                </button>
              </div>
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>1 LC</span>
                <span>Max {maxPrice} LC</span>
              </div>
              {!buyerCanAfford && buyerId && (
                <p className="text-danger text-xs mt-1 font-medium">
                  Buyer cannot afford this price
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Sell confirmation warning for bank sales */}
      {mode === 'bank' && selectedAsset && (
        <div className="mb-3 rounded-lg border border-warning/20 bg-warning/5 p-2.5">
          <p className="text-[0.55rem] text-warning font-medium">
            <span className="inline-flex items-center gap-1.5"><IconWarning size={12} /> You'll lose the income stream ({selectedDef?.incomePerRound ?? 0} LC/round) and take a tax reduction hit ({selectedDef?.taxPerRound ?? 0} LC/round).</span>
          </p>
        </div>
      )}

      {/* Confirm */}
      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={
            !selectedId ||
            loading ||
            (mode === 'player' && (!buyerId || price <= 0 || !buyerCanAfford))
          }
          className="
            flex-1 px-5 py-2.5 rounded-lg text-base font-semibold
            bg-gold text-stone-900
            hover:brightness-110 active:brightness-90
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          {loading ? 'Processing...'
            : mode === 'bank' && selectedAsset
              ? `Sell to Bank — ${selectedDef?.purchasePrice ?? 0} LC`
              : mode === 'player' && selectedAsset && buyerId
                ? `Sell to ${otherPlayers.find((p) => p.id === buyerId)?.name ?? '—'} for ${price} LC`
                : 'Select an asset'}
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
