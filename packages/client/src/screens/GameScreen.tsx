import { useCallback, useRef, useState } from 'react';
import type { AssetType } from '@ledger/common';
import { SocketEvents } from '@ledger/common';
import { useLobbyStore } from '../store/lobby-store';
import { useGameStore, selectMyPlayer, selectIsMyTurn, selectCurrentPlayer } from '../store/game-store';
import { useToastStore } from '../store/toast-store';
import { getSocket } from '../lib/socket';
import { IconTrophy, IconClock } from '../components/common/Icons';
import { GameSidebar } from '../components/sidebar/GameSidebar';
import { TurnIndicator } from '../components/board/TurnIndicator';
import { MarketPanel } from '../components/board/MarketPanel';
import { PlayerBoard } from '../components/board/PlayerBoard';
import { PlayerStandings } from '../components/board/PlayerStandings';
import { ActionPanel, type DialogType } from '../components/board/ActionPanel';
import { BuyAssetDialog } from '../components/board/dialogs/BuyAssetDialog';
import { SellAssetDialog } from '../components/board/dialogs/SellAssetDialog';
import { BorrowDialog } from '../components/board/dialogs/BorrowDialog';
import { RepayLoanDialog } from '../components/board/dialogs/RepayLoanDialog';
import { InvestDialog } from '../components/board/dialogs/InvestDialog';
import { AuctionPanel } from '../components/board/AuctionPanel';
import { InvestmentOfferPanel } from '../components/board/InvestmentOfferPanel';
import { CreateAuctionDialog } from '../components/board/dialogs/CreateAuctionDialog';
import { InitiateTakeoverDialog } from '../components/board/dialogs/InitiateTakeoverDialog';
import { SurrenderDialog } from '../components/board/dialogs/SurrenderDialog';
import { ExpansionVotePanel } from '../components/board/ExpansionVotePanel';
import { TakeoverPanel } from '../components/board/TakeoverPanel';
import { EliminationOverlay, SpectateBanner } from '../components/board/EliminationOverlay';
import { ChatPanel } from '../components/board/ChatPanel';
import { GameLog } from '../components/board/GameLog';
import { Timer } from '../components/common/Timer';

export function GameScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const playerId = useLobbyStore((s) => s.playerId);

  const myPlayer = selectMyPlayer(gameState, playerId);
  const isMyTurn = selectIsMyTurn(gameState, playerId);
  const currentPlayer = selectCurrentPlayer(gameState);

  /* ─── Dialog state ─── */
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const openDialog = setActiveDialog;
  const closeDialog = useCallback(() => setActiveDialog(null), []);

  /* ─── Action dispatchers ─── */
  const setSubmittingAction = useGameStore((s) => s.setSubmittingAction);
  const emit = useCallback((action: any) => {
    setSubmittingAction(true);
    getSocket().emit(SocketEvents.GAME_ACTION, { action });
  }, [setSubmittingAction]);

  const handleBuy = useCallback(
    (type: AssetType) => { emit({ type: 'buy_asset', assetType: type }); },
    [emit],
  );

  /* Market Buy buttons open the dialog instead of buying directly */
  const handleMarketBuy = useCallback(
    (_type: AssetType) => { openDialog('buy'); },
    [openDialog],
  );

  const handleSell = useCallback(
    (assetId: string, buyerId?: string, price?: number) => {
      const action: any = { type: 'sell_asset', assetId };
      if (buyerId !== undefined && price !== undefined) {
        action.buyerId = buyerId;
        action.price = price;
      }
      emit(action);
    },
    [emit],
  );

  const handleBorrow = useCallback(
    (amount: number) => { emit({ type: 'borrow', amount }); },
    [emit],
  );

  const handleRepay = useCallback(
    (contractId: string, amount: number) => { emit({ type: 'repay_loan', contractId, amount }); },
    [emit],
  );

  const handleProposeInvestment = useCallback(
    (targetPlayerId: string, amount: number, repaymentAmount: number, deadlineRound: number) => {
      emit({ type: 'propose_investment', targetPlayerId, amount, repaymentAmount, deadlineRound });
    },
    [emit],
  );

  const handleCreateAuction = useCallback(
    (assetId: string, startingBid: number, minimumBid: number) => {
      emit({ type: 'create_auction', assetId, startingBid, minimumBid });
    },
    [emit],
  );

  const handleConfirmAuction = useCallback(() => {
    if (!gameState?.activeAuction) return;
    emit({ type: 'confirm_auction', auctionId: gameState.activeAuction.id });
  }, [emit, gameState?.activeAuction]);

  const handleInitiateTakeover = useCallback(
    (targetPlayerId: string) => {
      emit({ type: 'initiate_takeover', targetPlayerId });
    },
    [emit],
  );

  const handleEndTurn = useCallback(() => {
    emit({ type: 'end_turn' });
  }, [emit]);

  const handleSurrender = useCallback(() => {
    emit({ type: 'surrender' });
  }, [emit]);

  const handleRequestExpansion = useCallback(() => {
    emit({ type: 'request_expansion' });
  }, [emit]);

  /* ─── Elimination overlay state ─── */
  const [eliminationDismissed, setEliminationDismissed] = useState(false);
  const prevEliminatedRef = useRef(false);

  // Detect when myPlayer first becomes eliminated — show the overlay
  const isEliminated = myPlayer?.isEliminated ?? false;
  if (isEliminated && !prevEliminatedRef.current) {
    prevEliminatedRef.current = true;
    // Reset dismiss state for this elimination event
    if (eliminationDismissed) {
      setEliminationDismissed(false);
    }
  } else if (!isEliminated) {
    prevEliminatedRef.current = false;
  }

  const canAct = isMyTurn && gameState?.roundPhase === 'actions';
  const isSubmittingAction = useGameStore((s) => s.isSubmittingAction);
  const expansionAvailable = (gameState?.expansionsUsed ?? 0) < 1
    && (!gameState?.expansionVotes || gameState.expansionVotes.isResolved);

  const otherPlayers = gameState
    ? gameState.players.filter((p) => p.id !== playerId && !p.isEliminated)
    : [];

  const myOffers = gameState?.investmentOffers?.filter((o) => o.receiverId === playerId) ?? [];

  /* ─── Derive elimination reason from logs ─── */
  const eliminationReason = myPlayer?.isEliminated
    ? [...(gameState?.logs ?? [])].reverse()
        .find((l) => l.playerId === playerId && l.message.toLowerCase().includes('eliminated'))
        ?.message ?? 'Eliminated from the game'
    : null;

  /* ─── Guard: no game state yet ─── */
  if (!gameState) {
    return (
      <div className="felt-bg min-h-screen flex items-center justify-center">
        <p className="text-text-muted text-lg">Waiting for game to start...</p>
      </div>
    );
  }

  /* ─── Guard: game finished ─── */
  if (gameState.phase === 'finished') {
    return (
      <div className="felt-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <IconTrophy size={48} className="text-gold mx-auto" />
          <h1 className="font-sans text-4xl text-gold mt-4">Game Over</h1>
          <p className="text-text mt-2">
            {gameState.winnerId
              ? `${gameState.players.find((p) => p.id === gameState.winnerId)?.name ?? 'Unknown'} wins!`
              : 'No winner'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="felt-bg min-h-dvh flex flex-col">

      {/* ─── Sidebar Navigation ─── */}
      <GameSidebar variant="game" onHome={() => { useGameStore.getState().reset(); useLobbyStore.getState().reset(); }} />

      {/* ─── Full-screen elimination overlay ─── */}
      {isEliminated && !eliminationDismissed && myPlayer && (
        <EliminationOverlay
          playerName={myPlayer.name}
          reason={eliminationReason ?? 'Eliminated'}
          onDismiss={() => setEliminationDismissed(true)}
        />
      )}

      {/* ─── Spectate banner (eliminated + dismissed overlay) ─── */}
      {isEliminated && eliminationDismissed && myPlayer && (
        <SpectateBanner
          playerName={myPlayer.name}
          reason={eliminationReason ?? 'Eliminated'}
          onDismiss={() => {}}
        />
      )}

      {/* ─── Content wrapper (offset for fixed sidebar on desktop) ─── */}
      <div className="md:ml-14 flex flex-col flex-1">

        {/* ─── Sticky Status Bar ─── */}
        <header className="sticky top-0 z-sticky bg-felt-dark border-b border-cream/10 safe-area-top">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between px-3 sm:px-6 h-11">
            <div className="anim-turn-in min-w-0 flex-1" key={currentPlayer?.id ?? 'no-player'}>
              <TurnIndicator
                roundNumber={gameState.roundNumber}
                roundPhase={gameState.roundPhase}
                currentPlayerName={currentPlayer?.name ?? 'Unknown'}
                isMyTurn={isMyTurn}
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Timer with clock icon */}
              <Timer
                endsAt={gameState.turnTimerEndsAt}
                onExpire={() => useToastStore.getState().addToast({
                  message: <span className="inline-flex items-center gap-1.5"><IconClock size={14} />Time's up! Turn ended</span>,
                  type: 'info',
                  duration: 3000,
                })}
              />

              {/* End Turn button */}
              {canAct && (
                <button
                  onClick={handleEndTurn}
                  disabled={isSubmittingAction}
                  className="px-3 sm:px-4 py-1.5 rounded-lg text-[0.65rem] font-semibold bg-gold-dark text-stone-900 border border-gold hover:bg-gold hover:-translate-y-0.5 hover:shadow-btn-gold active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-150 min-h-[44px] sm:min-h-0"
                >
                  {isSubmittingAction ? 'Ending...' : 'End Turn'}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <div className="max-w-[1440px] mx-auto w-full px-3 sm:px-6 py-3 sm:py-4 pb-8 animate-fade-scale-in">
          {/* Main grid: 1fr + 340px sidebar on desktop, single column on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3 sm:gap-5">

          {/* ════════ LEFT COLUMN ════════ */}
          <div className="flex flex-col gap-6 min-w-0">

            {/* Profile + Chip Summary + Your Hand */}
            {myPlayer && (
              <div className="animate-slide-up stagger-1">
                <PlayerBoard
                  player={myPlayer}
                  isLocal
                  showActions={false}
                />
              </div>
            )}

            {/* The Market — clicking Buy opens the dialog for confirmation */}
            <div className="animate-slide-up stagger-2">
              <MarketPanel
                market={gameState.market}
                canBuy={!!canAct}
                onBuy={handleMarketBuy}
              />
            </div>

            {/* Actions Bar (only during player's turn) */}
            {canAct && myPlayer && (
              <div className="animate-slide-up stagger-3">
                <ActionPanel
                  player={myPlayer}
                  otherPlayers={otherPlayers}
                  onOpenDialog={openDialog}
                  onEndTurn={handleEndTurn}
                  onRequestExpansion={handleRequestExpansion}
                  expansionAvailable={expansionAvailable}
                  disabled={isSubmittingAction}
                />
              </div>
            )}

            {/* Chronicle / Game Log */}
            <div className="animate-slide-up stagger-4">
              <GameLog
                logs={gameState.logs}
                players={gameState.players}
                myPlayerId={playerId}
              />
            </div>
          </div>

          {/* ════════ RIGHT COLUMN ════════ */}
          <div className="flex flex-col gap-4">
            {/* At the Table / Player Standings */}
            <div className="animate-slide-up stagger-3">
              <PlayerStandings
                players={gameState.players}
                currentPlayerId={gameState.turnOrder[gameState.currentPlayerIndex]}
                myPlayerId={playerId}
              />
            </div>

            {/* Pending investment offers */}
            <div className="animate-slide-up stagger-4">
              <InvestmentOfferPanel offers={myOffers} />
            </div>

            {/* Live auction panel — shown when an auction is active */}
            {gameState.activeAuction && gameState.activeAuction.phase === 'active' && (
              <div className="animate-slide-up stagger-5">
                <AuctionPanel auction={gameState.activeAuction} />
              </div>
            )}

            {/* Hostile takeover panel — shown when a takeover is active or resolved */}
            {gameState.activeTakeover && (
              <div className="animate-slide-up stagger-6">
                <TakeoverPanel takeover={gameState.activeTakeover} />
              </div>
            )}

            {/* Corporate Expansion vote panel — shown when a vote is in progress or resolved */}
            {gameState.expansionVotes && (
              <div className="animate-slide-up stagger-7">
                <ExpansionVotePanel
                  expansionVotes={gameState.expansionVotes}
                  players={gameState.players}
                />
              </div>
            )}

            {/* Table Chat */}
            <div className="animate-slide-up stagger-8">
              <ChatPanel />
            </div>
          </div>
        </div>
      </div>
      </div>{/* close wrapper */}

      {/* ─── Dialog Overlays ─── */}
      {myPlayer && (
        <>
          <BuyAssetDialog
            open={activeDialog === 'buy'}
            onClose={closeDialog}
            player={myPlayer}
            market={gameState.market}
            loading={isSubmittingAction}
            onBuy={handleBuy}
          />

          <SellAssetDialog
            open={activeDialog === 'sell'}
            onClose={closeDialog}
            player={myPlayer}
            otherPlayers={otherPlayers}
            loading={isSubmittingAction}
            onSell={handleSell}
          />

          <BorrowDialog
            open={activeDialog === 'borrow'}
            onClose={closeDialog}
            currentRound={gameState.roundNumber}
            loading={isSubmittingAction}
            onBorrow={handleBorrow}
          />

          <RepayLoanDialog
            open={activeDialog === 'repay'}
            onClose={closeDialog}
            player={myPlayer}
            currentRound={gameState.roundNumber}
            loading={isSubmittingAction}
            onRepay={handleRepay}
          />

          <InvestDialog
            open={activeDialog === 'invest'}
            onClose={closeDialog}
            player={myPlayer}
            otherPlayers={otherPlayers}
            currentRound={gameState.roundNumber}
            loading={isSubmittingAction}
            onPropose={handleProposeInvestment}
          />

          <CreateAuctionDialog
            open={activeDialog === 'auction'}
            onClose={closeDialog}
            player={myPlayer}
            loading={isSubmittingAction}
            onCreateAuction={handleCreateAuction}
          />

          <InitiateTakeoverDialog
            open={activeDialog === 'takeover'}
            onClose={closeDialog}
            player={myPlayer}
            otherPlayers={otherPlayers}
            loading={isSubmittingAction}
            onInitiateTakeover={handleInitiateTakeover}
          />

          <SurrenderDialog
            open={activeDialog === 'surrender'}
            onClose={closeDialog}
            playerName={myPlayer.name}
            loading={isSubmittingAction}
            onSurrender={handleSurrender}
          />
        </>
      )}
    </div>
  );
}
