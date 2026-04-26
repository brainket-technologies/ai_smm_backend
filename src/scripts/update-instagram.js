const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.platform.update({
      where: { nameKey: 'instagram' },
      data: {
        appId: '1275710720811339',
        appSecret: '119be37282a98f5aae5e5e43bdad2721'
      }
    });
    console.log('Successfully updated Instagram credentials in Database');
  } catch (error) {
    console.error('Error updating Instagram credentials:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
