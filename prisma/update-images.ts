// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const images: Record<string, string> = {
  stripe: '/logos/stripe.svg',
  razorpay: '/logos/razorpay.svg',
  paypal: '/logos/paypal.svg',
  flutterwave: '/logos/flutterwave.svg',
  paystack: '/logos/paystack.svg',
  cash: '/logos/cash.svg',
};

async function main() {
  for (const [name, image] of Object.entries(images)) {
    const result = await prisma.paymentMethod.updateMany({
      where: { name },
      data: { image },
    });
    console.log(`Updated ${name}: ${result.count} row(s) → ${image}`);
  }

  // Show current state
  const all = await prisma.paymentMethod.findMany({
    select: { name: true, image: true }
  });
  console.log('\nCurrent DB state:');
  all.forEach(r => console.log(`  ${r.name}: "${r.image}"`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
