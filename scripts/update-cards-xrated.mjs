#!/usr/bin/env node
/**
 * Script to update all 105 cards with X-rated content
 * Applies the "Backyard Boner Edition" style to all cards
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cardsPath = join(__dirname, '..', 'src', 'data', 'cards.json');

// Read the cards
const cardsData = JSON.parse(readFileSync(cardsPath, 'utf-8'));

// X-rated rewrite mappings - comprehensive list from DadDecK_Card_Types.md
const rewrites = {
  // Already updated cards (001, 002, 003, 026) - skip
  "001": null, "002": null, "003": null, "026": null,
  
  // BBQ_DAD cards
  "004": {
    name: "Lawn Legend Larry Lust-Cutter",
    subtitle: "GET OFF MY FUCKIN' LAWN",
    flavorText: "I fuck my lawn 'til it's perfect! 5G towers fry my balls, gotta fertilize! The grass is honest. The conspiracy is greener.",
    abilities: [{
      name: "Grass Stare Groin",
      description: "Stares at grass so hard enemies nut themselves in confusion. +30 defense! Claims 5G towers control dandelion growth. The stare is real. The conspiracy is realer."
    }]
  },
  
  "005": {
    name: "Remote Control Randy Rim-Ruler",
    subtitle: "Don't Touch My Fuckin' Buttons",
    flavorText: "I flip channels faster than I flip off Amazon's spy cams! Netflix is brainwashing us with gay frogs! Every button press is tracked. The remote is compromised. The conspiracy is permanent.",
    abilities: [{
      name: "Button Boner Memory",
      description: "Remembers every channel ever watched. Claims remotes are government tracking devices. Still uses 47 remotes. The memory is perfect. The conspiracy is perfect-er."
    }]
  },
  
  "006": {
    name: "Handyman Hank Hard-On Hammer",
    subtitle: "Duct Tape & Dick-40",
    flavorText: "I fix shit with my dick! Home Depot sells alien probes disguised as drills! Big Hardware hides Area 51 tech in aisle 5! Every tool is compromised. The fixes are real. The conspiracy is realer.",
    abilities: [{
      name: "YouTube Tit-Master",
      description: "Can fix anything after watching a 10-minute video. Claims YouTube tutorials are government psy-ops. Still watches them daily. Has 47 subscriptions. All of them are 'compromised.'"
    }]
  },
  
  "007": {
    name: "Bogey Bob Boner-Swinger",
    subtitle: "Hole-in-One Horn-Dog",
    flavorText: "I fuck every fairway! Nike's golf balls got Bill Gates spyware in 'em! Big Golf controls the wind through chemtrails! I still play though. The score is fake. The conspiracy is real.",
    abilities: [{
      name: "Infinite Cum-Mulligans",
      description: "'That one didn't count.' - Every single time. Also claims the wind is controlled by Big Golf to sell more balls. Has 47 theories about the course. None of them make sense but all involve tracking."
    }]
  },
  
  "008": {
    name: "Cargo Shorts Carl Cock-Pocketer",
    subtitle: "Pocket Dimension Dick",
    flavorText: "I fuck cargo shorts raw! Big Fashion's tracking me through my pockets! Every pocket holds a conspiracy. The storage is infinite. The paranoia is infinite-er.",
    abilities: [{
      name: "Infinite Fuck-Storage",
      description: "Can store anything in cargo pockets. Claims pockets are government tracking compartments. Still uses them. Has 47 pockets. All of them are 'bugged.' The storage is unmatched."
    }]
  },
  
  "009": {
    name: "Oil Change Oscar Lube-Licker",
    subtitle: "3,000 Miles or Fuckin' Whenever",
    flavorText: "I lube my ride with my juice! Tesla's makin' sexbots outta Priuses! Big Auto's trackin' every oil change through QR codes! The lube is honest. The conspiracy is slick.",
    abilities: [{
      name: "Engine Whisper-Wank",
      description: "Can diagnose engine problems by sound alone. Claims oil changes are government tracking systems. Still changes it every 3,000 miles. Has 47 theories about engines. All involve aliens."
    }]
  },
  
  "010": {
    name: "TPS Report Terry Tit-Paper",
    subtitle: "Did Ya Get the Fuckin' Memo?",
    flavorText: "I fuck TPS reports raw! Microsoft's got MKUltra in Office 365! Big Tech's controlling my workflow through Excel spreadsheets! The reports are endless. The conspiracy is endless-er.",
    abilities: [{
      name: "Meeting Sperm-Survivor",
      description: "Can survive any meeting by zoning out. Claims corporate meetings are government mind control sessions. Still attends them. Has 47 theories about TPS reports. All involve tracking."
    }]
  },
  
  "011": {
    name: "Skateboard Scott Shlong-Skater",
    subtitle: "Cool Cock (Confirmed)",
    flavorText: "I fuck skateboards raw! Spotify's algorithms are turning me gay! Big Skate's got spy wheels that track my every trick! I still ride though. The tricks are real. The conspiracy is radical.",
    abilities: [{
      name: "Radical Rim-Recall",
      description: "Can remember every trick from the '90s. Claims skateboard companies are government fronts. Still rides daily. Has 47 theories about skating. All involve chemtrails."
    }]
  },
  
  "012": {
    name: "Soccer Stan Sideline Sucker",
    subtitle: "Sideline Fuck-General",
    flavorText: "I fuck soccer sidelines raw! Big Sports' got FBI bugs in every cleat! The refs are Deep State operatives! I coach anyway. The kids need encouragement. Also the conspiracies.",
    abilities: [{
      name: "Orange Slice Orgasm-Provider",
      description: "Provides orange slices and encouragement. Claims sports gear is government tracking equipment. Still coaches. Has 47 theories about soccer. All are wrong but entertaining."
    }]
  },
  
  "013": {
    name: "Secret Recipe Rick Sperm-Chef",
    subtitle: "Secret Is Fuckin' Butter",
    flavorText: "I fuck recipes raw! Big Food's GMOs made my dick soft! The secret ingredient? Butter. And conspiracies. Big Breakfast's trying to control my morning routine through IHOP!",
    abilities: [{
      name: "Taste Memory Meat",
      description: "Can recreate any dish from memory. Claims food companies put mind control chemicals in every meal. Still cooks daily. Has 47 secret recipes. All involve butter and tracking."
    }]
  },
  
  "014": {
    name: "Costco Craig Cum-Bulker",
    subtitle: "Bulk Buy Fuck-Boss",
    flavorText: "I fuck bulk packs 'til the world ends! Costco's a goddamn FEMA camp in disguise! Big Retail's tracking me through every barcode! The bulk is unmatched. The conspiracy is real.",
    abilities: [{
      name: "Sample Sperm-Radar",
      description: "Can locate every sample station from 100 yards. Claims Costco is a government surveillance warehouse. Still shops there weekly. Has 47 theories about bulk buying. All involve FEMA camps."
    }]
  },
  
  "015": {
    name: "Christmas Clark Cock-Decorator",
    subtitle: "Decorate or Fuckin' Die",
    flavorText: "I fuck Christmas trees raw! Hallmark movies brainwash my kids! Big Holiday's got spy lights in every ornament! I decorate anyway. The cheer is forced. The conspiracy is real.",
    abilities: [{
      name: "Ladder Lust-Courage",
      description: "Climbs ladders with reckless abandon. Claims Christmas lights are government tracking devices. Still decorates. Has 47 theories about holidays. All involve mind control."
    }]
  },
  
  "016": {
    name: "Ultimate Dicktator Daddy",
    subtitle: "Hi Hungry, I'm Fuckin' Dad",
    flavorText: "I brought you into this world, and I'll take you out! After I finish this burger. Big Burger's controlling the weather through chemtrails! This burger? 100% grass-fed, government-free, dick-powered beef!",
    abilities: [{
      name: "Dad Joke Dickery",
      description: "Every joke lands and every joke is filthy. The groans are deafening. Claims dad jokes are the last bastion of free speech before the woke mob cancels everything. Has 47 dirty jokes ready at all times."
    }, {
      name: "Universal Rim-Remote",
      description: "Controls everything. Even you. Has 47 remotes because 'they' want us dependent on smart home technology. Still uses all of them. The contradiction is beautiful."
    }, {
      name: "Infinite Fuck-Wisdom",
      description: "Actually knows everything (confirmed by him). All knowledge comes from YouTube comment sections and Facebook groups. It's basically a PhD in conspiracies. Has 47 theories about everything."
    }]
  },
  
  "017": {
    name: "WiFi Wizard Walter Wank-Wireless",
    subtitle: "Have Ya Tried Fuckin' It Off?",
    flavorText: "I fuck routers raw! Apple's got brain chips in my iPhone! Big Tech's tracking every connection through 5G waves! The WiFi is compromised. The conspiracy is permanent.",
    abilities: [{
      name: "Router Reboot Rim-Job",
      description: "Fixes 90% of problems by rebooting. The other 10%? More rebooting. Claims each reboot resets the government tracking chips. Has 47 sticky notes with passwords. The reboots are frequent."
    }]
  },
  
  "018": {
    name: "Smoker Steve Meat-Smoker",
    subtitle: "Low & Slow Cock-Legend",
    flavorText: "I smoke brisket and conspiracies! Ronald McFuckface controls the weather through chemtrails! Big BBQ's tracking my smoke signals! The bark is perfect. The conspiracy is perfect-er.",
    abilities: [{
      name: "Smoke Ring Cum-Summon",
      description: "Perfect smoke ring every time. Claims smoke rings are signals to aliens. Still makes perfect ones. Has 47 theories about smoking. All involve government surveillance."
    }]
  },
  
  "019": {
    name: "Minivan Mike Meat-Mover",
    subtitle: "Swagger Cock-Wagon Commander",
    flavorText: "It's not a minivan, it's a mobile fuck-command center! Tesla's turning cars into sex robots! Minivans are the last honest vehicles before Big Electric took over! I drive a 2004 Odyssey. It's perfect. Also it has 47 cup holders.",
    abilities: [{
      name: "Snack Cum-Compartment",
      description: "Emergency rations for any crisis (all 5 flavors). Claims snack companies put tracking chips in goldfish crackers. Still buys them in bulk. The storage is unmatched."
    }]
  },
  
  "020": {
    name: "Recliner Randy Nap-Nut",
    subtitle: "Horizontal Cock Evaluation",
    flavorText: "This isn't sleeping, this is strategic consciousness pause! Netflix is brainwashing us with gay frogs! Infowars told me so! I nap for 12 hours daily. The REM cycles are coded messages.",
    abilities: [{
      name: "Power Nap Pussy",
      description: "20 minutes. Fully recharged. Still tired. Claims power naps reset government mind control chips. Has 47 theories about sleep. All involve aliens and tracking."
    }]
  },
  
  "021": {
    name: "Fertilizer Fred Fucker-Turf",
    subtitle: "Grass Growth Cock-Guru",
    flavorText: "I fuck fertilizer raw! Scotts Miracle-Gro is a Bilderberg Group conspiracy! Fertilizer companies spike turf with mind control chemicals! I mix my own. It's honest. Also it smells worse.",
    abilities: [{
      name: "Dandelion Dick-Destroyer",
      description: "Can spot a weed from a moving vehicle. Claims dandelions are government plants to track lawn owners. Still pulls them. Has 47 theories about weeds. All involve the Deep State."
    }]
  },
  
  "022": {
    name: "LinkedIn Larry Lust-Logger",
    subtitle: "Humble Fuck-Brag Master",
    flavorText: "Excited to announce that I'm excited to announce exhaustion! LinkedIn's a CIA recruitment platform! Every humble brag sends data to the Deep State! I post daily anyway. It's networking. Also it's surveillance.",
    abilities: [{
      name: "Infinite Hump-Brag",
      description: "Every post is secretly an achievement. Claims LinkedIn tracks our career moves to control the job market. Still uses it. Has 47 connections. All of them are 'compromised.'"
    }]
  },
  
  "023": {
    name: "Band Dad Brad Boner-Banger",
    subtitle: "Almost Got Fuckin' Signed",
    flavorText: "We almost got signed. ALMOST. Big Music's controlling the industry through Spotify algorithms! Record labels are government fronts for mind control! I still play. The garage is my stage.",
    abilities: [{
      name: "Air Guitar Ass-God",
      description: "Can shred invisible strings like nobody's business. Claims the music industry is a Deep State conspiracy. Still plays air guitar daily. Has 47 theories about why we didn't get signed. All involve the Illuminati."
    }]
  },
  
  "024": {
    name: "Classic Car Craig Cock-Cranker",
    subtitle: "Classic, Not a Clunker Fuck",
    flavorText: "They don't make 'em like they used to! Car manufacturers hide tracking chips in classic cars! Old vehicles are government surveillance platforms! I still drive mine. The style's unmatched.",
    abilities: [{
      name: "Part Pussy-Archaeologist",
      description: "Can find discontinued parts from the Cold War era. Claims old car parts are government tracking devices. Still uses them. Has 47 theories about why they stopped making them. All involve aliens."
    }]
  },
  
  "025": {
    name: "Breakfast King Keith Cum-Caker",
    subtitle: "Pancake Fuck-Perfectionist",
    flavorText: "Saturday morning pancakes are non-negotiable! Burn them and you're disowned. Big Breakfast's trying to control my morning routine through IHOP conspiracies! I make my own pancakes. They're honest. Also perfect.",
    abilities: [{
      name: "Flip Fuck-Master",
      description: "Never dropped a pancake. The walls disagree. Claims pancake mix is a government tracking powder. Still uses it. Has perfected the flip. The walls are covered in batter."
    }]
  }
};

// Continue with more rewrites...
// Note: This is a partial implementation - you'd need to add all 105 cards

console.log(`Loaded ${cardsData.cards.length} cards`);
console.log('This script needs to be expanded with all 105 card rewrites.');
