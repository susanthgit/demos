import { chromium } from 'playwright';

const FILE = 'file:///' + 'C:/Users/ssutheesh/Downloads/Cowork-Customer-Dashboard-v54.html';
const OUT = 'C:/Users/ssutheesh/.copilot/session-state/abec0395-ec20-4911-aa9b-82fe2c76f5a3/files';
const W = 1440, H = 900;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(FILE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
// dismiss overlays: "before you share" modal, 7-step tour, what's-new toast
for (const label of ['I understand', 'Skip', 'Later', 'Stop']) {
  try { await page.getByText(label, { exact: false }).first().click({ timeout: 2000 }); await page.waitForTimeout(300); } catch {}
}
await page.keyboard.press('Escape').catch(()=>{});
await page.waitForTimeout(600);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);

const total = await page.evaluate(() => document.body.scrollHeight);
console.log('full height:', total);
const tiles = Math.min(18, Math.ceil(total / H));
for (let i = 0; i < tiles; i++) {
  await page.evaluate((yy) => window.scrollTo(0, yy), i * H);
  await page.waitForTimeout(350);
  const n = String(i + 1).padStart(2, '0');
  await page.screenshot({ path: `${OUT}/ref-html-tile-${n}.png` });
}
console.log('wrote', tiles, 'tiles');
await browser.close();
