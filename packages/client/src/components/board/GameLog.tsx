import { useState, useEffect, useRef, type ReactNode } from 'react';
import type { GameLogEntry, Player } from '@ledger/common';
import {
  IconCoins, IconChart, IconSwords, IconBuilding, IconBriefcase,
  IconHammer, IconDiamond, IconScroll, IconWarning,
} from '../common/Icons';

export interface GameLogProps {
  logs: GameLogEntry[];
  players: Player[];
  myPlayerId: string | null;
}

/** Categories for filtering the log */
export type LogCategory = 'all' | 'income' | 'tax' | 'finance' | 'combat' | 'expansion';

interface CategoryEntry {
  category: LogCategory;
  icon: ReactNode | 'dot';
}

/* ─── Small inline icon components for each category ─── */

const iconIncome = <IconCoins size={12} />;
const iconTax = <IconChart size={12} />;
const iconCombat = <IconSwords size={12} />;
const iconExpansion = <IconBuilding size={12} />;
const iconFinance = <IconCoins size={12} />;
const iconInvestment = <IconBriefcase size={12} />;
const iconAuction = <IconHammer size={12} />;
const iconWarning = <IconWarning size={12} />;
const iconCard = <IconDiamond size={12} />;
const iconScroll = <IconScroll size={12} />;

/**
 * Classify a log entry into a category and return an icon.
 */
function classify(entry: GameLogEntry): CategoryEntry {
  const m = entry.message.toLowerCase();

  if (m.includes('income') || m.includes('collected')) {
    return { category: 'income', icon: iconIncome };
  }
  if (m.includes('tax') || m.includes('paid') || m.includes('insolven')) {
    return { category: 'tax', icon: iconTax };
  }
  if (m.includes('takeover') || m.includes('eliminated') || m.includes('surrender') || m.includes('afk')) {
    return { category: 'combat', icon: iconCombat };
  }
  if (m.includes('expansion') || m.includes('vote') || m.includes('passed') || m.includes('rejected')) {
    return { category: 'expansion', icon: iconExpansion };
  }
  if (m.includes('loan') || m.includes('borrow') || m.includes('repay') || m.includes('default')) {
    return { category: 'finance', icon: iconFinance };
  }
  if (m.includes('investment') || m.includes('invest') || m.includes('offer')) {
    return { category: 'finance', icon: iconInvestment };
  }
  if (m.includes('auction') || m.includes('bid') || m.includes('sold')) {
    return { category: 'finance', icon: iconAuction };
  }
  if (m.includes('emergency') || m.includes('sold')) {
    return { category: 'tax', icon: iconWarning };
  }
  if (m.includes('bought') || m.includes('purchased') || m.includes('asset')) {
    return { category: 'finance', icon: iconCard };
  }
  if (m.includes('started')) {
    return { category: 'all', icon: iconScroll };
  }

  return { category: 'all', icon: 'dot' };
}

export function GameLog({ logs, players, myPlayerId }: GameLogProps) {
  const [filter, setFilter] = useState<LogCategory>('all');
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new entries arrive
  const prevLength = useRef(logs.length);
  useEffect(() => {
    if (logs.length > prevLength.current && listRef.current) {
      listRef.current.scrollTop = 0;
    }
    prevLength.current = logs.length;
  }, [logs.length]);

  // Build player lookup for name highlighting
  const playerNames = new Map(players.map((p) => [p.id, p.name]));

  // Filter and reverse (newest first)
  const filtered = logs
    .filter((e) => filter === 'all' || classify(e).category === filter)
    .reverse()
    .slice(0, 50);

  // Category tabs
  const categories: { key: LogCategory; label: string; icon: ReactNode }[] = [
    { key: 'all', label: 'All', icon: iconScroll },
    { key: 'income', label: 'Income', icon: iconIncome },
    { key: 'tax', label: 'Tax', icon: iconTax },
    { key: 'finance', label: 'Finance', icon: iconFinance },
    { key: 'combat', label: 'Combat', icon: iconCombat },
    { key: 'expansion', label: 'Expansion', icon: iconExpansion },
  ];

  return (
    <div className="panel-glass p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-sans text-xs font-bold text-cream/70 uppercase tracking-widest">Chronicle</h3>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1 mb-3">
        {categories.map((cat) => {
          const count = filter === cat.key
            ? filtered.length
            : logs.filter((e) => cat.key === 'all' || classify(e).category === cat.key).length;
          const isActive = filter === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`
                inline-flex items-center gap-1
                text-[0.45rem] uppercase tracking-widest px-2 py-1 rounded-full
                transition-all duration-150
                ${isActive
                  ? 'bg-gold/15 text-gold border border-gold/30'
                  : 'text-text-muted/60 border border-transparent hover:text-text-muted hover:border-cream/10'
                }
              `}
            >
              <span className="shrink-0">{cat.icon}</span>
              {cat.label}{isActive ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* Log entries */}
      <div ref={listRef} className="max-h-[260px] overflow-y-auto space-y-0">
        {filtered.length === 0 ? (
          <p className="text-[0.6rem] text-text-muted/50 py-4 text-center">
            {logs.length === 0 ? 'No events yet' : 'No matching events'}
          </p>
        ) : (
          filtered.map((entry, i) => {
            const { icon, category } = classify(entry);
            // Determine dot color class based on category
            // Use a single, clean dot class for all entries to keep colors unified
            const dotClass = 'opacity-40';

            // Highlight player names in message
            let displayMessage = entry.message;
            for (const [, name] of playerNames) {
              if (displayMessage.includes(name)) {
                displayMessage = displayMessage.replace(
                  name,
                  `|<<${name}>>|`,
                );
              }
            }
            const parts = displayMessage.split(/(\|<<.+?>>\|)/);

            return (
              <div key={i} className="log-entry">
                <span className="w-4 shrink-0 flex items-start justify-center mt-1">
                  {icon === 'dot' ? (
                    <span className={`w-1.5 h-1.5 rounded-full bg-cream ${dotClass}`} />
                  ) : (
                    <span className="text-[0.55rem] leading-none opacity-70">{icon}</span>
                  )}
                </span>
                <span className="text-[0.45rem] text-text-muted font-mono mt-0.5 shrink-0">
                  {formatLogRound(entry.round)}
                </span>
                <span className="text-[0.6rem] text-text leading-snug">
                  {parts.map((part, j) => {
                    if (part.startsWith('|<<') && part.endsWith('>>|')) {
                      const name = part.slice(3, -3);
                      const isMe = players.some(
                        (p) => p.id === myPlayerId && p.name === name,
                      );
                      return (
                        <span key={j} className={isMe ? 'text-gold font-semibold' : 'text-text font-semibold'}>
                          {name}
                        </span>
                      );
                    }
                    return <span key={j} className="text-text-muted">{part}</span>;
                  })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function formatLogRound(round: number): string {
  return `R${round}`;
}
