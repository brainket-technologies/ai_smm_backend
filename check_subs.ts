import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_JhAiItvzM23Z@ep-plain-snow-amll0gmg.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function main() {
  const count = await prisma.userSubscription.count({
    where: { userId: BigInt(43) }
  });
  console.log(`Current subscription count for user 43: ${count}`);
}

main().finally(() => prisma.$disconnect());
