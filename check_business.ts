import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Checking business with ID 8...');
  const business = await prisma.business.findUnique({
    where: { id: BigInt(8) }
  });

  if (business) {
    console.log('✅ Business found:', business.name);
  } else {
    console.log('❌ Business with ID 8 NOT found.');
    
    const count = await prisma.business.count();
    console.log(`Total businesses in DB: ${count}`);
    
    const latest = await prisma.business.findMany({
      take: 10,
      orderBy: { id: 'desc' }
    });
    
    console.log('Latest 10 businesses:');
    latest.forEach(b => {
      console.log(`- ID: ${b.id}, Name: ${b.name}`);
    });
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
