/**
 * Ambil ulang screenshot halaman 01, 02, 03 (auth pages - tidak perlu login)
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8081';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, filename, desc) {
  await delay(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, filename), fullPage: true });
  console.log(`✅ ${filename}  →  ${desc}`);
}

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  console.log('🔑 Mengambil halaman auth (tanpa login)...');

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 30000 });
  await shot(page, '01_login.png', 'Halaman Login');

  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0', timeout: 30000 });
  await shot(page, '02_register.png', 'Halaman Register');

  await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle0', timeout: 30000 });
  await shot(page, '03_forgot_password.png', 'Halaman Lupa Password');

  await browser.close();
  console.log('\n🎉 Selesai! Cek folder screenshots/');
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
