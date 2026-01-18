/**
 * Generate SVG artwork for all cards
 *
 * Usage: bun run generate-svgs
 */

import { generateAllCardSVGs } from '../src/lib/art/svg-generator';
import { getAllCards } from '../src/lib/cards/database';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  console.log('🎨 Generating SVG artwork for all cards...\n');

  // Get all cards
  const cards = getAllCards();
  console.log(`Found ${cards.length} cards in database`);

  // Output directory
  const outputDir = path.join(process.cwd(), 'public/images/cards');
  console.log(`Output directory: ${outputDir}\n`);

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('✅ Created output directory\n');
  }

  // Generate SVGs
  console.log('Generating SVG files...');
  const generatedPaths = await generateAllCardSVGs(cards, outputDir);

  console.log(`\n✅ Successfully generated ${generatedPaths.length} SVG files!\n`);

  // Show sample of generated files
  console.log('Sample generated files:');
  generatedPaths.slice(0, 5).forEach(p => {
    console.log(`  - ${path.basename(p)}`);
  });

  if (generatedPaths.length > 5) {
    console.log(`  ... and ${generatedPaths.length - 5} more`);
  }

  console.log('\n🎉 All card artwork generated successfully!');
}

main().catch((error) => {
  console.error('❌ Error generating card artwork:', error);
  process.exit(1);
});
