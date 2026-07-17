# Ledger — Code Standards

## TypeScript Rules

- **Strict mode** enabled in all packages
- **Explicit types** for all function parameters and returns
- **No `any`** — use `unknown` and narrow with type guards
- **No `@ts-ignore`** or `@ts-expect-error` unless absolutely necessary
- Prefer **interfaces over types** for object shapes (use `type` for unions/utility types)
- Use **`const` assertions** for constant objects (`as const`)
- File names: **kebab-case** (`game-state.ts`, `buy-asset.ts`)

## React + Component Rules

- **Functional components only** — no class components
- **Named exports** — prefer named over default exports
- **One component per file** — except for tiny related components in the same file (e.g., a component + its sub-components under 80 lines)
- **Props typed with interface** named `{ComponentName}Props`
- **No inline styles** — always use Tailwind classes or CSS variables from `ui-tokens.md`
- **No `!important`** — ever. Use proper specificity
- Custom hooks prefixed with `use-` in filenames (`use-socket.ts`)
- **Components go in domain folders** — `components/board/`, `components/actions/`, etc.

## Server Rules

- **All game logic is synchronous** — async only for I/O (socket messages, timers)
- **Handler functions** receive `(socket, gameState, payload)` and return `void` (they mutate state then emit)
- **Validation functions** are pure functions: `(playerId, data, gameState) => ValidationResult`
- **Error messages** are user-facing — descriptive but not technical
- **No try/catch** around validation — validation returns `{ valid: false, reason }` rather than throwing

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Types | PascalCase | `GameState`, `Player`, `AssetType` |
| Variables | camelCase | `gameState`, `currentPlayer` |
| Functions | camelCase | `canBuyAsset()`, `calculateIncome()` |
| Files (code) | kebab-case | `game-state.ts`, `takeover.events.ts` |
| Files (React) | PascalCase | `GameScreen.tsx`, `AssetCard.tsx` |
| Socket events | snake_case | `game:turn_start`, `room:player_joined` |
| CSS classes | Tailwind utility-first | No custom CSS class names |

## TypeScript Paths

- `@ledger/common` → `packages/common/src`
- `@ledger/server` → `packages/server/src`
- `@ledger/client` → `packages/client/src`
