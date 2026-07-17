import { MOCK_GAME_STATE } from './mockData';
import type { Player, MarketAsset } from './types';

/* ─── DESIGN 4: THE FELT ───
 * Poker table. Green felt. Chips. Cards. Seats around the rail.
 * Fixed-width centered layout — no absolute-position chaos.
 */

const SUIT_ICONS: Record<string, string> = {
  ace: '♠',
  king: '♦',
  queen: '♥',
  jack: '♣',
};

const TIER_COLORS: Record<string, string> = {
  ace: '#C9A94E',
  king: '#4A90D9',
  queen: '#9B59B6',
  jack: '#8899AA',
};

const HEALTH_COLORS: Record<string, string> = {
  healthy: '#2ECC71',
  stable: '#4A90D9',
  stressed: '#F5A623',
  critical: '#E74C3C',
};

/* ─── Chip Stack ─── */
function ChipStack({ amount }: { amount: number }) {
  const count = Math.min(Math.ceil(amount / 30), 5);
  const colors = ['#C9A94E', '#8899AA', '#D32F2F', '#2ECC71', '#6C5CE7'];
  return (
    <div className="flex items-end gap-[2px]" style={{ perspective: '300px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}
             className="rounded-full shrink-0"
             style={{
               width: 12,
               height: 12,
               background: `radial-gradient(circle at 35% 30%, ${colors[i]}dd, ${colors[i]})`,
               border: `2px solid ${colors[i]}88`,
               boxShadow: `0 2px 3px rgba(0,0,0,0.5), inset 0 1px 0 ${colors[i]}aa`,
               transform: `translateY(${-i * 1.5}px)`,
               zIndex: count - i,
             }} />
      ))}
    </div>
  );
}

/* ─── Player Card (hole cards style) ─── */
function PlayingCard({ type, faceDown }: { type?: string; faceDown?: boolean }) {
  if (faceDown) {
    return (
      <div className="w-9 h-[52px] rounded flex items-center justify-center select-none shrink-0"
           style={{
             background: 'linear-gradient(145deg, #1a2a4a, #0d1528)',
             border: '1px solid #2a3a5a',
             boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
           }}>
        <span className="text-[10px]" style={{ color: '#2a3a5a' }}>◆</span>
      </div>
    );
  }
  const s = TIER_COLORS[type || 'jack'];
  const sym = SUIT_ICONS[type || 'jack'];
  const letter = type ? type[0].toUpperCase() : 'J';
  return (
    <div className="w-9 h-[52px] rounded flex flex-col items-center justify-center select-none shrink-0"
         style={{
           background: 'linear-gradient(180deg, #ffffff, #f2f2f2)',
           border: '1px solid #d0d0d0',
           boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
           color: s,
         }}>
      <span className="text-[13px] font-bold leading-none">{letter}</span>
      <span className="text-[8px] leading-none mt-[2px]">{sym}</span>
    </div>
  );
}

/* ─── Player Seat ─── */
function PlayerSeat({ player, isCurrent }: { player: Player; isCurrent: boolean }) {
  const net = player.income - player.tax;
  const hc = HEALTH_COLORS[player.financialHealth] || '#888';
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Name tag */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap"
           style={{
             background: isCurrent ? 'rgba(201, 169, 78, 0.15)' : 'rgba(0,0,0,0.55)',
             backdropFilter: 'blur(8px)',
             border: `1px solid ${isCurrent ? 'rgba(201, 169, 78, 0.35)' : 'rgba(255,255,255,0.06)'}`,
           }}>
        <span className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: player.color, boxShadow: `0 0 8px ${player.color}80` }} />
        <span className="text-[13px] font-semibold tracking-wide"
              style={{ color: isCurrent ? '#C9A94E' : 'rgba(255,255,255,0.85)' }}>
          {player.name}
        </span>
        {isCurrent && (
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] ml-1"
                style={{ color: 'rgba(201, 169, 78, 0.7)' }}>
            ● Acting
          </span>
        )}
      </div>

      {/* Chips + LC */}
      <div className="flex items-center gap-3">
        <ChipStack amount={player.lc} />
        <span className="text-[20px] font-bold leading-none tracking-tight"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: isCurrent ? '#C9A94E' : 'rgba(255,255,255,0.9)',
                textShadow: '0 2px 6px rgba(0,0,0,0.6)',
              }}>
          {player.lc}
        </span>
        <span className="text-[9px] font-medium uppercase tracking-[0.12em]"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
          LC
        </span>
      </div>

      {/* Assets as playing cards */}
      <div className="flex gap-1.5">
        {player.assets.length > 0
          ? player.assets.slice(0, 3).map(a => <PlayingCard key={a.id} type={a.type} />)
          : [0, 1].map(i => <PlayingCard key={i} faceDown />)}
      </div>

      {/* Health + net round */}
      <div className="flex items-center gap-2.5 px-2.5 py-1 rounded-full"
           style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
        <span className="w-2 h-2 rounded-full shrink-0"
              style={{ background: hc, boxShadow: `0 0 6px ${hc}80` }} />
        <span className="text-[10px] font-mono font-bold"
              style={{ color: net >= 0 ? 'rgba(46, 204, 113, 0.7)' : 'rgba(231, 76, 60, 0.7)' }}>
          {net >= 0 ? '+' : ''}{net}/rd
        </span>
      </div>
    </div>
  );
}

/* ─── The Table ─── */
function TableCenter({ assets }: { assets: MarketAsset[] }) {
  return (
    <div className="relative rounded-[80px] mx-auto"
         style={{
           width: 640,
           height: 360,
           background: 'radial-gradient(ellipse at 50% 50%, #1a602e 0%, #10421e 50%, #0a3016 100%)',
           boxShadow: 'inset 0 0 80px rgba(0,0,0,0.35), 0 12px 60px rgba(0,0,0,0.6)',
           border: '8px solid #3a1f0e',
           outline: '4px solid #5a3a1a',
           outlineOffset: '-2px',
         }}>
      {/* Felt texture */}
      <div className="absolute inset-0 rounded-[72px] pointer-events-none opacity-[0.03]"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
           }} />

      {/* Warm spotlight */}
      <div className="absolute inset-0 rounded-[72px] pointer-events-none"
           style={{
             background: 'radial-gradient(ellipse at 50% 40%, rgba(255,220,150,0.07) 0%, transparent 60%)',
           }} />

      {/* Dealer button */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20
                      px-4 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase whitespace-nowrap"
           style={{
             background: 'rgba(201, 169, 78, 0.15)',
             border: '1px solid rgba(201, 169, 78, 0.3)',
             color: '#C9A94E',
           }}>
        Round {MOCK_GAME_STATE.round} · {MOCK_GAME_STATE.phase}
      </div>

      {/* Market grid */}
      <div className="absolute inset-0 flex items-center justify-center p-10">
        <div className="grid grid-cols-4 gap-4 w-full max-w-[520px]">
          {assets.map((a) => {
            const tc = TIER_COLORS[a.type] || '#888';
            const available = a.remaining > 0;
            return (
              <div key={a.type}
                   className="rounded-xl text-center transition-all duration-200 hover:-translate-y-0.5"
                   style={{
                     background: available ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)',
                     backdropFilter: 'blur(6px)',
                     border: `1px solid ${available ? tc + '30' : 'rgba(255,255,255,0.04)'}`,
                     opacity: available ? 1 : 0.3,
                   }}>
                {/* Suit icon */}
                <div className="pt-3 pb-1">
                  <span className="text-[22px] font-bold" style={{ color: tc }}>
                    {SUIT_ICONS[a.type]}
                  </span>
                </div>

                {/* Name */}
                <div className="text-[12px] font-bold uppercase tracking-wider mb-1"
                     style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {a.type}
                </div>

                {/* Price */}
                <div className="text-[16px] font-bold font-mono mb-1" style={{ color: '#C9A94E' }}>
                  {a.price} <span className="text-[8px] uppercase tracking-wider font-medium"
                                  style={{ color: 'rgba(201, 169, 78, 0.5)' }}>LC</span>
                </div>

                {/* Income / Tax */}
                <div className="flex items-center justify-center gap-2 text-[9px] font-medium mb-2">
                  <span style={{ color: 'rgba(46, 204, 113, 0.7)' }}>+{a.income}</span>
                  <span className="text-[6px]" style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                  <span style={{ color: 'rgba(231, 76, 60, 0.7)' }}>-{a.tax}</span>
                </div>

                {/* Stock bar */}
                <div className="mx-3 mb-2"
                     style={{ height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{
                    width: `${(a.remaining / a.max) * 100}%`,
                    height: '100%',
                    borderRadius: 1,
                    background: tc + '60',
                  }} />
                </div>

                {/* Buy button */}
                <div className="px-2 pb-3 pt-1">
                  <button className="w-full py-2 text-[10px] font-bold uppercase tracking-wider
                                     cursor-pointer transition-all duration-150 rounded-lg"
                          style={{
                            background: available ? 'linear-gradient(180deg, rgba(201,169,78,0.25), rgba(201,169,78,0.15))' : 'transparent',
                            border: `1px solid ${available ? 'rgba(201,169,78,0.35)' : 'rgba(255,255,255,0.04)'}`,
                            color: available ? '#C9A94E' : 'rgba(255,255,255,0.15)',
                          }}
                          disabled={!available}>
                    {available ? 'Buy' : 'Sold Out'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Bottom Action Panel ─── */
function ActionBar() {
  const actions = [
    { label: 'Buy Asset', key: 'buy', glyph: '♠' },
    { label: 'Sell', key: 'sell', glyph: '→' },
    { label: 'Borrow', key: 'borrow', glyph: '⊕' },
    { label: 'Invest', key: 'invest', glyph: '⟐' },
    { label: 'Auction', key: 'auction', glyph: '⚖' },
    { label: 'Takeover', key: 'takeover', glyph: '⚔', danger: true },
  ];

  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-xl mx-auto"
         style={{
           background: 'rgba(0,0,0,0.5)',
           backdropFilter: 'blur(14px)',
           border: '1px solid rgba(255,255,255,0.06)',
           boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
         }}>
      {/* Label */}
      <div className="flex items-center gap-2 pr-4"
           style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#C9A94E] shrink-0"
              style={{ boxShadow: '0 0 10px rgba(201,169,78,0.5)' }} />
        <span className="text-[11px] font-semibold whitespace-nowrap"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
          Your Turn
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {actions.map((a) => (
          <button key={a.key}
                  className="px-4 py-2 text-[11px] font-semibold cursor-pointer
                             transition-all duration-150 active:scale-[0.97] rounded-lg whitespace-nowrap"
                  style={{
                    background: a.key === 'buy' ? 'rgba(201, 169, 78, 0.12)' :
                                a.danger ? 'rgba(231, 76, 60, 0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${
                      a.key === 'buy' ? 'rgba(201, 169, 78, 0.25)' :
                      a.danger ? 'rgba(231, 76, 60, 0.2)' : 'rgba(255,255,255,0.06)'
                    }`,
                    color: a.danger ? 'rgba(231, 76, 60, 0.8)' : 'rgba(255,255,255,0.75)',
                  }}>
            <span className="mr-1.5">{a.glyph}</span>
            {a.label}
          </button>
        ))}
      </div>

      {/* Pot */}
      <div className="ml-auto pl-4" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
             style={{ background: 'rgba(255,255,255,0.03)' }}>
          <span className="text-[9px] font-semibold uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
            Pot
          </span>
          <span className="text-[14px] font-bold font-mono" style={{ color: '#C9A94E' }}>
            {MOCK_GAME_STATE.players.reduce((s, p) => s + p.netWorth, 0)}
          </span>
          <span className="text-[8px] uppercase tracking-wider font-medium"
                style={{ color: 'rgba(255,255,255,0.2)' }}>LC</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Side Chronicle ─── */
function Chronicle() {
  return (
    <div className="w-64 p-4 rounded-xl"
         style={{
           background: 'rgba(0,0,0,0.5)',
           backdropFilter: 'blur(12px)',
           border: '1px solid rgba(255,255,255,0.05)',
         }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full" style={{ background: 'rgba(201, 169, 78, 0.4)' }} />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
          Chronicle
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {MOCK_GAME_STATE.logs.map((log, i) => (
          <div key={i} className="flex items-start gap-2.5 text-[11px] leading-snug">
            <span className="shrink-0 font-mono text-[9px] mt-[2px]"
                  style={{ color: 'rgba(201, 169, 78, 0.35)' }}>
              {String(MOCK_GAME_STATE.round - Math.floor(i / 2)).padStart(2, '0')}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Standings Sidebar ─── */
function Standings() {
  const sorted = [...MOCK_GAME_STATE.players].sort((a, b) => b.netWorth - a.netWorth);
  return (
    <div className="w-56 p-4 rounded-xl"
         style={{
           background: 'rgba(0,0,0,0.5)',
           backdropFilter: 'blur(12px)',
           border: '1px solid rgba(255,255,255,0.05)',
         }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full" style={{ background: 'rgba(201, 169, 78, 0.4)' }} />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
          Standings
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg"
               style={{ background: i === 0 ? 'rgba(201, 169, 78, 0.06)' : 'transparent' }}>
            <span className="w-5 text-center text-[10px] font-bold font-mono"
                  style={{ color: i === 0 ? '#C9A94E' : 'rgba(255,255,255,0.2)' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: p.color }} />
            <span className="flex-1 text-[12px] font-medium truncate"
                  style={{ color: 'rgba(255,255,255,0.65)' }}>
              {p.name}
            </span>
            <span className="text-[13px] font-bold font-mono"
                  style={{ color: i === 0 ? '#C9A94E' : 'rgba(255,255,255,0.5)' }}>
              {p.netWorth}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Layout ─── */
export default function PokerTableDesign() {
  const { players, market } = MOCK_GAME_STATE;

  return (
    <div className="min-h-screen flex flex-col"
         style={{
           background: 'radial-gradient(ellipse at 50% 50%, #0e141e 0%, #080b12 60%, #04060a 100%)',
           fontFamily: "'Inter', system-ui, sans-serif",
         }}>
      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0"
           style={{
             background: 'radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(0,0,0,0.7) 100%)',
           }} />

      {/* Overhead light */}
      <div className="fixed inset-0 pointer-events-none z-0"
           style={{
             background: 'radial-gradient(ellipse at 50% 30%, rgba(255,200,100,0.03) 0%, transparent 50%)',
           }} />

      {/* ─── Top Bar ─── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-3"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
              }}>
        <div className="flex items-center gap-4">
          <span className="text-[15px] font-black tracking-[0.25em] uppercase"
                style={{ color: 'rgba(201, 169, 78, 0.8)' }}>
            Ledger
          </span>
          <span className="text-[9px] font-bold px-2 py-1 rounded tracking-wider"
                style={{
                  background: 'rgba(201, 169, 78, 0.1)',
                  color: 'rgba(201, 169, 78, 0.5)',
                  border: '1px solid rgba(201, 169, 78, 0.15)',
                }}>
            {MOCK_GAME_STATE.roomCode}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-medium"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
            {MOCK_GAME_STATE.phase === 'actions' ? 'Action Phase' : MOCK_GAME_STATE.phase}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71]"
                  style={{ boxShadow: '0 0 8px rgba(46, 204, 113, 0.5)' }} />
            <span className="text-[9px] font-bold tracking-wider uppercase"
                  style={{ color: 'rgba(255,255,255,0.2)' }}>Live</span>
          </span>
        </div>
      </header>

      {/* ─── Main content ─── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-8">
        {/* Left sidebar: Standings */}
        <div className="w-56 shrink-0 mr-6">
          <Standings />
        </div>

        {/* Center: Player seats top, table, player seats bottom */}
        <div className="flex flex-col items-center gap-4 flex-1 max-w-[720px]">
          {/* Top row: 3 players */}
          <div className="flex items-center justify-center gap-10 w-full">
            <PlayerSeat player={players[2]} isCurrent={false} />
            <PlayerSeat player={players[3]} isCurrent={false} />
            <PlayerSeat player={players[4]} isCurrent={false} />
          </div>

          {/* Middle: Table */}
          <TableCenter assets={market} />

          {/* Bottom row: 2 players (current at bottom) */}
          <div className="flex items-center justify-center gap-16 w-full">
            <PlayerSeat player={players[1]} isCurrent={false} />
            <PlayerSeat player={players[0]} isCurrent={true} />
          </div>
        </div>

        {/* Right sidebar: Chronicle */}
        <div className="w-64 shrink-0 ml-6">
          <Chronicle />
        </div>
      </main>

      {/* ─── Bottom Action Bar ─── */}
      <footer className="relative z-10 flex justify-center px-6 pb-4">
        <ActionBar />
      </footer>

      {/* Felt edge glow */}
      <div className="fixed bottom-0 left-0 right-0 h-1 z-20 pointer-events-none"
           style={{
             background: 'linear-gradient(90deg, transparent, rgba(26,92,42,0.3), rgba(201,169,78,0.15), rgba(26,92,42,0.3), transparent)',
           }} />
    </div>
  );
}
