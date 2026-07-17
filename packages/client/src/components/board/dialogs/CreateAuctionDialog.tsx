import { useState } from 'react';
import type { Player } from '@ledger/common';
import { ASSET_DEFINITIONS } from '@ledger/common';
import { Modal } from '../../common/Modal';

export interface CreateAuctionDialogProps {
  open: boolean;
  onClose: () => void;
  player: Player;
  loading?: boolean;
  onCreateAuction: (assetId: string, startingBid: number, minimumBid: number) => void;
}

export function CreateAuctionDialog({
  open,
  onClose,
  player,
  loading = false,
  onCreateAuction,
}: CreateAuctionDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [startingBid, setStartingBid] = useState(10);
  const [minimumBid, setMinimumBid] = useState(10);

  const selectedAsset = selectedId
    ? player.assets.find((a) => a.id === selectedId) ?? null
    : null;

  const resetState = () => {
    setSelectedId(null);
    setStartingBid(10);
    setMinimumBid(10);
  };

  const handleConfirm = () => {
    if (!selectedId) return;
    onCreateAuction(selectedId, startingBid, minimumBid);
    resetState();
    onClose();
  };

  const handleCancel = () => {
    resetState();
    onClose();
  };

  if (player.assets.length === 0) {
    return (
      <Modal open={open} onClose={handleCancel} title="Start Auction">
        <p className="text-sm text-text-muted text-center py-6">
          You have no assets to auction.
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

  return (
    <Modal open={open} onClose={handleCancel} title="Start Auction">
      <p className="text-sm text-text-secondary mb-3">
        Select an asset to auction. Other players will bid in real-time.
      </p>

      {/* Asset list */}
      <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
        {player.assets.map((asset) => {
          const def = ASSET_DEFINITIONS[asset.type];
          return (
            <button
              key={asset.id}
              onClick={() => {
                setSelectedId(asset.id);
                setStartingBid(def.purchasePrice);
                setMinimumBid(def.purchasePrice);
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

      {/* Bid settings */}
      {selectedAsset && (
        <div className="space-y-3 mb-4">
          {/* Starting bid */}
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5 block">
              Starting Bid
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStartingBid((p) => Math.max(1, p - 5))}
                disabled={startingBid <= 1}
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
                <span className="text-2xl font-extrabold text-gold tabular-nums">{startingBid}</span>
                <span className="text-sm text-text-muted ml-1">LC</span>
              </div>
              <button
                onClick={() => setStartingBid((p) => Math.min(p + 5, 500))}
                disabled={startingBid >= 500}
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
          </div>

          {/* Minimum bid */}
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5 block">
              Minimum Acceptable Bid
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMinimumBid((p) => Math.max(startingBid, p - 5))}
                disabled={minimumBid <= startingBid}
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
                <span className="text-2xl font-extrabold text-gold tabular-nums">{minimumBid}</span>
                <span className="text-sm text-text-muted ml-1">LC</span>
              </div>
              <button
                onClick={() => setMinimumBid((p) => Math.min(p + 5, 500))}
                disabled={minimumBid >= 500}
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
            {minimumBid > startingBid && (
              <p className="text-xs text-text-muted mt-1">Minimum is higher than starting bid</p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={!selectedId || loading}
          className="
            flex-1 px-5 py-2.5 rounded-lg text-base font-semibold
            bg-gold text-stone-900
            hover:brightness-110 active:brightness-90
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          {loading
            ? 'Processing...'
            : selectedAsset
              ? `Start Auction — ${startingBid} LC starting`
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
