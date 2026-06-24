/**
 * Screenshot capture script — versi fix (auth persist via sessionStorage)
 * Setelah login, auth disimpan ke sessionStorage oleh Zustand persist,
 * sehingga state tidak hilang saat navigasi page.goto().
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8081';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Helper: simpan screenshot ──────────────────────────────────
async function shot(page, filename, desc) {
  await delay(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, filename), fullPage: true });
  console.log(`✅ ${filename}  →  ${desc}`);
}

// ─── Helper: inject sessionStorage auth ──────────────────────────
// Setelah page.goto(), Zustand akan hydrate dari sessionStorage ini
async function injectAuth(page, authPayload) {
  await page.evaluate((payload) => {
    window.sessionStorage.setItem('auth-storage', JSON.stringify({
      state: payload,
      version: 0,
    }));
  }, authPayload);
}

// ─── Helper: ambil auth state dari page ──────────────────────────
async function readAuth(page) {
  return page.evaluate(() => {
    try {
      const raw = window.sessionStorage.getItem('auth-storage');
      return raw ? JSON.parse(raw).state : null;
    } catch (_) { return null; }
  });
}

// ─── Helper: navigasi + inject auth lalu reload ──────────────────
async function goTo(page, url, authPayload) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await delay(300);
  // Inject ulang auth ke sessionStorage (karena goto bisa clear state)
  if (authPayload) await injectAuth(page, authPayload);
  // Reload supaya Zustand hydrate dari sessionStorage yang sudah di-inject
  await page.reload({ waitUntil: 'networkidle0', timeout: 30000 });
  await delay(1500);
}

// ─── Helper: login via UI dan kembalikan auth payload ──────────────
async function loginAsCustomer(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 30000 });
  await delay(1000);
  const buttons = await page.$$('button, [role="button"]');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Customer Demo')) {
      await btn.click();
      console.log('  → Clicked Customer Demo');
      await delay(4000);
      return readAuth(page);
    }
  }
  return null;
}

async function loginAsTenant(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 30000 });
  await delay(1000);
  const buttons = await page.$$('button, [role="button"]');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Mitra Demo')) {
      await btn.click();
      console.log('  → Clicked Mitra Demo');
      await delay(4000);
      return readAuth(page);
    }
  }
  return null;
}

async function loginAsAdmin(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 30000 });
  await delay(1000);
  // Ketik email admin
  const inputs = await page.$$('input');
  if (inputs.length > 0) {
    await inputs[0].click({ clickCount: 3 });
    await inputs[0].type('admin@gmail.com');
  }
  await delay(500);
  const buttons = await page.$$('button, [role="button"]');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && (text.trim() === 'Masuk' || text.includes('Masuk'))) {
      await btn.click();
      console.log('  → Clicked Masuk (Admin)');
      await delay(4000);
      return readAuth(page);
    }
  }
  return null;
}

// ─── MAIN ─────────────────────────────────────────────────────────
async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // ══════════════════════════════════════════════════════════════
  // BAGIAN 1: AUTH PAGES (tidak perlu login)
  // ══════════════════════════════════════════════════════════════
  console.log('\n🔑 [Auth Pages]');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 30000 });
  await shot(page, '01_login.png', 'Halaman Login');

  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0', timeout: 30000 });
  await shot(page, '02_register.png', 'Halaman Register');

  await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle0', timeout: 30000 });
  await shot(page, '03_forgot_password.png', 'Halaman Lupa Password');

  // ══════════════════════════════════════════════════════════════
  // BAGIAN 2: CUSTOMER PAGES
  // ══════════════════════════════════════════════════════════════
  console.log('\n👤 [Customer Pages] — Login sebagai Customer...');
  const customerAuth = await loginAsCustomer(page);
  if (!customerAuth) {
    console.error('❌ Gagal login sebagai customer!');
    await browser.close(); return;
  }
  console.log('  ✔ Auth customer tersimpan:', customerAuth.user?.email);
  await shot(page, '04_customer_home.png', 'Beranda Customer');

  const customerPages = [
    ['05_customer_calendar.png',          '/customer/calendar',                                      'Kalender Menu Harian'],
    ['06_customer_tenant_detail.png',     '/customer/tenant-detail?id=x&name=Warung%20Bu%20Kris',   'Detail Mitra Catering'],
    ['07_customer_menu_detail.png',       '/customer/menu-detail?id=x&name=Ayam%20Penyet&price=18000', 'Detail Menu Makanan'],
    ['08_customer_cart.png',              '/customer/cart',                                           'Keranjang Belanja'],
    ['09_customer_checkout_shipping.png', '/customer/checkout-shipping',                             'Checkout & Pengiriman'],
    ['10_customer_orders.png',            '/customer/orders',                                        'Riwayat Pesanan'],
    ['11_customer_order_detail.png',      '/customer/order-detail?orderId=x',                        'Detail Pesanan'],
    ['12_customer_add_review.png',        '/customer/add-review?menuId=x&menuName=Ayam%20Goreng',    'Form Tulis Ulasan'],
    ['13_customer_profile.png',           '/customer/profile',                                       'Profil Customer'],
    ['14_customer_edit_profile.png',      '/customer/edit-profile',                                  'Edit Profil Customer'],
    ['15_customer_notifications.png',     '/customer/notifications',                                 'Notifikasi Customer'],
  ];

  for (const [filename, urlPath, desc] of customerPages) {
    await goTo(page, `${BASE_URL}${urlPath}`, customerAuth);
    await shot(page, filename, desc);
  }

  // ══════════════════════════════════════════════════════════════
  // PAYMENT (akses bebas setelah customer login)
  // ══════════════════════════════════════════════════════════════
  console.log('\n💳 [Payment Pages]');
  await goTo(page, `${BASE_URL}/payment-simulator?orderId=1&totalAmount=50000`, customerAuth);
  await shot(page, '16_payment_simulator.png', 'Simulator Pembayaran');

  await goTo(page, `${BASE_URL}/payment-status?status=success&orderId=1`, customerAuth);
  await shot(page, '17_payment_status.png', 'Status Pembayaran');

  // ══════════════════════════════════════════════════════════════
  // BAGIAN 3: TENANT PAGES
  // ══════════════════════════════════════════════════════════════
  console.log('\n🍳 [Tenant Pages] — Login sebagai Tenant...');
  const tenantAuth = await loginAsTenant(page);
  if (!tenantAuth) {
    console.error('❌ Gagal login sebagai tenant!');
    await browser.close(); return;
  }
  console.log('  ✔ Auth tenant tersimpan:', tenantAuth.user?.email);
  await shot(page, '18_tenant_dashboard.png', 'Dashboard Tenant');

  const tenantPages = [
    ['19_tenant_kitchen_rekap.png',   '/tenant/kitchen-rekap',    'Rekap Dapur Harian'],
    ['20_tenant_menus.png',           '/tenant/menus',             'Kelola Menu Masakan'],
    ['21_tenant_add_menu.png',        '/tenant/add-menu',          'Form Tambah Menu'],
    ['22_tenant_edit_menu.png',       '/tenant/edit-menu?id=x&name=Ayam&price=18000&maxQuota=20&availableAt=2026-07-01', 'Form Edit Menu'],
    ['23_tenant_orders.png',          '/tenant/orders',            'Daftar Pesanan Masuk'],
    ['24_tenant_order_detail.png',    '/tenant/order-detail?orderId=x', 'Detail Pesanan Tenant'],
    ['25_tenant_profile_settings.png','/tenant/profile-settings',  'Pengaturan Profil Toko'],
    ['26_tenant_reviews.png',         '/tenant/reviews-list',      'Daftar Ulasan Customer'],
    ['27_tenant_notifications.png',   '/tenant/notifications',     'Notifikasi Tenant'],
  ];

  for (const [filename, urlPath, desc] of tenantPages) {
    await goTo(page, `${BASE_URL}${urlPath}`, tenantAuth);
    await shot(page, filename, desc);
  }

  // ══════════════════════════════════════════════════════════════
  // BAGIAN 4: ADMIN PAGES
  // ══════════════════════════════════════════════════════════════
  console.log('\n🛡️ [Admin Pages] — Login sebagai Admin...');
  const adminAuth = await loginAsAdmin(page);
  if (!adminAuth) {
    console.error('❌ Gagal login sebagai admin!');
    await browser.close(); return;
  }
  console.log('  ✔ Auth admin tersimpan:', adminAuth.user?.email || '(check store)');
  await shot(page, '28_admin_dashboard.png', 'Dashboard Super Admin');

  const adminPages = [
    ['29_admin_tenants.png', '/admin/tenants', 'Manajemen Mitra Catering'],
    ['30_admin_users.png',   '/admin/users',   'Manajemen Pengguna'],
  ];
  for (const [filename, urlPath, desc] of adminPages) {
    await goTo(page, `${BASE_URL}${urlPath}`, adminAuth);
    await shot(page, filename, desc);
  }

  await browser.close();

  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png'));
  console.log(`\n🎉 Selesai! ${files.length} screenshot tersimpan di:\n   ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
