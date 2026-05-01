const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing DB connection and LedgerAccount table...');
    const count = await prisma.ledgerAccount.count();
    console.log('LedgerAccount count:', count);
    
    const sample = await prisma.ledgerAccount.findFirst();
    console.log('Sample account:', sample);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
