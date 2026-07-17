import { useState } from 'react';
import { SettingsPanel } from '../board/SettingsPanel';
import { RulesPanel } from '../board/RulesPanel';

interface GameSidebarProps {
  variant?: 'landing' | 'game';
  onHome?: () => void;
}

export function GameSidebar({ variant = 'game', onHome }: GameSidebarProps) {
  const [activePanel, setActivePanel] = useState<'settings' | 'rules' | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  const closePanel = () => setActivePanel(null);

  const togglePanel = (panel: 'settings' | 'rules') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <>
      {/* Sidebar rail — hidden on mobile */}
      <nav
        className={`fixed left-0 top-0 z-sticky h-dvh
          bg-felt-dark/95 backdrop-blur-md
          border-r border-cream/[0.06]
          flex flex-col
          transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          hidden md:flex
          ${collapsed ? 'w-14' : 'w-48'}`}
      >
        {/* Logo header */}
        <div className={`flex items-center gap-3 px-4 h-14 border-b border-cream/[0.06] shrink-0 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/20 flex items-center justify-center shrink-0">
            <span className="font-serif text-xs font-bold text-gold">L</span>
          </div>
          {!collapsed && (
            <span className="font-serif text-sm font-semibold text-text-secondary whitespace-nowrap">
              Ledger
            </span>
          )}
        </div>

        {/* Nav section label */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted/60">
              Navigation
            </span>
          </div>
        )}

        {/* Nav items */}
        <div className={`flex flex-col gap-0.5 px-2 ${collapsed ? 'mt-2' : ''}`}>
          {variant === 'landing' && (
            <>
              <NavItem
                icon={<HomeIcon />}
                label="Home"
                collapsed={collapsed}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
              <NavItem
                icon={<PlayIcon />}
                label="Play"
                collapsed={collapsed}
                onClick={() => document.getElementById('play-section')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </>
          )}

          <NavItem
            icon={<SettingsIcon />}
            label="Settings"
            collapsed={collapsed}
            onClick={() => togglePanel('settings')}
            active={activePanel === 'settings'}
          />
          <NavItem
            icon={<RulesIcon />}
            label="Rules"
            collapsed={collapsed}
            onClick={() => togglePanel('rules')}
            active={activePanel === 'rules'}
          />

          {variant === 'game' && (
            <>
              <div className={`my-2 border-t border-cream/[0.06] ${collapsed ? 'mx-1' : 'mx-2'}`} />
              <NavItem
                icon={<HomeIcon />}
                label="Leave"
                collapsed={collapsed}
                onClick={onHome}
                danger
              />
            </>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Collapse toggle */}
        <div className="px-2 pb-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-2 rounded-lg text-text-muted/40 hover:text-text-muted hover:bg-cream/[0.04] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Overlay panels */}
      {activePanel === 'settings' && (
        <SettingsPanel onClose={closePanel} />
      )}
      {activePanel === 'rules' && (
        <RulesPanel onClose={closePanel} />
      )}
    </>
  );
}

function NavItem({
  icon,
  label,
  collapsed,
  onClick,
  active,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${collapsed ? 'justify-center' : ''}
        ${danger
          ? active
            ? 'bg-danger/15 text-danger'
            : 'text-danger/60 hover:text-danger hover:bg-danger/10'
          : active
            ? 'bg-gold/15 text-gold'
            : 'text-text-muted hover:text-text-secondary hover:bg-cream/[0.05]'
        }
        cursor-pointer`}
    >
      <span className="w-5 h-5 flex items-center justify-center shrink-0">
        {icon}
      </span>
      {!collapsed && (
        <span className="whitespace-nowrap text-xs tracking-wide">
          {label}
        </span>
      )}
    </button>
  );
}

/* --- SVG Icons (Phosphor-inspired, 1.5px stroke) --- */

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  );
}

function RulesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
      <path d="M8 7h6"/>
      <path d="M8 11h8"/>
    </svg>
  );
}
