import { useEffect, useState } from 'react';
import { useSocketStore } from '../../store/socket-store';
import { getSocket } from '../../lib/socket';

export function ConnectionStatus() {
  const { isConnected, socketId } = useSocketStore();
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const onReconnectAttempt = () => setReconnecting(true);
    const onReconnect = () => setReconnecting(false);
    const onConnect = () => setReconnecting(false);
    const onDisconnect = () => {
      // If the socket is still trying (manager hasn't given up), it's reconnecting
      if (socket.io?.engine?.transport === null || !socket.connected) {
        setReconnecting(true);
      }
    };

    socket.io?.on('reconnect_attempt', onReconnectAttempt);
    socket.io?.on('reconnect', onReconnect);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.io?.off('reconnect_attempt', onReconnectAttempt);
      socket.io?.off('reconnect', onReconnect);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const isActuallyConnected = isConnected && !reconnecting;

  return (
    <div
      className={`fixed bottom-4 right-4 z-tooltip flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs backdrop-blur-sm transition-all duration-300 ${
        isActuallyConnected
          ? 'bg-black/40 text-cream/50'
          : reconnecting
            ? 'bg-warning/10 text-warning border border-warning/20'
            : 'bg-danger/10 text-danger border border-danger/20'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full transition-all duration-300 ${
          isActuallyConnected
            ? 'bg-success shadow-[0_0_6px_oklch(0.52_0.14_150_/_0.5)]'
            : reconnecting
              ? 'bg-warning animate-pulse'
              : 'bg-danger'
        }`}
      />
      {isActuallyConnected ? `Connected` : reconnecting ? 'Reconnecting…' : 'Disconnected'}
      {socketId && isActuallyConnected && (
        <span className="hidden sm:inline text-cream/30">
          {socketId.slice(0, 6)}
        </span>
      )}
    </div>
  );
}
