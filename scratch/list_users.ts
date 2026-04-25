
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true }
  });
  console.log('Users and Roles:');
  users.forEach(u => {
    console.log(`- ${u.email}: ${u.role?.name || 'No Role'}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
