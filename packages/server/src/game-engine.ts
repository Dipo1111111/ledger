import type { GameState, Lobby, PlayerAction, Player } from '@ledger/common';
import {
  STARTING_LC,
  INITIAL_MARKET_SUPPLY,
  ASSET_DEFINITIONS,
  EMERGENCY_SALE_MULTIPLIER,
  TAKEOVER_DEFENDER_IMMUNITY_ROUNDS,
  TAKEOVER_REWARD_LC,
  AFK_MAX_TIMEOUTS,
} from '@ledger/common';
import { validateAction } from '@ledger/common';
import { calculateIncome, calculateTaxes, determineFinancialHealth } from '@ledger/common';
import { executeAction, eliminatePlayer } from './action-executor';

/* ─── Result type ─── */

export interface ActionResult {
  state?: GameState;
  error?: string;
}

/* ─── Engine ─── */

export class GameEngine {
  /** roomCode → authoritative GameState */
  private games = new Map<string, GameState>();
  /** roomCode → (playerId → consecutive timeouts) */
  private afkCounters = new Map<string, Map<string, number>>();

  /* ─── Game Lifecycle ─── */

  /**
   * Initialize a new GameState from a Lobby and start the first player's turn.
   */
  startGame(roomCode: string, lobby: Lobby): GameState {
    const players: Player[] = lobby.players.map((lp) => ({
      id: lp.id,
      name: lp.name,
      lc: STARTING_LC,
      assets: [],
      loans: [],
      investments: [],
      financialHealth: 'healthy',
      takeoverImmunityRounds: 0,
      isEliminated: false,
      isHost: lp.isHost,
      isConnected: true,
    }));

    const turnOrder = lobby.players.map((p) => p.id);

    const state: GameState = {
      id: crypto.randomUUID(),
      phase: 'in_progress',
      roundPhase: 'actions',
      roundNumber: 1,
      players,
      market: { ...INITIAL_MARKET_SUPPLY },
      currentPlayerIndex: 0,
      turnOrder,
      turnTimerSeconds: lobby.settings.turnTimerSeconds,
      turnTimerEndsAt: Date.now() + lobby.settings.turnTimerSeconds * 1000,
      activeTakeover: null,
      activeAuction: null,
      investmentOffers: [],
      expansionVotes: null,
      expansionsUsed: 0,
      winnerId: null,
      startedAt: Date.now(),
      logs: [],
    };

    // Collect income for the first player (they already have their turn)
    this.autoCollectIncome(state, turnOrder[0]);

    state.logs.push({
      round: 1,
      playerId: null,
      message: 'Game started!',
      timestamp: Date.now(),
    });

    this.games.set(roomCode, state);
    return state;
  }

  /**
   * Process a validated or in-progress player action.
   *
   * - `end_turn` is intercepted and triggers turn/round advancement.
   * - All other actions are validated against the current state, executed,
   *   then financial health is recalculated.
   */
  handleAction(roomCode: string, playerId: string, action: PlayerAction): ActionResult {
    const state = this.games.get(roomCode);
    if (!state) return { error: 'Game not found' };
    if (state.phase !== 'in_progress') return { error: 'Game is not in progress' };

    const player = state.players.find((p) => p.id === playerId);
    if (!player || player.isEliminated) {
      return { error: 'Player not found or eliminated' };
    }

    const currentPlayerId = state.turnOrder[state.currentPlayerIndex];

    // Allow auction and investment-response actions outside of the current player's turn
    const isOffTurnAction = action.type === 'place_bid'
      || action.type === 'cancel_auction'
      || action.type === 'respond_investment';

    if (!isOffTurnAction && playerId !== currentPlayerId) {
      return { error: 'It is not your turn' };
    }

    // Player took a real action — clear their AFK counter
    if (!isOffTurnAction) {
      this.resetAfkCounter(roomCode, playerId);
    }
    if (state.roundPhase !== 'actions') {
      return { error: 'Game is not in the actions phase' };
    }

    /* ─── end_turn — special-cased ─── */
    if (action.type === 'end_turn') {
      this.advanceTurn(state);
      return { state };
    }

    /* ─── Validate ─── */
    const validation = validateAction(playerId, action, state);
    if (!validation.valid) {
      return { error: validation.reason ?? 'Action rejected' };
    }

    /* ─── Execute ─── */
    executeAction(state, playerId, action);

    /* ─── Recalculate financial health ─── */
    for (const p of state.players) {
      if (!p.isEliminated) {
        p.financialHealth = determineFinancialHealth(p);
      }
    }

    return { state };
  }

  /**
   * Return the current GameState for a room (read-only access).
   */
  getGame(roomCode: string): GameState | undefined {
    return this.games.get(roomCode);
  }

  /**
   * Mark a player as connected or disconnected in the game state.
   */
  setPlayerConnected(roomCode: string, playerId: string, connected: boolean): void {
    const state = this.games.get(roomCode);
    if (!state) return;

    const player = state.players.find((p) => p.id === playerId);
    if (!player) return;

    player.isConnected = connected;
  }

  /**
   * Mark a player as abandoned (disconnected in a 2-player game).
   */
  handleAbandon(roomCode: string, playerId: string): void {
    const state = this.games.get(roomCode);
    if (!state || state.phase !== 'in_progress') return;

    const player = state.players.find((p) => p.id === playerId);
    if (!player || player.isEliminated) return;

    eliminatePlayer(state, playerId, 'abandoned the game');
    
    state.logs.push({
      round: state.roundNumber,
      playerId,
      message: `${player.name} abandoned the game.`,
      timestamp: Date.now(),
    });

    const alive = state.players.filter((p) => !p.isEliminated);
    if (alive.length <= 1) {
      this.endGame(state, alive[0]?.id ?? null);
    } else {
      if (state.turnOrder[state.currentPlayerIndex] === playerId) {
        this.advanceTurn(state);
      }
    }
  }

  /**
   * Handle a turn timer expiry for a room.
   *
   * - If the current player has timed out consecutively >= AFK_MAX_TIMEOUTS,
   *   they are auto-surrendered (eliminated).
   * - Otherwise, the turn auto-advances (acts as end_turn).
   * - If the game ends as a result, the state reflects that.
   *
   * Returns the updated GameState and any warning/error to emit as an event.
   */
  handleTimerExpiry(roomCode: string): { state: GameState; afkWarning?: string } {
    const state = this.games.get(roomCode);
    if (!state || state.phase !== 'in_progress' || state.roundPhase !== 'actions') {
      return { state: state! };
    }

    const currentPlayerId = state.turnOrder[state.currentPlayerIndex];
    const player = state.players.find((p) => p.id === currentPlayerId);
    if (!player || player.isEliminated) return { state };

    // Track consecutive timeouts
    if (!this.afkCounters.has(roomCode)) {
      this.afkCounters.set(roomCode, new Map());
    }
    const roomAfk = this.afkCounters.get(roomCode)!;
    const consecutive = (roomAfk.get(currentPlayerId) ?? 0) + 1;
    roomAfk.set(currentPlayerId, consecutive);

    // If AFK limit hit → auto-surrender
    if (consecutive >= AFK_MAX_TIMEOUTS) {
      eliminatePlayer(state, currentPlayerId, 'automatic surrender');
      state.logs.push({
        round: state.roundNumber,
        playerId: currentPlayerId,
        message: `${player.name} surrendered due to ${consecutive} consecutive timeouts.`,
        timestamp: Date.now(),
      });

      // Check if game should end
      const alive = state.players.filter((p) => !p.isEliminated);
      if (alive.length <= 1) {
        this.endGame(state, alive[0]?.id ?? null);
      } else {
        this.advanceTurn(state);
      }

      return {
        state,
        afkWarning: `${player.name} was auto-surrendered after ${consecutive} timeouts`,
      };
    }

    // First timeout — warning
    if (consecutive === 1) {
      state.logs.push({
        round: state.roundNumber,
        playerId: currentPlayerId,
        message: `Warning: ${player.name} missed a turn. ${AFK_MAX_TIMEOUTS - consecutive} more timeout${AFK_MAX_TIMEOUTS - consecutive > 1 ? 's' : ''} will result in surrender.`,
        timestamp: Date.now(),
      });
    }

    // Auto end the turn
    this.advanceTurn(state);

    return {
      state,
      afkWarning: consecutive === 1
        ? `Turn automatically ended. You will automatically surrender if you miss the next turn.`
        : undefined,
    };
  }

  /**
   * Clear the AFK counter for a player (called when they take a real action).
   */
  resetAfkCounter(roomCode: string, playerId: string): void {
    const roomAfk = this.afkCounters.get(roomCode);
    if (roomAfk) {
      roomAfk.delete(playerId);
    }
  }

  /* ─── Private: Turn / Round Advancement ─── */

  /**
   * Check all players for overdue loans at the start of a new round.
   * Loans past their deadline without repayment are marked defaulted.
   * If a player has enough LC to cover the repayment, the bank auto-deducts it.
   */
  private processLoanDefaults(state: GameState): void {
    for (const player of state.players) {
      if (player.isEliminated) continue;

      for (const loan of player.loans) {
        if (loan.isRepaid || loan.isDefaulted) continue;
        // Loan is due if roundNumber has passed the deadline
        if (state.roundNumber <= loan.deadlineRound) continue;

        if (player.lc >= loan.repaymentAmount) {
          // Bank demands payment — player can cover it
          player.lc -= loan.repaymentAmount;
          loan.isRepaid = true;
          state.logs.push({
            round: state.roundNumber,
            playerId: player.id,
            message: `${player.name} auto-repaid loan (${loan.repaymentAmount} LC)`,
            timestamp: Date.now(),
          });
        } else {
          // Player cannot afford repayment — loan defaults
          loan.isDefaulted = true;
          state.logs.push({
            round: state.roundNumber,
            playerId: player.id,
            message: `${player.name}'s loan defaulted: ${loan.repaymentAmount} LC owed.`,
            timestamp: Date.now(),
          });
        }
      }
    }
  }

  /**
   * Check all players for overdue investment contracts at the start of a new round.
   * When an investment deadline passes, the receiver should repay the investor.
   * If the receiver has enough LC, auto-transfer the repayment.
   * Otherwise mark as defaulted (remains on record, no elimination in V1).
   */
  private processInvestmentDeadlines(state: GameState): void {
    // Collect all investments that are due from all players (both sides have them)
    const allInvestments = state.players.flatMap((p) => p.investments);
    const seen = new Set<string>();

    for (const inv of allInvestments) {
      // Dedup — same contract appears on both investor and receiver
      if (seen.has(inv.id)) continue;
      seen.add(inv.id);

      if (inv.isRepaid || inv.isDefaulted) continue;
      if (state.roundNumber <= inv.deadlineRound) continue;

      const receiver = state.players.find((p) => p.id === inv.receiverId);
      if (!receiver || receiver.isEliminated) {
        // Receiver gone — auto-default the investment
        inv.isDefaulted = true;
        continue;
      }

      const investor = state.players.find((p) => p.id === inv.investorId);
      if (!investor) continue;

      if (receiver.lc >= inv.repaymentAmount) {
        // Receiver can repay
        receiver.lc -= inv.repaymentAmount;
        investor.lc += inv.repaymentAmount;
        inv.isRepaid = true;
        state.logs.push({
          round: state.roundNumber,
          playerId: receiver.id,
          message: `${receiver.name} repaid investment to ${investor.name} (${inv.repaymentAmount} LC)`,
          timestamp: Date.now(),
        });
      } else {
        // Cannot repay — default
        inv.isDefaulted = true;
        state.logs.push({
          round: state.roundNumber,
          playerId: receiver.id,
          message: `${receiver.name} defaulted on investment from ${investor.name} (${inv.repaymentAmount} LC owed)`,
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * At the tax phase, check for unresolved defaulted loans.
   * Attempt emergency asset sales to cover the debt.
   * If still insolvent after selling everything, eliminate the player.
   */
  private resolveDefaultedLoans(state: GameState): void {
    for (const player of state.players) {
      if (player.isEliminated) continue;

      const unresolvedDefaults = player.loans.filter((l) => l.isDefaulted && !l.isRepaid);
      if (unresolvedDefaults.length === 0) continue;

      const totalOwed = unresolvedDefaults.reduce((sum, l) => sum + l.repaymentAmount, 0);

      // Attempt emergency asset sales to cover the amount owed
      let safety = 100;
      while (player.lc < totalOwed && player.assets.length > 0 && safety-- > 0) {
        const sorted = [...player.assets].sort(
          (a, b) => ASSET_DEFINITIONS[b.type].purchasePrice - ASSET_DEFINITIONS[a.type].purchasePrice,
        );
        const asset = sorted[0];
        const def = ASSET_DEFINITIONS[asset.type];
        const saleValue = Math.floor(def.purchasePrice * EMERGENCY_SALE_MULTIPLIER);

        player.lc += saleValue;
        player.assets = player.assets.filter((a) => a.id !== asset.id);
        state.market[asset.type]++;

        state.logs.push({
          round: state.roundNumber,
          playerId: player.id,
          message: `${player.name} emergency-sold ${asset.type.toUpperCase()} for ${saleValue} LC (loan default)`,
          timestamp: Date.now(),
        });
      }

      // Settle what we can
      if (player.lc >= totalOwed) {
        for (const loan of unresolvedDefaults) {
          player.lc -= loan.repaymentAmount;
          loan.isRepaid = true;
        }
        state.logs.push({
          round: state.roundNumber,
          playerId: player.id,
          message: `${player.name} settled defaulted loan(s) (${totalOwed} LC)`,
          timestamp: Date.now(),
        });
      } else {
        // Still cannot pay — eliminate
        eliminatePlayer(state, player.id, 'unresolved loan default');
      }
    }
  }

  private advanceTurn(state: GameState): void {
    const aliveIds = new Set(
      state.players.filter((p) => !p.isEliminated).map((p) => p.id),
    );

    // Find the next alive player, wrapping around
    let nextIndex = state.currentPlayerIndex;
    let attempts = 0;
    do {
      nextIndex = (nextIndex + 1) % state.turnOrder.length;
      attempts++;
    } while (
      !aliveIds.has(state.turnOrder[nextIndex]) &&
      attempts < state.turnOrder.length
    );

    const wrapped = nextIndex <= state.currentPlayerIndex || attempts >= state.turnOrder.length;

    if (wrapped) {
      /* ─── Round Complete → Tax Phase ─── */
      this.processTaxPhase(state);

      // Check win condition after taxes
      let alive = state.players.filter((p) => !p.isEliminated);
      if (alive.length <= 1) {
        this.endGame(state, alive[0]?.id ?? null);
        return;
      }

      // Start new round
      state.roundNumber++;

      // Resolve any active takeover that has reached its deadline
      this.resolveTakeover(state);

      // Check win condition after takeover elimination
      alive = state.players.filter((p) => !p.isEliminated);
      if (alive.length <= 1) {
        this.endGame(state, alive[0]?.id ?? null);
        return;
      }

      state.currentPlayerIndex = this.findFirstAliveIndex(state);

      // Clean up stale investment offers (player eliminated or disconnected)
      state.investmentOffers = state.investmentOffers.filter((o) => {
        const inv = state.players.find((p) => p.id === o.investorId);
        const rec = state.players.find((p) => p.id === o.receiverId);
        if (!inv || inv.isEliminated || !rec || rec.isEliminated) {
          state.logs.push({
            round: state.roundNumber,
            playerId: null,
            message: `Investment offer from ${inv?.name ?? 'Unknown'} to ${rec?.name ?? 'Unknown'} expired`,
            timestamp: Date.now(),
          });
          return false;
        }
        return true;
      });

      // Check for newly overdue loans and investments at the start of the new round
      this.processLoanDefaults(state);
      this.processInvestmentDeadlines(state);

      // Re-check alive after potential loan-default eliminations
      alive = state.players.filter((p) => !p.isEliminated);
      if (alive.length <= 1) {
        this.endGame(state, alive[0]?.id ?? null);
        return;
      }

      const firstId = state.turnOrder[state.currentPlayerIndex];
      this.autoCollectIncome(state, firstId);

      state.logs.push({
        round: state.roundNumber,
        playerId: null,
        message: `Round ${state.roundNumber} started.`,
        timestamp: Date.now(),
      });
    } else {
      /* ─── Normal turn advancement ─── */
      state.currentPlayerIndex = nextIndex;
      const nextId = state.turnOrder[nextIndex];
      this.autoCollectIncome(state, nextId);
    }

    // Reset the turn timer for the new current player
    const currentId = state.turnOrder[state.currentPlayerIndex];
    const current = state.players.find((p) => p.id === currentId);
    if (current && !current.isEliminated) {
      state.turnTimerEndsAt = Date.now() + state.turnTimerSeconds * 1000;
    } else {
      state.turnTimerEndsAt = null;
    }
  }

  /* ─── Private: Tax Phase ─── */

  private processTaxPhase(state: GameState): void {
    state.roundPhase = 'taxes';

    for (const player of state.players) {
      if (player.isEliminated) continue;

      const tax = calculateTaxes(player);
      player.lc -= tax;

      state.logs.push({
        round: state.roundNumber,
        playerId: player.id,
        message: `${player.name} paid ${tax} LC in taxes`,
        timestamp: Date.now(),
      });

      // Handle insolvency via emergency asset sale
      if (player.lc < 0) {
        this.resolveInsolvency(state, player);
      }
    }

    // Resolve any defaulted loans (emergency sales → possible elimination)
    this.resolveDefaultedLoans(state);

    state.roundPhase = 'actions';
  }

  /**
   * Attempt to recover a player whose LC dropped below 0 by
   * emergency-selling assets at the distressed rate (0.5× purchase price).
   * If still insolvent after selling everything, eliminate the player.
   */
  private resolveInsolvency(state: GameState, player: Player): void {
    let safety = 100; // prevent infinite loops

    while (player.lc < 0 && player.assets.length > 0 && safety-- > 0) {
      // Sell the asset that raises the most cash (cheapest gives worst value, so
      // sell the most expensive first to minimise number of sales)
      const sorted = [...player.assets].sort(
        (a, b) => ASSET_DEFINITIONS[b.type].purchasePrice - ASSET_DEFINITIONS[a.type].purchasePrice,
      );
      const asset = sorted[0];

      const def = ASSET_DEFINITIONS[asset.type];
      const saleValue = Math.floor(def.purchasePrice * EMERGENCY_SALE_MULTIPLIER);

      player.lc += saleValue;
      player.assets = player.assets.filter((a) => a.id !== asset.id);
      state.market[asset.type]++;

      state.logs.push({
        round: state.roundNumber,
        playerId: player.id,
        message: `${player.name} emergency-sold ${asset.type.toUpperCase()} for ${saleValue} LC (×${EMERGENCY_SALE_MULTIPLIER})`,
        timestamp: Date.now(),
      });
    }

    if (player.lc < 0) {
      eliminatePlayer(state, player.id, 'could not pay taxes');
    }
  }

  /* ─── Private: Helpers ─── */

  /**
   * Resolve a hostile takeover at round advancement.
   * Compares the defender's current LC against the required reserve.
   * - If defender has enough LC → takeover fails, defender gets immunity.
   * - If defender lacks LC → defender eliminated, attacker gets best asset + reward.
   */
  private resolveTakeover(state: GameState): void {
    const takeover = state.activeTakeover;
    if (!takeover || takeover.phase !== 'defense') return;
    if (state.roundNumber < takeover.defenseDeadlineRound) return;

    const defender = state.players.find((p) => p.id === takeover.defenderId);
    const attacker = state.players.find((p) => p.id === takeover.attackerId);
    if (!defender || !attacker) {
      // One of them vanished — cancel the takeover
      state.activeTakeover = null;
      return;
    }

    if (defender.isEliminated) {
      // Defender already eliminated by other means — cancel the takeover
      state.activeTakeover = null;
      return;
    }

    // Update current progress with defender's actual LC
    takeover.currentProgress = defender.lc;

    if (defender.lc >= takeover.requiredReserve) {
      /* ─── Survived ─── */
      takeover.phase = 'failed';
      takeover.resolutionRound = state.roundNumber;
      defender.takeoverImmunityRounds = TAKEOVER_DEFENDER_IMMUNITY_ROUNDS;

      state.logs.push({
        round: state.roundNumber,
        playerId: defender.id,
        message: `${defender.name} survived the hostile takeover by ${attacker.name} (${defender.lc} LC ≥ ${takeover.requiredReserve} LC required)`,
        timestamp: Date.now(),
      });

      state.logs.push({
        round: state.roundNumber,
        playerId: defender.id,
        message: `${defender.name} is immune to takeovers for ${TAKEOVER_DEFENDER_IMMUNITY_ROUNDS} rounds`,
        timestamp: Date.now(),
      });
    } else {
      /* ─── Failed — defender eliminated ─── */
      takeover.phase = 'succeeded';
      takeover.resolutionRound = state.roundNumber;

      // Give the attacker the defender's highest-value asset
      const sorted = [...defender.assets].sort(
        (a, b) => ASSET_DEFINITIONS[b.type].purchasePrice - ASSET_DEFINITIONS[a.type].purchasePrice,
      );
      if (sorted.length > 0) {
        const best = sorted[0];
        defender.assets = defender.assets.filter((a) => a.id !== best.id);
        attacker.assets.push({
          id: best.id,
          type: best.type,
          ownerId: attacker.id,
        });
      }

      // LC reward
      attacker.lc += TAKEOVER_REWARD_LC;

      // Clean up the defender (liquidates remaining assets, defaults contracts)
      eliminatePlayer(state, defender.id, `taken over by ${attacker.name}`);
    }
  }

  private autoCollectIncome(state: GameState, playerId: string): void {
    const player = state.players.find((p) => p.id === playerId);
    if (!player || player.isEliminated) return;

    const income = calculateIncome(player);
    player.lc += income;

    state.logs.push({
      round: state.roundNumber,
      playerId: player.id,
      message: `${player.name} collected ${income} LC income`,
      timestamp: Date.now(),
    });

    // Decrement takeover immunity (Feature 13)
    if (player.takeoverImmunityRounds > 0) {
      player.takeoverImmunityRounds--;
    }
  }

  private findFirstAliveIndex(state: GameState): number {
    const idx = state.turnOrder.findIndex((id) => {
      const p = state.players.find((pl) => pl.id === id);
      return p && !p.isEliminated;
    });
    return idx >= 0 ? idx : 0;
  }

  private endGame(state: GameState, winnerId: string | null): void {
    state.phase = 'finished';
    state.winnerId = winnerId;

    const winnerName = winnerId
      ? state.players.find((p) => p.id === winnerId)?.name ?? 'Unknown'
      : null;

    state.logs.push({
      round: state.roundNumber,
      playerId: winnerId,
      message: winnerName
        ? `${winnerName} wins the game!`
        : 'Game ended — no remaining players',
      timestamp: Date.now(),
    });
  }
}
