import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_JhAiItvzM23Z@ep-plain-snow-amll0gmg.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function main() {
  const columns = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users'
    ORDER BY column_name;
  `;
  console.log(JSON.stringify(columns, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
