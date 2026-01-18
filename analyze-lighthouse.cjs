const report = require('./lighthouse-report-mobile.report.json');

console.log('=== Lighthouse Mobile Analysis ===\n');

// Performance issues
console.log('PERFORMANCE METRICS:');
const perfAudits = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'cumulative-layout-shift',
  'total-blocking-time',
  'speed-index',
];
perfAudits.forEach(id => {
  const audit = report.audits[id];
  if (audit) {
    console.log(`  ${audit.title}: ${audit.displayValue} (${Math.round(audit.score * 100)}/100)`);
  }
});

// Accessibility issues
console.log('\nACCESSIBILITY ISSUES (< 95):');
Object.entries(report.audits).forEach(([id, audit]) => {
  if (
    audit.score !== null &&
    audit.score < 0.95 &&
    (id.includes('aria') ||
      id.includes('label') ||
      id.includes('name-role') ||
      id.includes('contrast') ||
      id.includes('link-name'))
  ) {
    console.log(`  ${audit.title}: ${Math.round(audit.score * 100)}/100`);
  }
});

// Best Practices issues
console.log('\nBEST PRACTICES ISSUES (< 90):');
Object.entries(report.audits).forEach(([id, audit]) => {
  if (audit.score !== null && audit.score < 0.9) {
    console.log(`  ${audit.title}: ${Math.round(audit.score * 100)}/100`);
  }
});

// Opportunities
console.log('\nPERFORMANCE OPPORTUNITIES:');
if (
  report.audits['modern-landing-page-hero'] &&
  report.audits['modern-landing-page-hero'].score < 1
) {
  console.log(
    `  ${report.audits['modern-landing-page-hero'].title}: ${report.audits['modern-landing-page-hero'].displayValue}`
  );
}
if (
  report.audits['offscreen-images'] &&
  report.audits['offscreen-images'].details &&
  report.audits['offscreen-images'].details.items
) {
  const items = report.audits['offscreen-images'].details.items;
  if (items.length > 0) {
    console.log(`  Offscreen images: ${items.length} images`);
  }
}
if (
  report.audits['render-blocking-resources'] &&
  report.audits['render-blocking-resources'].details &&
  report.audits['render-blocking-resources'].details.items
) {
  const items = report.audits['render-blocking-resources'].details.items;
  if (items.length > 0) {
    console.log(`  Render-blocking resources: ${items.length} items`);
  }
}
if (
  report.audits['unminified-css'] &&
  report.audits['unminified-css'].details &&
  report.audits['unminified-css'].details.items
) {
  const items = report.audits['unminified-css'].details.items;
  if (items.length > 0) {
    console.log(`  Unminified CSS: ${items.length} files`);
  }
}
if (
  report.audits['unminified-javascript'] &&
  report.audits['unminified-javascript'].details &&
  report.audits['unminified-javascript'].details.items
) {
  const items = report.audits['unminified-javascript'].details.items;
  if (items.length > 0) {
    console.log(`  Unminified JavaScript: ${items.length} files`);
  }
}
if (
  report.audits['unused-javascript'] &&
  report.audits['unused-javascript'].details &&
  report.audits['unused-javascript'].details.items
) {
  const items = report.audits['unused-javascript'].details.items;
  if (items.length > 0) {
    console.log(
      `  Unused JavaScript: ${items.length} files, ${report.audits['unused-javascript'].details.overallSavingsBytes} bytes wasted`
    );
  }
}
