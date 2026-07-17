import type { GameState } from '../types/game-state';
import { ASSET_DEFINITIONS } from '../constants';
import type { ValidationResult } from './validation-result';

export function canSellAsset(
  playerId: string,
  assetId: string,
  state: GameState,
): ValidationResult {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { valid: false, reason: 'Player not found' };

  const asset = player.assets.find((a) => a.id === assetId);
  if (!asset) return { valid: false, reason: 'Asset not found in your portfolio' };

  return { valid: true };
}

export function canEmergencySell(
  playerId: string,
  assetId: string,
  state: GameState,
): ValidationResult {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { valid: false, reason: 'Player not found' };

  const asset = player.assets.find((a) => a.id === assetId);
  if (!asset) return { valid: false, reason: 'Asset not found' };

  return { valid: true };
}

export function canPrivateSell(
  playerId: string,
  assetId: string,
  buyerId: string,
  price: number,
  state: GameState,
): ValidationResult {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { valid: false, reason: 'Seller not found' };

  const buyer = state.players.find((p) => p.id === buyerId);
  if (!buyer) return { valid: false, reason: 'Buyer not found' };

  if (buyerId === playerId) {
    return { valid: false, reason: 'Cannot sell asset to yourself' };
  }

  const asset = player.assets.find((a) => a.id === assetId);
  if (!asset) return { valid: false, reason: 'Asset not found' };

  const def = ASSET_DEFINITIONS[asset.type];
  if (price <= 0 || price > def.purchasePrice * 5) {
    return { valid: false, reason: 'Invalid sale price' };
  }

  if (buyer.lc < price) {
    return { valid: false, reason: 'Buyer cannot afford this price' };
  }

  return { valid: true };
}
