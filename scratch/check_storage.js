
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const configs = await prisma.externalServiceConfig.findMany({
    where: { category: { equals: 'storage', mode: 'insensitive' } }
  });
  console.log('STORAGE CONFIGS:', JSON.stringify(configs, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
