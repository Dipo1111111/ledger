import { useState, type FormEvent } from 'react';
import { SocketEvents } from '@ledger/common';
import { getSocket } from '../../lib/socket';
import { Button } from '../common/Button';

export function CreateRoom() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    getSocket().emit(SocketEvents.CREATE_ROOM, { playerName: trimmed });
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="create-name"
          className="mb-1.5 block text-xs font-medium text-text-secondary"
        >
          Your name
        </label>
        <input
          id="create-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={24}
          autoFocus
          autoComplete="off"
          className="w-full rounded-lg border border-cream/15 bg-felt-dark/50 px-4 py-3
            text-text placeholder-text-muted/50 text-sm
            outline-none transition-colors
            focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        disabled={!name.trim()}
        className="w-full"
      >
        Create Game
      </Button>
    </form>
  );
}
