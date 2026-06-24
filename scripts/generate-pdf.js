/**
 * Generate PDF laporan layout aplikasi CateringKu
 * Nama   : M. Holil
 * NIM    : 23050770
 * Matkul : Pemrograman Mobile
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const OUTPUT_PDF = path.join(__dirname, '..', 'Laporan_Layout_CateringKu_M_Holil_23050770.pdf');

// Metadata mahasiswa
const STUDENT = {
  nama: 'M. Holil',
  nim: '23050770',
  matkul: 'Pemrograman Mobile',
};

// Daftar layout beserta nama halaman yang rapi
const LAYOUTS = [
  // Auth
  { file: '01_login.png',                   label: 'Halaman 1 – Login',                        section: 'AUTENTIKASI & REGISTRASI' },
  { file: '02_register.png',                label: 'Halaman 2 – Registrasi Akun',              section: null },
  { file: '03_forgot_password.png',         label: 'Halaman 3 – Lupa Password',                section: null },

  // Customer
  { file: '04_customer_home.png',           label: 'Halaman 4 – Beranda Customer',             section: 'HALAMAN CUSTOMER (PEMBELI)' },
  { file: '05_customer_calendar.png',       label: 'Halaman 5 – Kalender Menu Harian',         section: null },
  { file: '06_customer_tenant_detail.png',  label: 'Halaman 6 – Detail Mitra Catering',        section: null },
  { file: '07_customer_menu_detail.png',    label: 'Halaman 7 – Detail Menu Makanan',          section: null },
  { file: '08_customer_cart.png',           label: 'Halaman 8 – Keranjang Belanja',            section: null },
  { file: '09_customer_checkout_shipping.png', label: 'Halaman 9 – Checkout & Isi Pengiriman', section: null },
  { file: '10_customer_orders.png',         label: 'Halaman 10 – Riwayat Pesanan',             section: null },
  { file: '11_customer_order_detail.png',   label: 'Halaman 11 – Detail Pesanan',              section: null },
  { file: '12_customer_add_review.png',     label: 'Halaman 12 – Tambah Ulasan',               section: null },
  { file: '13_customer_profile.png',        label: 'Halaman 13 – Profil Customer',             section: null },
  { file: '14_customer_edit_profile.png',   label: 'Halaman 14 – Edit Profil Customer',        section: null },
  { file: '15_customer_notifications.png',  label: 'Halaman 15 – Notifikasi Customer',         section: null },

  // Payment
  { file: '16_payment_simulator.png',       label: 'Halaman 16 – Simulator Pembayaran',        section: 'HALAMAN PEMBAYARAN' },
  { file: '17_payment_status.png',          label: 'Halaman 17 – Status Pembayaran',           section: null },

  // Tenant
  { file: '18_tenant_dashboard.png',        label: 'Halaman 18 – Dashboard Mitra Catering',    section: 'HALAMAN MITRA CATERING (TENANT)' },
  { file: '19_tenant_kitchen_rekap.png',    label: 'Halaman 19 – Rekap Dapur Harian',          section: null },
  { file: '20_tenant_menus.png',            label: 'Halaman 20 – Kelola Menu Masakan',         section: null },
  { file: '21_tenant_add_menu.png',         label: 'Halaman 21 – Tambah Menu Baru',            section: null },
  { file: '22_tenant_edit_menu.png',        label: 'Halaman 22 – Edit Menu Masakan',           section: null },
  { file: '23_tenant_orders.png',           label: 'Halaman 23 – Daftar Pesanan Masuk',        section: null },
  { file: '24_tenant_order_detail.png',     label: 'Halaman 24 – Detail Pesanan Tenant',       section: null },
  { file: '25_tenant_profile_settings.png', label: 'Halaman 25 – Pengaturan Profil Toko',      section: null },
  { file: '26_tenant_reviews.png',          label: 'Halaman 26 – Daftar Ulasan Customer',      section: null },
  { file: '27_tenant_notifications.png',    label: 'Halaman 27 – Notifikasi Tenant',           section: null },

  // Admin
  { file: '28_admin_dashboard.png',         label: 'Halaman 28 – Dashboard Super Admin',       section: 'HALAMAN SUPER ADMINISTRATOR' },
  { file: '29_admin_tenants.png',           label: 'Halaman 29 – Manajemen Mitra Catering',    section: null },
  { file: '30_admin_users.png',             label: 'Halaman 30 – Manajemen Pengguna',          section: null },
];

// ─── Warna Tema ───────────────────────────────────────────────
const GREEN_DARK  = '#14532d';
const GREEN_MID   = '#16a34a';
const GREEN_LIGHT = '#dcfce7';
const GRAY_DARK   = '#1e293b';
const GRAY_MID    = '#475569';
const GRAY_LIGHT  = '#f1f5f9';

function drawRect(doc, x, y, w, h, color) {
  doc.save().rect(x, y, w, h).fill(color).restore();
}

function drawCoverPage(doc) {
  const W = doc.page.width;
  const H = doc.page.height;

  // Background gradient simulation (dua blok)
  drawRect(doc, 0, 0, W, H * 0.6, GREEN_DARK);
  drawRect(doc, 0, H * 0.6, W, H * 0.4, GRAY_LIGHT);

  // Decorative circles
  doc.save().circle(W - 60, 80, 120).fillOpacity(0.08).fill('#ffffff').restore();
  doc.save().circle(60, H * 0.55, 80).fillOpacity(0.06).fill('#ffffff').restore();

  // App logo area
  const logoY = 80;
  doc.save()
    .roundedRect(W / 2 - 45, logoY, 90, 90, 20)
    .fillOpacity(0.2).fill('#ffffff').restore();
  // Gunakan teks 'CK' karena emoji tidak didukung PDFKit (render jadi karakter aneh)
  doc.fillColor('#4ade80').fontSize(28).font('Helvetica-Bold')
    .text('CK', W / 2 - 20, logoY + 28, { lineBreak: false });

  // App Name
  doc.fillColor('#ffffff').fontSize(32).font('Helvetica-Bold')
    .text('CateringKu', 0, logoY + 110, { align: 'center' });
  doc.fillColor('#86efac').fontSize(13).font('Helvetica')
    .text('Aplikasi Pre-Order Catering Multi-Tenant', 0, logoY + 148, { align: 'center' });

  // Divider
  const divY = logoY + 185;
  drawRect(doc, W / 2 - 40, divY, 80, 2, '#4ade80');

  // Subtitle label
  doc.fillColor('#d1fae5').fontSize(11).font('Helvetica')
    .text('LAPORAN BUKTI LAYOUT APLIKASI MOBILE', 0, divY + 16, { align: 'center', characterSpacing: 1.5 });

  // ── Biodata Card ──
  const cardX = 60;
  const cardY = H * 0.6;
  const cardW = W - 120;
  const cardH = 145; // 3 rows saja (dikurangi 2 baris yang dihapus)

  doc.save().roundedRect(cardX, cardY, cardW, cardH, 12)
    .fillOpacity(1).fill('#ffffff')
    .fillOpacity(0.1).strokeColor(GREEN_MID).lineWidth(1.5).stroke()
    .restore();

  // Green accent bar kiri
  doc.save().roundedRect(cardX, cardY, 5, cardH, 3).fill(GREEN_MID).restore();

  // Header card
  doc.fillColor(GREEN_DARK).fontSize(11).font('Helvetica-Bold')
    .text('IDENTITAS MAHASISWA', cardX + 20, cardY + 18);
  drawRect(doc, cardX + 20, cardY + 33, cardW - 40, 1, '#e2e8f0');

  // Rows — hanya 3 baris
  const rows = [
    ['Nama',         STUDENT.nama],
    ['NIM',          STUDENT.nim],
    ['Mata Kuliah',  STUDENT.matkul],
  ];
  rows.forEach(([label, val], i) => {
    const ry = cardY + 48 + i * 28;
    doc.fillColor(GRAY_MID).fontSize(10).font('Helvetica')
      .text(label, cardX + 20, ry)
      .fillColor(GRAY_DARK).font('Helvetica-Bold')
      .text(`: ${val}`, cardX + 120, ry);
  });

  // Total layout badge
  const badgeX = W - cardX - 120;
  const badgeY = cardY + 48;
  doc.save().roundedRect(badgeX, badgeY, 110, 80, 10).fill(GREEN_LIGHT).restore();
  doc.fillColor(GREEN_DARK).fontSize(36).font('Helvetica-Bold')
    .text('30', badgeX, badgeY + 10, { width: 110, align: 'center' });
  doc.fillColor(GREEN_MID).fontSize(9).font('Helvetica')
    .text('Total Layout\nHalaman', badgeX, badgeY + 50, { width: 110, align: 'center' });

  // Footer
  doc.fillColor(GRAY_MID).fontSize(9).font('Helvetica')
    .text(`Dibuat: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}  •  Dibuat menggunakan Expo React Native`, 0, H - 40, { align: 'center' });
}

function drawSectionDivider(doc, sectionTitle) {
  doc.addPage();
  const W = doc.page.width;
  const H = doc.page.height;

  drawRect(doc, 0, 0, W, H, GREEN_DARK);
  doc.save().circle(W - 80, 100, 150).fillOpacity(0.07).fill('#ffffff').restore();
  doc.save().circle(80, H - 80, 100).fillOpacity(0.06).fill('#ffffff').restore();

  // Icon
  // Ganti emoji dengan simbol teks aman (PDFKit tidak support emoji)
  doc.save().roundedRect(W / 2 - 30, H / 2 - 100, 60, 60, 10).fill('#4ade80').restore();
  doc.fillColor(GREEN_DARK).fontSize(22).font('Helvetica-Bold')
    .text('[]', W / 2 - 14, H / 2 - 87, { lineBreak: false });

  doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
    .text(sectionTitle, 60, H / 2 - 20, { align: 'center', width: W - 120 });

  drawRect(doc, W / 2 - 50, H / 2 + 20, 100, 3, '#4ade80');

  doc.fillColor('#86efac').fontSize(11).font('Helvetica')
    .text('CateringKu — Laporan Layout Aplikasi Mobile', 0, H / 2 + 40, { align: 'center' });
}

function drawScreenshotPage(doc, imgPath, label, pageNum) {
  doc.addPage();
  const W = doc.page.width;
  const H = doc.page.height;

  // Header bar
  drawRect(doc, 0, 0, W, 65, GREEN_DARK);
  doc.save().circle(W - 30, 32, 55).fillOpacity(0.08).fill('#ffffff').restore();

  // Page number badge
  doc.save().circle(40, 32, 20).fill(GREEN_MID).restore();
  doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold')
    .text(String(pageNum), 28, 25, { width: 25, align: 'center' });

  // Label
  doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold')
    .text(label, 70, 18, { width: W - 100 });

  // Breadcrumb
  doc.fillColor('#86efac').fontSize(9).font('Helvetica')
    .text('CateringKu  •  M. Holil  •  NIM 23050770  •  Pemrograman Mobile', 70, 38, { width: W - 100 });

  // Image container
  const imgX = 30;
  const imgY = 80;
  const imgW = W - 60;
  const imgH = H - 110;

  // Shadow effect
  doc.save().roundedRect(imgX + 3, imgY + 3, imgW, imgH, 10).fillOpacity(0.12).fill('#000000').restore();

  // White card background
  doc.save().roundedRect(imgX, imgY, imgW, imgH, 10).fillOpacity(1).fill('#ffffff').stroke('#e2e8f0').restore();

  // Draw image (centered, scaled to fit with padding)
  try {
    const padding = 12;
    doc.image(imgPath, imgX + padding, imgY + padding, {
      width: imgW - padding * 2,
      height: imgH - padding * 2,
      fit: [imgW - padding * 2, imgH - padding * 2],
      align: 'center',
      valign: 'center',
    });
  } catch (e) {
    // If image fails, show placeholder
    doc.fillColor(GRAY_MID).fontSize(11)
      .text(`[Screenshot tidak tersedia: ${path.basename(imgPath)}]`, imgX + 20, imgY + imgH / 2 - 10, { width: imgW - 40, align: 'center' });
  }

  // Footer
  drawRect(doc, 0, H - 20, W, 20, GRAY_LIGHT);
  doc.fillColor(GRAY_MID).fontSize(8).font('Helvetica')
    .text(`${label}  |  CateringKu - Aplikasi Pre-Order Catering Multi-Tenant  |  NIM: 23050770`, 20, H - 15, { width: W - 40 });
}

// ─── Main ────────────────────────────────────────────────────────
async function generate() {
  console.log('🚀 Membuat PDF laporan...');

  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    info: {
      Title: 'Laporan Layout Aplikasi CateringKu',
      Author: STUDENT.nama,
      Subject: STUDENT.matkul,
      Keywords: 'CateringKu, Pemrograman Mobile, React Native, Expo',
    },
  });

  const stream = fs.createWriteStream(OUTPUT_PDF);
  doc.pipe(stream);

  // ── Cover ──
  drawCoverPage(doc);

  // ── Pages ──
  let pageNum = 1;
  for (const layout of LAYOUTS) {
    if (layout.section) {
      drawSectionDivider(doc, layout.section);
    }
    const imgPath = path.join(SCREENSHOTS_DIR, layout.file);
    if (fs.existsSync(imgPath)) {
      drawScreenshotPage(doc, imgPath, layout.label, pageNum);
    } else {
      console.warn(`⚠️  File tidak ditemukan: ${layout.file}`);
    }
    pageNum++;
  }

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const sizeMB = (fs.statSync(OUTPUT_PDF).size / 1024 / 1024).toFixed(2);
  console.log(`\n✅ PDF berhasil dibuat!`);
  console.log(`📄 File : ${OUTPUT_PDF}`);
  console.log(`📦 Ukuran: ${sizeMB} MB`);
  console.log(`📋 Total halaman: Cover + 4 Divider + 30 Layout = ${1 + 4 + 30} halaman`);
}

generate().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
