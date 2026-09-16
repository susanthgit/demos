import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const BASE = process.env.GOVERNANCE_QA_URL || 'http://127.0.0.1:4294/copilot/governance';
const OUT = path.relative(process.cwd(), String.raw`C:\Users\ssutheesh\.scout\copilot\session-state\7269ed79-83da-4b6e-927c-df15c9481478\files\governance-web-qa-v2`);
await fs.mkdir(OUT, { recursive: true });
const ids = ['start', 'risk', 'request', 'permissions', 'discover', 'discovery-access', 'labels', 'dlp', 'agents', 'credentials', 'lifecycle', 'audit', 'content-evidence', 'respond', 'pilot', 'next'];
const errors = [];
const checks = [];
const layout = [];
const browser = await chromium.launch();
const watch = (page) => {
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
};
async function visit(page, id) {
  await page.evaluate((hash) => { location.hash = hash; }, id);
  await page.waitForFunction((hash) => document.getElementById(hash)?.classList.contains('is-active'), id);
  await page.locator(`#${id} img`).evaluateAll(async (images) => {
    for (const image of images) await image.decode();
  });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function active(page, id) {
  await page.waitForFunction((hash) => document.getElementById(hash)?.classList.contains('is-active'), id);
  assert.equal(await page.locator('[data-scene].is-active').getAttribute('id'), id);
}
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }, { width: 390, height: 844 }]) {
    for (const theme of ['dark', 'light']) {
      const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
      watch(page);
      await page.goto(`${BASE}?scoutTheme=${theme}`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
      assert.equal(await page.locator('[data-scene]').count(), 16);
      for (const id of ids) {
        await visit(page, id);
        assert.equal(await page.locator('[data-scene]:visible').count(), 1);
        assert.ok(await page.locator(`#${id} h1, #${id} h2`).isVisible());
        assert.ok(await page.locator(`#${id} .gov-sources a`).count());
        const metrics = await page.evaluate(() => {
          const viewportWidth = window.innerWidth;
          const nodes = Array.from(document.querySelectorAll('.is-active *, .gov-topbar *, .gov-bottom *'));
          const overflowing = nodes.filter((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            if (!rect.width || !rect.height || style.display === 'none' || style.position === 'absolute') return false;
            if (element.closest('details:not([open])') && element.tagName !== 'SUMMARY') return false;
            return rect.right > viewportWidth + 2 || rect.left < -2;
          }).map((element) => `${element.tagName}.${element.className}`);
          const brokenImages = Array.from(document.querySelectorAll('.is-active img')).filter((image) => !image.complete || !image.naturalWidth).length;
          return { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, viewportWidth, overflowing, brokenImages };
        });
        assert.ok(metrics.width <= viewport.width + 2, `${theme}/${viewport.width}/${id} has horizontal overflow: ${metrics.width}`);
        assert.deepEqual(metrics.overflowing, [], `${theme}/${viewport.width}/${id} content exceeds the viewport`);
        assert.equal(metrics.brokenImages, 0, `${id} screenshot did not load`);
        if (viewport.width > 900) {
          assert.ok(metrics.height <= viewport.height + 2, `${theme}/${viewport.width}/${id} pushes navigation below the screen`);
        }
        layout.push({ theme, viewport: `${viewport.width}x${viewport.height}`, id, pageHeight: metrics.height });
        if (viewport.width === 1440) {
          await page.screenshot({ path: path.join(OUT, `${id}-${theme}-1440x900.png`), animations: 'disabled' });
        }
        if (viewport.width === 390 && ['start', 'permissions', 'content-evidence'].includes(id)) {
          await page.screenshot({ path: path.join(OUT, `${id}-${theme}-390x844.png`), fullPage: true, animations: 'disabled' });
        }
      }
      checks.push(`16 scenes: ${theme}, ${viewport.width}x${viewport.height}, readable layout and loaded screenshots`);
      await page.close();
    }
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  watch(page);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.getByRole('link', { name: 'Begin the conversation' }).click();
  await active(page, 'risk');
  await page.getByRole('link', { name: /Who can reach the source/ }).click();
  await active(page, 'permissions');
  await page.locator('[data-prev]').click();
  await active(page, 'request');
  await page.locator('[data-next]').click();
  await active(page, 'permissions');
  await page.locator('[data-menu]').click();
  assert.equal(await page.locator('[data-chapter-link]').count(), 16);
  await page.locator('[data-chapter-link][href="#audit"]').click();
  await active(page, 'audit');
  assert.equal(await page.locator('[data-chapter-dialog]').evaluate((dialog) => dialog.open), false);
  await page.locator('[data-menu]').click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-menu]').evaluate((button) => document.activeElement === button), true);
  await page.locator('.gov-skip').focus();
  await page.keyboard.press('Enter');
  await active(page, 'audit');
  assert.equal(await page.locator('#gov-main').evaluate((main) => document.activeElement === main), true);
  await page.evaluate(() => { window.print = () => { document.body.dataset.printRequested = 'true'; }; });
  await page.locator('[data-menu]').click();
  await page.locator('[data-print]').click();
  assert.equal(await page.locator('body').getAttribute('data-print-requested'), 'true');
  assert.equal(await page.locator('[data-chapter-dialog]').evaluate((dialog) => dialog.open), false);
  checks.push('Begin, buyer jump, previous/next, chapter navigation and menu Escape/focus');

  await visit(page, 'permissions');
  for (let mask = 0; mask < 8; mask++) {
    const acl = Boolean(mask & 4), rac = Boolean(mask & 2), group = Boolean(mask & 1);
    await page.locator('[data-permission="acl"]').setChecked(acl);
    await page.locator('[data-permission="rac"]').setChecked(rac);
    await page.locator('[data-permission="group"]').setChecked(group);
    const expected = acl && (!rac || group);
    assert.equal(await page.locator('[data-access-result]').getAttribute('data-state'), expected ? 'allowed' : 'denied', `Truth table ACL=${acl}, RAC=${rac}, group=${group}`);
  }
  for (const [preset, expected] of [['permission', 'denied'], ['group', 'denied'], ['both', 'allowed']]) {
    await page.locator(`[data-preset="${preset}"]`).click();
    assert.equal(await page.locator('[data-access-result]').getAttribute('data-state'), expected);
    assert.equal(await page.locator('[data-permission="rac"]').isChecked(), true);
    assert.equal(await page.locator(`[data-preset="${preset}"]`).getAttribute('aria-pressed'), 'true');
  }
  for (const gate of ['acl', 'rac', 'group']) {
    await page.locator(`[data-gate-phrase="${gate}"]`).click();
    assert.equal(await page.locator('[data-gate-control].is-lit').getAttribute('data-gate-control'), gate);
    await active(page, 'permissions');
  }
  await page.locator('[data-permission-reset]').click();
  assert.equal(await page.locator('[data-gate-control].is-lit').count(), 0);
  assert.equal(await page.locator('[data-access-result]').getAttribute('data-state'), 'denied');
  await page.locator('[data-preset="both"]').click();
  await page.locator('[data-permission="group"]').focus();
  const old = await page.locator('[data-permission="group"]').isChecked();
  await page.keyboard.press('Space');
  assert.equal(await page.locator('[data-permission="group"]').isChecked(), !old);
  await active(page, 'permissions');
  await page.locator('[data-preset="both"]').focus();
  await page.keyboard.press('ArrowRight');
  await active(page, 'permissions');
  await page.keyboard.press('Space');
  assert.equal(await page.locator('[data-access-result]').getAttribute('data-state'), 'allowed');
  await active(page, 'permissions');
  await page.locator('#permissions-title').focus();
  await page.keyboard.press('ArrowRight');
  await active(page, 'discover');
  await page.keyboard.press('ArrowLeft');
  await active(page, 'permissions');
  await page.keyboard.press('Space');
  await active(page, 'discover');
  checks.push('All 8 permission truth-table combinations, 3 presets, keyboard isolation and global navigation');

  await visit(page, 'request');
  for (let i = 0; i < 5; i++) {
    await page.locator(`[data-flow-step="${i}"]`).click();
    assert.equal(await page.locator('[data-flow-count]').textContent(), `${i + 1} / 5`);
  }
  await page.locator('[data-flow-reset]').click();
  assert.equal(await page.locator('[data-flow-count]').textContent(), '1 / 5');
  await visit(page, 'dlp');
  for (const [mode, word] of [['label', 'EXCLUDE SUPPORTED CONTENT'], ['prompt', 'PREVIEW / PROMPT SITS'], ['simulation', 'OBSERVE']]) {
    await page.locator(`[data-dlp="${mode}"]`).click();
    assert.equal(await page.locator('[data-dlp-status]').textContent(), word);
    await active(page, 'dlp');
  }
  await visit(page, 'credentials');
  for (const [identity, word] of [['maker', 'Maker’s connection'], ['automated', 'Configured connection'], ['user', 'User’s connection']]) {
    await page.locator(`[data-identity="${identity}"]`).click();
    assert.equal(await page.locator('[data-identity-name]').textContent(), word);
  }
  await visit(page, 'audit');
  for (const field of ['host', 'resource', 'message', 'who']) {
    await page.locator(`[data-audit-field="${field}"]`).click();
    assert.equal(await page.locator('[data-event-field].is-highlighted').getAttribute('data-event-field'), field);
  }
  checks.push('All 5 request steps, 3 DLP states, 3 identity models and 4 audit field highlights');

  await visit(page, 'discovery-access');
  await page.locator('[data-control="rac"]').click();
  assert.match(await page.locator('[data-control-detail]').textContent(), /channel sites have exceptions/);
  assert.equal(await page.locator('[data-capture-kind="rcd"] [data-image-crop]').getAttribute('data-image-crop'), 'rac');
  await page.locator('[data-control="rcd"]').click();
  assert.equal(await page.locator('[data-capture-kind="rcd"] [data-image-crop]').getAttribute('data-image-crop'), 'rcd');
  await page.locator('[data-rcd-context]').click();
  assert.equal(await page.locator('[data-capture-kind="rcd"] [data-image-crop]').getAttribute('data-image-crop'), 'settings');
  await page.locator('#discovery-access [data-zoom]').click();
  assert.equal(await page.locator('[data-zoom-dialog]').evaluate((dialog) => dialog.open), true);
  assert.equal(await page.locator('[data-close-zoom]').evaluate((button) => document.activeElement === button), true);
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => Boolean(document.activeElement?.closest('[data-zoom-dialog]'))), true);
  }
  await page.keyboard.press('ArrowRight');
  await active(page, 'discovery-access');
  await page.locator('[data-zoom-size]').click();
  assert.equal(await page.locator('.gov-zoom-viewport').evaluate((element) => element.classList.contains('is-actual')), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-zoom-dialog]').evaluate((dialog) => dialog.open), false);
  assert.equal(await page.locator('#discovery-access [data-zoom]').evaluate((button) => document.activeElement === button), true);
  await visit(page, 'content-evidence');
  for (const crop of ['response', 'resources', 'prompt']) {
    await page.locator(`[data-evidence-crop="${crop}"]`).click();
    assert.equal(await page.locator('[data-capture-kind="dspm"] [data-image-crop]').getAttribute('data-image-crop'), crop);
    const geometry = await page.locator('[data-capture-kind="dspm"] [data-crop-image]').evaluate((image) => ({
      natural: image.naturalWidth, rendered: image.getBoundingClientRect().width,
    }));
    assert.equal(geometry.natural, 965);
    assert.ok(geometry.rendered > 500);
  }
  await page.locator('#content-evidence [data-zoom]').click();
  assert.match(await page.locator('[data-zoom-image]').getAttribute('src'), /dspm-public-demo/);
  await page.locator('[data-close-zoom]').click();
  checks.push('RCD/RAC focus crops, full settings crop, all 3 DSPM detail views, unchanged original images, modal focus trap, actual-size zoom and Escape focus return');

  for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(viewport);
    for (const theme of ['dark', 'light']) {
      if (await page.locator('html').getAttribute('data-theme') !== theme) {
        await page.locator('[data-theme-toggle]').click();
      }
      const tokens = await page.evaluate(() => {
        const style = getComputedStyle(document.documentElement);
        return {
          paper: style.getPropertyValue('--cp-bg').trim().toLowerCase(),
          accent: style.getPropertyValue('--cp-accent').trim().toLowerCase(),
          grid: getComputedStyle(document.body).backgroundSize,
        };
      });
      assert.equal(tokens.paper, theme === 'dark' ? '#1b1916' : '#f4efe3');
      assert.equal(tokens.accent, theme === 'dark' ? '#9db6dc' : '#22385c');
      assert.deepEqual(tokens.grid.split(',').map((size) => size.trim()), ['46px 46px', '46px 46px']);
      for (const [id, attribute, states] of [
        ['dlp', 'data-dlp', ['simulation', 'label', 'prompt']],
        ['discovery-access', 'data-control', ['rcd', 'rac']],
        ['content-evidence', 'data-evidence-crop', ['prompt', 'response', 'resources']],
        ['credentials', 'data-identity', ['user', 'maker', 'automated']],
      ]) {
        await visit(page, id);
        for (const state of states) {
          await page.locator(`[${attribute}="${state}"]`).click();
          const height = await page.evaluate(() => document.documentElement.scrollHeight);
          assert.ok(height <= viewport.height + 2, `${theme}/${viewport.width}/${id}/${state} pushes navigation below the screen`);
          if (viewport.width === 1440 && ['discovery-access', 'content-evidence'].includes(id)) {
            await page.screenshot({ path: path.join(OUT, `${id}-${state}-${theme}.png`), animations: 'disabled' });
          }
        }
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  if (await page.locator('html').getAttribute('data-theme') !== 'dark') {
    await page.locator('[data-theme-toggle]').click();
  }
  checks.push('Reference notebook palette/grid and every screenshot, DLP and connection state fit both desktop viewports');

  await visit(page, 'pilot');
  for (const input of await page.locator('[data-readiness]').all()) await input.check();
  assert.match(await page.locator('[data-readiness-status]').textContent(), /^6 of 6/);
  await visit(page, 'audit');
  await visit(page, 'pilot');
  assert.equal(await page.locator('[data-readiness]:checked').count(), 6);
  await page.locator('[data-readiness-reset]').click();
  assert.equal(await page.locator('[data-readiness]:checked').count(), 0);
  await page.locator('[data-readiness]').first().check();
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-readiness]:checked').count(), 0);
  await page.locator('[data-notes-toggle]').click();
  assert.equal(await page.locator('#pilot .gov-notes').evaluate((details) => details.open), true);
  await page.locator('[data-notes-toggle]').click();
  assert.equal(await page.locator('#pilot .gov-notes').evaluate((details) => details.open), false);
  checks.push('Independent scene state, readiness reset/reload, presenter notes toggle');

  await page.locator('[data-theme-toggle]').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  assert.match(page.url(), /scoutTheme=light/);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.goto(`${BASE}?scoutTheme=bad#unknown`, { waitUntil: 'networkidle' });
  await active(page, 'start');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  assert.match(page.url(), /#start$/);
  await page.goto(`${BASE}?theme=day#permissions`, { waitUntil: 'networkidle' });
  await active(page, 'permissions');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.goto(`${BASE}?theme=night#content-evidence`, { waitUntil: 'networkidle' });
  await active(page, 'content-evidence');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.locator('[data-fullscreen]').click();
  await page.waitForFunction(() => Boolean(document.fullscreenElement));
  assert.equal(await page.evaluate(() => Boolean(document.fullscreenElement)), true);
  await page.locator('[data-fullscreen]').click();
  await page.waitForFunction(() => !document.fullscreenElement);
  assert.equal(await page.evaluate(() => Boolean(document.fullscreenElement)), false);
  checks.push('Dark default, both explicit themes, invalid theme fallback, day/night aliases, unknown hash, reload deep links and fullscreen');

  await page.emulateMedia({ media: 'print' });
  assert.equal(await page.locator('[data-scene]:visible').count(), 16);
  assert.equal(await page.locator('.gov-topbar').isVisible(), false);
  assert.equal(await page.locator('body').evaluate((body) => getComputedStyle(body).backgroundColor), 'rgb(244, 239, 227)');
  const pdf = await page.pdf({ path: path.join(OUT, 'governance-print.pdf'), printBackground: true, preferCSSPageSize: true });
  // Chromium emits an uncompressed page dictionary for each printed page.
  const printedPages = (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
  assert.equal(printedPages, 16, 'Each scene must remain on a single printed page');
  checks.push('Print includes all 16 scenes and presenter notes without splitting scenes across pages');
  await page.close();

  const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  watch(noJs);
  await noJs.goto(BASE, { waitUntil: 'networkidle' });
  assert.equal(await noJs.locator('[data-scene]:visible').count(), 16);
  assert.equal(await noJs.locator('noscript').first().isVisible(), true);
  assert.ok(await noJs.locator('#content-evidence .gov-reading-original img').isVisible());
  await noJs.locator('#audit .gov-notes summary').click();
  assert.equal(await noJs.locator('#audit .gov-notes').evaluate((details) => details.open), true);
  checks.push('No-JavaScript reading fallback displays all 16 scenes, screenshot evidence and native notes');
  await noJs.close();
  for (const theme of ['dark', 'light']) {
    const composites = [];
    for (const [index, id] of ids.entries()) {
      const input = await sharp(path.join(OUT, `${id}-${theme}-1440x900.png`)).resize(360, 225).png().toBuffer();
      composites.push({ input, left: (index % 4) * 360, top: Math.floor(index / 4) * 225 });
    }
    await sharp({ create: { width: 1440, height: 900, channels: 3, background: theme === 'dark' ? '#1b1916' : '#F4EFE3' } })
      .composite(composites).jpeg({ quality: 92 }).toFile(path.join(OUT, `${theme}-contact-sheet.jpg`));
  }
  assert.deepEqual(errors, [], 'Browser console errors or uncaught exceptions');
  checks.push('No browser console errors or uncaught exceptions');
  const results = { status: 'PASS', checkedAt: new Date().toISOString(), baseUrl: BASE, checks, layout, errors };
  await fs.writeFile(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`PASS: ${checks.length} check groups. 96 scene/theme/viewport combinations. 8-case permission truth table.`);
  console.log(`Screenshots, print PDF and results: ${path.resolve(OUT)}`);
  const taller = layout.filter((item) => item.pageHeight > Number(item.viewport.split('x')[1]) + 2 && !item.viewport.startsWith('390'));
  console.log(`Desktop scenes needing vertical scroll (not clipped): ${JSON.stringify(taller)}`);
} finally {
  await browser.close();
}
