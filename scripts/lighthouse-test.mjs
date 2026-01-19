#!/usr/bin/env node

/**
 * Lighthouse Performance Test Script
 * Tests performance on various simulated network conditions
 */

import { spawn } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  port: 4321,
  baseUrl: 'http://localhost:4321',
  thresholds: {
    performance: 90,
    accessibility: 95,
    'best-practices': 90,
    seo: 95,
    pwa: 80,
  },
};

// Test scenarios
const SCENARIOS = [
  {
    name: 'Desktop - Fast 4G',
    flags: {
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
      },
    },
  },
  {
    name: 'Mobile - Fast 4G',
    flags: {
      formFactor: 'mobile',
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 4,
      },
    },
  },
  {
    name: 'Mobile - Slow 4G',
    flags: {
      formFactor: 'mobile',
      throttling: {
        rttMs: 150,
        throughputKbps: 1.6 * 1024,
        cpuSlowdownMultiplier: 4,
      },
    },
  },
  {
    name: 'Mobile - 3G',
    flags: {
      formFactor: 'mobile',
      throttling: {
        rttMs: 300,
        throughputKbps: 400,
        cpuSlowdownMultiplier: 4,
      },
    },
  },
];

/**
 * Run Lighthouse test using spawn
 */
function runLighthouse(url, scenario, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      url,
      '--output=json',
      '--output=html',
      `--output-path=${outputPath}`,
      '--chrome-flags="--headless --no-sandbox --disable-gpu"',
      '--quiet',
      '--only-categories=performance,accessibility,best-practices,seo,pwa',
      `--throttling.rttMs=${scenario.flags.throttling.rttMs}`,
      `--throttling.throughputKbps=${scenario.flags.throttling.throughputKbps}`,
      `--throttling.cpuSlowdownMultiplier=${scenario.flags.throttling.cpuSlowdownMultiplier}`,
      `--emulated-form-factor=${scenario.flags.formFactor}`,
    ];

    const lighthouse = spawn('npx', ['lighthouse', ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: __dirname,
    });

    let stdout = '';
    let stderr = '';

    lighthouse.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    lighthouse.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    lighthouse.on('close', async (code) => {
      if (code !== 0) {
        reject(new Error(`Lighthouse failed with code ${code}: ${stderr}`));
        return;
      }

      try {
        const jsonPath = `${outputPath}.json`;
        const results = JSON.parse(await readFile(jsonPath, 'utf-8'));
        resolve({ results, jsonPath, htmlPath: `${outputPath}.html` });
      } catch (error) {
        reject(new Error(`Failed to read results: ${error.message}`));
      }
    });

    // Timeout after 2 minutes
    setTimeout(() => {
      lighthouse.kill();
      reject(new Error('Lighthouse test timed out'));
    }, 120000);
  });
}

/**
 * Format score for display
 */
function formatScore(score) {
  if (score === null) return 'N/A';
  const percentage = Math.round(score * 100);
  const color = percentage >= 90 ? '🟢' : percentage >= 50 ? '🟡' : '🔴';
  return `${color} ${percentage}`;
}

/**
 * Print results
 */
function printResults(scenario, results) {
  const categories = results.categories;
  const audits = results.audits;

  console.log(`\n📊 Results: ${scenario.name}`);
  console.log('═'.repeat(60));

  // Category scores
  console.log('\n📈 Category Scores:');
  Object.entries(categories).forEach(([key, category]) => {
    const score = formatScore(category.score);
    const threshold = CONFIG.thresholds[key];
    const passed = category.score * 100 >= threshold;
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${category.title.padEnd(20)} ${score}`);
  });

  // Key metrics
  console.log('\n⚡ Key Metrics:');
  const metrics = [
    { name: 'First Contentful Paint', audit: 'first-contentful-paint', unit: 's' },
    { name: 'Largest Contentful Paint', audit: 'largest-contentful-paint', unit: 's' },
    { name: 'Total Blocking Time', audit: 'total-blocking-time', unit: 'ms' },
    { name: 'Cumulative Layout Shift', audit: 'cumulative-layout-shift', unit: '' },
    { name: 'Speed Index', audit: 'speed-index', unit: 's' },
    { name: 'Time to Interactive', audit: 'interactive', unit: 's' },
  ];

  metrics.forEach(({ name, audit, unit }) => {
    const value = audits[audit]?.displayValue || 'N/A';
    console.log(`  ${name.padEnd(30)} ${value}`);
  });

  // Performance budget
  console.log('\n💾 Resource Sizes:');
  const resourceSizes = [
    { name: 'Total JS', audit: 'total-script-size' },
    { name: 'Total CSS', audit: 'total-css-size' },
    { name: 'Total Image Size', audit: 'total-image-size' },
  ];

  resourceSizes.forEach(({ name, audit }) => {
    const value = audits[audit]?.displayValue || 'N/A';
    console.log(`  ${name.padEnd(30)} ${value}`);
  });

  console.log('═'.repeat(60));
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 DadDeck Lighthouse Performance Test');
  console.log('═'.repeat(60));

  console.log(`\n📍 Testing URL: ${CONFIG.baseUrl}`);
  console.log('⚠️  Make sure "bun run preview" is running in another terminal\n');

  // Run tests for each scenario
  const allResults = [];

  for (const scenario of SCENARIOS) {
    const outputFile = join(__dirname, `../dist/lighthouse-${scenario.name.toLowerCase().replace(/\s+/g, '-')}`);

    console.log(`🚀 Testing: ${scenario.name}...`);

    try {
      const result = await runLighthouse(`${CONFIG.baseUrl}/`, scenario, outputFile);
      allResults.push({ scenario, ...result });
      printResults(scenario, result.results);
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
  }

  // Summary
  if (allResults.length > 0) {
    console.log('\n\n📋 Summary');
    console.log('═'.repeat(60));

    allResults.forEach(({ scenario, results }) => {
      const perfScore = Math.round(results.categories.performance.score * 100);
      const target = perfScore >= CONFIG.thresholds.performance ? '✅' : '❌';
      console.log(`${target} ${scenario.name.padEnd(25)} Performance: ${perfScore}`);
    });

    console.log('\n📁 Detailed reports saved in dist/:');
    allResults.forEach(({ htmlPath }) => {
      const fileName = htmlPath.split('/').pop();
      console.log(`  - ${fileName}`);
    });

    console.log('\n💡 Open HTML reports in browser for visual analysis');
  } else {
    console.log('\n❌ No tests completed successfully');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
