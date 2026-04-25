const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function upsertPage(slug, title, filePath) {
  const htmlContent = fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
  await prisma.staticPage.upsert({
    where: { slug },
    update: {
      title,
      content: htmlContent,
      isActive: true,
      updatedAt: new Date(),
    },
    create: {
      slug,
      title,
      content: htmlContent,
      isActive: true,
    },
  });
  console.log(`Page '${title}' (${slug}) upserted successfully.`);
}

async function main() {
  await upsertPage('privacy-policy', 'Privacy Policy', 'privacy_policy.html');
  await upsertPage('data-deletion', 'Data Deletion Policy', 'data_deletion_policy.html');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
