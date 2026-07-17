import { useCallback, useEffect, useRef, useState } from 'react';
import { SocketEvents } from '@ledger/common';
import { getSocket } from '../../lib/socket';
import { useChatStore } from '../../store/chat-store';
import { useLobbyStore } from '../../store/lobby-store';

export function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const playerId = useLobbyStore((s) => s.playerId);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    getSocket().emit(SocketEvents.CHAT_SEND, { text: trimmed });
    setInput('');
    inputRef.current?.focus();
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="panel-glass flex flex-col" style={{ maxHeight: 300 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cream/10">
        <span className="text-[0.55rem] font-semibold uppercase tracking-widest text-text-muted">
          Table Chat
        </span>
        <span className="text-[0.45rem] text-text-muted">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-1 min-h-0" style={{ maxHeight: 180 }}>
        {messages.length === 0 ? (
          <p className="text-[0.6rem] text-text-muted/50 text-center py-4">
            No messages yet
          </p>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.playerId === playerId;
            return (
              <div key={i} className="text-[0.6rem] leading-relaxed">
                <span className={`font-semibold ${isMe ? 'text-gold' : 'text-text'}`}>
                  {msg.playerName}
                </span>
                <span className="text-text-muted">: </span>
                <span className="text-text-secondary">{msg.text}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Input row */}
      <div className="flex items-center gap-1.5 border-t border-cream/10 px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={500}
          className="
            flex-1 min-w-0 px-2 py-1.5 rounded-lg
            bg-felt-dark/60 border border-cream/10
            text-[0.6rem] text-text placeholder-text-muted/40
            focus:outline-none focus:border-gold-dark focus:ring-1 focus:ring-gold-dark/30
            transition-all duration-150
          "
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="
            px-3 py-1.5 rounded-lg text-[0.6rem] font-semibold
            bg-gold-dark text-stone-900 border border-gold
            hover:bg-gold active:bg-gold-dark
            disabled:opacity-35 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          Send
        </button>
      </div>
    </div>
  );
}
