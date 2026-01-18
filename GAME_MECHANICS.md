# DadDeck™ Game Mechanics Guide

**Version:** 2.0 - Rated R Edition
**Last Updated:** January 17, 2026

---

## 🎯 Core Philosophy

DadDeck™ is a trading card game satirizing suburban American dad culture. The mechanics reflect this theme:

- **Stats represent dad capabilities** (Grill Skill, Nap Power, etc.)
- **Combat is dad-on-dad warfare** (thermostat battles, grill-offs, passive-aggressive warfare)
- **Synergies represent suburban alliances** (BBQ Dads unite, Lawn Car Cabals, etc.)
- **Rarity reflects dad hierarchy** (Common dads → Mythic Dad Supreme)

---

## 📊 The Stat System

Each card has 8 stats (0-100):

| Stat | What It Represents | In Combat |
|------|-------------------|-----------|
| **Dad Joke** | Pun quality, awkwardness | Psychic damage, status infliction |
| **Grill Skill** | BBQ mastery, flame control | Burn damage, over time effects |
| **Fix-It** | Repair ability, YouTube expertise | Physical damage, equipment bonus |
| **Nap Power** | Sleeping anywhere, horizontal mastery | Self-heal, evasion |
| **Remote Control** | Channel surfing, button knowledge | Control effects, ability manipulation |
| **Thermostat** | Temperature obsession, energy frugality | Defensive buffs, rage mechanics |
| **Sock & Sandal** | Fashion confidence, shame immunity | Status resistance, social armor |
| **Beer Snob** | Craft beer knowledge, hop detection | Alcohol effects, party buffs |

### Stat Interactions

**Rock-Paper-Scissors Mechanics:**
- **Dad Joke** beats **Sock & Sandal** (awkwardness overcomes shame)
- **Grill Skill** beats **Fix-It** (fire melts duct tape)
- **Nap Power** beats **Remote Control** (sleeping through TV)
- **Thermostat** beats **Dad Joke** (dad doesn't joke when angry at bill)
- **Sock & Sandal** beats **Thermostat** (fashion transcends temperature)

---

## ⚔️ Combat System

### Basic Damage Calculation

```
Base Damage = Attacker Stat - (Defender Stat × 0.5)
Final Damage = Base Damage × RNG (±20%) × Type Advantage × Critical Multiplier
```

**Critical Hits:**
- Base chance: 10%
- Bonus: +1% per 10 stat points
- Effect: 2× damage

**RNG Factor:**
- Random multiplier between 0.8x and 1.2x
- Prevents identical battles
- Rewards consistency over time

### Type Advantages

Certain dad types have advantages over others:

| Attacker Type | Bonus Against | Damage Multiplier |
|--------------|---------------|-------------------|
| **BBQ_DAD** | COUCH_DAD, CHEF_DAD | +50% |
| **FIX_IT_DAD** | CAR_DAD, WAREHOUSE_DAD | +50% |
| **GOLF_DAD** | COOL_DAD, COACH_DAD | +50% |
| **COUCH_DAD** | OFFICE_DAD, COACH_DAD | +50% |
| **LAWN_DAD** | FASHION_DAD, COUCH_DAD | +50% |
| **CAR_DAD** | FIX_IT_DAD, VINTAGE_DAD | +50% |
| **OFFICE_DAD** | COUCH_DAD, TECH_DAD | +50% |
| **COOL_DAD** | GOLF_DAD, VINTAGE_DAD | +50% |
| **COACH_DAD** | COUCH_DAD, LAWN_DAD | +50% |
| **CHEF_DAD** | BBQ_DAD, COUCH_DAD | +50% |
| **HOLIDAY_DAD** | LAWN_DAD, FASHION_DAD | +50% |
| **WAREHOUSE_DAD** | CAR_DAD, FIX_IT_DAD | +50% |
| **VINTAGE_DAD** | TECH_DAD, COOL_DAD | +50% |
| **FASHION_DAD** | COOL_DAD, OFFICE_DAD | +50% |
| **TECH_DAD** | OFFICE_DAD, VINTAGE_DAD | +50% |
| **ITEM** | None | Neutral |

*Disadvantaged matchups deal 25% less damage.*

### Status Effects

| Effect | Duration | Effect |
|--------|----------|--------|
| **Grilled** | 2 turns | -10% Grill Skill, -5% Fix-It |
| **Lectured** | 2 turns | -15% Dad Joke, +10% Thermostat (rage) |
| **Awkward** | 2 turns | -20% Dad Joke, +10% Sock & Sandal (shame spiral) |
| **Drunk** | 3 turns | +30% Beer Snob, -40% Fix-It, -20% Grill Skill |
| **Bored** | 2 turns | +20% Nap Power, +15% Remote Control (zone out) |
| **Inspired** | 3 turns | +15% Dad Joke, +10% Grill Skill (motivated) |

---

## 🔗 Synergy System

### Card Synergies

When certain cards work together, they gain bonuses:

#### **BBQ Alliance**
- **Cards Required:** Any BBQ_DAD + CHEF_DAD
- **Synergy Name:** Ultimate Cookout
- **Bonus:** +30% Grill Skill for both cards
- **Flavor:** "The backyard becomes sacred ground. Neighbors can smell the dominance."

#### **Suburban Dream Team**
- **Cards Required:** LAWN_DAD + CAR_DAD + WAREHOUSE_DAD
- **Synergy Name:** HOA Nightmares
- **Bonus:** +20% all stats for all lawn/car/warehouse dads
- **Flavor:** "The homeowners association weeps. They can't stop you."

#### **Couch Potato Crew**
- **Cards Required:** COUCH_DAD + Remote Control item
- **Synergy Name:** Infinite Nap
- **Bonus:** Target cannot be awakened. Effectively stunned.
- **Flavor:** "This is not sleep. This is strategic consciousness pause."

#### **Mythic Alliance**
- **Cards Required:** 2× Mythic rarity cards
- **Synergy Name:** Dad Council
- **Bonus:** 2× damage from both mythic cards
- **Flavor:** "When titans clash, the neighborhood trembles."

---

## 🎴 Card Power Calculation

Each card has a hidden **Power Rating** used for quick comparisons:

```
Power = Average Stats × Rarity Multiplier

Rarity Multipliers:
- Common:     1.0×
- Uncommon:   1.2×
- Rare:       1.5×
- Epic:       1.8×
- Legendary:  2.2×
- Mythic:     3.0×
```

**Example:**
- Grill Master Gary (Rare): 78 avg × 1.5 = **117 Power**
- The Ultimate Dad (Mythic): 97 avg × 3.0 = **291 Power**

---

## ⚡ Ability Execution

### How Abilities Work

1. **Stat Matching:** Ability names hint at which stat they use
   - "Flame On" → Grill Skill
   - "Power Nap" → Nap Power
   - "Temperature Lock" → Thermostat

2. **Damage Calculation:** Uses matched attacker stat vs. defender stat

3. **Status Effects:** 30% chance to inflict matching status effect
   - BBQ_DAD → Grilled
   - COACH_DAD → Inspired
   - COUCH_DAD → Bored

4. **Flavor Text:** Generated dynamically based on card names

### Ability Execution Result

```typescript
{
  success: boolean,      // Did ability work?
  damage: number,        // How much damage dealt
  statusEffects: [],     // Any status effects applied
  flavorText: string,    // Battle log text
  criticalHit: boolean   // Was this a crit?
}
```

---

## 🏆 Battle Simulation

### Turn Structure

1. **Initialization**
   - Calculate starting HP (Power × 10)
   - Check type advantages
   - Check for synergies

2. **Combat Loop** (max 10 turns)
   - Attacker uses ability → Deals damage
   - Defender counterattacks → Deals damage
   - Status effects applied/processed
   - HP check → If ≤0, battle ends

3. **Victory Conditions**
   - Reduce opponent HP to 0
   - Have higher HP after 10 turns (timeout)

### Battle Log Example

```
⚔️ BATTLE: Grill Master Gary vs Thermostat Tyrant!
Grill Master Gary power: 1170
Thermostat Tyrant power: 2340

Turn 1: Grill Master Gary uses Flame On!
  → 85 damage! BBQ_DAD has advantage over COUCH_DAD! (+50% damage)
  Counter: Thermostat Tyrant hits back for 65 damage!
  HP: 1105 vs 2275

Turn 2: Grill Master Gary uses Flame On!
  → 78 damage!
  Counter: Thermostat Tyrant hits back for 62 damage!
  HP: 1027 vs 2197

...

Turn 8: Grill Master Gary uses Flame On!
  → 92 damage!
  Counter: Thermostat Tyrant hits back for 58 damage!
  HP: 234 vs 1856

🏆 Thermostat Tyrant WINS in 8 turns!
```

---

## 🎮 Advanced Mechanics

### Combo System

**Chain Combos:** Use abilities in specific order for bonus damage
- Example: **Fix-It** → **Grill Skill** → **Dad Joke**
- Bonus: +25% final damage if all three land

**Stat Stacking:** Multiple buffs to same stat
- Diminishing returns after 150% (soft cap)
- Hard cap at 200% of original stat

### Equipment Synergy

ITEM cards can be equipped to DAD cards:
- **Weber Genesis Grill** + Any BBQ_DAD = +50% Grill Skill
- **La-Z-Boy Throne** + Any COUCH_DAD = +30% Nap Power
- **The Thermostat** + Any DAD = +20% Thermostat (but -10% all social stats due to rage)

### Weather/Environment Effects

Planned future expansion:
- **Summer Heatwave:** +20% Grill Skill, -10% Nap Power
- **Winter Storm:** +30% Thermostat, -20% all outdoor stats
- **HOA Inspection:** All LAWN_DAD cards gain +50% power
- **Costco Run:** All WAREHOUSE_DAD cards gain free sample buff (+10% all stats for 3 turns)

---

## 🔮 Prediction System

### Win Probability

```
Confidence Levels:
- 85%+: Dominant advantage (synergy or huge stat difference)
- 75-84%: Significant advantage
- 55-74%: Slight edge
- 45-54%: Even match (could go either way)
- <45%: Disadvantaged
```

**Prediction Factors:**
1. Card power difference (40% weight)
2. Type advantage (30% weight)
3. Synergy presence (20% weight)
4. Random factor (10% weight - keeps it spicy)

---

## 🎲 RNG Philosophy

### Why RNG Exists

1. **Prevents Solving:** Without randomness, the game would be solved mathematically
2. **Reflects Life:** Dads don't always perform perfectly (back spasms, grill flare-ups, etc.)
3. **Creates Stories:** "Remember when Grill Master Gary crit for 250 damage?"
4. **Keeps It Fair:** Lower rarity cards can sometimes beat higher ones

### Mitigating RNG

- **Consistent Stats:** High stats reduce RNG impact
- **Synergies:** Guaranteed bonuses that ignore RNG
- **Type Advantage:** Consistent 50% bonus
- **Best of 3:** Tournament format reduces luck factor

---

## 📊 Balance Philosophy

### Design Principles

1. **Every Card Has a Purpose**
   - Common cards: Synergy pieces, early game
   - Uncommon: Role-players, tech cards
   - Rare: Core of most decks
   - Epic: Powerhouses, build-arounds
   - Legendary: Format-defining cards
   - Mythic: Game-enders, rare pulls

2. **Rock-Paper-Scissors Everywhere**
   - No unbeatable strategy
   - Every deck has a weakness
   - Skill comes from building balanced decks

3. **Fun Over Fair**
   - Some cards intentionally OP (mythic tier)
   - Combo pieces exist for deck building
   - Wacky interactions encouraged

---

## 🚀 Completed & Future Expansions

### Completed Features ✅

- **Deck Building:** 30-card decks with synergy focus
- **Card Upgrades:** Stat-based progression system
- **Trading System:** Player-to-player card exchange
- **Achievements:** Milestone tracking and rewards
- **Crafting:** Material-based card creation

### Planned Mechanics 🚧

- **Tournament Mode:** Best of 3, sideboarding
- **Co-Op Mode:** 2v2 dad battles
- **Campaign Mode:** Fight through the suburbs, defeat the HOA
- **Custom Cards:** User-generated dad cards
- **Season 2 Dads:** 30+ new cards (Influencer Dad, Crypto Dad, etc.)

---

## 💡 Pro Tips

### For New Players

1. **Start with BBQ_DAD** - Simple, powerful, good stats
2. **Don't sleep on Common cards** - New Balance Nathan is a beast
3. **Synergies win games** - Type advantage matters more than raw stats
4. **The Thermostat is OP** - If you pull it, build around it

### For Advanced Players

1. **Tech against popular types** - Pack COOL_DAD counters if everyone plays GOLF_DAD
2. **Status effect decks** - Drunk/Inspired/Grilled stack is devastating
3. **Rarity doesn't mean everything** - Well-played Common beats bad Legendary
4. **Watch the battle log** - Learn which abilities trigger when

---

## 🎯 Summary

DadDeck™ mechanics are designed to:

✅ **Feel like suburban dad warfare** (thermostat battles, grill-offs)
✅ **Be easy to learn, hard to master** (simple stats, deep synergies)
✅ **Generate memorable moments** (crits, combo chains, underdog wins)
✅ **Reward smart deck building** (synergies, type advantages, tech choices)
✅ **Keep games exciting** (RNG ensures no two battles are identical)

**Most Importantly:** It's a satire. The fun comes from the absurdity of dad stereotypes battling for suburban dominance.

---

*Built with love, irony, and too much time thinking about dad culture.*
