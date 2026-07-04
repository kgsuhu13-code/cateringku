const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process for attractive food & drink shops...');
  
  // Clear any existing data
  console.log('Clearing database...');
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.menu.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});

  // Generate dynamic dates (today, tomorrow, and day after tomorrow) in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  console.log(`Menus will be created for: Today (${today}), Tomorrow (${tomorrow}), and Day After (${dayAfter})`);

  // 1. Tenant: Dapur Nusantara Rasa (Food)
  console.log('Seeding Tenant: Dapur Nusantara Rasa...');
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Dapur Nusantara Rasa',
      description: 'Menyediakan aneka nasi kotak, lauk pauk khas Indonesia, dan masakan rumah higienis.',
      address: 'Jl. Slamet Riyadi No. 102, Solo',
    },
  });

  // Menus for Dapur Nusantara Rasa
  await prisma.menu.createMany({
    data: [
      {
        tenantId: tenant1.id,
        name: 'Nasi Kotak Ayam Bakar Taliwang',
        description: 'Nasi putih dengan ayam bakar bumbu Taliwang khas Lombok yang pedas gurih, dilengkapi plecing kangkung.',
        price: 25000,
        maxQuota: 30,
        availableAt: today,
      },
      {
        tenantId: tenant1.id,
        name: 'Nasi Liwet Solo Lengkap',
        description: 'Nasi gurih khas Solo disajikan dengan ayam opir suwir, sayur labu siam pedas, telur pindang, dan kumut.',
        price: 22000,
        maxQuota: 25,
        availableAt: today,
      },
      {
        tenantId: tenant1.id,
        name: 'Rendang Sapi Minang Box',
        description: 'Nasi rendang daging sapi asli Minang yang empuk dan kaya rempah, sayur daun singkong, dan sambal ijo.',
        price: 30000,
        maxQuota: 20,
        availableAt: tomorrow,
      },
      {
        tenantId: tenant1.id,
        name: 'Nasi Kuning Tumpeng Mini',
        description: 'Nasi kuning wangi dengan lauk mie goreng, ayam suwir, perkedel, abon sapi, dan sambal bajak.',
        price: 24000,
        maxQuota: 30,
        availableAt: tomorrow,
      },
    ],
  });

  // 2. Tenant: Fresh & Fit Healthy Kitchen (Healthy Food & Drinks)
  console.log('Seeding Tenant: Fresh & Fit Healthy Kitchen...');
  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Fresh & Fit Healthy Kitchen',
      description: 'Menu makanan sehat rendah kalori, salad sayur premium, dan cold-pressed juice segar tanpa gula tambahan.',
      address: 'Ruko Premium Boulevard Blok C-05, Jakarta',
    },
  });

  // Menus for Fresh & Fit
  await prisma.menu.createMany({
    data: [
      {
        tenantId: tenant2.id,
        name: 'Salmon Avocado Salad Bowl',
        description: 'Kombinasi potongan salmon panggang, alpukat mentega, edamame, tomat ceri, dan mix greens dengan sesame dressing.',
        price: 35000,
        maxQuota: 15,
        availableAt: today,
      },
      {
        tenantId: tenant2.id,
        name: 'Detox Green Juice (Apel & Celery)',
        description: 'Cold-pressed juice dari seledri impor segar, apel malang hijau, timun, lemon, dan jahe hangat.',
        price: 18000,
        maxQuota: 40,
        availableAt: today,
      },
      {
        tenantId: tenant2.id,
        name: 'Chicken Caesar Salad Wrap',
        description: 'Dada ayam panggang empuk, selada romaine segar, telur rebus, keju parmesan dibungkus kulit tortilla gandum.',
        price: 28000,
        maxQuota: 25,
        availableAt: tomorrow,
      },
      {
        tenantId: tenant2.id,
        name: 'Berry Glow Smoothie Juice',
        description: 'Jus smoothie dari stroberi, blueberry, yogurt plain, madu alami, dan chia seeds untuk antioksidan.',
        price: 20000,
        maxQuota: 35,
        availableAt: tomorrow,
      },
    ],
  });

  // 3. Tenant: Kopi & Boba Senja (Drinks)
  console.log('Seeding Tenant: Kopi & Boba Senja...');
  const tenant3 = await prisma.tenant.create({
    data: {
      name: 'Kopi & Boba Senja',
      description: 'Kopi susu gula aren kekinian, matcha latte premium Jepang, dan berbagai varian susu boba yang manis & kenyal.',
      address: 'Jl. Margonda Raya No. 420, Depok',
    },
  });

  // Menus for Kopi & Boba Senja
  await prisma.menu.createMany({
    data: [
      {
        tenantId: tenant3.id,
        name: 'Es Kopi Susu Gula Aren Senja',
        description: 'Espresso blend Arabika-Robusta dicampur susu segar creamy dan sirup gula aren murni khas Senja.',
        price: 15000,
        maxQuota: 50,
        availableAt: today,
      },
      {
        tenantId: tenant3.id,
        name: 'Matcha Latte Premium',
        description: 'Uji Matcha Jepang autentik dilarutkan dengan susu UHT hangat/dingin dengan rasa manis yang pas.',
        price: 20000,
        maxQuota: 30,
        availableAt: today,
      },
      {
        tenantId: tenant3.id,
        name: 'Brown Sugar Boba Milk Tea',
        description: 'Teh susu klasik disajikan dengan boba kenyal hangat yang direbus dengan sirup gula merah.',
        price: 18000,
        maxQuota: 40,
        availableAt: tomorrow,
      },
      {
        tenantId: tenant3.id,
        name: 'Ice Red Velvet Cheese Cream',
        description: 'Minuman manis rasa Red Velvet premium dilapisi foam keju asin gurih di atasnya.',
        price: 19000,
        maxQuota: 35,
        availableAt: tomorrow,
      },
    ],
  });

  // 4. Tenant: Sweet Treats Dessert & Co (Desserts & Drinks)
  console.log('Seeding Tenant: Sweet Treats Dessert & Co...');
  const tenant4 = await prisma.tenant.create({
    data: {
      name: 'Sweet Treats Dessert & Co',
      description: 'Dessert box lumer, es campur kekinian mango sago, dan mocktail buah segar yang memanjakan lidah.',
      address: 'Kawasan Kuliner Tunjungan, Surabaya',
    },
  });

  // Menus for Sweet Treats
  await prisma.menu.createMany({
    data: [
      {
        tenantId: tenant4.id,
        name: 'Mango Sago Creamy Bowl',
        description: 'Puding mangga lembut dengan potongan mangga harum manis segar, sagu mutiara, jelly kelapa disiram kuah susu mangga.',
        price: 16000,
        maxQuota: 35,
        availableAt: today,
      },
      {
        tenantId: tenant4.id,
        name: 'Sparkling Lychee Mocktail',
        description: 'Minuman soda segar dicampur sirup leci premium, buah leci utuh, daun mint, dan biji selasih.',
        price: 14000,
        maxQuota: 45,
        availableAt: today,
      },
      {
        tenantId: tenant4.id,
        name: 'Avocado Choco Lumer Box',
        description: 'Dessert box 3 layer: bolu coklat lembab, custard alpukat murni, dan ganache coklat hitam yang lumer.',
        price: 25000,
        maxQuota: 20,
        availableAt: tomorrow,
      },
      {
        tenantId: tenant4.id,
        name: 'Es Campur Jelly Durian',
        description: 'Es serut dengan sirup cocopandan, susu kental manis, cincau hitam, kelapa muda, jelly, dan buah durian asli.',
        price: 22000,
        maxQuota: 15,
        availableAt: tomorrow,
      },
    ],
  });

  // 5. Seed some mock users for login ease
  console.log('Seeding mock users...');
  
  // Seed a Tenant Owner linked to Tenant 1
  await prisma.user.create({
    data: {
      firebaseUid: 'mock_tenant_uid_123',
      email: 'tenant@gmail.com',
      name: 'Hendra Owner Nusantara',
      role: 'TENANT',
      tenantId: tenant1.id,
      phone: '08567890123',
      address: 'Solo, Jawa Tengah',
    },
  });

  // Seed a Customer
  await prisma.user.create({
    data: {
      firebaseUid: 'mock_customer_uid_123',
      email: 'customer@gmail.com',
      name: 'Budi Raharjo',
      role: 'CUSTOMER',
      phone: '081234567890',
      address: 'Kost Asri Kamar 3, Sukolilo, Surabaya',
    },
  });

  // Seed a Super Admin
  await prisma.user.create({
    data: {
      firebaseUid: 'mock_admin_uid_123',
      email: 'admin@gmail.com',
      name: 'Pak Rektor Admin',
      role: 'SUPER_ADMIN',
      phone: '08999999999',
      address: 'Kantor Rektorat Lt. 2',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
