import { useState, type FormEvent } from 'react';
import { SocketEvents } from '@ledger/common';
import { getSocket } from '../../lib/socket';
import { Button } from '../common/Button';

export function JoinRoom() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = roomCode.trim().toUpperCase();
    if (!trimmedName || !trimmedCode) return;

    setLoading(true);
    getSocket().emit(SocketEvents.JOIN_ROOM, {
      playerName: trimmedName,
      roomCode: trimmedCode,
    });
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="join-name"
          className="mb-1.5 block text-xs font-medium text-text-secondary"
        >
          Your name
        </label>
        <input
          id="join-name"
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

      <div>
        <label
          htmlFor="join-code"
          className="mb-1.5 block text-xs font-medium text-text-secondary"
        >
          Room code
        </label>
        <input
          id="join-code"
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          maxLength={6}
          autoComplete="off"
          className="w-full rounded-lg border border-cream/15 bg-felt-dark/50 px-4 py-3
            text-text placeholder-text-muted/50 text-sm font-mono tracking-widest text-center
            outline-none transition-colors
            focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        disabled={!name.trim() || roomCode.trim().length < 4}
        className="w-full"
      >
        Join Game
      </Button>
    </form>
  );
}
