import { MOCK_GAME_STATE } from './mockData';
import type { Player, MarketAsset } from './types';

/* ─── DESIGN 2: THE STUDY ───
 * Warm, editorial, premium club atmosphere.
 * Deep charcoal surfaces with gold and violet accents.
 * Generous spacing, serif display type, elevated cards.
 * Feels like a high-stakes poker room in a private club.
 */

function HealthBadge({ health }: { health: string }) {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    healthy: { label: 'Healthy', color: '#2ECC71', bg: 'rgba(46, 204, 113, 0.12)' },
    stable: { label: 'Stable', color: '#7C6CF0', bg: 'rgba(124, 108, 240, 0.12)' },
    stressed: { label: 'Stressed', color: '#F5A623', bg: 'rgba(245, 166, 35, 0.12)' },
    critical: { label: 'Critical', color: '#E74C3C', bg: 'rgba(231, 76, 60, 0.12)' },
  };
  const c = config[health] || config.stable;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full"
          style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
      {c.label}
    </span>
  );
}

function AssetGlyph({ type, size = 'sm' }: { type: string; size?: 'sm' | 'md' }) {
  const dims = size === 'md' ? 'w-8 h-8 text-[15px]' : 'w-6 h-6 text-[11px]';
  const colors: Record<string, string> = {
    ace: 'var(--color-study-gold)',
    king: 'var(--color-study-violet)',
    queen: 'var(--color-study-gold-light)',
    jack: 'var(--color-study-muted)',
  };
  return (
    <span className={`inline-flex items-center justify-center ${dims} font-bold rounded-lg`}
          style={{
            background: `${colors[type] || '#888'}1A`,
            border: `1px solid ${colors[type] || '#888'}40`,
            color: colors[type] || '#888',
          }}>
      {type.toUpperCase()[0]}
    </span>
  );
}

function PlayerCard({ player, isCurrent }: { player: Player; isCurrent: boolean }) {
  const netIncome = player.income - player.tax;
  return (
    <div className={`study-card p-5 rounded-xl ${isCurrent ? 'ring-2' : ''}`}
         style={{
           background: 'var(--color-study-surface)',
           border: `1px solid ${isCurrent ? 'var(--color-study-gold)' : 'var(--color-study-border)'}`,
           boxShadow: isCurrent ? '0 0 30px rgba(201, 169, 78, 0.08), 0 8px 32px rgba(0,0,0,0.3)' :
                                 '0 4px 16px rgba(0,0,0,0.2)',
           ringColor: 'var(--color-study-gold)',
         }}>
      {/* Top row: Name + Health */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{
            background: player.color,
            boxShadow: `0 0 8px ${player.color}60`,
          }} />
          <div>
            <h3 className="font-[family-name:var(--font-study-serif)] text-[17px] font-semibold leading-tight"
                style={{ color: 'var(--color-study-ink)' }}>
              {player.name}
              {isCurrent && (
                <span className="ml-2 text-[11px] font-[family-name:var(--font-study-sans)] font-medium italic"
                      style={{ color: 'var(--color-study-gold)' }}>
                  ● acting
                </span>
              )}
            </h3>
          </div>
        </div>
        <HealthBadge health={player.financialHealth} />
      </div>

      {/* LC Balance — hero number */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-[family-name:var(--font-study-serif)] text-[36px] font-bold leading-none tracking-tight"
              style={{ color: 'var(--color-study-gold)' }}>
          {player.lc}
        </span>
        <span className="font-[family-name:var(--font-study-sans)] text-[12px] font-medium uppercase tracking-[0.12em]"
              style={{ color: 'var(--color-study-muted)' }}>LC</span>
      </div>

      {/* Assets row */}
      <div className="flex items-center gap-2 mb-3">
        {player.assets.map((a, i) => (
          <AssetGlyph key={a.id} type={a.type} />
        ))}
        {player.assets.length === 0 && (
          <span className="text-[12px] italic" style={{ color: 'var(--color-study-muted)' }}>
            No assets
          </span>
        )}
      </div>

      {/* Income / Tax / Net */}
      <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid var(--color-study-border)' }}>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-[family-name:var(--font-study-sans)] font-medium"
                style={{ color: '#2ECC71' }}>+{player.income}</span>
          <span className="text-[9px] uppercase tracking-[0.08em] font-[family-name:var(--font-study-sans)]"
                style={{ color: 'var(--color-study-muted)' }}>In</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-[family-name:var(--font-study-sans)] font-medium"
                style={{ color: '#E74C3C' }}>-{player.tax}</span>
          <span className="text-[9px] uppercase tracking-[0.08em] font-[family-name:var(--font-study-sans)]"
                style={{ color: 'var(--color-study-muted)' }}>Tax</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[12px] font-[family-name:var(--font-study-serif)] font-bold"
                style={{
                  color: netIncome >= 0 ? '#2ECC71' : '#E74C3C',
                }}>
            {netIncome >= 0 ? '+' : ''}{netIncome} LC
          </span>
          <span className="text-[9px] uppercase tracking-[0.08em] font-[family-name:var(--font-study-sans)]"
                style={{ color: 'var(--color-study-muted)' }}>Net</span>
        </div>
      </div>
    </div>
  );
}

function MarketPanel({ assets }: { assets: MarketAsset[] }) {
  return (
    <div className="rounded-xl p-5" style={{
      background: 'var(--color-study-surface)',
      border: '1px solid var(--color-study-border)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[family-name:var(--font-study-serif)] text-[18px] font-semibold"
            style={{ color: 'var(--color-study-ink)' }}>
          Market
        </h2>
        <span className="text-[11px] font-[family-name:var(--font-study-sans)] font-medium px-3 py-1 rounded-full"
              style={{
                background: 'var(--color-study-elevated)',
                color: 'var(--color-study-muted)',
              }}>
          {assets.reduce((s, a) => s + a.remaining, 0)} available
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {assets.map((a) => {
          const remaining = a.remaining;
          return (
            <div key={a.type} className="rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5"
                 style={{
                   background: 'var(--color-study-elevated)',
                   border: `1px solid ${remaining > 0 ? 'var(--color-study-border)' : 'var(--color-study-border)'}`,
                   boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                   opacity: remaining > 0 ? 1 : 0.4,
                 }}>
              <div className="flex items-center gap-3 mb-3">
                <AssetGlyph type={a.type} size="md" />
                <div>
                  <h3 className="font-[family-name:var(--font-study-serif)] text-[16px] font-semibold capitalize leading-tight"
                      style={{ color: 'var(--color-study-ink)' }}>
                    {a.type}
                  </h3>
                  <span className="text-[11px] font-[family-name:var(--font-study-sans)]"
                        style={{ color: 'var(--color-study-muted)' }}>
                    {remaining} remaining · max {a.max}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-[family-name:var(--font-study-sans)] font-medium"
                        style={{ color: '#2ECC71' }}>+{a.income}/rd</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-[family-name:var(--font-study-sans)] font-medium"
                        style={{ color: '#E74C3C' }}>-{a.tax}/rd</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3"
                   style={{ borderTop: '1px solid var(--color-study-border)' }}>
                <div className="flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-study-serif)] text-[22px] font-bold"
                        style={{ color: 'var(--color-study-gold)' }}>{a.price}</span>
                  <span className="text-[10px] uppercase tracking-[0.08em] font-[family-name:var(--font-study-sans)]"
                        style={{ color: 'var(--color-study-muted)' }}>LC</span>
                </div>
                <button className="px-5 py-2 rounded-lg text-[12px] font-[family-name:var(--font-study-sans)] font-semibold
                                   cursor-pointer transition-all duration-200 active:scale-95"
                        style={{
                          background: remaining > 0 ? 'linear-gradient(135deg, #C9A94E, #B8922E)' : 'var(--color-study-elevated)',
                          color: remaining > 0 ? '#fff' : 'var(--color-study-dim)',
                          opacity: remaining > 0 ? 1 : 0.5,
                        }}
                        disabled={remaining <= 0}>
                  {remaining > 0 ? 'Acquire' : 'Sold Out'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionsPanel() {
  const actions = [
    { label: 'Acquire Asset', key: 'buy', style: 'primary' as const },
    { label: 'Sell Asset', key: 'sell', style: 'secondary' as const },
    { label: 'Borrow', key: 'borrow', style: 'secondary' as const },
    { label: 'Invest', key: 'invest', style: 'secondary' as const },
    { label: 'Start Auction', key: 'auction', style: 'secondary' as const },
    { label: 'Hostile Takeover', key: 'takeover', style: 'danger' as const },
  ];
  return (
    <div className="rounded-xl p-5" style={{
      background: 'var(--color-study-surface)',
      border: '1px solid var(--color-study-border)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[family-name:var(--font-study-serif)] text-[18px] font-semibold"
            style={{ color: 'var(--color-study-ink)' }}>
          Actions
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((a) => {
          const isPrimary = a.style === 'primary';
          const isDanger = a.style === 'danger';
          return (
            <button key={a.key}
                    className="px-4 py-3 rounded-lg text-[12px] font-[family-name:var(--font-study-sans)] font-semibold
                               cursor-pointer transition-all duration-200 active:scale-[0.97] text-left"
                    style={{
                      background: isPrimary ? 'linear-gradient(135deg, #C9A94E, #B8922E)' :
                                  isDanger ? 'rgba(231, 76, 60, 0.1)' : 'var(--color-study-elevated)',
                      border: `1px solid ${
                        isPrimary ? 'rgba(201, 169, 78, 0.3)' :
                        isDanger ? 'rgba(231, 76, 60, 0.2)' : 'var(--color-study-border)'
                      }`,
                      color: isPrimary ? '#fff' : isDanger ? '#E74C3C' : 'var(--color-study-ink)',
                    }}>
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GameLog() {
  return (
    <div className="rounded-xl p-5" style={{
      background: 'var(--color-study-surface)',
      border: '1px solid var(--color-study-border)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      maxHeight: 200,
      overflow: 'auto',
    }}>
      <h2 className="font-[family-name:var(--font-study-serif)] text-[15px] font-semibold mb-3"
          style={{ color: 'var(--color-study-ink)' }}>
        Chronicle
      </h2>
      <div className="space-y-2">
        {MOCK_GAME_STATE.logs.map((log, i) => (
          <div key={i} className="flex items-start gap-3 text-[12px]">
            <span className="font-[family-name:var(--font-study-sans)] mt-0.5 shrink-0"
                  style={{ color: 'var(--color-study-gold)' }}>
              {MOCK_GAME_STATE.round - Math.floor(i / 2)}.
            </span>
            <span className="font-[family-name:var(--font-study-sans)] leading-relaxed"
                  style={{ color: 'var(--color-study-muted)' }}>{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Standings() {
  const sorted = [...MOCK_GAME_STATE.players].sort((a, b) => b.netWorth - a.netWorth);
  return (
    <div className="rounded-xl p-5" style={{
      background: 'var(--color-study-surface)',
      border: '1px solid var(--color-study-border)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[family-name:var(--font-study-serif)] text-[15px] font-semibold"
            style={{ color: 'var(--color-study-ink)' }}>
          Standings
        </h2>
      </div>
      <div className="space-y-2">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 py-2 px-3 rounded-lg"
               style={{
                 background: i === 0 ? 'rgba(201, 169, 78, 0.06)' : 'transparent',
               }}>
            <span className="font-[family-name:var(--font-study-serif)] text-[12px] w-5 text-center font-bold"
                  style={{
                    color: i === 0 ? 'var(--color-study-gold)' : 'var(--color-study-dim)',
                  }}>
              {i === 0 ? '❶' : i === 1 ? '❷' : i === 2 ? '❸' : `#${i + 1}`}
            </span>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="flex-1 font-[family-name:var(--font-study-sans)] text-[13px] truncate"
                  style={{ color: 'var(--color-study-ink)' }}>{p.name}</span>
            <span className="font-[family-name:var(--font-study-serif)] text-[15px] font-bold"
                  style={{ color: 'var(--color-study-gold)' }}>{p.netWorth}</span>
            <span className="text-[9px] uppercase tracking-[0.08em] font-[family-name:var(--font-study-sans)]"
                  style={{ color: 'var(--color-study-muted)' }}>LC</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudyDesign() {
  const { players, market } = MOCK_GAME_STATE;

  return (
    <div className="min-h-screen" style={{
      background: 'var(--color-study-bg)',
      fontFamily: 'var(--font-study-sans)',
    }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4"
           style={{
             borderBottom: '1px solid var(--color-study-border)',
             background: 'var(--color-study-bg)',
           }}>
        <div className="flex items-center gap-6">
          <h1 className="font-[family-name:var(--font-study-serif)] text-[20px] font-bold tracking-wide"
              style={{ color: 'var(--color-study-gold)' }}>
            Ledger
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-medium px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(201, 169, 78, 0.1)',
                    border: '1px solid rgba(201, 169, 78, 0.2)',
                    color: 'var(--color-study-gold)',
                  }}>
              {MOCK_GAME_STATE.roomCode}
            </span>
            <span className="text-[12px] font-medium"
                  style={{ color: 'var(--color-study-muted)' }}>
              Round {MOCK_GAME_STATE.round}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[12px] font-medium"
                style={{ color: 'var(--color-study-muted)' }}>
            {MOCK_GAME_STATE.phase === 'actions' ? 'Action Phase' : MOCK_GAME_STATE.phase}
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{
              background: '#2ECC71',
              boxShadow: '0 0 8px rgba(46, 204, 113, 0.4)',
            }} />
            <span className="text-[11px]" style={{ color: 'var(--color-study-muted)' }}>Live</span>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="p-6">
        {/* Player cards row */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {players.map((p) => (
            <PlayerCard key={p.id} player={p} isCurrent={p.isCurrentTurn} />
          ))}
        </div>

        {/* Two-column: Market + (Actions + Chronicle) */}
        <div className="flex gap-6">
          <div className="flex-[3] min-w-0">
            <MarketPanel assets={market} />
          </div>
          <div className="flex-[2] flex flex-col gap-4 min-w-0">
            <div className="grid grid-cols-2 gap-4">
              <ActionsPanel />
              <Standings />
            </div>
            <GameLog />
          </div>
        </div>
      </div>
    </div>
  );
}
