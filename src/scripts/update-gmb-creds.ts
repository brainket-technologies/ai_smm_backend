import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const appId = process.env.GOOGLE_CLIENT_ID || '';
  const appSecret = process.env.GOOGLE_CLIENT_SECRET || '';

  console.log('Updating GMB credentials...');

  const updated = await prisma.platform.updateMany({
    where: { nameKey: 'gmb' },
    data: {
      appId: appId,
      appSecret: appSecret,
    }
  });

  console.log(`Updated ${updated.count} platform(s).`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
