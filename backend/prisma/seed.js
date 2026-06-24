const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  print = console.log;
  print('Clearing database...');
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.menu.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});

  print('Seeding tenants...');
  const tenantA = await prisma.tenant.create({
    data: {
      name: 'Warung Penyetan Bu Kris',
      description: 'Menyediakan aneka penyetan pedas dan lezat khas Surabaya.',
      address: 'Jl. Dharmawangsa No. 45, Dharmahusada',
    },
  });

  const tenantB = await prisma.tenant.create({
    data: {
      name: 'Dapur Sehat Organik',
      description: 'Makanan sehat, salad buah, salad sayur, dan jus segar untuk diet seimbang.',
      address: 'Ruko Green Lake Blok A No. 12, Sukolilo',
    },
  });

  print('Seeding users...');
  // Seed a Tenant Owner for Tenant A
  const tenantUser = await prisma.user.create({
    data: {
      firebaseUid: 'mock_tenant_uid_123',
      email: 'tenant@gmail.com',
      name: 'Hendra Owner Bu Kris',
      role: 'TENANT',
      tenantId: tenantA.id,
      phone: '08567890123',
      address: 'Warung Bu Kris Dharmawangsa',
    },
  });

  // Seed a Customer
  const customerUser = await prisma.user.create({
    data: {
      firebaseUid: 'mock_customer_uid_123',
      email: 'customer@gmail.com',
      name: 'Budi Raharjo',
      role: 'CUSTOMER',
      phone: '081234567890',
      address: 'Kost Asri Kamar 3, Sukolilo, Surabaya',
    },
  });

  // Seed Super Admin
  const adminUser = await prisma.user.create({
    data: {
      firebaseUid: 'mock_admin_uid_123',
      email: 'admin@gmail.com',
      name: 'Pak Rektor Admin',
      role: 'SUPER_ADMIN',
      phone: '08999999999',
      address: 'Kantor Rektorat Lt. 2',
    },
  });

  // Get dynamic dates (today and tomorrow) in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  print(`Dates generated: Today = ${today}, Tomorrow = ${tomorrow}`);

  print('Seeding menus...');
  // Menus for Tenant A (Warung Penyetan Bu Kris)
  const menuA1 = await prisma.menu.create({
    data: {
      tenantId: tenantA.id,
      name: 'Ayam Goreng Penyet + Nasi',
      description: 'Ayam goreng renyah dengan sambal korek pedas mantap dan nasi hangat.',
      price: 18000,
      maxQuota: 20,
      availableAt: today,
    },
  });

  await prisma.menu.create({
    data: {
      tenantId: tenantA.id,
      name: 'Bebek Bakar Madu',
      description: 'Bebek bakar bumbu madu gurih manis ditambah sambal pencit.',
      price: 25000,
      maxQuota: 10,
      availableAt: today,
    },
  });

  await prisma.menu.create({
    data: {
      tenantId: tenantA.id,
      name: 'Lele Penyet Dobel',
      description: 'Dua ekor lele goreng garing disiram sambal terasi matang.',
      price: 15000,
      maxQuota: 15,
      availableAt: tomorrow,
    },
  });

  // Menus for Tenant B (Dapur Sehat Organik)
  const menuB1 = await prisma.menu.create({
    data: {
      tenantId: tenantB.id,
      name: 'Fruit Salad Premium Extra Cheese',
      description: 'Kombinasi buah segar melon, apel, anggur, dan stroberi disiram saus creamy dan keju melimpah.',
      price: 22000,
      maxQuota: 15,
      availableAt: today,
    },
  });

  await prisma.menu.create({
    data: {
      tenantId: tenantB.id,
      name: 'Chicken Caesar Salad',
      description: 'Dada ayam panggang, selada romaine segar, crouton garing, disiram dengan dressing Caesar premium.',
      price: 28000,
      maxQuota: 12,
      availableAt: tomorrow,
    },
  });

  print('Seeding a mock paid order for testing...');
  await prisma.order.create({
    data: {
      customerId: customerUser.id,
      tenantId: tenantA.id,
      totalAmount: 18000,
      paymentStatus: 'PAID',
      status: 'PAID',
      shippingAddress: customerUser.address,
      deliveryTime: '12:00',
      orderItems: {
        create: [
          {
            menuId: menuA1.id,
            quantity: 1,
            targetDate: today,
          }
        ]
      }
    }
  });

  print('Seeding reviews...');
  await prisma.review.create({
    data: {
      customerId: customerUser.id,
      menuId: menuA1.id,
      rating: 5,
      comment: 'Sambal koreknya nampol banget, ayamnya renyah pol!',
    }
  });

  await prisma.review.create({
    data: {
      customerId: customerUser.id,
      menuId: menuB1.id,
      rating: 4,
      comment: 'Buah-buahan segar, keju melimpah. Mantap!',
    }
  });

  print('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
