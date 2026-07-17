import { useEffect, useRef } from 'react';
import { SocketEvents, calculateIncome, calculateTaxes } from '@ledger/common';
import { getSocket, type TypedSocket } from '../lib/socket';
import { useSocketStore } from '../store/socket-store';
import { useLobbyStore } from '../store/lobby-store';
import { useGameStore } from '../store/game-store';
import { useToastStore } from '../store/toast-store';
import { useChatStore } from '../store/chat-store';
import {
  IconLightning, IconRefresh, IconTrophy, IconHammer,
  IconBriefcase, IconWarning, IconChartDown, IconCoins,
  IconBuilding, IconSwords, IconShield, IconSkull,
  IconSignal, IconClock,
} from '../components/common/Icons';
import type { ReactNode } from 'react';

/* ─── Toast icon helper ─── */
function iconMsg(icon: ReactNode, text: string): ReactNode {
  return (
    <span className="inline-flex items-start gap-1.5">
      <span className="shrink-0 mt-0.5">{icon}</span>
      <span>{text}</span>
    </span>
  );
}

/* ─── Dedup trackers ─── */
/** Track last notified turn to prevent duplicate turn-change toasts */
let lastTurnToastKey = '';
/** Track known offer count per playerId for toast notification on new offers */
const lastOfferCount = new Map<string, number>();
/** Track the previous highest bidder per auction for outbid notification */
const prevHighestBidderId = new Map<string, string | null>();
/** Track whether we've notified for the current expansion vote */
let expansionVoteNotified = false;
/** Track the last notified round to avoid duplicate tax warnings */
let lastNotifiedRound = 0;

/**
 * Connect the socket and wire all event listeners to Zustand stores.
 * Safe to call from App - idempotent after first mount.
 */
export function useSocket(): TypedSocket {
  const socket = getSocket();
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current) return;
    registered.current = true;

    const { setConnected, setDisconnected } = useSocketStore.getState();
    const { updateLobby, onGameStarting, pushError } = useLobbyStore.getState();

    /* ─── Lifecycle ─── */
    socket.on('connect', () => {
      console.log('[socket] connected', socket.id);
      setConnected(socket.id ?? '');

      // Attempt reconnect if we have saved room/player data
      const { roomCode, playerId } = useLobbyStore.getState();
      if (roomCode && playerId) {
        import('../lib/socket').then(({ getSessionToken }) => {
          socket.emit(SocketEvents.RECONNECT, {
            roomCode,
            playerId,
            sessionToken: getSessionToken() ?? undefined,
          });
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected', reason);
      setDisconnected(reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[socket] connect_error', err.message);
    });

    /* ─── Lobby Updates ─── */
    socket.on(SocketEvents.LOBBY_UPDATE, (payload) => {
      updateLobby(payload.players, payload.settings);
    });

    socket.on(SocketEvents.ROOM_CREATED, (payload) => {
      const { enterRoom } = useLobbyStore.getState();
      enterRoom(payload.roomCode, payload.playerId);

      // Store session token for reconnection
      if (payload.sessionToken) {
        import('../lib/socket').then(({ setSessionToken }) => {
          setSessionToken(payload.sessionToken!);
        });
      }
    });

    socket.on(SocketEvents.GAME_STARTING, (payload) => {
      const { gameState } = payload;
      if (gameState) {
        onGameStarting(gameState);
        useGameStore.getState().setGameState(gameState);
      }
    });

    /* ─── Game Events ─── */
    socket.on(SocketEvents.STATE_UPDATE, (payload) => {
      const wasSubmitting = useGameStore.getState().isSubmittingAction;
      useGameStore.getState().setGameState(payload.gameState);
      // Show success toast if we were waiting on an action response
      if (wasSubmitting) {
        useToastStore.getState().addToast({
          message: 'Action completed',
          type: 'success',
          duration: 1500,
        });
      }
    });

    socket.on(SocketEvents.TURN_CHANGE, (payload) => {
      const myId = useLobbyStore.getState().playerId;
      const gs = useGameStore.getState().gameState;

      // Dedup: same player+round+phase combo = skip duplicate
      const turnKey = `${payload.playerId}:${gs?.roundNumber}:${gs?.roundPhase}`;
      if (turnKey === lastTurnToastKey) return;
      lastTurnToastKey = turnKey;

      if (payload.playerId === myId) {
        // Show income / tax info from the current state
        const me = gs?.players.find((p) => p.id === myId);
        const income = me ? calculateIncome(me) : 0;
        const tax = me ? calculateTaxes(me) : 0;
        const net = income - tax;
        let msg: string;
        if (income > 0 && net < 0) {
          msg = `Your turn! Collected +${income} LC income. ${tax} LC taxes due.`;
        } else if (income > 0) {
          msg = `Your turn! Collected +${income} LC income.`;
        } else if (net < 0) {
          msg = `Your turn! No income. ${tax} LC taxes due.`;
        } else {
          msg = "Your turn! No income.";
        }
        useToastStore.getState().addToast({
          message: iconMsg(<IconLightning size={14} />, msg),
          type: 'info',
          duration: 4000,
        });
      } else if (gs) {
        // Someone else's turn
        const name = gs.players.find((p) => p.id === payload.playerId)?.name ?? 'Unknown';
        useToastStore.getState().addToast({
          message: iconMsg(<IconRefresh size={14} />, `${name}'s turn`),
          type: 'info',
          duration: 2500,
        });
      }
    });

    socket.on(SocketEvents.GAME_FINISHED, (payload) => {
      useGameStore.getState().setGameState(payload.gameState);
      const myId = useLobbyStore.getState().playerId;
      const winnerName = payload.gameState.players.find((p) => p.id === payload.winnerId)?.name ?? 'Unknown';
      const isWinner = payload.winnerId === myId;
      const trophyIcon = <IconTrophy size={16} />;
      useToastStore.getState().addToast({
        message: isWinner
          ? iconMsg(trophyIcon, 'You win! Congratulations!')
          : iconMsg(trophyIcon, `${winnerName} wins the game!`),
        type: isWinner ? 'success' : 'info',
        duration: 0, // sticky
      });
    });

    socket.on(SocketEvents.AUCTION_UPDATE, (payload) => {
      const { auction } = payload;
      const myId = useLobbyStore.getState().playerId;

      // Outbid notification: if I was the highest bidder and someone else outbid me
      const prevBidder = prevHighestBidderId.get(auction.id) ?? null;
      if (prevBidder === myId && auction.highestBidderId !== myId) {
        useToastStore.getState().addToast({
          message: iconMsg(<IconHammer size={14} />, `You were outbid! Current bid: ${auction.currentBid} LC`),
          type: 'error',
          duration: 5000,
        });
      }
      prevHighestBidderId.set(auction.id, auction.highestBidderId);

      useGameStore.getState().setActiveAuction(payload.auction);
    });

    /* ─── Investment offer toast detection (piggybacks on STATE_UPDATE) ─── */
    socket.on(SocketEvents.STATE_UPDATE, (payload) => {
      const pid = useLobbyStore.getState().playerId;
      if (!pid) return;

      const offers = payload.gameState.investmentOffers?.filter((o) => o.receiverId === pid) ?? [];
      const prev = lastOfferCount.get(pid) ?? 0;

      if (offers.length > prev) {
        const diff = offers.length - prev;
        useToastStore.getState().addToast({
          message: iconMsg(<IconBriefcase size={14} />, `${diff} new investment offer${diff > 1 ? 's' : ''} received`),
          type: 'info',
          duration: 4000,
        });
      }
      lastOfferCount.set(pid, offers.length);
    });

    /* ─── Tax phase warning (piggybacks on STATE_UPDATE) ─── */
    socket.on(SocketEvents.STATE_UPDATE, (payload) => {
      const pid = useLobbyStore.getState().playerId;
      if (!pid) return;

      const round = payload.gameState.roundNumber;
      // Only warn once per round
      if (round <= lastNotifiedRound) return;
      lastNotifiedRound = round;

      const me = payload.gameState.players.find((p) => p.id === pid);
      if (!me || me.isEliminated) return;

      const tax = calculateTaxes(me);
      const netIncome = calculateIncome(me) - tax;

      if (me.lc < tax && tax > 0) {
        // Cannot cover upcoming taxes with current cash
        useToastStore.getState().addToast({
          message: iconMsg(<IconWarning size={14} />, `Tax warning! ${tax} LC taxes due, you only have ${me.lc} LC. Sell assets or take a loan!`),
          type: 'error',
          duration: 8000,
        });
      } else if (netIncome < 0 && me.financialHealth === 'stressed') {
        // Negative cash flow while already stressed
        useToastStore.getState().addToast({
          message: iconMsg(<IconChartDown size={14} />, `Negative cash flow (${netIncome} LC). Your financial situation is declining.`),
          type: 'error',
          duration: 6000,
        });
      } else if (me.lc > tax && tax > 0) {
        // Manageable but worth noting
        const remaining = me.lc - tax;
        useToastStore.getState().addToast({
          message: iconMsg(<IconCoins size={14} />, `${tax} LC taxes paid. ${remaining} LC remaining.`),
          type: 'info',
          duration: 3000,
        });
      }
    });

    /* ─── Expansion vote notifications ─── */
    socket.on(SocketEvents.EXPANSION_VOTE_UPDATE, (payload) => {
      const gs = useGameStore.getState().gameState;
      const ev = gs?.expansionVotes;

      // Toast only once per vote (first time we see a non-resolved vote)
      if (!expansionVoteNotified && ev && !ev.isResolved) {
        expansionVoteNotified = true;
        const requester = gs?.players.find((p) => p.id === payload.requestedBy)?.name ?? 'Someone';
        useToastStore.getState().addToast({
          message: iconMsg(<IconBuilding size={14} />, `${requester} called for Corporate Expansion. Vote now!`),
          type: 'info',
          duration: 5000,
        });
        return;
      }

      // Toast on resolution
      if (ev?.isResolved) {
        expansionVoteNotified = false;
        useToastStore.getState().addToast({
          message: ev.passes
            ? iconMsg(<IconBuilding size={14} />, 'Corporate Expansion PASSED. New assets available!')
            : iconMsg(<IconBuilding size={14} />, 'Corporate Expansion REJECTED'),
          type: ev.passes ? 'success' : 'error',
          duration: 5000,
        });
      }
    });

    /* ─── Takeover event notifications ─── */
    socket.on(SocketEvents.TAKEOVER_DECLARED, (payload) => {
      const name = useGameStore.getState().gameState?.players.find((p) => p.id === payload.attackerId)?.name ?? 'Someone';

      useToastStore.getState().addToast({
        message: iconMsg(<IconSwords size={14} />, `${name} declared a hostile takeover!`),
        type: 'info',
        duration: 5000,
      });
    });

    socket.on(SocketEvents.TAKEOVER_RESOLVED, (payload) => {
      const gs = useGameStore.getState().gameState;
      const attacker = gs?.players.find((p) => p.id === payload.attackerId)?.name ?? 'Someone';
      const defender = gs?.players.find((p) => p.id === payload.defenderId)?.name ?? 'Someone';

      if (payload.succeeded) {
        useToastStore.getState().addToast({
          message: iconMsg(<IconSkull size={14} />, `${defender} was eliminated by ${attacker}'s takeover!`),
          type: 'error',
          duration: 6000,
        });
      } else {
        useToastStore.getState().addToast({
          message: iconMsg(<IconShield size={14} />, `${defender} survived ${attacker}'s takeover attempt`),
          type: 'success',
          duration: 5000,
        });
      }
    });

    /* ─── Elimination notification toast ─── */
    socket.on(SocketEvents.PLAYER_ELIMINATED, (payload) => {
      const gs = useGameStore.getState().gameState;
      const name = gs?.players.find((p) => p.id === payload.playerId)?.name ?? 'Someone';
      const pid = useLobbyStore.getState().playerId;

      if (payload.playerId === pid) {
        useToastStore.getState().addToast({
          message: iconMsg(<IconSkull size={14} />, `You were eliminated. ${payload.reason}`),
          type: 'error',
          duration: 6000,
        });
      } else {
        useToastStore.getState().addToast({
          message: iconMsg(<IconSkull size={14} />, `${name} eliminated. ${payload.reason}`),
          type: 'error',
          duration: 5000,
        });
      }
    });

    /* ─── Player disconnect / reconnect ─── */
    socket.on(SocketEvents.PLAYER_DISCONNECTED, (payload) => {
      const gs = useGameStore.getState().gameState;
      if (!gs) return;
      const updated = {
        ...gs,
        players: gs.players.map((p) =>
          p.id === payload.playerId ? { ...p, isConnected: false } : p,
        ),
      };
      useGameStore.getState().setGameState(updated);
      useToastStore.getState().addToast({
        message: iconMsg(<IconSignal size={14} />, `${payload.playerName} disconnected`),
        type: 'error',
        duration: 4000,
      });
    });

    socket.on(SocketEvents.PLAYER_RECONNECTED, (payload) => {
      const gs = useGameStore.getState().gameState;
      if (!gs) return;
      const updated = {
        ...gs,
        players: gs.players.map((p) =>
          p.id === payload.playerId ? { ...p, isConnected: true } : p,
        ),
      };
      useGameStore.getState().setGameState(updated);
      useToastStore.getState().addToast({
        message: iconMsg(<IconSignal size={14} />, `${payload.playerName} reconnected`),
        type: 'info',
        duration: 4000,
      });
    });

    socket.on(SocketEvents.SYSTEM_ERROR, (payload) => {
      pushError(payload.message);
      useGameStore.getState().setSubmittingAction(false);
      useToastStore.getState().addToast({
        message: payload.message,
        type: 'error',
      });
    });

    /* ─── Chat messages ─── */
    socket.on(SocketEvents.CHAT_MESSAGE, (payload) => {
      const { addMessage } = useChatStore.getState();
      addMessage({
        playerId: payload.playerId,
        playerName: payload.playerName,
        text: payload.text,
        timestamp: payload.timestamp,
      });
    });

    /* ─── Pause / Resume ─── */
    socket.on(SocketEvents.GAME_PAUSED, (payload) => {
      useGameStore.getState().setGamePaused(true, payload.pausedByPlayerName);
      useToastStore.getState().addToast({
        message: iconMsg(<IconSignal size={14} />, `Game paused: waiting for ${payload.pausedByPlayerName}`),
        type: 'info',
        duration: 5000,
      });
    });

    socket.on(SocketEvents.GAME_RESUMED, () => {
      useGameStore.getState().setGamePaused(false, null);
      useToastStore.getState().addToast({
        message: iconMsg(<IconSignal size={14} />, `Player reconnected: game resumed`),
        type: 'success',
        duration: 4000,
      });
    });

    /* ─── Connect ─── */
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      /* We do NOT disconnect on unmount - App lives for the session.
         If the socket should be torn down, call destroySocket() explicitly. */
    };
  }, [socket]);

  return socket;
}
