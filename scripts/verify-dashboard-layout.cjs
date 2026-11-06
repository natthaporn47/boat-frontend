const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const build = path.join(root, 'build');
// Layout-only mode avoids consuming the real provider's daily quota.
const fixtureMap = process.env.VERIFY_MAP_MODE === 'fixture';
const sizes = [
  { width: 1920, height: 1080 }, { width: 1440, height: 900 },
  { width: 1366, height: 768 }, { width: 1024, height: 768 },
  { width: 768, height: 1024 }, { width: 390, height: 844 },
  { width: 375, height: 667 }, { width: 320, height: 800 },
].filter(size => !process.env.VERIFY_WIDTH || size.width === Number(process.env.VERIFY_WIDTH));

async function verifyLayout(page, name) {
  if (await page.locator('.map-view').count() && !page.mapMessages.some(message => /Maps Demo Key limit reached/i.test(message))) {
    try { await page.locator(fixtureMap ? '.map-view-canvas .layout-map-fixture' : '.map-view-canvas .gm-style').waitFor({ timeout: 10000 }); }
    catch (error) {
      if (!page.mapMessages.some(message => /Maps Demo Key limit reached/i.test(message))) throw error;
    }
  }
  const measurements = await page.evaluate(() => {
    const rect = element => element.getBoundingClientRect();
    const header = document.querySelector('.page-title');
    const right = document.querySelector('.header-right');
    const h = rect(header), r = rect(right);
    const rows = [...document.querySelectorAll('.system-status-row')];
    const missionRows = [...document.querySelectorAll('.mission-info-row')];
    return {
      width: innerWidth, documentWidth: document.documentElement.scrollWidth,
      headerOverlap: h.bottom > r.top + 2 && r.bottom > h.top + 2 && h.right > r.left + 2,
      statusOverlap: rows.some(row => rect(row.firstElementChild).bottom > rect(row.lastElementChild).top + 1 && rect(row.firstElementChild).right > rect(row.lastElementChild).left + 1),
      missionOverlap: missionRows.some(row => rect(row.children[1]).right > rect(row.lastElementChild).left + 1),
      map: document.querySelector('.map-view') ? { width: rect(document.querySelector('.map-view')).width, height: rect(document.querySelector('.map-view')).height, canvasHeight: rect(document.querySelector('.map-view-canvas')).height, rendered: Boolean(document.querySelector('.map-view-canvas .gm-style')), fixture: Boolean(document.querySelector('.map-view-canvas .layout-map-fixture')), error: document.querySelector('.map-view-message[role=alert]')?.textContent || null } : null,
    };
  });
  assert(measurements.documentWidth <= measurements.width, `${name}: overflow ${measurements.documentWidth}/${measurements.width}`);
  assert(!measurements.headerOverlap, `${name}: header overlap`);
  assert(!measurements.statusOverlap, `${name}: status row overlap`);
  assert(!measurements.missionOverlap, `${name}: mission row overlap`);
  if (measurements.map) {
    const quotaReached = page.mapMessages.some(message => /Maps Demo Key limit reached/i.test(message));
    measurements.map.providerStatus = fixtureMap ? 'layout-fixture-only' : measurements.map.rendered ? 'rendered' : quotaReached ? 'demo-key-daily-quota-reached' : 'unavailable';
    assert((fixtureMap && measurements.map.fixture) || measurements.map.rendered || quotaReached, `${name}: unexpected Google Maps failure (${measurements.map.error || 'no map element'})`);
    assert(measurements.map.width >= 240, `${name}: map too narrow`);
    assert(measurements.map.height >= 280, `${name}: map too short`);
    assert(measurements.map.canvasHeight >= 280, `${name}: collapsed map canvas`);
  }
  return measurements;
}

async function openMenu(page) {
  const toggle = page.getByRole('button', { name: 'เปิด/ปิดเมนู', exact: true });
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await toggle.tap();
  else await toggle.click();
  const overlap = await page.evaluate(() => new Promise(resolve => {
    const started = performance.now();
    let maximumDifference = 0;
    const sample = () => {
      if (innerWidth >= 768) {
        const sidebar = document.querySelector('.navbar').getBoundingClientRect();
        const content = document.querySelector('.page-area').getBoundingClientRect();
        maximumDifference = Math.max(maximumDifference, Math.abs(sidebar.right - content.left));
      }
      if (performance.now() - started < 280) requestAnimationFrame(sample);
      else resolve(maximumDifference);
    };
    sample();
  }));
  assert(overlap < 1, 'Sidebar and content stay aligned throughout the transition');
  await page.getByRole('navigation', { name: 'เมนูหลัก' }).waitFor();
}

(async () => {
  const server = http.createServer(async (request, response) => {
    try {
      const relative = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/boat-frontend\/?/, '').replace(/^\/+/, '');
      const target = path.resolve(build, relative || 'index.html');
      if (!target.startsWith(build + path.sep)) { response.writeHead(403).end(); return; }
      const bytes = await fs.readFile(target);
      const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' }[path.extname(target)];
      response.writeHead(200, { 'Content-Type': type || 'application/octet-stream' }).end(bytes);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  const results = [];
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    for (const size of sizes) {
      const page = await browser.newPage({ viewport: size, hasTouch: size.width < 768, locale: 'th-TH', timezoneId: 'Asia/Bangkok', deviceScaleFactor: 1 });
      if (fixtureMap) {
        await page.route('https://maps.googleapis.com/**', route => route.abort());
        await page.addInitScript(() => {
          class LayoutMap {
            constructor(container) {
              const surface = document.createElement('div');
              surface.className = 'layout-map-fixture';
              surface.style.cssText = 'width:100%;height:100%;display:grid;place-items:center;background:#f1f5f9;color:#64748b';
              surface.textContent = 'Map layout test fixture';
              container.appendChild(surface);
            }
            unbindAll() {}
          }
          window.google = { maps: { importLibrary: async () => ({ Map: LayoutMap }) } };
        });
      }
      const errors = [];
      page.mapMessages = [];
      page.on('console', message => {
        if (/Google Maps|Maps Demo Key|ApiNotActivated|InvalidKey|Referer|Quota|Billing/i.test(message.text())) {
          page.mapMessages.push(message.text().replace(/AIza[\w-]+/g, '[redacted]').replace(/https?:\/\/[^\s]+/g, '[url]'));
        }
      });
      page.on('pageerror', error => errors.push(error.message));
      // UI checks never contact the physical boat or send control requests.
      await page.route('http://100.73.198.53:8000/**', route => route.abort());
      await page.goto(`http://127.0.0.1:${server.address().port}/boat-frontend/`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { level: 1, name: 'หน้าหลัก', exact: true }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.locator('.map-view-canvas[aria-busy="false"]').waitFor({ timeout: 20000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1500);
      assert.equal(await page.locator('.navbar').count(), 1);
      assert.equal(await page.locator('.page-header').count(), 1, 'One shared header');
      const sidebar = page.getByRole('navigation', { name: 'เมนูหลัก' });
      if (size.width >= 768) {
        assert.equal(Math.round((await sidebar.boundingBox()).width), 76, 'Desktop starts icon-only');
        assert.equal(await page.locator('.menu-label').first().evaluate(element => getComputedStyle(element).visibility), 'hidden');
        assert.equal(await page.locator('.page-area').evaluate(element => Math.round(element.getBoundingClientRect().left)), 76);
      } else {
        assert.equal(await page.locator('.navbar').getAttribute('inert'), '');
        assert.equal(await page.locator('.page-area').evaluate(element => Math.round(element.getBoundingClientRect().left)), 0);
      }
      if (size.width >= 768) {
        const inactiveLink = sidebar.locator('a[href="#/history"]');
        const activeLink = sidebar.locator('a[aria-current="page"]');
        const activeColor = await activeLink.evaluate(el => getComputedStyle(el).backgroundColor);
        await inactiveLink.hover();
        await page.getByRole('tooltip').waitFor();
        await page.waitForTimeout(250);
        const tooltipBounds = await page.getByRole('tooltip').boundingBox();
        assert(tooltipBounds.x >= 76, 'Tooltip is not clipped inside the rail');
        const hoverColor = await inactiveLink.evaluate(el => getComputedStyle(el).backgroundColor);
        assert.notEqual(hoverColor, activeColor, 'Hover and active states differ');
        await page.mouse.move(size.width - 10, 10);
        await page.getByRole('tooltip').waitFor({ state: 'hidden' });
        await page.waitForTimeout(250);
        assert.equal(await activeLink.evaluate(el => getComputedStyle(el).backgroundColor), activeColor);
      }
      const home = await verifyLayout(page, `Home ${size.width}`);

      await page.getByRole('button', { name: 'เริ่มภารกิจ', exact: true }).click();
      const popup = page.getByRole('dialog', { name: 'ข้อมูลการพ่นยา' });
      await popup.getByLabel('จำนวนชนิดน้ำยา').selectOption('5');
      assert.equal(await popup.getByLabel('ชื่อยา', { exact: true }).count(), 5);
      assert(await popup.evaluate(element => element.scrollWidth <= element.clientWidth));
      await page.keyboard.press('Escape');
      await popup.waitFor({ state: 'hidden' });
      assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden', 'Popup releases scroll lock');
      await page.getByRole('button', { name: 'เริ่มภารกิจ', exact: true }).click();
      await popup.getByRole('button', { name: 'ปิดหน้าต่าง' }).click();
      await openMenu(page);
      if (size.width < 768) {
        assert.equal(await page.locator('.page-area').evaluate(element => Math.round(element.getBoundingClientRect().left)), 0, 'Drawer never pushes content');
        assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
        await page.keyboard.press('Shift+Tab');
        assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'ประวัติการทำงาน', 'Drawer traps reverse tab focus');
        await page.getByRole('button', { name: 'ปิดเมนูด้านหลัง' }).click({ position: { x: size.width - 10, y: size.height / 2 } });
        await openMenu(page);
        await page.keyboard.press('Escape');
        await openMenu(page);
        await page.getByRole('button', { name: 'ปิดเมนู', exact: true }).click();
        await openMenu(page);
      } else {
        assert.equal(Math.round((await sidebar.boundingBox()).width), 248, 'Expanded sidebar fits Thai labels');
        assert.equal(await page.locator('.page-area').evaluate(element => Math.round(element.getBoundingClientRect().left)), 248);
        assert.equal(await page.locator('.navigation-backdrop').count(), 0);
        await verifyLayout(page, `Home sidebar open ${size.width}`);
      }
      await page.getByRole('navigation', { name: 'เมนูหลัก' }).getByRole('link', { name: 'ภารกิจ / แผนที่' }).click();
      await page.getByRole('heading', { level: 1, name: 'ภารกิจ / แผนที่' }).waitFor();
      await page.locator('.map-view-canvas[aria-busy="false"]').waitFor({ timeout: 20000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(700);
      assert.equal(await page.locator('.navbar.open').count(), 0);
      if (size.width >= 768) {
        await page.waitForTimeout(300);
        assert.equal(Math.round((await sidebar.boundingBox()).width), 76, 'Desktop collapses after selecting a page');
        assert.equal(await sidebar.getByRole('link', { name: 'ภารกิจ / แผนที่' }).getAttribute('aria-current'), 'page');
      }
      const mission = await verifyLayout(page, `Mission ${size.width}`);
      if (size.width >= 768) {
        await openMenu(page);
        await verifyLayout(page, `Mission expanded sidebar ${size.width}`);
        assert.equal(await page.locator('.page-area').evaluate(el => Math.round(el.getBoundingClientRect().left)), 248);


        await openMenu(page);
      }
      await page.getByRole('button', { name: 'เริ่มภารกิจ', exact: true }).click();
      await page.getByRole('dialog', { name: 'ข้อมูลการพ่นยา' }).waitFor();
      await page.getByRole('button', { name: 'ยกเลิก', exact: true }).click();

      await openMenu(page);
      await page.getByRole('navigation', { name: 'เมนูหลัก' }).getByRole('link', { name: 'ประวัติการทำงาน' }).click();
      await page.getByRole('heading', { level: 1, name: 'ประวัติการทำงาน' }).waitFor();
      await page.waitForTimeout(250);
      assert.equal(await page.evaluate(() => window.scrollY), 0, 'Route starts at the top');
      const history = await verifyLayout(page, `History ${size.width}`);
      await page.evaluate(() => window.scrollTo(0, 400));
      assert.equal(await page.locator('.page-header').evaluate(el => Math.round(el.getBoundingClientRect().top)), 0, 'Header stays sticky');
      await page.evaluate(() => window.scrollTo(0, 0));
      if (size.width >= 768) {
        assert.equal(await sidebar.getByRole('link', { name: 'ประวัติการทำงาน' }).getAttribute('aria-current'), 'page');
      }
      assert.equal(await page.locator('.history-table tbody > tr').count(), 10);
      if (size.width >= 768) {
        await openMenu(page);
        await verifyLayout(page, `History expanded sidebar ${size.width}`);
        assert.equal(await page.locator('.page-area').evaluate(el => Math.round(el.getBoundingClientRect().left)), 248);
        await openMenu(page);
      }
      await page.getByRole('button', { name: 'ถัดไป', exact: true }).click();
      await page.getByText('แสดง 11–20 จาก 24 รายการ', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'หน้าที่ 3', exact: true }).click();
      assert.equal(await page.locator('.history-table tbody > tr').count(), 4);
      await page.getByLabel('วันที่เริ่มต้น').fill('2026-11-03');
      await page.getByLabel('วันที่สิ้นสุด').fill('2026-11-03');
      await page.getByRole('button', { name: 'กรองข้อมูล', exact: true }).click();
      await page.getByText('พบ 2 รายการ', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'ดูรายละเอียด DEMO-023', exact: true }).click();
      await page.getByText('ไม่ได้ใช้น้ำยาในภารกิจนี้', { exact: true }).waitFor();
      await verifyLayout(page, `History expanded ${size.width}`);
      await page.getByLabel('สถานะภารกิจ', { exact: true }).selectOption('STOPPED');
      await page.getByRole('button', { name: 'กรองข้อมูล', exact: true }).click();
      await page.getByText('พบ 1 รายการ', { exact: true }).waitFor();
      assert.equal(await page.locator('.history-table tbody > tr').count(), 1);
      await page.getByRole('button', { name: 'ล้างตัวกรอง', exact: true }).click();
      await page.getByText('พบ 24 รายการ', { exact: true }).waitFor();
      // Resize across the drawer breakpoint while open; latent states must clear.
      await page.evaluate(() => window.scrollTo(0, 0));
      await openMenu(page);
      const nextWidth = size.width >= 768 ? 767 : 768;
      await page.setViewportSize({ width: nextWidth, height: size.height });
      await page.waitForTimeout(350);
      assert.equal(await page.locator('.navbar.open').count(), 0);
      assert.equal(await page.locator('.navigation-backdrop').count(), 0);
      assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
      await verifyLayout(page, `After breakpoint resize ${size.width} to ${nextWidth}`);
      assert.deepEqual(errors, [], `Browser runtime errors at ${size.width}`);
      results.push({ ...size, home, mission, history, pagination: true, popup: true, navigation: true });
      console.log(`PASS ${size.width}px (${size.width < 768 ? 'touch + keyboard' : 'mouse + keyboard'}): Home, Mission, History, no overlap/overflow, map sizing, popup, drawer, filters, pagination`);
      await page.close();
    }
    console.log(JSON.stringify({ mapMode: fixtureMap ? 'layout-fixture-only' : 'live-provider', results }, null, 2));
  } finally {
    if (browser) await browser.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
