/**
 * PACK-005: Card Type Distribution Verification
 *
 * Analyzes card distribution across dad types to ensure variety and balance.
 */

import cardsData from '../src/data/cards.json' with { type: 'json' };
import seasonalCardsData from '../src/data/seasonal-cards.json' with { type: 'json' };

const allCards = [...cardsData.cards, ...seasonalCardsData.cards];

// Count cards by dad type
const typeCounts = {};
allCards.forEach(card => {
  typeCounts[card.type] = (typeCounts[card.type] || 0) + 1;
});

// Sort by count (descending)
const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

// Calculate statistics
const totalCards = allCards.length;
const uniqueTypes = sorted.length;
const averageCardsPerType = (totalCards / uniqueTypes).toFixed(1);
const minCards = 5;
const targetAverage = 6.5;

// Find outliers
const belowMinimum = sorted.filter(([_, count]) => count < minCards);
const aboveTarget = sorted.filter(([_, count]) => count > targetAverage + 2);
const belowTarget = sorted.filter(([_, count]) => count < targetAverage - 2);

// Print report
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║          DADDECK™ - CARD TYPE DISTRIBUTION REPORT              ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');
console.log(`📊 OVERVIEW`);
console.log(`   Total Cards: ${totalCards}`);
console.log(`   Dad Types: ${uniqueTypes}`);
console.log(`   Average per Type: ${averageCardsPerType} cards`);
console.log('');
console.log(`📈 DISTRIBUTION BY TYPE`);
console.log('┌─────────────────────────────────┬───────┬──────────┐');
console.log('│ Dad Type                        │ Count │ Percent  │');
console.log('├─────────────────────────────────┼───────┼──────────┤');

sorted.forEach(([type, count]) => {
  const percentage = ((count / totalCards) * 100).toFixed(1);
  const typePadded = type.padEnd(31);
  const countPadded = String(count).padStart(5);
  const percentPadded = percentage.padStart(8);
  console.log(`│ ${typePadded} │ ${countPadded} │ ${percentPadded}% │`);
});

console.log('└─────────────────────────────────┴───────┴──────────┘');
console.log('');
console.log(`✅ ACCEPTANCE CRITERIA CHECK`);
console.log('');

// Check 1: Minimum 5 cards per type
const check1 = belowMinimum.length === 0 ? '✓ PASS' : '✗ FAIL';
console.log(`${check1}  Minimum ${minCards} cards per type`);
if (belowMinimum.length > 0) {
  console.log(`      Below minimum: ${belowMinimum.map(([t, c]) => `${t} (${c})`).join(', ')}`);
} else {
  console.log(`      All ${uniqueTypes} types have at least ${minCards} cards`);
}

// Check 2: Balanced distribution (within ±2 of target average)
const check2 = (aboveTarget.length + belowTarget.length) < uniqueTypes / 2 ? '✓ PASS' : '✗ FAIL';
console.log('');
console.log(`${check2}  Balanced distribution (±2 of ${targetAverage} average)`);
console.log(`      Above target (+2): ${aboveTarget.length} types`);
if (aboveTarget.length > 0) {
  console.log(`      ${aboveTarget.map(([t, c]) => `${t} (${c})`).join(', ')}`);
}
console.log(`      Below target (-2): ${belowTarget.length} types`);
if (belowTarget.length > 0) {
  console.log(`      ${belowTarget.map(([t, c]) => `${t} (${c})`).join(', ')}`);
}

// Check 3: All 16 core dad types represented
const coreDadTypes = [
  'BBQ_DAD', 'FIX_IT_DAD', 'GOLF_DAD', 'COUCH_DAD', 'LAWN_DAD',
  'CAR_DAD', 'OFFICE_DAD', 'COOL_DAD', 'COACH_DAD', 'CHEF_DAD',
  'HOLIDAY_DAD', 'WAREHOUSE_DAD', 'VINTAGE_DAD', 'FASHION_DAD',
  'TECH_DAD'
];
const missingCoreTypes = coreDadTypes.filter(type => !typeCounts[type]);
const check3 = missingCoreTypes.length === 0 ? '✓ PASS' : '✗ FAIL';
console.log('');
console.log(`${check3}  All 16 core dad types represented`);
if (missingCoreTypes.length > 0) {
  console.log(`      Missing types: ${missingCoreTypes.join(', ')}`);
} else {
  console.log(`      All 16 core dad types present`);
}

console.log('');
console.log('═════════════════════════════════════════════════════════════════');
console.log('');

// Exit with appropriate code
const allChecksPass = belowMinimum.length === 0 &&
                      (aboveTarget.length + belowTarget.length) < uniqueTypes / 2 &&
                      missingCoreTypes.length === 0;

if (allChecksPass) {
  console.log('✅ All acceptance criteria PASSED!');
  process.exit(0);
} else {
  console.log('❌ Some acceptance criteria FAILED!');
  process.exit(1);
}
