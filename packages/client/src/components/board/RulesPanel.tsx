interface RulesPanelProps {
  onClose: () => void;
}

export function RulesPanel({ onClose }: RulesPanelProps) {
  return (
    <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-14 w-96 h-full bg-felt-dark/95 backdrop-blur-md border-r border-cream/10 p-6 overflow-y-auto animate-slide-right">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-lg font-semibold text-white">How to Play</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-cream/40 hover:text-cream/70 hover:bg-cream/[0.05] transition-all duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Rules content */}
        <div className="space-y-6 font-sans text-sm text-cream/50 leading-relaxed">
          <RuleSection title="Goal">
            Build the most valuable corporate empire. Last corporation standing wins.
          </RuleSection>

          <RuleSection title="Assets">
            Playing cards represent corporate assets. Each card generates income but also incurs taxes.
            Jacks, Queens, Kings, and Aces have different values.
          </RuleSection>

          <RuleSection title="Turn Structure">
            On your turn: buy assets from the market, sell to the bank or other players,
            borrow from the bank, invest in other corporations, or launch hostile takeovers.
          </RuleSection>

          <RuleSection title="Loans">
            Borrow up to 120 LC from the bank. Loans accrue 50% interest over 3 rounds.
            Default on a loan and face elimination.
          </RuleSection>

          <RuleSection title="Private Trading">
            Negotiate deals directly with other players. Sell assets at any agreed price.
          </RuleSection>

          <RuleSection title="Hostile Takeovers">
            Spend 120 LC to declare a takeover against a weaker corporation.
            The target gets a chance to defend.
          </RuleSection>

          <RuleSection title="Corporate Expansion">
            Once per game, trigger a corporate expansion vote.
            If approved, a new batch of assets enters the market.
          </RuleSection>

          <RuleSection title="Bankruptcy">
            Fail to pay taxes or debts and face emergency asset sales.
            Lose everything and you are eliminated.
          </RuleSection>
        </div>
      </div>
    </div>
  );
}

function RuleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-serif text-base font-semibold text-white/80 mb-1.5">{title}</h3>
      <p>{children}</p>
    </div>
  );
}
