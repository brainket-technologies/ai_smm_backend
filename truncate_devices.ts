import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting cleanup...');

  // 1. Clear device_tokens first (due to foreign key)
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "device_tokens" CASCADE;');
  console.log('device_tokens table truncated.');

  // 2. Delete from users where ID is NOT 1 or 2
  // Note: Using executeRaw because BigInt handling in where clause can be tricky in some environments
  await prisma.$executeRawUnsafe('DELETE FROM "users" WHERE id NOT IN (1, 2);');
  console.log('Users (except ID 1, 2) deleted successfully.');
  
  // 3. Also clear other related tables if necessary (optional but good for consistency)
  // await prisma.$executeRawUnsafe('TRUNCATE TABLE "otp_verifications" CASCADE;');
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
