import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:4322';
const slugs = ['seo-word-list', 'advertising-word-list'];

const browser = await chromium.launch();

for (const slug of slugs) {
  const short = slug === 'seo-word-list' ? 'seo' : 'adv';
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[console] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

  await page.goto(`${BASE}/training/${slug}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // dismiss cookie banner
  const no = await page.$('button:has-text("No thanks")');
  if (no) { await no.click(); await page.waitForTimeout(300); }

  // walk the page to trigger every reveal
  const total = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < total; y += 600) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(800);

  // capture each major section
  const sections = await page.evaluate(() =>
    [...document.querySelectorAll('main section, main .hero, main > div')].map((el, i) => ({
      i,
      cls: el.className.split(' ')[0] || el.tagName.toLowerCase(),
      top: el.getBoundingClientRect().top + window.scrollY,
      h: el.offsetHeight,
    })).filter(s => s.h > 100)
  );
  console.log(slug, 'sections:', sections.map(s => `${s.cls}(${Math.round(s.h)})`).join(', '));

  let n = 0;
  for (const s of sections) {
    await page.evaluate((top) => window.scrollTo(0, Math.max(0, top - 80)), s.top);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `/tmp/shots-${short}-${n}-${s.cls}.png` });
    n++;
    // tall sections: capture a second frame lower down
    if (s.h > 1100) {
      await page.evaluate((top) => window.scrollTo(0, top + 900), s.top);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `/tmp/shots-${short}-${n}-${s.cls}-b.png` });
      n++;
    }
  }
  console.log(slug, 'ERRORS:', errors.length ? errors.join('\n') : 'none');
  await page.close();
}

await browser.close();
