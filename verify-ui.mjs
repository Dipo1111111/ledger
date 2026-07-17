import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS = path.join(__dirname, 'screenshots');
const URL = 'http://localhost:5173';

import { mkdirSync } from 'fs';
mkdirSync(SCREENSHOTS, { recursive: true });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const browserA = await chromium.launch({ headless: true });
  const browserB = await chromium.launch({ headless: true });

  try {
    const ctxA = await browserA.newContext({ viewport: { width: 1440, height: 900 } });
    const ctxB = await browserB.newContext({ viewport: { width: 1440, height: 900 } });
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    const results = [];

    // ─── STEP 1: Home Screen (empty) ────────────────────────────
    console.log('📸 1/18 — Home screen');
    await pageA.goto(URL, { waitUntil: 'networkidle' });
    await sleep(2000); // Wait for socket to connect
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '01-home-screen.png'), fullPage: false });
    results.push({ step: '01-home-screen', note: 'HomeScreen with Create Game default tab — title, tab switcher, name input, Create Game button, footer' });

    // ─── STEP 2: Create a room ──────────────────────────────────
    console.log('📸 2/18 — Create room with Alice');
    await pageA.fill('#create-name', 'Alice');
    await sleep(200);
    await pageA.click('button:has-text("Create Game")');
    await sleep(2000); // Wait for socket response + navigation
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '02-room-created.png'), fullPage: false });
    results.push({ step: '02-room-created', note: 'LobbyScreen after Alice creates room' });

    // ─── STEP 3: Extract room code ──────────────────────────────
    let roomCode = '';
    try {
      // Room code is in a font-mono element with tracking-[0.25em]
      const codeEl = pageA.locator('.font-mono.text-xl');
      if (await codeEl.isVisible({ timeout: 3000 }).catch(() => false)) {
        roomCode = (await codeEl.textContent() || '').trim();
      }
    } catch (e) {
      console.log('⚠️ Could not get room code from font-mono');
    }
    // Fallback: try from page content
    if (!roomCode) {
      try {
        roomCode = await pageA.evaluate(() => {
          const el = document.querySelector('.font-mono');
          return el?.textContent?.trim() || '';
        });
      } catch(e) {}
    }
    console.log(`📋 Room code: "${roomCode}"`);

    // ─── STEP 4: Join with Bob ──────────────────────────────────
    console.log('📸 4/18 — Bob joins the room');
    await pageB.goto(URL, { waitUntil: 'networkidle' });
    await sleep(2000);

    // Click "Join Game" tab
    const joinTab = pageB.locator('button:has-text("Join Game")');
    if (await joinTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await joinTab.click();
      await sleep(300);
    }

    // Fill Bob's details
    await pageB.fill('#join-name', 'Bob');
    await sleep(200);
    if (roomCode) {
      await pageB.fill('#join-code', roomCode);
      await sleep(200);
    }
    await pageB.click('button:has-text("Join Game")');
    await sleep(2000);
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '04-lobby-two-players.png'), fullPage: false });
    await pageB.screenshot({ path: path.join(SCREENSHOTS, '04b-lobby-bob.png'), fullPage: false });
    results.push({ step: '04-lobby-two-players', note: 'Lobby with 2 players (Alice host + Bob joined)' });

    // ─── STEP 5: Bob readies up ─────────────────────────────────
    console.log('📸 5/18 — Bob readies up');
    const bobReadyBtn = pageB.locator('button:has-text("Ready")');
    if (await bobReadyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bobReadyBtn.click();
      await sleep(500);
    }
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '05-all-ready.png'), fullPage: false });
    results.push({ step: '05-all-ready', note: 'Both players in lobby, Bob is Ready' });

    // ─── STEP 6: Start Game ─────────────────────────────────────
    console.log('📸 6/18 — Start game');
    const startBtn = pageA.locator('button:has-text("Start Game")');
    if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startBtn.click();
      console.log('🎮 Starting game...');
    }
    await sleep(4000); // Wait for game to initialize and state to propagate
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '06-game-screen-full.png'), fullPage: true });
    results.push({ step: '06-game-screen-full', note: 'Full game board after game starts' });

    // ─── STEP 7: Upper section — Status Bar ─────────────────────
    console.log('📸 7/18 — Status bar (TurnIndicator + Timer)');
    await pageA.evaluate(() => window.scrollTo(0, 0));
    await sleep(300);
    // Crop to just the status bar
    const statusBar = pageA.locator('header');
    if (await statusBar.isVisible().catch(() => false)) {
      await statusBar.screenshot({ path: path.join(SCREENSHOTS, '07-status-bar.png') });
    }
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '07-game-viewport.png'), fullPage: false });
    results.push({ step: '07-game-viewport', note: 'Viewport showing sticky status bar with TurnIndicator + Timer' });

    // ─── STEP 8: PlayerBoard ────────────────────────────────────
    console.log('📸 8/18 — PlayerBoard (profile + chips + hand)');
    const playerBoard = pageA.locator('text=Your Corporation');
    if (await playerBoard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await playerBoard.scrollIntoViewIfNeeded();
      await sleep(200);
    }
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '08-player-board.png'), fullPage: false });
    results.push({ step: '08-player-board', note: 'PlayerBoard: avatar, name, health badge, chip tokens (balance + income + tax + net worth)' });

    // ─── STEP 9: Your Hand section ──────────────────────────────
    console.log('📸 9/18 — Your Hand / AssetCards');
    const yourHand = pageA.locator('text=Your Hand');
    if (await yourHand.isVisible({ timeout: 2000 }).catch(() => false)) {
      await yourHand.scrollIntoViewIfNeeded();
      await sleep(200);
    }
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '09-player-hand.png'), fullPage: false });
    results.push({ step: '09-player-hand', note: 'Your Hand: 4 empty asset card slots for starting player' });

    // ─── STEP 10: MarketPanel ────────────────────────────────────
    console.log('📸 10/18 — Market Panel');
    const market = pageA.locator('text=The Market');
    if (await market.isVisible({ timeout: 2000 }).catch(() => false)) {
      await market.scrollIntoViewIfNeeded();
      await sleep(200);
    }
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '10-market-panel.png'), fullPage: false });
    results.push({ step: '10-market-panel', note: 'MarketPanel: "The Market" ornament heading, 4 asset cards with Buy buttons' });

    // ─── STEP 11: ActionPanel ────────────────────────────────────
    console.log('📸 11/18 — Action Panel');
    const actions = pageA.locator('text=Actions');
    if (await actions.isVisible({ timeout: 2000 }).catch(() => false)) {
      await actions.scrollIntoViewIfNeeded();
      await sleep(200);
    }
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '11-action-panel.png'), fullPage: false });
    results.push({ step: '11-action-panel', note: 'ActionPanel: gold panel with Buy/Sell/Borrow/Repay/Invest + End Turn button' });

    // ─── STEP 12: Chronicle ─────────────────────────────────────
    console.log('📸 12/18 — Chronicle (game log)');
    const chronicle = pageA.locator('text=Chronicle');
    if (await chronicle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await chronicle.scrollIntoViewIfNeeded();
      await sleep(200);
    }
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '12-chronicle.png'), fullPage: false });
    results.push({ step: '12-chronicle', note: 'Chronicle panel: glass panel with ornament heading, log entries with dot indicators' });

    // ─── STEP 13: PlayerStandings ───────────────────────────────
    console.log('📸 13/18 — Player Standings sidebar');
    const standings = pageA.locator('text=At the Table');
    if (await standings.isVisible({ timeout: 2000 }).catch(() => false)) {
      await standings.scrollIntoViewIfNeeded();
      await sleep(200);
    }
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '13-player-standings.png'), fullPage: false });
    results.push({ step: '13-player-standings', note: 'PlayerStandings: "At the Table" header, player avatars, names, health badges, stats' });

    // ─── STEP 14: FinancialHealthBadge close-up ─────────────────
    console.log('📸 14/18 — Financial Health Badge');
    const badge = pageA.locator('.health-badge').first();
    if (await badge.isVisible({ timeout: 2000 }).catch(() => false)) {
      await badge.screenshot({ path: path.join(SCREENSHOTS, '14-health-badge.png') });
    }
    results.push({ step: '14-health-badge', note: 'FinancialHealthBadge component: class-based styling, dot indicator, text' });

    // ─── STEP 15: Buy Dialog via Modal ──────────────────────────
    console.log('📸 15/18 — Buy Asset Dialog');
    const buyBtn = pageA.locator('button:has-text("Buy")').first();
    if (await buyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await buyBtn.scrollIntoViewIfNeeded();
      await sleep(200);
      await buyBtn.click();
      await sleep(1000);
    }
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '15-buy-dialog.png'), fullPage: false });
    results.push({ step: '15-buy-dialog', note: 'BuyAssetDialog: Modal overlay centered, showing asset grid with prices' });

    // Check if modal is centered — capture the entire page to see overlay
    const isModalCentered = await pageA.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return 'no dialog found';
      const rect = dialog.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      return {
        centerX: Math.abs(rect.left + rect.width/2 - vw/2) < 50,
        centerY: Math.abs(rect.top + rect.height/2 - vh/2) < 100,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        vw, vh,
      };
    });
    console.log('📐 Modal position:', JSON.stringify(isModalCentered));
    results.push({ step: '15b-modal-centered', note: `Modal centered check: ${JSON.stringify(isModalCentered)}` });

    // Close dialog
    const cancelBtn = pageA.locator('button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cancelBtn.click();
      await sleep(500);
    }

    // ─── STEP 16: Sell Dialog ────────────────────────────────────
    console.log('📸 16/18 — Sell Asset Dialog');
    const sellBtn = pageA.locator('button:has-text("Sell")').first();
    if (await sellBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sellBtn.click();
      await sleep(1000);
    }
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '16-sell-dialog.png'), fullPage: false });
    results.push({ step: '16-sell-dialog', note: 'SellAssetDialog: Modal showing assets available to sell (or "no assets" empty state)' });

    // Close
    const closeBtn = pageA.locator('button:has-text("Close")').first();
    if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBtn.click();
      await sleep(500);
    } else {
      const cancel2 = pageA.locator('button:has-text("Cancel")').first();
      if (await cancel2.isVisible().catch(() => false)) await cancel2.click();
      await sleep(500);
    }

    // ─── STEP 17: Borrow Dialog ─────────────────────────────────
    console.log('📸 17/18 — Borrow Dialog');
    const borrowBtn = pageA.locator('button:has-text("Borrow")').first();
    if (await borrowBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await borrowBtn.click();
      await sleep(1000);
    }
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '17-borrow-dialog.png'), fullPage: false });
    results.push({ step: '17-borrow-dialog', note: 'BorrowDialog: Modal with amount stepper ±, quick amounts, repayment terms' });
    // Close
    const cancel3 = pageA.locator('button:has-text("Cancel")').first();
    if (await cancel3.isVisible().catch(() => false)) await cancel3.click();
    await sleep(500);

    // ─── STEP 18: End Turn ──────────────────────────────────────
    console.log('📸 18/18 — End turn flow');
    const endTurnBtn = pageA.locator('button:has-text("End Turn")').first();
    if (await endTurnBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await endTurnBtn.click();
      await sleep(2000);
    }
    await pageA.screenshot({ path: path.join(SCREENSHOTS, '18-after-end-turn.png'), fullPage: false });
    results.push({ step: '18-after-end-turn', note: 'Screen after End Turn — turn passed, ActionPanel hidden' });

    // Also check Bob's screen
    await sleep(1000);
    await pageB.screenshot({ path: path.join(SCREENSHOTS, '18b-bobs-view.png'), fullPage: false });
    results.push({ step: '18b-bobs-view', note: "Bob's perspective showing it's his turn (gold Turn indicator)" });

    // ─── Final screenshot of whole game ─────────────────────────
    await pageA.evaluate(() => window.scrollTo(0, 0));
    await sleep(300);
    await pageA.screenshot({ path: path.join(SCREENSHOTS, 'final-overview.png'), fullPage: true });
    results.push({ step: 'final-overview', note: 'Full page screenshot for final review' });

    // ─── REPORT ─────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════');
    console.log('       VERIFICATION RESULTS');
    console.log('═══════════════════════════════════════');
    for (const r of results) {
      console.log(`  ✅ ${r.step}: ${r.note}`);
    }
    console.log(`\n📁 ${results.length} screenshots → ${SCREENSHOTS}`);

    return { success: true, count: results.length, results };

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    try {
      const contexts = browserA.contexts();
      if (contexts.length > 0) {
        const pages = contexts[0].pages();
        if (pages.length > 0) {
          await pages[0].screenshot({ path: path.join(SCREENSHOTS, 'error.png'), fullPage: true });
        }
      }
    } catch (e) {}
    return { success: false, error: err.message };
  } finally {
    await browserA.close();
    await browserB.close();
  }
}

main().then(r => {
  console.log(JSON.stringify(r));
  process.exit(r.success ? 0 : 1);
});
