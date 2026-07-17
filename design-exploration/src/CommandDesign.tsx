import { MOCK_GAME_STATE } from './mockData';
import type { Player, MarketAsset } from './types';

/* ─── DESIGN 3: THE COMMAND ───
 * Tactical, bold, tension-forward military operations room.
 * Midnight navy, crimson alerts, steel blue data.
 * Heavy borders, color-coded status blocks, asymmetric layout.
 * Feels like you're in a strategic command center.
 */

function StatusBlock({ health }: { health: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    healthy: { label: '✓ OPERATIONAL', color: '#27AE60', bg: 'rgba(39, 174, 96, 0.15)' },
    stable: { label: '● STABLE', color: '#4A90D9', bg: 'rgba(74, 144, 217, 0.15)' },
    stressed: { label: '▲ STRESSED', color: '#F5A623', bg: 'rgba(245, 166, 35, 0.15)' },
    critical: { label: '✕ CRITICAL', color: '#D32F2F', bg: 'rgba(211, 47, 47, 0.15)' },
  };
  const c = cfg[health] || cfg.stable;
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-widest"
          style={{ background: c.bg, color: c.color, borderLeft: `2px solid ${c.color}` }}>
      {c.label}
    </span>
  );
}

function PlayerCard({ player, isCurrent }: { player: Player; isCurrent: boolean }) {
  const netIncome = player.income - player.tax;
  return (
    <div className={`relative ${isCurrent ? 'command-active-border' : ''}`}
         style={{
           background: 'var(--color-command-surface)',
           border: `2px solid ${isCurrent ? 'var(--color-command-steel)' : 'var(--color-command-border)'}`,
           transition: 'border-color 0.2s',
         }}>
      {/* Corner tab for current player */}
      {isCurrent && (
        <div className="absolute -top-px -right-px px-2 py-0.5 text-[8px] font-bold tracking-[0.2em]"
             style={{ background: 'var(--color-command-steel)', color: '#fff' }}>
          ACTING
        </div>
      )}

      <div className="p-3">
        {/* Top: Name + Status */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5" style={{
              background: player.color,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }} />
            <span className="font-[family-name:var(--font-command)] text-[12px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--color-command-ink)' }}>
              {player.name}
            </span>
          </div>
          <StatusBlock health={player.financialHealth} />
        </div>

        {/* LC Display */}
        <div className="flex items-baseline gap-2 mb-2.5">
          <span className="font-[family-name:var(--font-command)] text-[30px] font-black leading-none tracking-tight"
                style={{ color: 'var(--color-command-ink)' }}>
            {player.lc}
          </span>
          <span className="font-[family-name:var(--font-command)] text-[10px] font-bold tracking-[0.15em]"
                style={{ color: 'var(--color-command-muted)' }}>LC</span>
        </div>

        {/* Asset grid */}
        <div className="grid grid-cols-4 gap-1 mb-2.5">
          {player.assets.slice(0, 4).map((a) => (
            <div key={a.id} className="text-center py-1 text-[10px] font-bold font-[family-name:var(--font-command)]"
                 style={{
                   background: 'var(--color-command-bg)',
                   border: '1px solid var(--color-command-border)',
                   color: a.type === 'ace' ? 'var(--color-command-amber)' :
                          a.type === 'king' ? 'var(--color-command-steel)' :
                          a.type === 'queen' ? '#9B59B6' :
                          'var(--color-command-muted)',
                 }}>
              {a.type.toUpperCase()}
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - player.assets.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="text-center py-1 text-[10px] font-[family-name:var(--font-command)]"
                 style={{
                   background: 'var(--color-command-bg)',
                   border: '1px dashed var(--color-command-border)',
                   color: 'var(--color-command-dim)',
                 }}>
              —
            </div>
          ))}
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2 pt-2" style={{ borderTop: '1px solid var(--color-command-border)' }}>
          <div className="text-center">
            <div className="font-[family-name:var(--font-command)] text-[11px] font-bold"
                 style={{ color: '#27AE60' }}>+{player.income}</div>
            <div className="font-[family-name:var(--font-command)] text-[7px] uppercase tracking-[0.15em]"
                 style={{ color: 'var(--color-command-muted)' }}>Income</div>
          </div>
          <div className="text-center">
            <div className="font-[family-name:var(--font-command)] text-[11px] font-bold"
                 style={{ color: '#D32F2F' }}>-{player.tax}</div>
            <div className="font-[family-name:var(--font-command)] text-[7px] uppercase tracking-[0.15em]"
                 style={{ color: 'var(--color-command-muted)' }}>Tax</div>
          </div>
          <div className="text-center">
            <div className="font-[family-name:var(--font-command)] text-[11px] font-bold"
                 style={{ color: netIncome >= 0 ? '#27AE60' : '#D32F2F' }}>
              {netIncome >= 0 ? '+' : ''}{netIncome}
            </div>
            <div className="font-[family-name:var(--font-command)] text-[7px] uppercase tracking-[0.15em]"
                 style={{ color: 'var(--color-command-muted)' }}>Net</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketPanel({ assets }: { assets: MarketAsset[] }) {
  return (
    <div style={{
      background: 'var(--color-command-surface)',
      border: '2px solid var(--color-command-border)',
    }} className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-4" style={{ background: 'var(--color-command-steel)' }} />
          <h2 className="font-[family-name:var(--font-command)] text-[14px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--color-command-ink)' }}>
            Asset Market
          </h2>
        </div>
        <div className="font-[family-name:var(--font-command)] text-[10px] px-2 py-0.5 font-bold"
             style={{
               background: 'var(--color-command-bg)',
               border: '1px solid var(--color-command-border)',
               color: 'var(--color-command-muted)',
             }}>
          {assets.reduce((s, a) => s + a.remaining, 0)} UNITS
        </div>
      </div>

      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr className="font-[family-name:var(--font-command)] text-[9px] uppercase tracking-[0.15em]"
            style={{ color: 'var(--color-command-muted)' }}>
            <th className="text-left pb-2 font-medium">Asset</th>
            <th className="text-right pb-2 font-medium">Price</th>
            <th className="text-right pb-2 font-medium">Income</th>
            <th className="text-right pb-2 font-medium">Tax</th>
            <th className="text-center pb-2 font-medium">Max</th>
            <th className="text-center pb-2 font-medium">Stock</th>
            <th className="text-right pb-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr key={a.type} className="group" style={{
              borderTop: '1px solid var(--color-command-border)',
            }}>
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 text-center text-[13px] font-bold"
                       style={{
                         color: a.type === 'ace' ? 'var(--color-command-amber)' :
                                a.type === 'king' ? 'var(--color-command-steel)' :
                                a.type === 'queen' ? '#9B59B6' : 'var(--color-command-muted)',
                       }}>
                    {a.type.toUpperCase()[0]}
                  </div>
                  <span className="font-[family-name:var(--font-command)] text-[12px] font-bold uppercase"
                        style={{ color: 'var(--color-command-ink)' }}>{a.type}</span>
                </div>
              </td>
              <td className="text-right py-2.5">
                <span className="font-[family-name:var(--font-command)] text-[14px] font-bold"
                      style={{ color: 'var(--color-command-ink)' }}>{a.price}</span>
              </td>
              <td className="text-right py-2.5">
                <span className="font-[family-name:var(--font-command)] text-[12px] font-bold"
                      style={{ color: '#27AE60' }}>+{a.income}</span>
              </td>
              <td className="text-right py-2.5">
                <span className="font-[family-name:var(--font-command)] text-[12px] font-bold"
                      style={{ color: '#D32F2F' }}>-{a.tax}</span>
              </td>
              <td className="text-center py-2.5">
                <span className="font-[family-name:var(--font-command)] text-[11px]"
                      style={{ color: 'var(--color-command-muted)' }}>{a.max}</span>
              </td>
              <td className="text-center py-2.5">
                <span className="font-[family-name:var(--font-command)] text-[11px] font-bold px-2 py-0.5"
                      style={{
                        background: a.remaining > 2 ? 'rgba(39, 174, 96, 0.12)' :
                                    a.remaining > 0 ? 'rgba(245, 166, 35, 0.12)' : 'rgba(211, 47, 47, 0.12)',
                        color: a.remaining > 2 ? '#27AE60' :
                               a.remaining > 0 ? '#F5A623' : '#D32F2F',
                        border: `1px solid ${
                          a.remaining > 2 ? 'rgba(39, 174, 96, 0.3)' :
                          a.remaining > 0 ? 'rgba(245, 166, 35, 0.3)' : 'rgba(211, 47, 47, 0.3)'
                        }`,
                      }}>
                  {a.remaining}
                </span>
              </td>
              <td className="text-right py-2.5">
                <button className="px-5 py-2.5 text-[12px] font-[family-name:var(--font-command)] font-bold
                                   cursor-pointer transition-all duration-150 uppercase tracking-wider"
                        style={{
                          background: a.remaining > 0 ? 'var(--color-command-steel)' : 'transparent',
                          border: `2px solid ${a.remaining > 0 ? 'var(--color-command-steel)' : 'var(--color-command-border)'}`,
                          color: a.remaining > 0 ? '#fff' : 'var(--color-command-dim)',
                          opacity: a.remaining > 0 ? 1 : 0.5,
                        }}
                        disabled={a.remaining <= 0}>
                  {a.remaining > 0 ? 'DEPLOY' : 'N/A'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionPanel() {
  return (
    <div style={{
      background: 'var(--color-command-surface)',
      border: '2px solid var(--color-command-border)',
    }} className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1.5 h-4" style={{ background: 'var(--color-command-crimson)' }} />
        <h2 className="font-[family-name:var(--font-command)] text-[14px] font-bold uppercase tracking-wider"
            style={{ color: 'var(--color-command-ink)' }}>
          Command
        </h2>
      </div>
      <div className="space-y-2">
        {[
          { label: 'ACQUIRE ASSET', key: 'buy', primary: true },
          { label: 'DIVEST ASSET', key: 'sell', primary: false },
          { label: 'SECURE LOAN', key: 'borrow', primary: false },
          { label: 'EXTEND INVESTMENT', key: 'invest', primary: false },
          { label: 'OPEN AUCTION', key: 'auction', primary: false },
          { label: 'INITIATE TAKEOVER', key: 'takeover', primary: false, danger: true },
        ].map((a) => (
          <button key={a.key}
                  className="w-full px-5 py-3 text-[12px] font-[family-name:var(--font-command)] font-bold
                             cursor-pointer transition-all duration-150 active:scale-[0.98] uppercase tracking-wider text-left"
                  style={{
                    background: a.primary ? 'var(--color-command-steel)' :
                                a.danger ? 'rgba(211, 47, 47, 0.08)' : 'var(--color-command-bg)',
                    border: `2px solid ${
                      a.primary ? 'var(--color-command-steel)' :
                      a.danger ? 'rgba(211, 47, 47, 0.3)' : 'var(--color-command-border)'
                    }`,
                    color: a.primary ? '#fff' : a.danger ? '#D32F2F' : 'var(--color-command-ink)',
                  }}>
            {a.danger && <span className="mr-2">⚔</span>}
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function IntelPanel() {
  const sorted = [...MOCK_GAME_STATE.players].sort((a, b) => b.netWorth - a.netWorth);
  return (
    <div style={{
      background: 'var(--color-command-surface)',
      border: '2px solid var(--color-command-border)',
    }} className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1.5 h-4" style={{ background: 'var(--color-command-amber)' }} />
        <h2 className="font-[family-name:var(--font-command)] text-[14px] font-bold uppercase tracking-wider"
            style={{ color: 'var(--color-command-ink)' }}>
          Intelligence
        </h2>
      </div>
      <div className="space-y-1">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2 px-2 py-1.5"
               style={{ background: i === 0 ? 'rgba(245, 166, 35, 0.05)' : 'transparent' }}>
            <span className="font-[family-name:var(--font-command)] text-[10px] font-bold w-5 text-right"
                  style={{ color: i === 0 ? 'var(--color-command-amber)' : 'var(--color-command-muted)' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="w-2 h-2" style={{
              background: p.color,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }} />
            <span className="flex-1 font-[family-name:var(--font-command)] text-[11px] truncate"
                  style={{ color: 'var(--color-command-ink)' }}>{p.name}</span>
            <span className="font-[family-name:var(--font-command)] text-[13px] font-bold"
                  style={{ color: 'var(--color-command-ink)' }}>{p.netWorth}</span>
            <span className="font-[family-name:var(--font-command)] text-[8px] tracking-wider"
                  style={{ color: 'var(--color-command-muted)' }}>NW</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogPanel() {
  return (
    <div style={{
      background: 'var(--color-command-surface)',
      border: '2px solid var(--color-command-border)',
      maxHeight: 180,
      overflow: 'auto',
    }} className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-1.5 h-4" style={{ background: 'var(--color-command-muted)' }} />
        <h2 className="font-[family-name:var(--font-command)] text-[12px] font-bold uppercase tracking-wider"
            style={{ color: 'var(--color-command-muted)' }}>
          Event Log
        </h2>
      </div>
      <div className="space-y-1">
        {MOCK_GAME_STATE.logs.map((log, i) => (
          <div key={i} className="flex items-start gap-2 py-1 text-[11px] font-[family-name:var(--font-command)]"
               style={{ borderBottom: i < MOCK_GAME_STATE.logs.length - 1 ? '1px solid var(--color-command-border)' : 'none' }}>
            <span className="shrink-0 font-bold"
                  style={{ color: 'var(--color-command-muted)' }}>
              [{MOCK_GAME_STATE.round - Math.floor(i / 2)}]
            </span>
            <span className="leading-snug"
                  style={{ color: 'var(--color-command-ink)' }}>{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommandDesign() {
  const { players, market } = MOCK_GAME_STATE;

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'var(--color-command-bg)',
      fontFamily: 'var(--font-command)',
    }}>
      {/* Top Bar */}
      <div className="flex items-stretch" style={{
        borderBottom: '2px solid var(--color-command-border)',
        background: 'var(--color-command-surface)',
      }}>
        <div className="flex items-center gap-4 px-4 py-3" style={{
          borderRight: '2px solid var(--color-command-border)',
        }}>
          <div className="w-2 h-4" style={{ background: 'var(--color-command-crimson)' }} />
          <span className="font-[family-name:var(--font-command)] text-[16px] font-black tracking-[0.2em] uppercase"
                style={{ color: 'var(--color-command-ink)' }}>
            Ledger
          </span>
        </div>
        <div className="flex items-center gap-4 px-4 py-3">
          <span className="font-[family-name:var(--font-command)] text-[11px] font-bold px-2 py-0.5"
                style={{
                  background: 'var(--color-command-bg)',
                  border: '1px solid var(--color-command-border)',
                  color: 'var(--color-command-steel)',
                }}>
            {MOCK_GAME_STATE.roomCode}
          </span>
          <span className="font-[family-name:var(--font-command)] text-[11px]"
                style={{ color: 'var(--color-command-muted)' }}>
            RND {String(MOCK_GAME_STATE.round).padStart(2, '0')}
          </span>
          <span className="font-[family-name:var(--font-command)] text-[11px] font-bold px-2 py-0.5"
                style={{
                  background: MOCK_GAME_STATE.phase === 'actions' ? 'rgba(74, 144, 217, 0.12)' : 'rgba(39, 174, 96, 0.12)',
                  color: MOCK_GAME_STATE.phase === 'actions' ? 'var(--color-command-steel)' : '#27AE60',
                }}>
            {MOCK_GAME_STATE.phase === 'actions' ? '● ACTIONS' : MOCK_GAME_STATE.phase.toUpperCase()}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4 py-3">
          <span className="w-1.5 h-1.5 rounded-full" style={{
            background: '#27AE60',
            boxShadow: '0 0 6px rgba(39, 174, 96, 0.6)',
          }} />
          <span className="font-[family-name:var(--font-command)] text-[9px] tracking-wider"
                style={{ color: 'var(--color-command-muted)' }}>SYS ONLINE</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 flex gap-3">
        {/* Left: Player Cards */}
        <div className="flex flex-col gap-3 w-[240px] shrink-0">
          <div className="font-[family-name:var(--font-command)] text-[9px] font-bold uppercase tracking-[0.2em] px-1"
               style={{ color: 'var(--color-command-muted)' }}>
            Corporation Status
          </div>
          {players.map((p) => (
            <PlayerCard key={p.id} player={p} isCurrent={p.isCurrentTurn} />
          ))}
        </div>

        {/* Center: Market */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <MarketPanel assets={market} />
          <LogPanel />
        </div>

        {/* Right: Action + Intel */}
        <div className="flex flex-col gap-3 w-[220px] shrink-0">
          <ActionPanel />
          <IntelPanel />
        </div>
      </div>
    </div>
  );
}
