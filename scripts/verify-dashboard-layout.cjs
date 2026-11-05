const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const build = path.join(root, 'build');
const output = path.join(root, 'output', 'dashboard-layout');
const sizes = [
  { width: 1440, height: 1024 }, { width: 1024, height: 900 },
  { width: 390, height: 844 }, { width: 320, height: 800 },
  { width: 768, height: 1024 },
];

async function verifyLayout(page, name) {
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
      statusOverlap: rows.some(row => rect(row.firstElementChild).right > rect(row.lastElementChild).left + 1),
      missionOverlap: missionRows.some(row => rect(row.children[1]).right > rect(row.lastElementChild).left + 1),
      map: document.querySelector('.map-view') ? { width: rect(document.querySelector('.map-view')).width, height: rect(document.querySelector('.map-view')).height, canvasHeight: rect(document.querySelector('.map-view-canvas')).height } : null,
    };
  });
  assert(measurements.documentWidth <= measurements.width, `${name}: overflow ${measurements.documentWidth}/${measurements.width}`);
  assert(!measurements.headerOverlap, `${name}: header overlap`);
  assert(!measurements.statusOverlap, `${name}: status row overlap`);
  assert(!measurements.missionOverlap, `${name}: mission row overlap`);
  if (measurements.map) {
    assert(measurements.map.width >= 240, `${name}: map too narrow`);
    assert(measurements.map.height >= 280, `${name}: map too short`);
    assert(measurements.map.canvasHeight >= 280, `${name}: collapsed map canvas`);
  }
  return measurements;
}

async function openMenu(page) {
  await page.getByRole('button', { name: 'เปิด/ปิดเมนู', exact: true }).click();
  await page.waitForTimeout(230);
  await page.getByRole('navigation', { name: 'เมนูหลัก' }).waitFor();
}

(async () => {
  await fs.mkdir(output, { recursive: true });
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
      const page = await browser.newPage({ viewport: size, locale: 'th-TH', timezoneId: 'Asia/Bangkok', deviceScaleFactor: 1 });
      const errors = [];
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
      const home = await verifyLayout(page, `Home ${size.width}`);
      await page.screenshot({ path: path.join(output, `home-${size.width}.png`), fullPage: true });

      await page.getByRole('button', { name: 'เริ่มภารกิจ', exact: true }).click();
      const popup = page.getByRole('dialog', { name: 'ข้อมูลการพ่นยา' });
      await popup.getByLabel('จำนวนชนิดน้ำยา').selectOption('5');
      assert.equal(await popup.getByLabel('ชื่อยา', { exact: true }).count(), 5);
      assert(await popup.evaluate(element => element.scrollWidth <= element.clientWidth));
      await popup.getByRole('button', { name: 'ปิดหน้าต่าง' }).click();
      await openMenu(page);
      if (size.width < 1280) {
        await page.getByRole('button', { name: 'ปิดเมนูด้านหลัง' }).click({ position: { x: size.width - 10, y: size.height / 2 } });
        await openMenu(page);
        await page.keyboard.press('Escape');
        await openMenu(page);
      } else {
        assert(await page.locator('.page-area').evaluate(element => parseFloat(getComputedStyle(element).marginLeft) > 0));
        await verifyLayout(page, `Home sidebar open ${size.width}`);
      }
      await page.getByRole('navigation', { name: 'เมนูหลัก' }).getByRole('link', { name: 'ภารกิจ / แผนที่' }).click();
      await page.getByRole('heading', { level: 1, name: 'ภารกิจ / แผนที่' }).waitFor();
      await page.locator('.map-view-canvas[aria-busy="false"]').waitFor({ timeout: 20000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(700);
      assert.equal(await page.locator('.navbar.open').count(), 0);
      const mission = await verifyLayout(page, `Mission ${size.width}`);
      await page.screenshot({ path: path.join(output, `mission-${size.width}.png`), fullPage: true });
      await page.getByRole('button', { name: 'เริ่มภารกิจ', exact: true }).click();
      await page.getByRole('dialog', { name: 'ข้อมูลการพ่นยา' }).waitFor();
      await page.getByRole('button', { name: 'ยกเลิก', exact: true }).click();

      await openMenu(page);
      await page.getByRole('navigation', { name: 'เมนูหลัก' }).getByRole('link', { name: 'ประวัติการทำงาน' }).click();
      await page.getByRole('heading', { level: 1, name: 'ประวัติการทำงาน' }).waitFor();
      await page.waitForTimeout(250);
      assert.equal(await page.evaluate(() => window.scrollY), 0, 'Route starts at the top');
      const history = await verifyLayout(page, `History ${size.width}`);
      assert.equal(await page.locator('.history-table tbody > tr').count(), 10);
      await page.screenshot({ path: path.join(output, `history-${size.width}.png`), fullPage: true });
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
      assert.deepEqual(errors, [], `Browser runtime errors at ${size.width}`);
      results.push({ ...size, home, mission, history, pagination: true, popup: true, navigation: true });
      console.log(`PASS ${size.width}px: Home, Mission, History, no overlap/overflow, map sizing, popup, drawer, filters, pagination`);
      await page.close();
    }
    await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify(results, null, 2));
  } finally {
    if (browser) await browser.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
