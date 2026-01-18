#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

// Read the current cards
const content = readFileSync('./src/data/cards.json', 'utf-8');
const cards = JSON.parse(content);

// New cards to add
const newCards = [
  // BBQ_DICKTATOR cards (5)
  {
    id: "106",
    name: "Brisket Baron Bob",
    subtitle: "14-Hour Smoke Master",
    type: "BBQ_DICKTATOR",
    rarity: "epic",
    artwork: "/cards/brisket-baron-bob.svg",
    stats: {
      dadJoke: 75,
      grillSkill: 95,
      fixIt: 40,
      napPower: 35,
      remoteControl: 45,
      thermostat: 50,
      sockSandal: 65,
      beerSnob: 80
    },
    flavorText: "Government wants you to think brisket takes 8 hours! LIES! Real brisket takes 14 hours minimum! I've got 3 smokers going simultaneously! The FDA's trying to regulate my rub recipe! My spice blend is freedom in powder form!",
    abilities: [
      {
        name: "Low & Slow Domination",
        description: "Smokes meat until it surrenders. +40 Grill Skill when opponent is hungry. Claims Big BBQ is trying to push gas grills. Charcoal is the only honest heat source."
      }
    ],
    series: 1,
    cardNumber: 106,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "107",
    name: "Rib Rack Randall",
    subtitle: "Falls-Off-The-Bone Fury",
    type: "BBQ_DICKTATOR",
    rarity: "rare",
    artwork: "/cards/rib-rack-randall.svg",
    stats: {
      dadJoke: 80,
      grillSkill: 85,
      fixIt: 35,
      napPower: 45,
      remoteControl: 55,
      thermostat: 60,
      sockSandal: 70,
      beerSnob: 75
    },
    flavorText: "Baby back ribs? BABY BACK?! I only eat FULL-GROWN ADULT RIBS! The pork industry's covering up that ribs come from cyborg pigs! My marinade recipe was downloaded from alien spacecraft! The government stole my dry rub formula!",
    abilities: [
      {
        name: "Rib Meat Revelation",
        description: "Reveals the truth about rib meat distribution. +35 Grill Skill when grilling pork products. Claims the National Pork Board is a government conspiracy."
      }
    ],
    series: 1,
    cardNumber: 107,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "108",
    name: "Smoker Steve the Smokestack",
    subtitle: "Hickory Smoke Perfectionist",
    type: "BBQ_DICKTATOR",
    rarity: "legendary",
    artwork: "/cards/smoker-steve.svg",
    stats: {
      dadJoke: 85,
      grillSkill: 90,
      fixIt: 50,
      napPower: 40,
      remoteControl: 60,
      thermostat: 65,
      sockSandal: 75,
      beerSnob: 85
    },
    flavorText: "I've got 7 different wood types in my smoker! Hickory, mesquite, apple, cherry, pecan, oak, and maple! Each one tells a different flavor story! The EPA's trying to regulate my smoke emissions! Smoke is freedom! You can't regulate freedom!",
    abilities: [
      {
        name: "Wood Smoke Wizardry",
        description: "Infuses food with sacred wood smoke essence. +50 Grill Skill, immune to EPA regulations. Claims secondhand smoke is actually government mind-control vapor. His smoke is pure liberty."
      }
    ],
    series: 1,
    cardNumber: 108,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "109",
    name: "Propane Pete the Purist",
    subtitle: "Clean Heat Connoisseur",
    type: "BBQ_DICKTATOR",
    rarity: "uncommon",
    artwork: "/cards/propane-pete.svg",
    stats: {
      dadJoke: 70,
      grillSkill: 75,
      fixIt: 45,
      napPower: 35,
      remoteControl: 50,
      thermostat: 55,
      sockSandal: 60,
      beerSnob: 65
    },
    flavorText: "Charcoal's messy! Propane's clean! I can grill at exactly 425°F for precisely 12 minutes! Big Charcoal's lying to you about flavor! My propane tank's a freedom container! The government tracks propane purchases!",
    abilities: [
      {
        name: "Precision Propane Power",
        description: "Achieves exact temperatures with mathematical precision. +25 Grill Skill, but vulnerable to charcoal propaganda. Believes propane flavor is superior because it's cleaner."
      }
    ],
    series: 1,
    cardNumber: 109,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "110",
    name: "Sauce Boss Sam",
    subtitle: "Sweet & Spicy Sovereign",
    type: "BBQ_DICKTATOR",
    rarity: "rare",
    artwork: "/cards/sauce-boss-sam.svg",
    stats: {
      dadJoke: 90,
      grillSkill: 80,
      fixIt: 40,
      napPower: 50,
      remoteControl: 60,
      thermostat: 65,
      sockSandal: 70,
      beerSnob: 75
    },
    flavorText: "I've got 12 different sauces! Vinegar-based! Tomato-based! Mustard-based! White sauce! The big sauce companies are putting mind control chemicals in their bottles! I make my own sauce in my bathtub! Health department said that's illegal. Sauce tyranny!",
    abilities: [
      {
        name: "Sauce Sovereignty",
        description: "Applies experimental sauces with reckless abandon. +35 Grill Skill, but risks health department intervention. Claims all commercial sauces contain tracking nanobots."
      }
    ],
    series: 1,
    cardNumber: 110,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  // TECH_TWATS cards (5)
  {
    id: "111",
    name: "Router Rick the Rebooter",
    subtitle: "Have You Tried Turning It Off and On?",
    type: "TECH_TWATS",
    rarity: "common",
    artwork: "/cards/router-rick.svg",
    stats: {
      dadJoke: 65,
      grillSkill: 40,
      fixIt: 75,
      napPower: 30,
      remoteControl: 95,
      thermostat: 70,
      sockSandal: 50,
      beerSnob: 45
    },
    flavorText: "The problem's always the router! I restart it 7 times per day! ISP's secretly throttling my connection! My router's in the Faraday cage I built in the basement! WiFi signals are government mind control waves!",
    abilities: [
      {
        name: "Sacred Restart Ritual",
        description: "Performs the holy cycle of power cycling. +20 Fix It when fixing tech problems. Believes 93% of tech issues can be solved by unplugging and plugging back in. He's 14% correct."
      }
    ],
    series: 1,
    cardNumber: 111,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "112",
    name: "Password Pete the Pattern-Protector",
    subtitle: "My Password Is Password123",
    type: "TECH_TWATS",
    rarity: "uncommon",
    artwork: "/cards/password-pete.svg",
    stats: {
      dadJoke: 75,
      grillSkill: 35,
      fixIt: 60,
      napPower: 40,
      remoteControl: 85,
      thermostat: 60,
      sockSandal: 55,
      beerSnob: 50
    },
    flavorText: "I use the same password for everything! It's 'Football' plus my birth year! Security experts are lying about password complexity! Big Cyber is trying to sell us password managers! My password strategy hasn't been hacked yet! (That I know of.)",
    abilities: [
      {
        name: "Password Recklessness",
        description: "Uses the same terrible password everywhere. +15 Remote Control, but -30 defense against hacking. Claims password requirements are a government conspiracy."
      }
    ],
    series: 1,
    cardNumber: 112,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "113",
    name: "Smartphone Steve the Screen-Stare",
    subtitle: "Infinite Scroll Specialist",
    type: "TECH_TWATS",
    rarity: "common",
    artwork: "/cards/smartphone-steve.svg",
    stats: {
      dadJoke: 60,
      grillSkill: 30,
      fixIt: 45,
      napPower: 55,
      remoteControl: 90,
      thermostat: 65,
      sockSandal: 50,
      beerSnob: 40
    },
    flavorText: "I spend 6 hours per day reading news apps! Algorithms are trying to control my political opinions! Big Tech's radicalizing me through clickbait! I've got 47 news apps on my phone! All of them know everything about me!",
    abilities: [
      {
        name: "Doomscrolling Defender",
        description: "Absorbs information at terrifying rates. +25 Remote Control, but -20 Nap Power due to blue light. Claims his phone is listening to his conversations. It probably is."
      }
    ],
    series: 1,
    cardNumber: 113,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "114",
    name: "Cable Guy Carl the Connector",
    subtitle: "HDMI Hierophant",
    type: "TECH_TWATS",
    rarity: "rare",
    artwork: "/cards/cable-guy-carl.svg",
    stats: {
      dadJoke: 70,
      grillSkill: 45,
      fixIt: 80,
      napPower: 35,
      remoteControl: 85,
      thermostat: 60,
      sockSandal: 55,
      beerSnob: 60
    },
    flavorText: "I've got 47 HDMI cables behind my TV! I know which one carries 8K at 120Hz! The cable companies are lying about bandwidth! I color-code all my connections! Labels on everything! The government's tracking through smart TVs!",
    abilities: [
      {
        name: "Cable Management Chaos",
        description: "Maintains terrifyingly complex cable ecosystems. +35 Fix It when dealing with audio/video setups. Has a spreadsheet documenting every cable in his house. It's 47 pages long."
      }
    ],
    series: 1,
    cardNumber: 114,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "115",
    name: "Update Avoider Dan",
    subtitle: "Remind Me Tomorrow Forever",
    type: "TECH_TWATS",
    rarity: "common",
    artwork: "/cards/update-avoider-dan.svg",
    stats: {
      dadJoke: 80,
      grillSkill: 35,
      fixIt: 50,
      napPower: 45,
      remoteControl: 80,
      thermostat: 55,
      sockSandal: 50,
      beerSnob: 55
    },
    flavorText: "Updates are just government spyware! I haven't updated my phone in 3 years! It works perfectly fine! My computer's running Windows 7! Big Tech wants to force planned obsolescence! I still have an original iPad!",
    abilities: [
      {
        name: "Update Evasion Tactics",
        description: "Relentlessly avoids all software updates. +20 Remote Control, but vulnerable to security exploits. Claims every update is a government surveillance program."
      }
    ],
    series: 1,
    cardNumber: 115,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  // COACH_CUMSTERS cards (5)
  {
    id: "116",
    name: "Whistleblower Will",
    subtitle: "Referee Respecter",
    type: "COACH_CUMSTERS",
    rarity: "epic",
    artwork: "/cards/whistleblower-will.svg",
    stats: {
      dadJoke: 85,
      grillSkill: 60,
      fixIt: 55,
      napPower: 20,
      remoteControl: 45,
      thermostat: 50,
      sockSandal: 65,
      beerSnob: 70
    },
    flavorText: "I've been reffing youth soccer for 22 years! I own 47 different whistles! Parents who yell at refs are the worst part of America! I've ejected 14 grandpas from games! Respect the striped shirt! My calls are final! Even when I'm wrong!",
    abilities: [
      {
        name: "Whistle Authority",
        description: "Blows whistle with righteous fury. +40 defense when challenged. Has memorized 3,472 pages of rulebooks across 7 different sports. Will argue for 45 minutes about a call from 2019."
      }
    ],
    series: 1,
    cardNumber: 116,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "117",
    name: "Gatorade Greg the Hydrator",
    subtitle: "Is It In You?",
    type: "COACH_CUMSTERS",
    rarity: "uncommon",
    artwork: "/cards/gatorade-greg.svg",
    stats: {
      dadJoke: 75,
      grillSkill: 55,
      fixIt: 45,
      napPower: 25,
      remoteControl: 40,
      thermostat: 45,
      sockSandal: 55,
      beerSnob: 60
    },
    flavorText: "Water's for amateurs! Real athletes need electrolytes! I drink 2 gallons of Gatorade per day! My piss is neon blue! The sports drink industry's lying about hydration! I've got 14 cases in my garage! All different flavors!",
    abilities: [
      {
        name: "Electrolyte Evangelist",
        description: "Aggressively hydrates everyone in sight. +20 Nap Power (sugar crash), +15 Grill Skill (energy). Claims water is a government plot to make us weak."
      }
    ],
    series: 1,
    cardNumber: 117,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "118",
    name: "Bench Boss Barry",
    subtitle: "Clipboard Commander",
    type: "COACH_CUMSTERS",
    rarity: "rare",
    artwork: "/cards/bench-boss-barry.svg",
    stats: {
      dadJoke: 80,
      grillSkill: 50,
      fixIt: 60,
      napPower: 30,
      remoteControl: 45,
      thermostat: 50,
      sockSandal: 60,
      beerSnob: 65
    },
    flavorText: "I've got clipboards for everything! Practice plans! Rotation charts! Snack schedules! I color-code my timeouts! The other team's scouts are watching! I signal plays in code! My wife says I'm too intense for 8-year-olds' basketball!",
    abilities: [
      {
        name: "Clipboard Stratagems",
        description: "Develops unnecessarily complex strategies for children's games. +30 Fix It when coaching. Has 47 different plays designed. None of them work."
      }
    ],
    series: 1,
    cardNumber: 118,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "119",
    name: "Trophy Tom the Victory-Vainer",
    subtitle: "Participant Ribbon Collector",
    type: "COACH_CUMSTERS",
    rarity: "common",
    artwork: "/cards/trophy-tom.svg",
    stats: {
      dadJoke: 70,
      grillSkill: 55,
      fixIt: 40,
      napPower: 35,
      remoteControl: 50,
      thermostat: 45,
      sockSandal: 60,
      beerSnob: 55
    },
    flavorText: "I've got 237 participation trophies from 1987! Everyone deserves a trophy! My kids' teams get trophies even when they lose! Participation awards build character! My basement's a trophy museum! I dust them weekly!",
    abilities: [
      {
        name: "Trophy Case Tyrant",
        description: "Displays mediocre achievements with pride. +15 Dad Joke when telling stories about past glory. Has a trophy for 'Best Attendant' at a 1991 company picnic."
      }
    ],
    series: 1,
    cardNumber: 119,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "120",
    name: "Halftime Hank the Motivator",
    subtitle: "Speeches That Change Nothing",
    type: "COACH_CUMSTERS",
    rarity: "legendary",
    artwork: "/cards/halftime-hank.svg",
    stats: {
      dadJoke: 90,
      grillSkill: 65,
      fixIt: 55,
      napPower: 25,
      remoteControl: 50,
      thermostat: 55,
      sockSandal: 70,
      beerSnob: 75
    },
    flavorText: "I give the same speech every halftime! 'You boys want this? THEN GO GET IT!' I've seen every sports movie! My speeches are 40% clichés! 60% spitting! 100% AMERICAN! Kids usually look confused! Sometimes they cry!",
    abilities: [
      {
        name: "Inspirational Oratory",
        description: "Delivers rousing speeches that accomplish nothing. +40 all stats during halftime, but effects wear off by third quarter. Quotes from movies he's never actually seen."
      }
    ],
    series: 1,
    cardNumber: 120,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  // HOLIDAY_HORNDOGS cards (5)
  {
    id: "121",
    name: "Halloween Harry the Horror-Fan",
    subtitle: "Skeleton War Veteran",
    type: "HOLIDAY_HORNDOGS",
    rarity: "epic",
    artwork: "/cards/halloween-harry.svg",
    stats: {
      dadJoke: 85,
      grillSkill: 50,
      fixIt: 65,
      napPower: 40,
      remoteControl: 60,
      thermostat: 45,
      sockSandal: 60,
      beerSnob: 70
    },
    flavorText: "Halloween's the only holiday that matters! I've got 47 skeletons in my yard! They stay up year-round! The war on Christmas is fake! The war on Halloween is REAL! Kids today are too lazy for proper haunting!",
    abilities: [
      {
        name: "Spooky Supremacy",
        description: "Decorates for Halloween on September 1st. +35 Fix It when building props. Claims Halloween is being replaced by 'Fall Festivals' as part of a conspiracy."
      }
    ],
    series: 1,
    cardNumber: 121,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "122",
    name: "Thanksgiving Ted the Turkey-Tyrant",
    subtitle: "Deep Fryer Daredevil",
    type: "HOLIDAY_HORNDOGS",
    rarity: "rare",
    artwork: "/cards/thanksgiving-ted.svg",
    stats: {
      dadJoke: 80,
      grillSkill: 90,
      fixIt: 50,
      napPower: 60,
      remoteControl: 45,
      thermostat: 40,
      sockSandal: 55,
      beerSnob: 65
    },
    flavorText: "I deep fry TWO turkeys every year! One's for eating! One's for backup! Fire department's been to my house 4 times! They're just jealous of my technique! Butterball's a government conspiracy! I brine for 72 hours!",
    abilities: [
      {
        name: "Turkey Terror Tactics",
        description: "Deep fries poultry with reckless abandon. +40 Grill Skill, -20 Fix It (fire damage). Claims the fire marshal has a personal vendetta against him."
      }
    ],
    series: 1,
    cardNumber: 122,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "123",
    name: "Easter Egg Eddie",
    subtitle: "Pastel Pollution Purveyor",
    type: "HOLIDAY_HORNDOGS",
    rarity: "uncommon",
    artwork: "/cards/easter-egg-eddie.svg",
    stats: {
      dadJoke: 75,
      grillSkill: 45,
      fixIt: 55,
      napPower: 35,
      remoteControl: 50,
      thermostat: 50,
      sockSandal: 55,
      beerSnob: 60
    },
    flavorText: "I hide 147 eggs for my kids every year! 20 are real! 127 are plastic! I make maps! I use GPS coordinates! Kids find them all in 7 minutes! I cry for 3 hours afterwards! Easter's losing its meaning!",
    abilities: [
      {
        name: "Egg Obsession",
        description: "Over-engineers simple egg hunts. +25 Fix It when planning holiday events. Has a spreadsheet tracking egg hide locations from 1998-present."
      }
    ],
    series: 1,
    cardNumber: 123,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "124",
    name: "Valentine's Vic the Heart-Attacker",
    subtitle: "Romance Ruiner",
    type: "HOLIDAY_HORNDOGS",
    rarity: "common",
    artwork: "/cards/valentines-vic.svg",
    stats: {
      dadJoke: 70,
      grillSkill: 40,
      fixIt: 45,
      napPower: 30,
      remoteControl: 55,
      thermostat: 50,
      sockSandal: 60,
      beerSnob: 50
    },
    flavorText: "Valentine's Day is a Hallmark conspiracy! Flowers are 400% marked up! I buy my wife a card from the dollar store! She says I'm romantic! I think she's being sarcastic! Love is a government construct! My anniversary card said 'Happy Tax Day'!",
    abilities: [
      {
        name: "Anti-Romantic Resistance",
        description: "Resists commercialized romance. +20 Dad Joke (cynical humor), -30 Remote Control (wife's mad). Claims the flower industry is a government mind-control operation."
      }
    ],
    series: 1,
    cardNumber: 124,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "125",
    name: "New Year's Ned the Resolution-Wrecker",
    subtitle: "Gym Membership Waster",
    type: "HOLIDAY_HORNDOGS",
    rarity: "common",
    artwork: "/cards/new-years-ned.svg",
    stats: {
      dadJoke: 80,
      grillSkill: 50,
      fixIt: 40,
      napPower: 45,
      remoteControl: 55,
      thermostat: 55,
      sockSandal: 60,
      beerSnob: 60
    },
    flavorText: "I make the same resolution every year! Go to the gym! Last year I went ONCE! January 3rd! The gym's a government conspiracy! They steal our money through unused memberships! I'm still paying for 2018's membership!",
    abilities: [
      {
        name: "Resolution Failure",
        description: "Fails at every self-improvement goal. +15 Nap Power (gave up), +25 Dad Joke (jokes about it). Claims gyms are pyramid schemes."
      }
    ],
    series: 1,
    cardNumber: 125,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  // VINTAGE_VAGABONDS cards (5)
  {
    id: "126",
    name: "Vinyl Vance the Record-Collector",
    subtitle: "I Don't Even Have a Turntable",
    type: "VINTAGE_VAGABONDS",
    rarity: "epic",
    artwork: "/cards/vinyl-vance.svg",
    stats: {
      dadJoke: 75,
      grillSkill: 45,
      fixIt: 60,
      napPower: 50,
      remoteControl: 40,
      thermostat: 55,
      sockSandal: 70,
      beerSnob: 85
    },
    flavorText: "I've got 847 vinyl records! Most are still sealed! Digital music sounds like garbage! Analog's the only honest audio format! I paid $400 for a first press! I've never listened to it! The cover art's better than the music!",
    abilities: [
      {
        name: "Vinyl Virtuosity",
        description: "Collects records he never plays. +40 Beer Snob (musical elitism), -20 Fix It (can't figure out turntable). Claims Spotify is destroying society."
      }
    ],
    series: 1,
    cardNumber: 126,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "127",
    name: "Rotary Ralph the Dial-Up Defender",
    subtitle: "You've Got Mail",
    type: "VINTAGE_VAGABONDS",
    rarity: "rare",
    artwork: "/cards/rotary-ralph.svg",
    stats: {
      dadJoke: 85,
      grillSkill: 40,
      fixIt: 70,
      napPower: 55,
      remoteControl: 35,
      thermostat: 50,
      sockSandal: 65,
      beerSnob: 60
    },
    flavorText: "I still have a landline! I refuse to carry a cell phone! Smartphones are tracking devices! I've got an answering machine from 1994! The outgoing message's 7 minutes long! The internet was better before everyone was on it!",
    abilities: [
      {
        name: "Analog Antics",
        description: "Uses technology from 1994 with pride. +30 Fix It when dealing with old tech, -25 Remote Control in modern situations. Still uses a paper map instead of GPS."
      }
    ],
    series: 1,
    cardNumber: 127,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "128",
    name: "Cassette Carl the Tape-Master",
    subtitle: "Pencil Rewind Specialist",
    type: "VINTAGE_VAGABONDS",
    rarity: "uncommon",
    artwork: "/cards/cassette-carl.svg",
    stats: {
      dadJoke: 70,
      grillSkill: 45,
      fixIt: 55,
      napPower: 50,
      remoteControl: 45,
      thermostat: 55,
      sockSandal: 65,
      beerSnob: 65
    },
    flavorText: "I've got a mixtape for every occasion! Road trips! Parties! Funerals! I made one for my daughter's wedding! She didn't play it! Kids today don't appreciate the art of the pause button! I carry a pencil to rewind tapes!",
    abilities: [
      {
        name: "Mixtape Maven",
        description: "Creates unnecessarily specific cassette compilations. +25 Dad Joke (stories about making mixtapes). Claims digital playlists lack soul."
      }
    ],
    series: 1,
    cardNumber: 128,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "129",
    name: "Tube TV Tom the Analog-Archivist",
    subtitle: "47-Inch CRT Monster",
    type: "VINTAGE_VAGABONDS",
    rarity: "rare",
    artwork: "/cards/tube-tv-tom.svg",
    stats: {
      dadJoke: 80,
      grillSkill: 50,
      fixIt: 75,
      napPower: 45,
      remoteControl: 50,
      thermostat: 55,
      sockSandal: 70,
      beerSnob: 65
    },
    flavorText: "I've got a 300-pound CRT TV from 1998! Picture quality's better than 4K! I need two people to move it! The cable box is from 2005! It weighs 40 pounds! My living room floor's sagging! It's worth it for that warm CRT glow!",
    abilities: [
      {
        name: "CRT Crusader",
        description: "Maintains dangerously heavy televisions. +35 Fix It when repairing old electronics. Claims modern TVs are government spying devices. His TV takes 15 minutes to 'warm up.'"
      }
    ],
    series: 1,
    cardNumber: 129,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  },
  {
    id: "130",
    name: "VHS Vic the Video-Collector",
    subtitle: "Be Kind, Rewind",
    type: "VINTAGE_VAGABONDS",
    rarity: "common",
    artwork: "/cards/vhs-vic.svg",
    stats: {
      dadJoke: 75,
      grillSkill: 45,
      fixIt: 60,
      napPower: 50,
      remoteControl: 45,
      thermostat: 50,
      sockSandal: 60,
      beerSnob: 60
    },
    flavorText: "I've got 47 VHS tapes recorded off TV! Commercials included! That's history! Blockbuster was a golden age! Streaming's killing physical media! I've got the director's cut of Waterworld on tape! The tracking's fucked! It adds character!",
    abilities: [
      {
        name: "VHS Virtuoso",
        description: "Collects obsolete video formats with pride. +20 Nap Power (watching tapes), +15 Dad Joke (complaining about streaming). Has 3 copies of the same movie 'because quality might differ.'"
      }
    ],
    series: 1,
    cardNumber: 130,
    totalInSeries: 150,
    artist: "DadArt Studios",
    seasonId: 2
  }
];

// Add new cards to existing cards
cards.cards.push(...newCards);

// Write back to file
writeFileSync('./src/data/cards.json', JSON.stringify(cards, null, 2));

console.log(`✅ Added ${newCards.length} new cards!`);
console.log(`📊 Total cards: ${cards.cards.length}`);
