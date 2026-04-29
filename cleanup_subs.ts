import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.userSubscription.deleteMany({
    where: {
      tierKey: 'pro',
      status: 'active'
    }
  });
  console.log(`Successfully deleted ${deleted.count} test subscription entries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
