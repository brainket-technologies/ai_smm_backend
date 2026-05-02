import { FestivalService } from './src/lib/services/festival-service';
import { prisma } from './src/lib/prisma';

async function test() {
  console.log('Truncating tables for clean test...');
  await prisma.$executeRaw`TRUNCATE TABLE festivals, festival_fetch_logs RESTART IDENTITY;`;

  console.log('--- Step 1: Fetch for UP ---');
  await FestivalService.getFestivals('IN', 2026, 'UP');
  const count1 = await prisma.festival.count();
  const upOnly = await prisma.festival.count({ where: { state: 'UP' } });
  console.log(`Total festivals: ${count1}, UP specific: ${upOnly}`);

  console.log('--- Step 2: Fetch for AP ---');
  // This should call API for AP and merge overlapping state-specific festivals
  await FestivalService.getFestivals('IN', 2026, 'AP');
  const count2 = await prisma.festival.count();
  const merged = await prisma.festival.count({ where: { state: { contains: ',' } } });
  const apCount = await prisma.festival.count({ where: { state: { contains: 'AP' } } });
  
  console.log(`Total festivals after AP fetch: ${count2}`);
  console.log(`Festivals mapped to multiple states (merged): ${merged}`);
  console.log(`Festivals available for AP (State specific + Merged + National): ${apCount}`);
}

test().catch(console.error).finally(() => prisma.$disconnect());
