# LEDGER — Game Design Document (GDD) V1

> **Unified Edition** — Compiled from design conversations, rulebook edge cases, balance philosophy, and final locked decisions.
> **Status:** Final for V1 development
> **Date:** 2026-07-05

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Design Pillars](#2-core-design-pillars)
3. [Player & Match Setup](#3-player--match-setup)
4. [Core Gameplay Loop](#4-core-gameplay-loop)
5. [Turn Structure](#5-turn-structure)
6. [Round End & Taxes](#6-round-end--taxes)
7. [Assets & The Economy](#7-assets--the-economy)
8. [Loans](#8-loans)
9. [Investments](#9-investments)
10. [Selling Assets](#10-selling-assets)
11. [Auctions](#11-auctions)
12. [Negotiations](#12-negotiations)
13. [Hostile Takeovers](#13-hostile-takeovers)
14. [Bankruptcy & Elimination](#14-bankruptcy--elimination)
15. [Corporate Expansion](#15-corporate-expansion)
16. [Financial Health](#16-financial-health)
17. [Tie Situations](#17-tie-situations)
18. [Disconnect & AFK & Surrender](#18-disconnect--afk--surrender)
19. [The Five Game Eras](#19-the-five-game-eras)
20. [Balance Philosophy — Why Every System Exists](#20-balance-philosophy--why-every-system-exists)
21. [Player Psychology & Emotional Arc](#21-player-psychology--emotional-arc)
22. [The Eight Design Commandments](#22-the-eight-design-commandments)
23. [Target Audience & Platform](#23-target-audience--platform)
24. [The Five Final Questions](#24-the-five-final-questions)
25. [Future Ideas (Not V1)](#25-future-ideas-not-v1)

---

## 1. Executive Summary

### What is Ledger?

Ledger is a **competitive online multiplayer business strategy game** where players build corporate empires through investing, asset acquisition, financial management, negotiation, calculated risk-taking, and corporate warfare.

Unlike Monopoly — which is driven primarily by movement and luck — Ledger is designed entirely around **player decisions**.

There are:
- **No dice**
- **No random movement**
- **No chance cards** deciding the game

**Every victory should feel earned.**

Ledger is fundamentally a game about making smarter financial decisions than everyone else.

### Game Objective

**Win Condition:** Become the last corporation remaining.

Players are eliminated only through:
- **Hostile Takeover failure**
- **Financial Collapse** (unable to satisfy required obligations)

No score determines victory. Only survival.

### Match Length

**Target:** 30–60 minutes. Never less than 20. Rarely exceed 60.

This encourages players to immediately queue for another game.

### Player Identity

Each player represents a **corporation**. Every corporation begins equally. There are:
- No unique abilities
- No pay-to-win mechanics
- No classes
- No asymmetric starting positions

**Victory depends entirely on decisions.**

### Currency

**Ledger Chips (LC)** — the single universal currency.
Everything uses LC: assets, loans, investments, taxes, takeovers, trading.

Examples: 20 LC, 150 LC, 480 LC.

### Origin

Ledger was inspired by a **physical card game** originally created by three high school friends. The original game became popular because it created **stories** — huge comebacks, impossible negotiations, risky loans, betrayals, alliances, bankruptcies, and constant shouting around the table.

The digital version's goal is **not** to recreate the card game perfectly.
The goal is to **recreate why it was fun.**

---

## 2. Core Design Pillars

Everything inside Ledger must support these pillars.

### 1. Strategy over Luck
The better player should usually win. Luck should exist only in human behavior — not in dice, not in card draws, not in randomness. If you lose, it should be because another player outplayed you.

### 2. Economy is King
Money drives everything. Every action has an economic consequence:
- Borrowing creates opportunities
- Taxes create pressure
- Assets create growth
- Investments create alliances
- Takeovers create fear

Everything ultimately revolves around LC.

### 3. Every Decision Matters
Every turn should ask meaningful questions:
- Should I buy an asset?
- Should I borrow?
- Should I invest?
- Should I auction?
- Should I sell?
- Should I prepare for taxes?
- Should I save cash?
- Should I prepare for a takeover?

**Every decision must have trade-offs.**

### 4. Social Strategy
Ledger is not purely an economic simulator. It is also a **negotiation game**. Players constantly communicate — lending, selling, defending, investing, coordinating. The game encourages interaction.

### 5. Constant Pressure
No player should ever feel completely safe.
- Poor players fear taxes
- Middle players fear stronger corporations
- Rich players fear becoming everyone's target

The game should constantly create tension.

### 6. Multiple Paths to Victory
No player should ever be forced into one strategy. Possible approaches:
- Asset Expansion
- Investment Empire
- Aggressive Acquisitions
- Corporate Diplomacy
- Economic Dominance
- Hostile Takeovers
- Hybrid Strategy

Different games should naturally create different winners.

---

## 3. Player & Match Setup

### Player Count

| Setting | Value |
|---------|-------|
| Minimum | 2 players |
| Recommended | 3–6 players |
| Maximum (V1) | 6 players |
| Ideal experience | 4–6 players |

**Why 6 max?** Ledger is built around negotiations, investments, auctions, hostile takeovers, and player interaction. With 10–12 people every turn becomes too long. 4–6 keeps everyone involved, negotiations manageable, and rounds within the 30–60 minute target.

### Starting State

Every player begins with:
| Resource | Starting Value |
|----------|---------------|
| Ledger Chips (LC) | **20 LC** |
| Assets | None |
| Loans | None |
| Investments | None |
| Legal actions | None |
| Takeover immunity | None |

### Market Starting State

The market begins fully stocked with the following asset supply:

| Asset | Total Supply in Market |
|-------|----------------------|
| Jack | 8 |
| Queen | 6 |
| King | 4 |
| Ace | 2 |

The Bank begins with **unlimited Ledger Chips** digitally.

---

## 4. Core Gameplay Loop

Every game of Ledger follows the same loop. Players continuously cycle through:

**Build → Earn → Invest → Negotiate → Defend → Expand → Eliminate → Win**

The game intentionally changes feeling as it progresses:
- **Early game** is about growth
- **Mid game** is about competition
- **Late game** is about survival

This makes every match feel like it naturally evolves rather than repeating the exact same actions every round.

### Match Flow — The Four Stages

1. **Foundation** — Acquire assets, take loans, generate income, build cash flow. Low conflict.
2. **Expansion** — Corporations become wealthier. Trading increases. Investments appear. Auctions become common.
3. **Corporate Warfare** — Market becomes increasingly player-driven. Negotiations dominate. Takeovers begin.
4. **Endgame** — Only a few corporations remain. Every decision matters.

---

## 5. Turn Structure

Every player's turn follows **exactly this order**.

### Step 1 — Collect Income

- Collect income from **every owned asset**
- Income is **automatic** — no button required
- **Nothing can interrupt income collection**
- Income is received **before** any purchases or actions
- Income comes directly from the Bank, not from other players

### Step 2 — Actions

Player may perform any combination of the following in **any order**:
- Buy market assets
- Buy assets from another player
- Sell assets
- Auction assets
- Borrow from Bank
- Repay loans
- Invest in another player
- Negotiate trades
- Initiate Hostile Takeover (if eligible)

### Step 3 — End Turn

Turn passes to the next player.

**No taxes during individual turns.** Taxes only happen after every player has completed one full round.

---

## 6. Round End & Taxes

After every player has played once:

1. **Everyone simultaneously pays taxes**
2. Tax is calculated from **owned assets only** — not cash, not loans, not investments
3. If a player cannot pay: they enter **Financial Distress**

### Tax Rates (Locked)

| Asset | Tax / Round |
|-------|------------|
| Jack | 5 LC |
| Queen | 10 LC |
| King | 15 LC |
| Ace | 25 LC |

### Why Tax Rates Scale

Taxes are proportional to the asset's power. The Ace costs 100 LC and generates +50 income, so it carries a 25 LC tax burden — the highest. This ensures that owning premium assets is powerful but comes with proportional obligations.

### Financial Distress Recovery

If a player cannot pay taxes, they must immediately attempt recovery. Recovery options (in any order):
- Sell assets (private, auction, or emergency)
- Borrow from Bank (if eligible)
- Receive investments
- Auction assets

If they recover: **continue playing.**
If they cannot: **Bankruptcy** (see [Section 14](#14-bankruptcy--elimination)).

---

## 7. Assets & The Economy

### Asset Table (Locked V1 Numbers)

| Asset | Purchase Price | Income / Round | Tax / Round | Max Per Player |
|-------|---------------|----------------|-------------|----------------|
| Jack | 20 LC | +10 LC | -5 LC | 3 |
| Queen | 40 LC | +20 LC | -10 LC | 2 |
| King | 60 LC | +30 LC | -15 LC | 2 |
| Ace | 100 LC | +50 LC | -25 LC | 1 |

### Net Income Per Asset

| Asset | Gross Income | Tax | Net / Round | Rounds to Recoup Cost |
|-------|-------------|-----|-------------|----------------------|
| Jack | +10 | -5 | +5 | 4 |
| Queen | +20 | -10 | +10 | 4 |
| King | +30 | -15 | +15 | 4 |
| Ace | +50 | -25 | +25 | 4 |

**Design rationale:** Each asset pays itself back in approximately **four profitable rounds** before taxes. This creates meaningful long-term planning without making assets feel weak.

### Why Asset Caps Exist

Without ownership limits, the optimal strategy would always be: "Buy every strongest asset." This removes strategic diversity.

Asset caps ensure:
- Strong assets remain valuable
- Different players build different portfolios
- No single player can monopolize the economy

**Ace cap = 1** is intentional. Owning one Ace means "I'm one of the strongest companies." Owning two would mean "I'm becoming impossible to catch." The cap of 1 keeps Aces feeling **legendary** and forces diversification.

### Buying Assets

- Market assets purchased **instantly**
- Ownership transfers **immediately**
- Income begins **next round** (not delayed)
- Maximum copies per player enforced — cannot exceed cap
- The Bank always has assets available (unlimited supply)

### Market Supply

**Version 1:** Unlimited base supply. The Bank never permanently runs out of standard assets. This ensures the game never stalls.

However, per-player ownership caps and the natural progression to a player-driven economy ensure scarcity still emerges in interesting ways.

---

## 8. Loans

### Loan Terms (Locked)

| Parameter | Value |
|-----------|-------|
| Maximum loan amount | 120 LC |
| Interest rate | 50% |
| Repayment deadline | 3 rounds |
| Active loans at once | 1 (maximum) |

### Borrowing Rules

- Player may borrow **anytime during their turn**
- Cannot borrow if **already in default** on a loan
- Loan amount capped at 120 LC
- Interest is fixed at 50% (borrow 100 → repay 150)
- Repayment deadline is fixed at 3 rounds

### Repayment

**Early repayment:** Allowed. Interest still applies.
**Partial repayment:** Allowed. Remaining balance continues with original terms.

### Loan Default

If repayment deadline expires:
1. Bank **immediately demands payment**
2. Player enters **Financial Distress**
3. Player must attempt recovery (sell, borrow elsewhere, receive investments)
4. Failure to recover = **Bankruptcy**

### Why Loans Exist

Loans solve a major economic problem: players who fall behind early need a way to accelerate growth. Without loans, early mistakes would permanently decide the match. Loans introduce **controlled risk** — borrowing allows rapid expansion but creates future obligations through interest and deadlines.

---

## 9. Investments

### Overview

Any player may invest in another player. Investment terms are **fully negotiated** — nothing is fixed.

### Examples of Investment Terms

- "I'll give you 60 LC, you repay 90 LC in 3 rounds"
- "100 LC, 10% of your future profits for 5 rounds"
- "I'll fund your takeover defense, you owe me one favor"
- Anything both parties agree to

### Rules

| Parameter | Rule |
|-----------|------|
| Multiple investors per player | Allowed, unlimited |
| Investor must be recorded | Yes |
| Receiver recorded | Yes |
| Amount recorded | Yes |
| Repayment amount | Negotiated |
| Repayment deadline | Negotiated |

### Late Repayment

If the receiver fails to repay on time:
- Investor may **immediately file a legal claim**
- If receiver refuses to pay: **Legal action available** (enforced by the game)

### Why Investments Exist

Investments encourage **cooperation inside a competitive game**. Players are no longer forced into simple rivalries. Instead, they can form temporary business relationships — funding a struggling player in exchange for future profit, financing an ally to stop a dominant player, or creating long-term repayment agreements.

These interactions make each match **socially dynamic** rather than mechanically repetitive.

---

## 10. Selling Assets

### Three Ways to Sell

1. **Private Sale** — Any negotiated price. Immediate transfer.
2. **Auction** — See [Section 11](#11-auctions).
3. **Emergency Sale to Bank** — Bank always buys at **50% of purchase price**. Instant payment. No negotiation.

### Emergency Sale Philosophy

The 50% resale value is intentional. If the Bank paid full value, there would be almost no downside to buying and instantly selling assets. The discount forces players to view emergency sales as a **desperate measure** rather than a profitable strategy.

---

## 11. Auctions

### Auction Rules

1. Owner (seller) starts an auction
2. Seller chooses:
   - **Starting bid**
   - **Minimum acceptable bid**
3. Auction becomes visible to **all players**
4. Other players place bids in real-time
5. **Highest confirmed bidder wins**
6. Seller may **cancel auction anytime before final confirmation** (no locked-in sales until confirmed)

### Why Auctions Exist

Auctions ensure valuable assets aren't always sold privately. Instead of one buyer and one seller deciding a price, the **entire table can compete**. This increases interaction and creates dramatic moments where players must decide how much an asset is truly worth.

---

## 12. Negotiations

### What Can Be Negotiated

Players may negotiate freely for:
- Asset sales
- Investments
- Loans (private, between players)
- Emergency funding
- Takeover defense (before countdown begins)
- Joint legal cases
- Future repayment
- Asset swaps
- Temporary alliances
- Anything except taxes

### When Negotiations Can Happen

- **Anytime during turns** — voice chat, text chat, trade window
- **Never during another player's Hostile Takeover countdown** — negotiation freeze during active takeover defense

### Privacy

Only participating players can see the negotiation. Others cannot. This enables:
- Alliances
- Politics
- Bluffs
- Secret funding
- Emergency rescues
- Backroom deals

### Enforcement

The game itself **enforces the contract** automatically. Nobody can scam someone after accepting a deal in the system.

### Why Negotiation Matters

Ledger is as much a **social strategy game** as it is an economic one. Negotiation creates stories that cannot be scripted — bluffing, forming alliances, breaking alliances, emergency funding, last-second deals, coordinated defenses. No two matches play the same, even when the rules remain constant.

---

## 13. Hostile Takeovers

Hostile Takeovers are **the biggest event in Ledger**. They are not random — they are earned.

### Eligibility Requirements

| Requirement | Value |
|-------------|-------|
| Minimum wealth | 120 LC |
| Filing fee | 40 LC (permanent, nonrefundable) |
| Attacker cooldown | 3 rounds between your takeovers |
| Target immunity | 4 rounds after surviving a takeover |
| Repeated targeting | Prohibited — cannot chain-attack same player |

### Takeover Process

**Step 1 — Declare Takeover**
Player pays the 40 LC filing fee and chooses a target.

**Step 2 — Court Announcement**
Everyone sees: *"Hostile Takeover Initiated"*

**Step 3 — Defense Phase**
The target receives **ONE FULL ROUND** to defend.

**Step 4 — Resolution**
Target's turn arrives → defender's fate is determined.

### Defense Options

During the defense round, the defending player may:
- Borrow
- Sell assets
- Auction assets
- Receive investments
- Negotiate
- Sell to Bank
- Repay debt
- Anything legal

**Every other player now decides:** Help them? Or let them die?

### Win Condition for Defender

The defender must reach a **required LC reserve** (dynamically calculated by the game) before their next turn.

Players only see:
- **Target Required** — the amount needed
- **Current Progress** — what they have so far

The calculation is invisible — players don't manually calculate percentages.

### If Defender Survives
- Takeover **fails**
- Attacker **permanently loses** the 40 LC filing fee
- Target becomes **immune for 4 rounds**
- Everyone celebrates. The table changes.

### If Defender Loses
- Player is **eliminated**
- Their remaining liquid assets are liquidated
- Attacker receives:
  - **One selected asset** of their choice
  - **Small LC liquidation reward**
- **Not an entire empire transfer** — rewards are deliberately moderate

### Why Filing Fees Exist

Filing fees ensure hostile takeovers are **strategic decisions** rather than spam actions. Every attempt carries real financial risk. Even failed takeovers have meaningful consequences.

### Why Limited Rewards Exist

If attackers received everything owned by the defeated player, the winner would often become unstoppable. Rewards are deliberately moderate — winning a takeover should feel significant without ending the competitive balance of the match.

### Why Takeover Immunity Exists

Without immunity, a player who barely survives one takeover could immediately face another. This would feel unfair and remove any sense of recovery. Temporary immunity gives successful defenders time to rebuild, creating more dramatic comebacks.

### Why Repeated Targeting Protection Exists

Prevents bullying. Encourages strategic target selection. The game won't let you chain-attack the same player.

### Key Restriction

**Negotiations freeze during another player's Hostile Takeover countdown.** When someone's under threat, the table can't interfere externally — only the defender and their allies (who already have deals in place) can act. This focuses the drama entirely on that one moment.

---

## 14. Bankruptcy & Elimination

### When Bankruptcy Occurs

A player is bankrupt if they **cannot meet a mandatory payment** after exhausting all recovery options.

Mandatory payments include:
- Taxes
- Loan repayment
- Court obligation
- Takeover defense requirement

### Recovery Options (Before Elimination)

A player in Financial Distress may attempt:
- Sell assets (private, auction, or emergency)
- Borrow from Bank (if eligible)
- Accept investments
- Auction assets
- Negotiate with other players

If after all options: **LC < required payment** → **Player eliminated.**

### What Happens on Elimination

- Player eliminated
- Assets liquidated
- Contracts closed
- Investments settled where possible
- No rewards granted to opponents except normal economy adjustments (unless elimination was via Hostile Takeover — see [Section 13](#13-hostile-takeovers))

### Why Elimination Exists

Ledger intentionally allows elimination because:
- Elimination creates **pressure**
- Pressure creates **excitement**
- Excitement creates **memorable stories**

Nobody wants to become the next company to collapse.

---

## 15. Corporate Expansion

Corporate Expansion is Ledger's **signature mechanic** — the late-game system that transitions the economy into its second phase.

### Trigger Conditions

Corporate Expansion becomes available when:
- **Every standard asset has been purchased at least once**
- **OR** the majority of assets are already owned by players

This naturally pushes the game into its second phase.

### How It Works

1. **Any player** may request Corporate Expansion
2. **Once per game** — during their turn
3. **Vote** — every player votes YES or NO
4. **Simple majority** wins (e.g., 4 Yes, 2 No → passes)
5. **Only YES voters pay** the Expansion Contribution

### Expansion Contribution

Each YES voter pays exactly **10 LC**.

Players who vote NO pay nothing. The players asking for market growth are the ones funding it.

### What Gets Added

Corporate Expansion adds a new **"Corporate Set"** of existing asset classes with similar proportions.

For example, if the market originally contained:
- 8 Jacks
- 6 Queens
- 4 Kings
- 2 Aces

An expansion adds another **limited batch** of those same assets in similar proportions.

### Important Constraints

- **Per-player ownership caps remain unchanged** — no one can suddenly own two Aces
- **No new asset tier** — nothing above Ace is introduced in V1
- **Maximum 1 expansion per game** in V1

### Why No New Asset Tier?

Introducing something above an Ace (e.g., "Chairman" or "Crown") would require rebalancing the entire economy. It also creates a situation where everyone votes NO because the strongest player is likely to buy it first. Keeping the same asset hierarchy makes expansions beneficial to the whole table rather than just the richest player.

### Why Only One Expansion?

One expansion keeps games predictable and helps maintain the target match length of 30–60 minutes. If future playtesting shows longer games remain engaging, multiple expansions can be considered later.

---

## 16. Financial Health

Every player always has a **visible financial status** determined automatically.

### Health Tiers

| Status | Meaning |
|--------|---------|
| **Healthy** | Strong financial position, low debt, positive cash flow |
| **Stable** | Good position, manageable obligations |
| **Stressed** | Notable debt, cash concerns, approaching danger |
| **Critical** | High risk of bankruptcy, may not survive next obligation |

### Factors Considered

- Debt level
- Cash on hand
- Income
- Missed payments
- Default history

### Purpose

Financial Health gives every player an **immediate, intuitive understanding** of their situation without needing to do math. It creates urgency and awareness naturally.

---

## 17. Tie Situations

If the final two players **simultaneously bankrupt** (extremely rare edge case):

**Winner determined by:** Highest **Net Worth**

**Net Worth = LC + Asset Value** (asset value calculated at purchase price, not current market value).

---

## 18. Disconnect & AFK & Surrender

### Player Disconnect (Online)

1. **Short grace timer** starts — player can reconnect
2. If timer expires: **AI temporarily controls simple actions** (auto-collect income, take no strategic actions)
3. If absence too long: **Player forfeits**

### AFK Detection

Repeated inactivity:
1. **Warning**
2. Then **automatic surrender**

### Surrender

- Player may **surrender anytime** during their turn
- Assets are **liquidated**
- Player is **eliminated**
- **No rewards granted** to opponents except normal economy adjustments (no takeover rewards for a surrender)

---

## 19. The Five Game Eras

Ledger naturally evolves through five distinct eras within a single match.

### Era One — Foundation
Everyone grows. Everyone buys assets. Economy expands. Little conflict.

### Era Two — Expansion
Negotiation increases. Investments appear. Loans become common. Income rises.

### Era Three — Competition
Market mostly owned. Private trading dominates. Political alliances begin. Players prepare defenses.

### Era Four — Corporate War
Hostile takeovers. Emergency investments. Legal pressure. Bankruptcies. Massive negotiations. Everything becomes tense.

### Era Five — Endgame
Only the strongest businesses remain. Every decision matters. Every takeover matters. Every negotiation matters. One mistake ends your company.

---

## 20. Balance Philosophy — Why Every System Exists

This is the most important design document in Ledger. It explains **why** every mechanic exists. If future updates are ever made, these principles should almost never change.

### Core Philosophy

Ledger is not a luck game. It is an economy game where every major decision creates opportunity, risk, and interaction. The game rewards **planning, negotiation, timing, and calculated risk** — not random chance. Every system exists because it solves a **specific gameplay problem.**

---

### Why Income Exists

**The problem:** Without recurring income, players would only spend money until everyone became poor.

**The solution:** Assets create a reason to invest rather than simply hoard LC. Income also creates different strategic paths — a player may build a slow, stable economy; another may take loans to grow aggressively; another may invest for long-term profit. This creates variety instead of every match feeling identical.

---

### Why Taxes Exist

**The problem:** Without taxes, the richest player would snowball indefinitely. Players would buy assets and never face meaningful financial decisions.

**The solution:** Taxes force players to think beyond simply acquiring wealth. Owning more assets makes you stronger, but it also increases your obligations. This creates constant tension between **growth and sustainability.** The richest player is powerful, but also carries the greatest financial burden.

---

### Why Loans Exist

**The problem:** Players who fall behind early would rarely recover. Early mistakes would permanently decide the match.

**The solution:** Loans introduce controlled risk. Borrowing allows rapid expansion, but creates future obligations through interest and repayment deadlines. Debt can create opportunity, but poor debt management leads to collapse.

---

### Why Investments Exist

**The problem:** Without investments, players ignore each other. The game becomes multiplayer solitaire.

**The solution:** Investments encourage cooperation inside a competitive game. Players form temporary business relationships — funding struggling players, financing allies, creating long-term agreements. These interactions make each match socially dynamic.

---

### Why Asset Caps Exist

**The problem:** Without ownership limits, the optimal strategy is always "buy every strongest asset." This removes strategic diversity.

**The solution:** Caps ensure strong assets remain valuable, different players specialize in different portfolios, and no single player can monopolize the economy.

---

### Why Emergency Bank Sales Exist (50%)

**The problem:** Without an emergency option, players facing bankruptcy have no last-resort recovery path.

**The solution:** The 50% discount forces players to view emergency sales as a desperate measure rather than a profitable strategy. If the Bank paid full value, there would be no downside to buy-and-sell churn.

---

### Why Private Trading Exists

**The problem:** Fixed prices remove player agency from the economy.

**The solution:** Private trading creates a true player-driven economy where value is determined through negotiation. This allows discounts, premium sales, alliances, and strategic bargaining. Every match develops its own market conditions.

---

### Why Auctions Exist

**The problem:** Valuable assets always sold privately means the entire table can't compete.

**The solution:** Auctions let the entire table compete, increasing interaction and creating dramatic moments where players decide an asset's true worth.

---

### Why Hostile Takeovers Exist

**The problem:** Without elimination pressure, weaker players survive indefinitely by maintaining minimal cash flow.

**The solution:** Takeovers introduce meaningful pressure. Players must not only build wealth but also defend it. However, takeovers are intentionally expensive and risky — elimination is never trivial or easily repeatable.

---

### Why Takeover Immunity & Anti-Bullying Rules Exist

**The problem:** Without immunity, a player who barely survives one takeover could immediately face another. Without anti-bullying rules, players can be repeatedly targeted.

**The solution:** Temporary immunity (4 rounds) gives defenders time to rebuild, creating more dramatic comebacks. Anti-bullying rules prevent chain-attacks and encourage strategic target selection.

---

### Why Filing Fees Exist

**The problem:** Without cost, takeovers become spam actions that waste everyone's time.

**The solution:** Filing fees ensure takeovers are strategic decisions. Every attempt carries real financial risk, forcing players to choose timing carefully.

---

### Why Limited Takeover Rewards Exist

**The problem:** Full asset transfer creates unstoppable winners.

**The solution:** One chosen asset + small liquidation reward. Winning a takeover feels significant without ending the match's competitive balance. Other players can still fight back.

---

### Why Corporate Expansion Exists

**The problem:** Without a second phase, late-game can stall as the market dries up and trading stagnates.

**The solution:** Corporate Expansion allows players to collectively introduce new investment opportunities when the economy is ready, creating a natural transition into the late game without forced scarcity.

---

### Why Unlimited Market Supply Exists

**The problem:** If the market can empty completely, players spend turns waiting with nothing meaningful to do.

**The solution:** An always-available market keeps the game moving while scarcity emerges naturally through ownership limits and player-controlled trading.

---

### Why Voice & Negotiation Matter

**The problem:** Pure economic mechanics feel mechanical and forgettable.

**The solution:** Negotiation creates stories that cannot be scripted — bluffing, alliances, betrayals, last-second deals, coordinated defenses. No two matches play the same, even when the rules are constant.

---

**Together, these systems create a game where every mechanic has a clear purpose. No rule exists simply to add complexity; each one is designed to solve a balance problem, encourage player interaction, or create meaningful strategic decisions.**

---

## 21. Player Psychology & Emotional Arc

This section defines how Ledger should **make players feel** throughout a match.

### Opening — Curiosity

Players are learning. Nobody knows who will win. Everyone has equal opportunity. The atmosphere should feel **optimistic** — every corporation has potential.

### Early Growth — Ambition

Players begin seeing possibilities. Someone buys their first Queen. Someone takes their first loan. Someone starts building income. The feeling becomes: *"I'm building something."*

### Mid Game — Competition

Players begin comparing. Who has the biggest income? Who has the strongest assets? Who owes money? Who is dangerous? The table shifts from peaceful growth into competition.

### Market Control — Pressure

Players now realize mistakes matter. Taxes hurt. Loans become serious. Investments become valuable. Nobody is thinking only about themselves anymore — they're watching everyone.

### First Hostile Takeover — Fear

The entire game changes. Nobody is safe anymore. Every player begins preparing for survival. Money is no longer just for expansion — money becomes **security.**

### Late Game — Paranoia

Players watch everyone. Every negotiation, investment, and purchase matters. Players begin asking: *"If I do this… what will everyone else do?"* This is the emotional peak of Ledger.

### Final Two Players — Respect

Both players have earned their place. The game becomes a battle of timing. The winner shouldn't feel lucky — they should feel **smarter.**

### What Winning Should Feel Like

**Earned.** Not lucky. Not random. Not accidental. The winner should think: *"I outplayed everyone."*

### What Losing Should Feel Like

Players should never lose and think *"the game cheated me."* Instead: *"I know exactly where I messed up."* Maybe they borrowed too much. Maybe they trusted the wrong person. Maybe they expanded too quickly. Maybe they were too passive.

**Every loss should teach.** That's how players improve.

### The Richest Player Should Never Feel Safe

Most economy games fail because once someone becomes rich, the game is over. Ledger rejects this. Being rich gives power, but it also paints a target on your back. Everyone watches the leader. Everyone negotiates against them. Being rich should feel **rewarding… and dangerous.**

### The Poorest Player Should Never Feel Hopeless

A poor player always has options. They may not have money, but they can still: negotiate, borrow, receive investments, sell assets, form alliances, survive. A player should never feel *"I'm mathematically out"* until they actually lose.

### The Game Should Reward Courage

Ledger rewards calculated risk. Players willing to borrow, invest, negotiate, expand, and attack should generally outperform players who simply hoard money forever. **Passive play is safe. Active play is rewarding.**

---

## 22. The Eight Design Commandments

These are **non-negotiable.** Every future mechanic must obey them.

### 1. Skill Beats Luck
Randomness may add variety. It must never decide the winner.

### 2. Money Must Always Move
A stagnant economy is a dead economy. Money should constantly circulate between players, Bank, taxes, loans, investments, trades, auctions, and takeovers.

### 3. Every Reward Needs a Cost
No free advantages. Every gain should involve risk, opportunity cost, or responsibility.

### 4. Every Player Must Matter
No player should become irrelevant while still alive. Even the weakest corporation should influence the table.

### 5. Rich Players Create Pressure. Poor Players Create Opportunity.
This balance keeps matches interesting.

### 6. Negotiation is Gameplay
Talking is not outside the game. Talking is **the game.** A great negotiator should have a genuine competitive advantage.

### 7. Every Match Tells a Different Story
If every game ends the same way, Ledger has failed. Players should develop different reputations: The Investor, The Shark, The Negotiator, The Opportunist, The Empire Builder, The Survivor.

### 8. Simplicity Over Complexity
Ledger should never become complicated just to appear intelligent. If two mechanics achieve the same goal, choose the simpler one. Players should spend their mental energy **making decisions** — not remembering rules.

---

## 23. Target Audience & Platform

### Target Audience

| Attribute | Value |
|-----------|-------|
| Minimum age | 13+ |
| Core audience | Strategy gamers, Chess players, Monopoly fans, Poker players, Finance enthusiasts, Entrepreneurs, Competitive friend groups, Content creators |

### Platform Strategy

| Phase | Platform |
|-------|----------|
| **Version 1** | Web (desktop-first, mobile responsive) |
| **Future** | iOS, Android, Steam |

### Player Count Summary

| Setting | Locked Value |
|---------|-------------|
| Minimum | 2 |
| Maximum (V1) | 6 |
| Recommended | 4–6 |

---

## 24. The Five Final Questions

Every feature added to Ledger should answer **yes** to all five:

1. **Does it create more meaningful decisions?**
2. **Does it create memorable stories?**
3. **Does it increase strategic depth without unnecessary complexity?**
4. **Does it preserve fairness while rewarding skill?**
5. **Does it still feel like Ledger?**

If the answer to any of these is **no**, the feature should be redesigned or removed.

### The Golden Rule

If a mechanic **removes** meaningful decisions → **remove it.**
If a mechanic **creates** meaningful decisions → **keep it.**

This single rule should guide every future update.

---

## 25. Future Ideas (Not V1)

These ideas are intentionally **parked** for after the core game is complete and proven. The rule is simple: **if it doesn't directly improve the core gameplay loop, it does not go into Version 1.**

### Parked Ideas

- Seasons / Ranked mode
- Cosmetics / Customization
- Spectator mode
- Tournament mode
- Daily challenges
- Replay viewer
- Statistics & analytics
- AI opponents (for single-player / practice)
- Different maps / themes
- Special event modes
- Larger lobbies (above 6 players)
- Multiple Corporate Expansions per match

---

*This concludes the LEDGER Game Design Document V1. Every system, rule, number, and philosophy documented here is locked for V1 development. Any changes should be tested against the Eight Commandments and the Five Final Questions before being adopted.*
