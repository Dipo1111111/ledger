interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  return (
    <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-14 w-80 h-full bg-felt-dark/95 backdrop-blur-md border-r border-cream/10 p-6 overflow-y-auto animate-slide-right">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-lg font-semibold text-white">Settings</h2>
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

        {/* Settings content */}
        <div className="space-y-6">
          <SettingToggle label="Sound Effects" defaultChecked />
          <SettingToggle label="Music" />
          <SettingToggle label="Animations" defaultChecked />
          <SettingToggle label="Compact View" />
        </div>

        {/* Danger zone */}
        <div className="mt-10 pt-6 border-t border-cream/[0.06]">
          <button className="w-full py-2.5 rounded-[9px] border border-danger/30 text-danger/80 text-sm font-sans font-medium hover:bg-danger/10 hover:border-danger/40 transition-all duration-150">
            Surrender Game
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-sm text-cream/60">{label}</span>
      <button
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
          defaultChecked ? 'bg-gold-dark/40' : 'bg-cream/10'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${
            defaultChecked
              ? 'left-5.5 bg-gold-dark'
              : 'left-0.5 bg-cream/40'
          }`}
        />
      </button>
    </div>
  );
}
