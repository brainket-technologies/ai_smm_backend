const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkColumns() {
  const config = await prisma.appConfig.findFirst();
  if (config) {
    console.log('Columns in AppConfig:', Object.keys(config));
  } else {
    console.log('No record found in AppConfig');
  }
}

checkColumns()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
