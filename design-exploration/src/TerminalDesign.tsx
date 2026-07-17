import { MOCK_GAME_STATE } from './mockData';
import type { Player, MarketAsset } from './types';

/* ─── DESIGN 1: THE TERMINAL ───
 * Ultra-dark, monospace, high-density financial terminal.
 * Everything is visible at once. Sharp corners, thin borders,
 * glowing accents. Feels like you're piloting a corporate empire.
 */

function HealthIndicator({ health }: { health: string }) {
  const colors: Record<string, string> = {
    healthy: 'var(--color-terminal-green)',
    stable: 'var(--color-terminal-cyan)',
    stressed: 'var(--color-terminal-amber)',
    critical: 'var(--color-terminal-red)',
  };
  return (
    <span style={{ color: colors[health] || 'var(--color-terminal-muted)' }}
          className="text-[10px] uppercase tracking-[0.15em] font-medium">
      ◆ {health}
    </span>
  );
}

function PlayerPanel({ player, isCurrent }: { player: Player; isCurrent: boolean }) {
  const netIncome = player.income - player.tax;
  return (
    <div style={{
      background: 'var(--color-terminal-surface)',
      border: `1px solid ${isCurrent ? 'var(--color-terminal-accent)' : 'var(--color-terminal-border)'}`,
      boxShadow: isCurrent ? '0 0 12px rgba(108,92,231,0.2)' : 'none',
    }} className="p-3 transition-all duration-300">
      {/* Cursor indicator for current turn */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full" style={{
          background: player.color,
          boxShadow: `0 0 6px ${player.color}80`,
        }} />
        <span className="font-[family-name:var(--font-terminal)] text-[13px] uppercase tracking-[0.08em]"
              style={{ color: 'var(--color-terminal-ink)' }}>
          {player.name}
          {isCurrent && <span className="text-[var(--color-terminal-accent)] ml-1">◄ ACTIVE</span>}
        </span>
      </div>

      {/* LC Balance — largest number */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-[family-name:var(--font-terminal)] text-[28px] font-bold leading-none tracking-tight"
              style={{ color: 'var(--color-terminal-cyan)' }}>
          {player.lc}
        </span>
        <span className="font-[family-name:var(--font-terminal)] text-[10px] uppercase tracking-[0.12em]"
              style={{ color: 'var(--color-terminal-muted)' }}>LC</span>
      </div>

      {/* Asset holdings */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-[family-name:var(--font-terminal)] text-[11px]"
              style={{ color: 'var(--color-terminal-muted)' }}>PORTFOLIO</span>
        <div className="flex-1 h-px" style={{ background: 'var(--color-terminal-border)' }} />
        <div className="flex gap-1">
          {player.assets.map((a) => (
            <span key={a.id} className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold"
                  style={{
                    background: 'var(--color-terminal-elevated)',
                    border: '1px solid var(--color-terminal-border)',
                    color: a.type === 'ace' ? 'var(--color-terminal-amber)' :
                           a.type === 'king' ? 'var(--color-terminal-cyan)' :
                           a.type === 'queen' ? 'var(--color-terminal-accent)' :
                           'var(--color-terminal-muted)',
                  }}>
              {a.type === 'ace' ? 'A' : a.type === 'king' ? 'K' : a.type === 'queen' ? 'Q' : 'J'}
            </span>
          ))}
        </div>
      </div>

      {/* Income / Tax row */}
      <div className="flex items-center gap-3 text-[11px] font-[family-name:var(--font-terminal)]">
        <span style={{ color: 'var(--color-terminal-green)' }}>+{player.income} LC</span>
        <span style={{ color: 'var(--color-terminal-red)' }}>-{player.tax} LC</span>
        <span style={{
          color: netIncome >= 0 ? 'var(--color-terminal-green)' : 'var(--color-terminal-red)',
        }}>
          = {netIncome >= 0 ? '+' : ''}{netIncome} LC NET
        </span>
        <div className="ml-auto">
          <HealthIndicator health={player.financialHealth} />
        </div>
      </div>
    </div>
  );
}

function MarketPanel({ assets }: { assets: MarketAsset[] }) {
  return (
    <div className="p-3" style={{
      background: 'var(--color-terminal-surface)',
      border: '1px solid var(--color-terminal-border)',
    }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-[family-name:var(--font-terminal)] text-[11px] uppercase tracking-[0.12em]"
              style={{ color: 'var(--color-terminal-accent)' }}>◆ MARKET</span>
        <div className="flex-1 h-px" style={{ background: 'var(--color-terminal-border)' }} />
        <span className="font-[family-name:var(--font-terminal)] text-[10px]"
              style={{ color: 'var(--color-terminal-muted)' }}>SPOT</span>
      </div>
      <div className="space-y-2">
        {assets.map((a) => (
          <div key={a.type} className="flex items-center gap-3 p-2"
               style={{ background: 'var(--color-terminal-elevated)', border: '1px solid var(--color-terminal-border)' }}>
            <div className="w-7 h-7 flex items-center justify-center text-[13px] font-bold"
                 style={{
                   background: 'var(--color-terminal-bg)',
                   border: '1px solid var(--color-terminal-border)',
                   color: a.type === 'ace' ? 'var(--color-terminal-amber)' :
                          a.type === 'king' ? 'var(--color-terminal-cyan)' :
                          a.type === 'queen' ? 'var(--color-terminal-accent)' :
                          'var(--color-terminal-muted)',
                 }}>
              {a.type === 'ace' ? 'A' : a.type === 'king' ? 'K' : a.type === 'queen' ? 'Q' : 'J'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-terminal)] text-[13px] capitalize"
                      style={{ color: 'var(--color-terminal-ink)' }}>{a.type}</span>
                <span className="font-[family-name:var(--font-terminal)] text-[10px]"
                      style={{ color: 'var(--color-terminal-muted)' }}>×{a.remaining}</span>
              </div>
              <div className="flex gap-3 text-[10px] font-[family-name:var(--font-terminal)] mt-0.5">
                <span style={{ color: 'var(--color-terminal-cyan)' }}>+{a.income} LC</span>
                <span style={{ color: 'var(--color-terminal-red)' }}>-{a.tax} LC</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-[family-name:var(--font-terminal)] text-[16px] font-bold leading-none"
                   style={{ color: 'var(--color-terminal-ink)' }}>
                {a.price}
              </div>
              <div className="font-[family-name:var(--font-terminal)] text-[9px] uppercase tracking-[0.1em]"
                   style={{ color: 'var(--color-terminal-muted)' }}>LC</div>
            </div>
            <button className="px-4 py-2 text-[12px] font-[family-name:var(--font-terminal)] font-bold border cursor-pointer transition-all duration-200"
                    style={{
                      background: a.remaining > 0 ? 'transparent' : 'var(--color-terminal-elevated)',
                      border: `1px solid ${a.remaining > 0 ? 'var(--color-terminal-accent)' : 'var(--color-terminal-border)'}`,
                      color: a.remaining > 0 ? 'var(--color-terminal-accent)' : 'var(--color-terminal-dim)',
                    }}
                    disabled={a.remaining <= 0}>
              BUY
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionPanel() {
  const actions = [
    { label: 'BUY ASSET', key: 'buy', primary: true },
    { label: 'SELL ASSET', key: 'sell', primary: false },
    { label: 'BORROW LC', key: 'borrow', primary: false },
    { label: 'INVEST', key: 'invest', primary: false },
    { label: 'AUCTION', key: 'auction', primary: false },
    { label: 'TAKEOVER', key: 'takeover', primary: false, danger: true },
  ];
  return (
    <div style={{
      background: 'var(--color-terminal-surface)',
      border: '1px solid var(--color-terminal-border)',
    }} className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-[family-name:var(--font-terminal)] text-[11px] uppercase tracking-[0.12em]"
              style={{ color: 'var(--color-terminal-accent)' }}>◆ ACTIONS</span>
        <div className="flex-1 h-px" style={{ background: 'var(--color-terminal-border)' }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <button key={a.key} className="px-4 py-2.5 text-[12px] font-[family-name:var(--font-terminal)] font-bold
                                         uppercase tracking-[0.08em] cursor-pointer transition-all duration-150"
                  style={{
                    background: a.primary ? 'var(--color-terminal-accent)' :
                                a.danger ? 'transparent' : 'var(--color-terminal-elevated)',
                    border: `1px solid ${a.danger ? 'var(--color-terminal-red)' : a.primary ? 'var(--color-terminal-accent)' : 'var(--color-terminal-border)'}`,
                    color: a.primary ? '#fff' : a.danger ? 'var(--color-terminal-red)' : 'var(--color-terminal-ink)',
                    opacity: a.primary ? 1 : 0.85,
                  }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* Quick stats */}
      <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-terminal-border)' }}>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'ROUND', value: MOCK_GAME_STATE.round },
            { label: 'PHASE', value: MOCK_GAME_STATE.phase.toUpperCase() },
            { label: 'TURN', value: MOCK_GAME_STATE.players[0].name.split(' ')[0] },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-[family-name:var(--font-terminal)] text-[10px] uppercase tracking-[0.12em]"
                   style={{ color: 'var(--color-terminal-muted)' }}>{s.label}</div>
              <div className="font-[family-name:var(--font-terminal)] text-[13px] font-bold mt-0.5"
                   style={{ color: 'var(--color-terminal-ink)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GameLog() {
  return (
    <div className="p-3" style={{
      background: 'var(--color-terminal-surface)',
      border: '1px solid var(--color-terminal-border)',
      maxHeight: 240,
      overflow: 'auto',
    }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-[family-name:var(--font-terminal)] text-[11px] uppercase tracking-[0.12em]"
              style={{ color: 'var(--color-terminal-muted)' }}>■ LOG</span>
        <div className="flex-1 h-px" style={{ background: 'var(--color-terminal-border)' }} />
      </div>
      {MOCK_GAME_STATE.logs.map((log, i) => (
        <div key={i} className="flex items-start gap-2 py-1 border-b last:border-0"
             style={{ borderColor: 'var(--color-terminal-border)' }}>
          <span className="font-[family-name:var(--font-terminal)] text-[10px] mt-0.5 shrink-0"
                style={{ color: 'var(--color-terminal-dim)' }}>{`[${MOCK_GAME_STATE.round - Math.floor(i / 2)}]`}</span>
          <span className="font-[family-name:var(--font-terminal)] text-[11px] leading-snug"
                style={{ color: 'var(--color-terminal-muted)' }}>{log}</span>
        </div>
      ))}
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between px-4 py-2"
         style={{
           background: 'var(--color-terminal-surface)',
           borderBottom: '1px solid var(--color-terminal-border)',
         }}>
      <div className="flex items-center gap-4">
        <span className="font-[family-name:var(--font-terminal)] text-[14px] font-bold tracking-[0.15em] uppercase"
              style={{ color: 'var(--color-terminal-accent)' }}>
          Ledger
        </span>
        <span className="font-[family-name:var(--font-terminal)] text-[10px] px-2 py-0.5"
              style={{
                background: 'var(--color-terminal-elevated)',
                border: '1px solid var(--color-terminal-border)',
                color: 'var(--color-terminal-muted)',
              }}>
          {MOCK_GAME_STATE.roomCode}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-[family-name:var(--font-terminal)] text-[11px]"
              style={{ color: 'var(--color-terminal-cyan)' }}>
          ROUND {MOCK_GAME_STATE.round}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{
            background: 'var(--color-terminal-green)',
            boxShadow: '0 0 6px rgba(0, 230, 118, 0.5)',
          }} />
          <span className="font-[family-name:var(--font-terminal)] text-[10px]"
                style={{ color: 'var(--color-terminal-muted)' }}>CONNECTED</span>
        </span>
      </div>
    </div>
  );
}

export default function TerminalDesign() {
  const { players, market } = MOCK_GAME_STATE;

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'var(--color-terminal-bg)',
      fontFamily: 'var(--font-terminal)',
    }}>
      {/* Subtle scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
           style={{
             background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
           }} />

      <TopBar />

      <div className="flex-1 flex gap-3 p-3" style={{ minHeight: 0 }}>
        {/* Left: Player standings */}
        <div className="w-[280px] shrink-0 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1 mb-1">
            <span className="font-[family-name:var(--font-terminal)] text-[10px] uppercase tracking-[0.15em]"
                  style={{ color: 'var(--color-terminal-muted)' }}>CORPORATIONS</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-terminal-border)' }} />
            <span className="font-[family-name:var(--font-terminal)] text-[10px]"
                  style={{ color: 'var(--color-terminal-muted)' }}>{players.length}</span>
          </div>
          {players.map((p) => (
            <PlayerPanel key={p.id} player={p} isCurrent={p.isCurrentTurn} />
          ))}
        </div>

        {/* Center: Market + Log */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <MarketPanel assets={market} />
          <GameLog />
        </div>

        {/* Right: Actions + standings */}
        <div className="w-[240px] shrink-0 flex flex-col gap-3">
          <ActionPanel />

          {/* Quick standings */}
          <div className="p-3" style={{
            background: 'var(--color-terminal-surface)',
            border: '1px solid var(--color-terminal-border)',
          }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-[family-name:var(--font-terminal)] text-[11px] uppercase tracking-[0.12em]"
                    style={{ color: 'var(--color-terminal-muted)' }}>■ RANKINGS</span>
              <div className="flex-1 h-px" style={{ background: 'var(--color-terminal-border)' }} />
            </div>
            {[...players]
              .sort((a, b) => b.netWorth - a.netWorth)
              .map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 py-1.5 border-b last:border-0"
                   style={{ borderColor: 'var(--color-terminal-border)' }}>
                <span className="font-[family-name:var(--font-terminal)] text-[10px] w-4 text-right"
                      style={{ color: 'var(--color-terminal-dim)' }}>#{i + 1}</span>
                <div className="w-1.5 h-1.5 rounded-full shrink-0"
                     style={{ background: p.color }} />
                <span className="font-[family-name:var(--font-terminal)] text-[11px] truncate flex-1"
                      style={{ color: 'var(--color-terminal-ink)' }}>{p.name}</span>
                <span className="font-[family-name:var(--font-terminal)] text-[12px] font-bold"
                      style={{ color: 'var(--color-terminal-cyan)' }}>{p.netWorth}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
