# Ledger — Agent Instructions

Read these files in this exact order before any implementation:

1. `context/project-overview.md` — What we're building and why
2. `context/architecture.md` — Stack, structure, system boundaries, rules
3. `context/build-plan.md` — Phased feature list, what to build next
4. `context/code-standards.md` — TypeScript, React, naming conventions
5. `context/library-docs.md` — How to use React, Zustand, Socket.io, Tailwind
6. `context/ui-tokens.md` — Design tokens (colors, spacing, typography)
7. `context/ui-rules.md` — Visual identity, layout, component styles
8. `context/ui-registry.md` — Built components reference
9. `context/progress-tracker.md` — What's done, what's next

## Core Rules (Never Violate)

1. **Server is the authority.** All game state validation happens server-side. Client is UI only.
2. **No hardcoded hex values.** Use CSS variables from `ui-tokens.md` mapped through Tailwind config.
3. **Update the progress tracker** after completing each feature. Mark it `[x]`.
4. **Check the UI registry** before creating new components. Reuse existing patterns.
5. **Follow the build plan order.** Don't skip phases or reorder features.
6. **No try/catch in validation.** Validation returns `{ valid: boolean, reason?: string }`.
7. **Named exports only.** No default exports.
8. **All monetary values use "LC" suffix.** Display as "120 LC", never just "120".
9. **Refer to `docs/LEDGER_GDD_v1.md`** for any game design questions — rules, balance, edge cases.
10. **No database.** Game state is in-memory on the server, discarded when the match ends.

## Skills to Use

| When | Skill | Purpose |
|------|-------|---------|
| Before any complex feature | `architect` | Plan before building — reads context, asks questions, produces implementation plan |
| After finishing a feature | `review` | Verify implementation matches plan, check for architecture violations |
| After UI components are built | `imprint` | Capture component patterns into `ui-registry.md` for consistency |
| When something breaks | `recover` | Diagnose failure mode (bug, wrong assumption, context pollution) and fix |
| At end of session | `remember` | Save session state, decisions, and progress to memory for continuity |

## Memory System

- Memory lives in `C:\Users\USER\.claude\projects\C--Users-USER-Documents-Ledger\memory\`
- At session start: memory is loaded automatically as background context
- At session end: run `remember` to save decisions, patterns, and progress
- Memory files use frontmatter with `name`, `description`, and `metadata.type`

## First-Time Setup

If this is a fresh session and nothing is built yet:
1. Read all 9 context files (listed above)
2. Check `progress-tracker.md` to see what's done
3. Start with Feature 00 (Monorepo Setup) and proceed in order
