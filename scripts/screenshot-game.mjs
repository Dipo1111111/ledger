/**
 * Take a screenshot of the Ledger game board with mock state.
 * Requires dev server running on port 5173.
 */
import { chromium } from 'playwright';

const MOCK_GAME = {
  id: 'screenshot-room',
  phase: 'in_progress',
  roundPhase: 'actions',
  roundNumber: 7,
  currentPlayerIndex: 0,
  turnOrder: ['p1', 'p2', 'p3'],
  turnTimerSeconds: 60,
  turnTimerEndsAt: Date.now() + 45000,
  activeTakeover: null,
  activeAuction: null,
  investmentOffers: [],
  expansionVotes: null,
  expansionsUsed: 0,
  winnerId: null,
  startedAt: Date.now() - 600000,
  market: { jack: 4, queen: 3, king: 2, ace: 1 },
  players: [
    {
      id: 'p1', name: 'You', lc: 245,
      assets: [
        { id: 'a1', type: 'king', ownerId: 'p1' },
        { id: 'a2', type: 'queen', ownerId: 'p1' },
        { id: 'a3', type: 'jack', ownerId: 'p1' },
      ],
      loans: [], investments: [],
      financialHealth: 'healthy', takeoverImmunityRounds: 0,
      isEliminated: false, isHost: true, isConnected: true,
    },
    {
      id: 'p2', name: 'Rival Corp', lc: 180,
      assets: [
        { id: 'a4', type: 'ace', ownerId: 'p2' },
        { id: 'a5', type: 'king', ownerId: 'p2' },
      ],
      loans: [{ id: 'l1', borrowerId: 'p2', amount: 50, interestRate: 0.15, roundsRemaining: 3, roundBorrowed: 4 }],
      investments: [],
      financialHealth: 'stable', takeoverImmunityRounds: 0,
      isEliminated: false, isHost: false, isConnected: true,
    },
    {
      id: 'p3', name: 'Apex Holdings', lc: 120,
      assets: [
        { id: 'a6', type: 'queen', ownerId: 'p3' },
        { id: 'a7', type: 'jack', ownerId: 'p3' },
        { id: 'a8', type: 'jack', ownerId: 'p3' },
      ],
      loans: [], investments: [],
      financialHealth: 'stressed', takeoverImmunityRounds: 0,
      isEliminated: false, isHost: false, isConnected: true,
    },
  ],
  logs: [
    { round: 7, playerId: 'p2', message: 'Rival Corp purchased a King for 40 LC', timestamp: Date.now() - 30000 },
    { round: 7, playerId: 'p1', message: 'You borrowed 50 LC from the bank', timestamp: Date.now() - 20000 },
    { round: 6, playerId: 'p3', message: 'Apex Holdings sold a Jack for 25 LC', timestamp: Date.now() - 60000 },
    { round: 6, playerId: null, message: 'Round 6 taxes collected', timestamp: Date.now() - 90000 },
  ],
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Inject game state via exposed Zustand stores
  await page.evaluate((gameState) => {
    const gameStore = window.__gameStore;
    const lobbyStore = window.__lobbyStore;
    if (!gameStore || !lobbyStore) {
      throw new Error('Stores not exposed on window');
    }
    lobbyStore.setState({ roomCode: 'SHOT01', playerId: 'p1' });
    gameStore.setState({ gameState });
  }, MOCK_GAME);

  await page.waitForTimeout(1500); // Wait for animations

  await page.screenshot({
    path: 'packages/client/public/game-screenshot.png',
    fullPage: false,
  });

  console.log('Screenshot saved: packages/client/public/game-screenshot.png');
  await browser.close();
})();
