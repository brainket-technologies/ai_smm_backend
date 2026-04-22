import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true }
  });
  console.log('Current Users:', JSON.stringify(users, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}

main().finally(() => prisma.$disconnect());
