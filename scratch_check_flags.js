const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const flags = await prisma.appFeatureFlag.findMany({
    orderBy: { moduleName: 'asc' }
  });
  console.log(JSON.stringify(flags, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
