import type { GameState } from '../types/game-state';
import {
  TAKEOVER_MIN_WEALTH,
  TAKEOVER_FILING_FEE,
  TAKEOVER_ATTACKER_COOLDOWN_ROUNDS,
  TAKEOVER_DEFENDER_IMMUNITY_ROUNDS,
} from '../constants';
import { calculateNetWorth } from '../calculations/net-worth';
import type { ValidationResult } from './validation-result';

export function canInitiateTakeover(
  attackerId: string,
  targetPlayerId: string,
  state: GameState,
): ValidationResult {
  const attacker = state.players.find((p) => p.id === attackerId);
  if (!attacker) return { valid: false, reason: 'Attacker not found' };

  const defender = state.players.find((p) => p.id === targetPlayerId);
  if (!defender) return { valid: false, reason: 'Target not found' };

  if (attackerId === targetPlayerId) {
    return { valid: false, reason: 'Cannot target yourself' };
  }

  if (defender.isEliminated) {
    return { valid: false, reason: 'Target is already eliminated' };
  }

  const attackerWorth = calculateNetWorth(attacker);
  if (attackerWorth < TAKEOVER_MIN_WEALTH) {
    return {
      valid: false,
      reason: `Need ${TAKEOVER_MIN_WEALTH} LC net worth, have ${attackerWorth} LC`,
    };
  }

  if (attacker.lc < TAKEOVER_FILING_FEE) {
    return {
      valid: false,
      reason: `Need ${TAKEOVER_FILING_FEE} LC for filing fee, have ${attacker.lc} LC`,
    };
  }

  if (defender.takeoverImmunityRounds > 0) {
    return { valid: false, reason: 'Target is immune to takeovers' };
  }

  // Check if attacker is on cooldown
  const lastTakeover = state.logs.find(
    (log) =>
      log.playerId === attackerId &&
      log.message.includes('initiated a takeover'),
  );
  if (lastTakeover) {
    const roundsSince = state.roundNumber - lastTakeover.round;
    if (roundsSince < TAKEOVER_ATTACKER_COOLDOWN_ROUNDS) {
      return {
        valid: false,
        reason: `Must wait ${TAKEOVER_ATTACKER_COOLDOWN_ROUNDS - roundsSince} more round(s) between takeovers`,
      };
    }
  }

  // Check if this attacker already has an active takeover in progress
  if (
    state.activeTakeover &&
    state.activeTakeover.phase === 'defense' &&
    state.activeTakeover.attackerId === attackerId
  ) {
    return { valid: false, reason: 'You already have an active takeover' };
  }

  // Check if this defender is already being targeted
  if (
    state.activeTakeover &&
    state.activeTakeover.phase === 'defense' &&
    state.activeTakeover.defenderId === targetPlayerId
  ) {
    return { valid: false, reason: 'This player is already being targeted' };
  }

  return { valid: true };
}
