// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Use a fixed ID so you can always use it safely in your code/tests
  const userId = 0;

  // Upsert = create if not exists, otherwise update
  const user = await prisma.project.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      
      name: 'Testing Project',
      password: 'hashed-password', // <- replace with a hashed version
  
    },
  });

  console.log('✅ User seeded:', user);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🌱 Seeding complete.');
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
