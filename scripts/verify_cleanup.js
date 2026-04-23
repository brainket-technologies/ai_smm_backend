const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } });
    const deviceCount = await prisma.deviceToken.count();
    
    console.log('--- DATABASE STATUS (NEON) ---');
    console.log('Total Users:', userCount);
    console.log('Remaining Users:', JSON.stringify(users, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
    console.log('Total Device Tokens:', deviceCount);
    console.log('------------------------------');
  } catch (e) {
    console.error('Check failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
