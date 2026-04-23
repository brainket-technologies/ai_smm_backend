import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const activeConfig = await prisma.externalServiceConfig.findFirst({
    where: { 
      category: 'storage',
      isActive: true 
    }
  });

  console.log('Active Storage Config:', JSON.stringify(activeConfig, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
