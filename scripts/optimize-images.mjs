#!/usr/bin/env node
/**
 * Image Optimization Script for DadDeck™
 *
 * Optimizes PNG/JPG images in public/ directory using sharp.
 * Reduces file sizes while maintaining visual quality.
 *
 * Target sizes:
 * - Card images: Max 500KB
 * - UI images: Max 100KB
 *
 * Quality settings:
 * - PNG: Lossless compression (zlib level 9)
 * - JPG: Quality 85
 * - WebP: Quality 85 (converted from PNG for better compression)
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function findImages(dir, extensions = ['.png', '.jpg', '.jpeg', '.webp']) {
  const images = [];

  function traverse(currentDir) {
    const entries = readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip _optimized directory
        if (entry.name !== '_optimized') {
          traverse(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = entry.name.toLowerCase().slice(entry.name.lastIndexOf('.'));
        if (extensions.includes(ext)) {
          const stats = statSync(fullPath);
          images.push({
            path: fullPath,
            relativePath: fullPath.replace(publicDir + '/', ''),
            size: stats.size,
          });
        }
      }
    }
  }

  traverse(dir);
  return images.sort((a, b) => b.size - a.size); // Sort by size descending
}

async function optimizeWithSharp() {
  log('🖼️  DadDeck Image Optimizer', 'cyan');
  log('═══════════════════════════════\n', 'dim');

  // Check if sharp is installed
  let sharp;
  try {
    sharp = (await import('sharp')).default;
    log('✓ sharp found - using for optimization\n', 'green');
  } catch {
    log('⚠ sharp not found - installing...', 'yellow');
    log('  Run: bun add -D sharp\n', 'dim');
    log('For now, files will be copied without optimization.\n', 'yellow');

    // Skip optimization if sharp is not available
    log('Build continuing with original images...\n', 'dim');
    return;
  }

  const images = await findImages(publicDir);

  if (images.length === 0) {
    log('No images found to optimize.\n', 'dim');
    return;
  }

  log(`Found ${images.length} images\n`, 'cyan');

  const results = {
    optimized: 0,
    skipped: 0,
    totalOriginal: 0,
    totalOptimized: 0,
  };

  const maxSize = {
    card: 500 * 1024, // 500KB for cards
    ui: 100 * 1024,   // 100KB for UI elements
  };

  for (const image of images) {
    const isCard = image.relativePath.startsWith('cards/');
    const targetMaxSize = isCard ? maxSize.card : maxSize.ui;
    const relativePath = image.relativePath;

    results.totalOriginal += image.size;

    // Skip if already small enough
    if (image.size <= targetMaxSize) {
      results.skipped++;
      continue;
    }

    try {
      const img = sharp(image.path);
      const metadata = await img.metadata();

      let optimized;
      let outputPath = image.path;

      // Process based on format
      if (metadata.format === 'png') {
        // Try to optimize PNG first
        optimized = await img
          .png({ compressionLevel: 9, adaptiveFiltering: true })
          .toBuffer();

        // If still too large, convert to WebP
        if (optimized.length > targetMaxSize) {
          log(`  ${relativePath}: ${formatBytes(image.size)} → `, 'dim');
          optimized = await img
            .webp({ quality: 85, effort: 6 })
            .toBuffer();
          outputPath = image.path.replace('.png', '.webp');
          log(`${formatBytes(optimized.length)} (WebP)`, 'green');
        } else {
          log(`  ${relativePath}: ${formatBytes(image.size)} → ${formatBytes(optimized.length)}`, 'green');
        }
      } else if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
        optimized = await img
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
        log(`  ${relativePath}: ${formatBytes(image.size)} → ${formatBytes(optimized.length)}`, 'green');
      } else if (metadata.format === 'webp') {
        optimized = await img
          .webp({ quality: 85, effort: 6 })
          .toBuffer();
        log(`  ${relativePath}: ${formatBytes(image.size)} → ${formatBytes(optimized.length)}`, 'green');
      }

      // Write optimized image
      const fs = await import('fs/promises');
      await fs.writeFile(outputPath, optimized);

      results.optimized++;
      results.totalOptimized += image.size - optimized.length;

      // If we converted to WebP, remove original PNG
      if (outputPath !== image.path) {
        await fs.unlink(image.path);
      }
    } catch (error) {
      log(`  ✗ ${relativePath}: ${error.message}`, 'yellow');
    }
  }

  log('\n═══════════════════════════════', 'dim');
  log('Summary:', 'cyan');
  log(`  Optimized: ${results.optimized} files`, 'green');
  log(`  Skipped:   ${results.skipped} files (already optimal)`, 'dim');
  log(`  Saved:     ${formatBytes(results.totalOptimized)}`, 'green');
  log(`  Original: ${formatBytes(results.totalOriginal)}`, 'dim');
  log(`  Final:    ${formatBytes(results.totalOriginal - results.totalOptimized)}`, 'dim');
  log('\n✓ Image optimization complete!\n', 'green');
}

// Run optimization
optimizeWithSharp().catch(console.error);
