import { useState } from 'react';
import TerminalDesign from './TerminalDesign';
import StudyDesign from './StudyDesign';
import CommandDesign from './CommandDesign';
import PokerTableDesign from './PokerTableDesign';

type DesignKey = 'terminal' | 'study' | 'command' | 'felt';

const designs: { key: DesignKey; label: string; subtitle: string; color: string }[] = [
  { key: 'terminal', label: 'The Terminal', subtitle: 'Ultra-dark financial terminal · Monospace · High density', color: '#6C5CE7' },
  { key: 'study', label: 'The Study', subtitle: 'Warm editorial club · Serif display · Premium spacing', color: '#C9A94E' },
  { key: 'command', label: 'The Command', subtitle: 'Tactical ops room · Bold blocks · Crimson alerts', color: '#D32F2F' },
  { key: 'felt', label: 'The Felt', subtitle: 'Poker table · Green felt · Seated layout · Chip stacks', color: '#1B5E20' },
];

function NavBar({ active, onChange }: { active: DesignKey; onChange: (k: DesignKey) => void }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-stretch"
         style={{
           background: '#0a0a12',
           borderBottom: '1px solid #1a1a2e',
           fontFamily: "'Inter', system-ui, sans-serif",
         }}>
      <div className="flex items-center gap-2 px-4 py-2 mr-2"
           style={{ borderRight: '1px solid #1a1a2e' }}>
        <span className="text-[13px] font-bold tracking-wider text-white/90">
          Ledger
        </span>
        <span className="text-[9px] text-white/30 font-medium px-1.5 py-0.5 border border-white/10 rounded">
          Design Lab
        </span>
      </div>
      {designs.map((d) => (
        <button
          key={d.key}
          onClick={() => onChange(d.key)}
          className="px-5 py-2 cursor-pointer transition-all duration-200 text-left"
          style={{
            background: active === d.key ? `${d.color}15` : 'transparent',
            borderBottom: active === d.key ? `2px solid ${d.color}` : '2px solid transparent',
          }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            <span className="text-[12px] font-semibold"
                  style={{
                    color: active === d.key ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                  }}>
              {d.label}
            </span>
          </div>
          <div className="text-[9px] text-white/30 mt-0.5">{d.subtitle}</div>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState<DesignKey>('terminal');

  return (
    <div className="min-h-screen" style={{ background: '#06060c' }}>
      <NavBar active={active} onChange={setActive} />

      {/* Each design is wrapped in a full-screen container offset by the nav */}
      {/* The Felt uses absolute positioning — no padding so its layout math stays correct */}
      <div className={active === 'felt' ? '' : 'pt-[60px]'}>
        {active === 'terminal' && <TerminalDesign />}
        {active === 'study' && <StudyDesign />}
        {active === 'command' && <CommandDesign />}
        {active === 'felt' && <PokerTableDesign />}
      </div>

      {/* Mini label in corner showing which design is active */}
      <div className="fixed bottom-3 right-3 z-[9999] px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.15em] opacity-50"
           style={{
             background: '#0a0a12',
             border: '1px solid #1a1a2e',
             color: '#6b6b8a',
             borderRadius: '2px',
           }}>
        {active === 'terminal' ? 'T1 · TERMINAL' : active === 'study' ? 'T2 · STUDY' : active === 'command' ? 'T3 · COMMAND' : 'T4 · THE FELT'}
      </div>
    </div>
  );
}
