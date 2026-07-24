import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:4322';
const slug = process.env.SLUG || 'seo-word-list';
const out = '/tmp/seo-review';

const browser = await chromium.launch();
const errors = [];

async function shoot(page, name) {
  await page.screenshot({ path: `${out}-${name}.png`, fullPage: name === 'full' });
}

// Desktop landing
const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
desktop.on('console', (m) => { if (m.type() === 'error') errors.push(`[console] ${m.text()}`); });
desktop.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
const resp = await desktop.goto(`${BASE}/training/${slug}`, { waitUntil: 'networkidle' });
console.log('landing status', resp.status());
await desktop.waitForTimeout(1500);
await shoot(desktop, 'full');
await shoot(desktop, 'viewport');

// Categories section in view
const cats = await desktop.$('.categories');
if (cats) { await cats.scrollIntoViewIfNeeded(); await desktop.waitForTimeout(400); await desktop.screenshot({ path: `${out}-categories.png` }); }
// Pitch section
const pitch = await desktop.$('.pitch');
if (pitch) { await pitch.scrollIntoViewIfNeeded(); await desktop.waitForTimeout(400); await desktop.screenshot({ path: `${out}-pitch.png` }); }

// Mobile
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(`${BASE}/training/${slug}`, { waitUntil: 'networkidle' });
await mobile.waitForTimeout(800);
await mobile.screenshot({ path: `${out}-mobile.png`, fullPage: true });

console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
await browser.close();
