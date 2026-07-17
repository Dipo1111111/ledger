import type { AssetType } from '@ledger/common';
import { ASSET_DEFINITIONS } from '@ledger/common';

/* ─── Suit display mapping ─── */

interface SuitInfo {
  symbol: string;
  colorClass: string;
  label: string;
  suitName: string;
}

const SUIT_MAP: Record<AssetType, SuitInfo> = {
  jack: { symbol: '♠', colorClass: 'text-spade', label: 'J', suitName: 'spade' },
  queen: { symbol: '♥', colorClass: 'text-heart', label: 'Q', suitName: 'heart' },
  king: { symbol: '♣', colorClass: 'text-club', label: 'K', suitName: 'club' },
  ace: { symbol: '♦', colorClass: 'text-diamond', label: 'A', suitName: 'diamond' },
};

/* ─── SVG face card art per suit ─── */

function JackSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none">
      <line x1="30" y1="52" x2="46" y2="95" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="70" y1="52" x2="54" y2="95" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="30" cy="50" r="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="70" cy="50" r="4.5" stroke="currentColor" strokeWidth="2" />
      <polygon points="50,58 55,66 50,74 45,66" fill="currentColor" opacity="0.5" />
      <line x1="26" y1="78" x2="74" y2="78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

function QueenSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none">
      <path d="M14,95 L10,95 L10,78 Q30,52 50,48 Q70,52 90,78 L90,95 L86,95 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="50" cy="48" r="5.5" fill="currentColor" opacity="0.6" />
      <circle cx="28" cy="64" r="3.5" fill="currentColor" opacity="0.4" />
      <circle cx="72" cy="64" r="3.5" fill="currentColor" opacity="0.4" />
      <line x1="14" y1="78" x2="10" y2="94" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <circle cx="10" cy="95" r="3" fill="currentColor" opacity="0.25" />
      <line x1="86" y1="78" x2="90" y2="94" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <circle cx="90" cy="95" r="3" fill="currentColor" opacity="0.25" />
      <line x1="18" y1="92" x2="82" y2="92" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function KingSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none">
      <path d="M20,95 L16,95 L16,75 L28,82 L35,66 L40,69 L50,56 L60,69 L65,66 L72,82 L84,75 L84,95 L80,95 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="50" cy="67" r="5" fill="currentColor" opacity="0.6" />
      <circle cx="28" cy="82" r="3.5" fill="currentColor" opacity="0.4" />
      <circle cx="72" cy="82" r="3.5" fill="currentColor" opacity="0.4" />
      <line x1="22" y1="92" x2="78" y2="92" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="34" cy="95" r="2" fill="currentColor" opacity="0.25" />
      <circle cx="50" cy="95" r="2" fill="currentColor" opacity="0.25" />
      <circle cx="66" cy="95" r="2" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

function AceSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none">
      <polygon points="50,42 64,60 50,78 36,60" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="50,48 57,60 50,72 43,60" fill="currentColor" opacity="0.3" />
      <path d="M36,60 Q25,52 20,56 Q25,60 36,60" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M64,60 Q75,52 80,56 Q75,60 64,60" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M36,60 Q25,68 20,64 Q25,60 36,60" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M64,60 Q75,68 80,64 Q75,60 64,60" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="50" cy="60" r="3" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

const FACE_SVG: Record<AssetType, typeof JackSvg> = {
  jack: JackSvg,
  queen: QueenSvg,
  king: KingSvg,
  ace: AceSvg,
};

/* ─── Props ─── */

export interface AssetCardProps {
  type: AssetType;
  /** Number of this asset the player owns (shown as badge) */
  ownedCount?: number;
  /** If true, shows purchase action (market card) */
  showBuy?: boolean;
  /** If true, shows as an empty slot (dashed border) */
  empty?: boolean;
  /** Called when the card or buy button is clicked */
  onBuy?: (type: AssetType) => void;
  /** Disable the buy action */
  buyDisabled?: boolean;
  /** Additional class names */
  className?: string;
}

/* ─── Component ─── */

export function AssetCard({
  type,
  ownedCount = 0,
  showBuy = false,
  empty = false,
  onBuy,
  buyDisabled = false,
  className = '',
}: AssetCardProps) {
  const def = ASSET_DEFINITIONS[type];
  const suit = SUIT_MAP[type];
  const FaceSvg = FACE_SVG[type];

  /* ─── Empty slot ─── */
  if (empty) {
    return (
      <div
        className={`empty-slot w-full max-w-[160px] ${className}`}
      >
        <span className="text-2xl text-text-muted/40">{suit.symbol}</span>
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted/40">
          {suit.label} Slot
        </span>
        <span className="text-[0.55rem] text-text-muted/30">
          Limit {def.maxPerPlayer}
        </span>
      </div>
    );
  }

  /* ─── Market card variant ─── */
  if (showBuy) {
    return (
      <div
        className={`
          group relative aspect-[5/7] w-full max-w-[160px]
          bg-card rounded-[12px] shadow-card
          flex flex-col items-center justify-center text-center
          px-4 py-4
          transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${!buyDisabled
            ? 'cursor-pointer hover:-translate-y-2 hover:shadow-card-hover'
            : ''
          }
          ${className}
        `}
        onClick={() => {
          if (!buyDisabled && onBuy) onBuy(type);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (!buyDisabled && onBuy && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onBuy(type);
          }
        }}
      >
        {/* Corner rank markers */}
        <div className={`absolute top-2 left-2.5 flex flex-col items-center leading-none ${suit.colorClass}`}>
          <span className="text-[0.75rem] font-bold">{suit.label}</span>
          <span className="text-[0.5rem]">{suit.symbol}</span>
        </div>
        <div className={`absolute bottom-2 right-2.5 flex flex-col items-center leading-none ${suit.colorClass} rotate-180`}>
          <span className="text-[0.75rem] font-bold">{suit.label}</span>
          <span className="text-[0.5rem]">{suit.symbol}</span>
        </div>

        {/* Face art */}
        <FaceSvg className={`w-[58%] h-auto ${suit.colorClass}`} />
        <div className="text-[0.7rem] font-bold text-card-text mt-1">{suit.label} {suit.suitName.charAt(0).toUpperCase() + suit.suitName.slice(1)}</div>

        {/* Price */}
        <div className="text-[0.65rem] font-semibold text-gold-dark mt-1">{def.purchasePrice} LC</div>

        {/* Stats row */}
        <div className="flex gap-2.5 text-[0.55rem] text-text-muted mt-1.5">
          <span className="text-success">+{def.incomePerRound}</span>
          <span className="text-danger">-{def.taxPerRound}</span>
          <span>Max {def.maxPerPlayer}</span>
        </div>

        {/* Buy button */}
        <button
          onClick={(e) => { e.stopPropagation(); if (!buyDisabled && onBuy) onBuy(type); }}
          disabled={buyDisabled}
          className="mt-2 w-[80%] px-4 py-1.5 rounded-lg text-[0.6rem] font-semibold bg-gold-dark text-stone-900 border border-gold hover:bg-gold disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
        >
          Buy
        </button>
      </div>
    );
  }

  /* ─── Playing card (owned/default) ─── */
  const badgeBgClass = {
    spade: 'bg-blue',
    heart: 'bg-pink',
    club: 'bg-gold-dark',
    diamond: 'bg-red',
  }[suit.suitName];

  return (
    <div
      className={`
        relative aspect-[5/7] w-full max-w-[160px]
        bg-card rounded-[12px] shadow-card
        flex flex-col items-center justify-center
        px-4 py-4
        transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${className}
      `}
    >
      {/* Inner border */}
      <div className="absolute inset-[7px] rounded-[7px] border border-black/5 pointer-events-none" />

      {/* Corner rank markers */}
      <div className={`absolute top-2 left-2.5 flex flex-col items-center leading-none ${suit.colorClass}`}>
        <span className="font-bold text-sm">{suit.label}</span>
        <span className="text-[0.55rem]">{suit.symbol}</span>
      </div>
      <div className={`absolute bottom-2 right-2.5 flex flex-col items-center leading-none ${suit.colorClass} rotate-180`}>
        <span className="font-bold text-sm">{suit.label}</span>
        <span className="text-[0.55rem]">{suit.symbol}</span>
      </div>

      {/* Face SVG art */}
      <FaceSvg className={`w-[66%] h-auto ${suit.colorClass}`} />

      {/* Center suit symbol (small, below SVG) */}
      <span className={`text-[0.65rem] leading-none mt-1.5 ${suit.colorClass} opacity-80`}>
        {suit.symbol}
      </span>

      {/* Asset name */}
      <div className="text-[0.6rem] font-semibold text-card-text mt-0.5">{suit.label} {suit.suitName.charAt(0).toUpperCase() + suit.suitName.slice(1)}</div>

      {/* Stats bar at bottom */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between text-[0.55rem] font-semibold px-2 py-1.5 rounded bg-black/5">
        <span className="text-success">+{def.incomePerRound}</span>
        <span className="text-danger">-{def.taxPerRound}</span>
      </div>

      {/* Owned count badge — clean circle, no extra gradient */}
      {ownedCount > 0 && (
        <div className={`absolute -top-1.5 -right-1.5 w-[24px] h-[24px] rounded-full ${badgeBgClass} flex items-center justify-center text-[0.6rem] font-extrabold text-white shadow-md z-10`}>
          {ownedCount}
        </div>
      )}
    </div>
  );
}
