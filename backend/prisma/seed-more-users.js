const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding extra tenant owner users...');
  
  // Find the tenants
  const tenant2 = await prisma.tenant.findFirst({ where: { name: 'Fresh & Fit Healthy Kitchen' } });
  const tenant3 = await prisma.tenant.findFirst({ where: { name: 'Kopi & Boba Senja' } });
  const tenant4 = await prisma.tenant.findFirst({ where: { name: 'Sweet Treats Dessert & Co' } });

  if (tenant2) {
    await prisma.user.upsert({
      where: { email: 'fresh@gmail.com' },
      update: {},
      create: {
        firebaseUid: 'mock_tenant_fresh',
        email: 'fresh@gmail.com',
        name: 'Siti Owner Fresh & Fit',
        role: 'TENANT',
        tenantId: tenant2.id,
        phone: '08561111111',
        address: 'Ruko Premium, Jakarta',
      }
    });
  }

  if (tenant3) {
    await prisma.user.upsert({
      where: { email: 'boba@gmail.com' },
      update: {},
      create: {
        firebaseUid: 'mock_tenant_boba',
        email: 'boba@gmail.com',
        name: 'Rian Owner Boba Senja',
        role: 'TENANT',
        tenantId: tenant3.id,
        phone: '08562222222',
        address: 'Jl. Margonda, Depok',
      }
    });
  }

  if (tenant4) {
    await prisma.user.upsert({
      where: { email: 'sweets@gmail.com' },
      update: {},
      create: {
        firebaseUid: 'mock_tenant_sweets',
        email: 'sweets@gmail.com',
        name: 'Dewi Owner Sweet Treats',
        role: 'TENANT',
        tenantId: tenant4.id,
        phone: '08563333333',
        address: 'Tunjungan, Surabaya',
      }
    });
  }

  console.log('Extra users seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
