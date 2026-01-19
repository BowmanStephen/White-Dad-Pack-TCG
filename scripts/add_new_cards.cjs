#!/usr/bin/env node

const fs = require('fs');

// Read the current cards
const content = fs.readFileSync('./src/data/cards.json', 'utf-8');
const cards = JSON.parse(content);

// New cards to add (just the structure, we'll append them)
const newCards = require('./new_cards_data.json');

// Add new cards to existing cards
cards.cards.push(...newCards);

// Write back to file with proper formatting
fs.writeFileSync('./src/data/cards.json', JSON.stringify(cards, null, 2));

console.log(`✅ Added ${newCards.length} new cards!`);
console.log(`📊 Total cards: ${cards.cards.length}`);
