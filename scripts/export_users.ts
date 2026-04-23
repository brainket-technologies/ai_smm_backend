import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true }
  });
  fs.writeFileSync('scripts/users_left.json', JSON.stringify(users, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
