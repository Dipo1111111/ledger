import { useState } from 'react';
import { Card } from '../components/common/Card';
import { CreateRoom } from '../components/lobby/CreateRoom';
import { JoinRoom } from '../components/lobby/JoinRoom';

type Tab = 'create' | 'join';

export function HomeScreen() {
  const [tab, setTab] = useState<Tab>('create');

  return (
    <div className="flex min-h-dvh items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-sm animate-slide-up space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-widest text-gold">
            Ledger
          </h1>
          <p className="font-sans text-[0.65rem] sm:text-xs tracking-wider text-cream/40 uppercase">
            The Game of High Finance
          </p>
        </div>

        {/* Card */}
        <Card variant="gold">
          {/* Tab switcher */}
          <div className="mb-5 sm:mb-6 flex rounded-lg bg-black/20 p-0.5">
            <button
              onClick={() => setTab('create')}
              className={`flex-1 rounded-md py-3 sm:py-2 text-sm font-medium transition-all duration-150 min-h-[44px] sm:min-h-0 ${
                tab === 'create'
                  ? 'bg-gold/20 text-gold shadow-sm'
                  : 'text-cream/50 hover:text-cream/70'
              }`}
            >
              Create Game
            </button>
            <button
              onClick={() => setTab('join')}
              className={`flex-1 rounded-md py-3 sm:py-2 text-sm font-medium transition-all duration-150 min-h-[44px] sm:min-h-0 ${
                tab === 'join'
                  ? 'bg-gold/20 text-gold shadow-sm'
                  : 'text-cream/50 hover:text-cream/70'
              }`}
            >
              Join Game
            </button>
          </div>

          {/* Active tab */}
          {tab === 'create' ? <CreateRoom /> : <JoinRoom />}
        </Card>

        {/* Footer */}
        <p className="text-center font-sans text-[10px] tracking-wider text-cream/20 uppercase">
          Requires 2&ndash;6 players
        </p>
      </div>
    </div>
  );
}
