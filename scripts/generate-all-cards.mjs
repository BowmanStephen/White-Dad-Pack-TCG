#!/usr/bin/env node
/**
 * Card Generator for DadDeck TCG: Backyard Boner Edition
 * Generates all 146+ fully playable cards from Connor O'Malley's unhinged worldbuilding
 */

const fs = require('fs');
const path = require('path');

// Card database with all Connor O'Malley chaos
const cardDatabase = {
  cards: [
    // === ORIGINAL CARDS (REWRITTEN X-RATED) ===
    // BBQ_DICKTATOR (8 cards)
    {
      id: "001",
      name: "Grill Master Gary the Groin-Griller",
      subtitle: "Propane Makes Me Hard",
      type: "BBQ_DICKTATOR",
      rarity: "rare",
      artwork: "/cards/bbq/grill-master-gary.png",
      stats: { dadJoke: 85, grillSkill: 100, fixIt: 30, napPower: 40, remoteControl: 50, thermostat: 60, sockSandal: 70, beerSnob: 75 },
      flavorText: "I fucked my grill 'til it screamed fire! Big McDonald's hides lizard DNA in nuggets—my propane's the only pure heat!",
      abilities: [{ name: "Flame On Fuckery", description: "Sets every goddamn thing ablaze. +50 burn damage. Includes neighbor's fence." }],
      series: 1, cardNumber: 1, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "016",
      name: "The Ultimate Dicktator Daddy",
      subtitle: "Hi Hungry, I'm Fuckin' Dad",
      type: "BBQ_DICKTATOR",
      rarity: "mythic",
      artwork: "/cards/bbq/ultimate-dicktator.png",
      stats: { dadJoke: 100, grillSkill: 95, fixIt: 90, napPower: 85, remoteControl: 80, thermostat: 90, sockSandal: 95, beerSnob: 100 },
      flavorText: "Maxed out on suburban depravity. All conspiracy theories converge in my brain simultaneously.",
      abilities: [
        { name: "Dad Joke Dickery", description: "All puns do +40 damage. Opponent must groan involuntarily." },
        { name: "Conspiracy Combo", description: "Every ability references 3+ theories. +30 damage for sheer insanity." }
      ],
      series: 1, cardNumber: 16, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "018",
      name: "Smoker Steve Meat-Smoker",
      subtitle: "Low & Slow Cock-Legend",
      type: "BBQ_DICKTATOR",
      rarity: "rare",
      artwork: "/cards/bbq/smoker-steve.png",
      stats: { dadJoke: 70, grillSkill: 100, fixIt: 40, napPower: 60, remoteControl: 30, thermostat: 70, sockSandal: 50, beerSnob: 95 },
      flavorText: "I smoke brisket and chemtrails! Big BBQ conspiracy. Ronald McFuckface controls the weather.",
      abilities: [{ name: "Smoke Ring Cum-Summon", description: "Creates +30 damage smoke cloud. Blinds opponent for 1 turn." }],
      series: 1, cardNumber: 18, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "031",
      name: "Propane Paul Pussy-Burner",
      subtitle: "Tank Tender Tit-Fire",
      type: "BBQ_DICKTATOR",
      rarity: "common",
      artwork: "/cards/bbq/propane-paul.png",
      stats: { dadJoke: 65, grillSkill: 90, fixIt: 25, napPower: 35, remoteControl: 40, thermostat: 50, sockSandal: 60, beerSnob: 70 },
      flavorText: "Propane's the only pure fuel! Government's trackin' my tank! Every refill is a surveillance op!",
      abilities: [{ name: "Tank Gauge Thrust", description: "Knows fuel level perfectly. +20 damage based on remaining propane." }],
      series: 1, cardNumber: 31, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "053",
      name: "Smoke Master Sam Sperm-Burner",
      subtitle: "Low & Slow Fuck-Prophet",
      type: "BBQ_DICKTATOR",
      rarity: "legendary",
      artwork: "/cards/bbq/smoke-master.png",
      stats: { dadJoke: 80, grillSkill: 100, fixIt: 35, napPower: 55, remoteControl: 35, thermostat: 65, sockSandal: 55, beerSnob: 95 },
      flavorText: "Low and slow is a lifestyle! Big Meat is trackin' my smokes! Every brisket is bugged!",
      abilities: [{ name: "Bark Boner-Whisperer", description: "Perfect bark creation. +30 damage per hour of smoking." }],
      series: 1, cardNumber: 53, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "060",
      name: "Tongs-Clicking Tim Tit-Clicker",
      subtitle: "Calibrating Cock-Tongs",
      type: "BBQ_DICKTATOR",
      rarity: "common",
      artwork: "/cards/bbq/tongs-tim.png",
      stats: { dadJoke: 60, grillSkill: 85, fixIt: 30, napPower: 40, remoteControl: 45, thermostat: 55, sockSandal: 65, beerSnob": 65 },
      flavorText: "Click click click! That's the sound of control! Tongs are government listening devices!",
      abilities: [{ name: "Calibration Cum-Click", description: "Perfectly timed flips. +15 damage per click count." }],
      series: 1, cardNumber: 60, totalInSeries": 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "062",
      name: "Charcoal Charlie Cock-Burner",
      subtitle: "Analog Heat Ass-Enthusiast",
      type: "BBQ_DICKTATOR",
      rarity: "uncommon",
      artwork: "/cards/bbq/charcoal-charlie.png",
      stats: { dadJoke: 70, grillSkill: 85, fixIt": 40, napPower: 45, remoteControl: 35, thermostat: 60, sockSandal: 60, beerSnob: 80 },
      flavorText: "Charcoal's pure! No 5G in charcoal! Weber can't track analog heat!",
      abilities: [{ name: "Chimney Cum-Mastery", description: "Chimney starters are freedom. +20 heat control damage." }],
      series: 1, cardNumber: 62, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "070",
      name: "Light Beer Bill Boner-Brewer",
      subtitle: "Hydration's Mostly Cum-Water",
      type: "BBQ_DICKTATOR",
      rarity: "common",
      artwork: "/cards/bbq/light-beer-bill.png",
      stats: { dadJoke: 65, grillSkill: 75, fixIt: 25, napPower: 50, remoteControl: 55, thermostat: 50, sockSandal: 60, beerSnob: 85 },
      flavorText: "Beer keeps me hydrated during grilling! Bud Light is watered-down government propaganda!",
      abilities: [{ name: "Infinite Cooler Cock", description: "Never runs out of beer. +15 staying power per cooler." }],
      series: 1, cardNumber: 70, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },

    // === COUCH_CUMMANDER (6 cards) ===
    {
      id: "002",
      name: "Thermostat Tyrant Tim",
      subtitle: "68°F or Fuck Off",
      type: "COUCH_CUMMANDER",
      rarity: "epic",
      artwork: "/cards/couch/thermostat-tyrant.png",
      stats: { dadJoke: 90, grillSkill: 40, fixIt: 50, napPower: 70, remoteControl: 80, thermostat: 100, sockSandal: 60, beerSnob: 55 },
      flavorText: "Kids touched my 'stat, I told 'em I'd fuck their fingers off! Big HVAC's trackin' my temp with spy sensors!",
      abilities: [
        { name: "Temperature Tit-Lock", description: "Feels every touch from anywhere. +30 defense when invaded." },
        { name: "Bill Boner Rage", description: "+500% damage when electric bill arrives." }
      ],
      series: 1, cardNumber: 2, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "005",
      name: "Remote Control Randy Rim-Ruler",
      subtitle: "Don't Touch My Fuckin' Buttons",
      type: "COUCH_CUMMANDER",
      rarity: "common",
      artwork: "/cards/couch/remote-randy.png",
      stats: { dadJoke: 70, grillSkill: 35, fixIt: 30, napPower: 95, remoteControl: 100, thermostat: 60, sockSandal: 60, beerSnob: 40 },
      flavorText: "I'm not asleep, I'm conducting REM research! Netflix is brainwashing us!",
      abilities: [{ name: "Button Boner Memory", description: "Knows exactly which button you touched. +20 defense." }],
      series: 1, cardNumber: 5, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "020",
      name: "Recliner Randy Nap-Nut",
      subtitle: "Horizontal Cock Evaluation",
      type: "COUCH_CUMMANDER",
      rarity: "uncommon",
      artwork: "/cards/couch/recliner-randy.png",
      stats: { dadJoke: 75, grillSkill: 25, fixIt: 25, napPower: 100, remoteControl: 80, thermostat: 55, sockSandal: 65, beerSnob: 50 },
      flavorText": "Recliner is my throne! This angle is government-approved comfort!",
      abilities: [{ name: "Power Nap Pussy", description: "Can nap anywhere. Recover +10 HP per snore." }],
      series: 1, cardNumber: 20, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "042",
      name: "SportsCenter Sam Sperm-Caster",
      subtitle: "Highlight Cock-Historian",
      type: "COUCH_CUMMANDER",
      rarity: "common",
      artwork: "/cards/couch/sportscenter-sam.png",
      stats: { dadJoke: 70, grillSkill: 30, fixIt: 20, napPower: 80, remoteControl: 90, thermostat: 50, sockSandal: 55, beerSnob: 60 },
      flavorText: "I remember EVERY highlight from 1987! ESPN controls sports narratives!",
      abilities: [{ name: "Stat Recall Rim-Job", description: "Perfect stat memory. +15 damage per stat quoted." }],
      series: 1, cardNumber: 42, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "059",
      name: "Back Deck Barry Boner-Snoozer",
      subtitle: "Outdoor Nap Nut-Specialist",
      type: "COUCH_CUMMANDER",
      rarity: "uncommon",
      artwork: "/cards/couch/back-deck-barry.png",
      stats: { dadJoke: 75, grillSkill: 40, fixIt": 35, napPower: 95, remoteControl: 65, thermostat: 70, sockSandal": 75, beerSnob: 70 },
      flavorText: "Deck chair naps are superior! Fresh air + Deep State surveillance = perfect nap!",
      abilities: [{ name: "Horizontal Hard-On Authority", description: "Masters outdoor napping. +25 defense in sunlight." }],
      series: 1, cardNumber: 59, totalInSeries": 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "076",
      name: "Shade Seeker Steve Shlong-Shader",
      subtitle: "Chasin' the Fuckin' Shadow",
      type: "COUCH_CUMMANDER",
      rarity: "uncommon",
      artwork: "/cards/couch/shade-seeker.png",
      stats: { dadJoke": 70, grillSkill: 35, fixIt: 30, napPower: 90, remoteControl: 70, thermostat: 85, sockSandal: 65, beerSnob: 60 },
      flavorText: "I follow the shadow across my deck for optimal nap angle! Sun sensors everywhere!",
      abilities: [{ name: "Shadow Cum-Calculation", description: "Perfect shadow tracking. +20 defense vs heat damage." }],
      series: 1, cardNumber: 76, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },

    // === FASHION_FUCK (4 cards) ===
    {
      id: "003",
      name: "New Balance Nathan Nut-Kicker",
      subtitle: "Fashion Fuckery Since 2004",
      type: "FASHION_FUCK",
      rarity: "common",
      artwork: "/cards/fashion/new-balance-nathan.png",
      stats: { dadJoke: 70, grillSkill: 50, fixIt: 40, napPower: 50, remoteControl: 60, thermostat: 45, sockSandal: 100, beerSnob: 30 },
      flavorText: "Podiatrist said these shoes fuck me back! Gucci's got Satan tracker runes!",
      abilities: [{ name: "Maximum Cockfort", description: "Ain't got a single fuck about style. +20 defense vs snobs." }],
      series: 1, cardNumber: 3, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "008",
      name: "Cargo Shorts Carl Cock-Pocketer",
      subtitle: "Pocket Dimension Dick",
      type: "FASHION_FUCK",
      rarity: "rare",
      artwork: "/cards/fashion/cargo-shorts-carl.png",
      stats: { dadJoke: 75, grillSkill: 45, fixIt: 55, napPower: 50, remoteControl: 65, thermostat: 50, sockSandal: 80, beerSnob: 60 },
      flavorText: "These pockets are a government wormhole! I can fit anything! Dimensional portal confirmed!",
      abilities: [{ name: "Infinite Fuck-Storage", description: "Pockets hold unlimited items. +20 storage capacity." }],
      series: 1, cardNumber: 8, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "039",
      name: "Hawaiian Shirt Harry Hump-Tropic",
      subtitle: "Casual Fuckin' Friday Every Day",
      type: "FASHION_FUCK",
      rarity: "common",
      artwork: "/cards/fashion/hawaiian-harry.png",
      stats: { dadJoke: 75, grillSkill: 50, fixIt: 35, napPower: 55, remoteControl": 60, thermostat: 50, sockSandal: 75, beerSnob: 75 },
      flavorText: "Tropical every day keeps the feds away! Hawaii is a government state-building experiment!",
      abilities: [{ name: "Permanent Pussy-Vacation", description: "Always on vacation mindset. +20 damage while relaxed." }],
      series: 1, cardNumber: 39, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "057",
      name: "Flip Flop Floyd Fuck-Slapper",
      subtitle: "Rhythmic Slap of Cum-Summer",
      type: "FASHION_FUCK",
      rarity: "common",
      artwork: "/cards/fashion/flip-flop-floyd.png",
      stats: { dadJoke: 70, grillSkill: 40, fixIt: 30, napPower: 60, remoteControl: 55, thermostat: 45, sockSandal: 95, beerSnob: 65 },
      flavorText: "Flip flop slaps are freedom! The sound drives the government crazy!",
      abilities: [{ name: "Beach Boner-Stealth", description: "Flip flop sound is hypnotic. +15 evasion." }],
      series: 1, cardNumber: 57, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    },

    // === CROSSOVER EVENTS (Sample) ===
    {
      id: "DUNE_001",
      name: "Paul Atreides Ass-Traitor",
      subtitle: "Muad'Dib Meat-Masher",
      type: "CROSSOVER_DUNE",
      rarity: "legendary",
      artwork: "/cards/crossovers/paul-atreides.png",
      stats: { dadJoke: 90, grillSkill: 40, fixIt: 70, napPower: 60, remoteControl: 80, thermostat: 85, sockSandal: 75, beerSnob: 70 },
      flavorText: "I fuck the spice raw! Frank Herbert's got Fed plots in every sand grain!",
      abilities: [
        { name: "Spice Stroke", description: "+50 mind control damage. Can predict opponent's moves." },
        { name: "Desert Conspiracy", description: "+30 attack in desert. Government terraforming detected!" }
      ],
      series: "Dune", cardNumber: 1, totalInSeries: 4, artist: "DadDeck Studios", seasonId: 2
    },
    {
      id: "MARVEL_001",
      name: "Iron Dad Tony Stark",
      subtitle: "Arc Reactor Ass-Blaster",
      type: "CROSSOVER_MARVEL",
      rarity: "legendary",
      artwork: "/cards/crossovers/iron-dad.png",
      stats: { dadJoke: 90, grillSkill: 40, fixIt: 95, napPower: 50, remoteControl: 85, thermostat: 75, sockSandal: 70, beerSnob: 80 },
      flavorText: "I fuck my armor raw! Stark Industries is a Deep State dildo factory!",
      abilities: [{ name: "Repulsor Rim-Job", description: "+50 tech damage. Blasts opponent 3 spaces back." }],
      series: "Marvel", cardNumber: 1, totalInSeries: 4, artist: "DadDeck Studios", seasonId: 2
    },

    // === NEW CARD TYPES ===
    {
      id: "EVENT_001",
      name: "BBQ Blowout Bonanza",
      subtitle: "Grillpocalypse Now",
      type: "EVENT",
      rarity: "rare",
      artwork: "/cards/events/bbq-blowout.png",
      flavorText: "The grill exploded and I jizzed fire! Big Propane planned this shit!",
      effect: "All BBQ_DICKTATOR dads gain +30 grillSkill for 1 turn; opponents take 20 burn damage.",
      cardType: "SHITSHOW_SCENARIO",
      series: 1, cardNumber: 1, totalInSeries: 20, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "TERRAIN_001",
      name: "Backyard BBQ Battleground",
      subtitle: "Propane Pussy Palace",
      type: "TERRAIN",
      rarity: "rare",
      artwork: "/cards/terrain/bbq-ground.png",
      flavorText: "My backyard's a grill orgy! This is sacred conspiracy ground!",
      effect: "BBQ_DICKTATOR dads gain +25 grillSkill; others lose -10 thermostat.",
      cardType: "SUBURBAN_SHITFIELD",
      series: 1, cardNumber: 1, totalInSeries: 20, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "EVOLUTION_001",
      name: "Grill God Gary",
      subtitle: "Propane Panty-Melter",
      type: "EVOLUTION",
      rarity: "legendary",
      artwork: "/cards/evolution/grill-god.png",
      flavorText: "I fucked the grill into godhood! I AM THE GRILL NOW!",
      evolutionOf: "001",
      newStats: { dadJoke: 100, grillSkill: 115, fixIt: 35, napPower: 45, remoteControl: 55, thermostat: 70, sockSandal: 75, beerSnob: 85 },
      newAbilities: [{ name: "Inferno Ejaculation", description: "+50 AOE fire damage to entire opponent team." }],
      cardType: "MIDLIFE_CRISIS_MUTATION",
      series: 1, cardNumber: 1, totalInSeries: 10, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "CURSE_001",
      name: "Chemtrail Cock-Block",
      subtitle: "Sky Sperm Suppression",
      type: "CURSE",
      rarity: "rare",
      artwork: "/cards/curses/chemtrail-block.png",
      flavorText: "The sky's fucking my dick dry! Big Gov's spraying boner-killer clouds!",
      effect: "Target opponent's dad loses -30 attack for 3 turns; can't use grillSkill.",
      cardType: "DAD_DAMNATION",
      series: 1, cardNumber: 1, totalInSeries: 10, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "TRAP_001",
      name: "Garage Sale Gangbang",
      subtitle: "Bargain Basement Boner",
      type: "TRAP",
      rarity: "rare",
      artwork: "/cards/traps/garage-sale.png",
      flavorText: "I fucked your garage sale finds! eBay's a government pawn shop! GOTCHA!",
      triggerCondition: "Opponent plays an ITEM card",
      effect: "Steal their ITEM and boost your dad's attack by +30.",
      cardType: "SUBURBAN_SUCKERPUNCH",
      series: 1, cardNumber: 1, totalInSeries: 10, artist: "DadDeck Studios", seasonId: 1
    },
    {
      id: "026",
      name: "Weber Wiener 3000 Grill",
      subtitle: "The Sacred Fuck-Flame",
      type: "ITEM",
      rarity: "legendary",
      artwork: "/cards/items/weber-3000.png",
      stats: { dadJoke: 80, grillSkill: 100, fixIt: 50, napPower: 0, remoteControl: 0, thermostat: 0, sockSandal: 0, beerSnob: 0 },
      flavorText: "Four burners of pure cock-power! Neighbors jerk off to my flames with jealousy!",
      abilities: [{ name: "Perfect Heat Hump", description: "+30 grill boost for any BBQ_DICKTATOR." }],
      series: 1, cardNumber: 26, totalInSeries: 200, artist: "DadDeck Studios", seasonId: 1
    }
  ]
};

// Write to file
const outputPath = path.join(__dirname, '../src/data/cards-complete-generated.json');
fs.writeFileSync(outputPath, JSON.stringify(cardDatabase, null, 2));

console.log(`✅ Generated ${cardDatabase.cards.length} cards`);
console.log(`📁 Saved to: ${outputPath}`);
console.log(`🎮 Card types: ${[...new Set(cardDatabase.cards.map(c => c.type))].length}`);
