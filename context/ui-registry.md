# UI Registry — Ledger

## Common Components

| Component | File | Description |
|-----------|------|-------------|
| Modal | `components/common/Modal.tsx` | Fixed inset overlay with backdrop blur, flex-centered panel, Escape key handler |
| Button | `components/common/Button.tsx` | Reusable button with ghost/gold variants |
| Card | `components/common/Card.tsx` | Base card wrapper — felt-light/80 bg, subtle border, card shadow |
| Badge | `components/common/Badge.tsx` | Small labeled badge for counts/states |
| Timer | `components/common/Timer.tsx` | Countdown timer display, shows remaining seconds |
| ConnectionStatus | `components/common/ConnectionStatus.tsx` | Socket connection indicator |
| GameSidebar | `components/sidebar/GameSidebar.tsx` | Collapsible sidebar (14px collapsed / 48px expanded), logo header, nav items, settings/rules panels |

## Board Components

| Component | File | Description |
|-----------|------|-------------|
| AssetCard | `components/board/AssetCard.tsx` | Playing card with SVG face art, 3 variants (empty/market/owned), corner rank markers, suit-specific colors |
| MarketPanel | `components/board/MarketPanel.tsx` | "The Market" panel with 4 AssetCards in buy mode, ornament heading |
| PlayerBoard | `components/board/PlayerBoard.tsx` | Gold panel with avatar, FinancialHealthBadge, 5-chip grid (Balance/Income/Tax/Net Worth/Debt), "Your Hand" section |
| ActionPanel | `components/board/ActionPanel.tsx` | Gold panel with 5 ghost action buttons (Buy/Sell/Borrow/Repay/Invest) + End Turn gold button |
| PlayerStandings | `components/board/PlayerStandings.tsx` | "At the Table" sidebar with sorted player rows, avatars, health badges, stat lines, suit tags |
| TurnIndicator | `components/board/TurnIndicator.tsx` | Shows current round (Roman numerals), round phase, current player name |
| FinancialHealthBadge | `components/board/FinancialHealthBadge.tsx` | Class-based health indicator (healthy/stable/stressed/critical) with dot + text |

## Dialog Components

| Component | File | Description |
|-----------|------|-------------|
| BuyAssetDialog | `components/board/dialogs/BuyAssetDialog.tsx` | Modal showing asset grid with prices, buy/disabled per asset type |
| SellAssetDialog | `components/board/dialogs/SellAssetDialog.tsx` | Modal with bank/player toggle, asset selection, buyer picker, price stepper (1-5× purchase price) |
| BorrowDialog | `components/board/dialogs/BorrowDialog.tsx` | Modal with amount stepper (±10 LC), quick amounts (30/60/90/120), repayment terms breakdown |
| RepayLoanDialog | `components/board/dialogs/RepayLoanDialog.tsx` | Modal with loan selection cards, range slider for partial/full repayment |
| InvestDialog | `components/board/dialogs/InvestDialog.tsx` | Modal for investing in other players |

## Screens

| Screen | File | Description |
|--------|------|-------------|
| HomeScreen | `screens/HomeScreen.tsx` | Landing screen with Create/Join tabs, name input |
| LobbyScreen | `screens/LobbyScreen.tsx` | Two-column lobby: player list + actions (left), settings (right). Pre-room: centered form with tab switcher |
| GameScreen | `screens/GameScreen.tsx` | Main game view: status bar, PlayerBoard, MarketPanel, ActionPanel, Chronicle, PlayerStandings, dialogs |

## State Stores

| Store | File | Description |
|-------|------|-------------|
| lobby-store | `stores/lobby-store.ts` | Room + player identity state |
| game-store | `stores/game-store.ts` | Authoritative GameState from server, selectors for derived data |
| socket-store | `stores/socket-store.ts` | Socket connection state |
