import { chromium } from 'playwright';

const BASE = 'http://localhost:4293/cowork/meet-cowork';
const OUT = 'C:/Users/ssutheesh/.copilot/session-state/abec0395-ec20-4911-aa9b-82fe2c76f5a3/files/qa';
const N = 13;
const longWait = new Set([3, 4]); // agentLoop + coworkChat animate longer

const browser = await chromium.launch();
for (const theme of ['day', 'night']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(`${BASE}?theme=${theme}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  for (let i = 0; i < N; i++) {
    await page.waitForTimeout(longWait.has(i) ? 3600 : 1500);
    const n = String(i).padStart(2, '0');
    await page.screenshot({ path: `${OUT}/meet-${theme}-${n}.png` });
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(250);
  }
  await page.close();
}

// peg probe: rapidly run through all scenes, then measure responsiveness
const probe = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await probe.goto(BASE, { waitUntil: 'networkidle' });
for (let i = 0; i < N + 2; i++) { await probe.keyboard.press('ArrowRight'); await probe.waitForTimeout(120); }
const rafMs = await probe.evaluate(() => new Promise((res) => {
  let f = 0; const t0 = performance.now();
  const tick = () => { if (++f >= 60) return res(performance.now() - t0); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}));
console.log('PEG PROBE: 60 frames in', Math.round(rafMs), 'ms', rafMs < 1500 ? '-> OK (responsive)' : '-> SLOW/PEG?');
await browser.close();
console.log('done');
