const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  console.log('Roles:', JSON.stringify(roles, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));

  const userCount = await prisma.user.count({ where: { isDeleted: false } });
  console.log('Total non-deleted users:', userCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
