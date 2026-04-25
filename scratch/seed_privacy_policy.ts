import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const htmlContent = fs.readFileSync(path.join(__dirname, 'privacy_policy.html'), 'utf-8');

  const privacyPolicy = await prisma.staticPage.upsert({
    where: { slug: 'privacy-policy' },
    update: {
      title: 'Privacy Policy',
      content: htmlContent,
      isActive: true,
      updatedAt: new Date(),
    },
    create: {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      content: htmlContent,
      isActive: true,
    },
  });

  console.log('Privacy Policy page upserted:', {
    id: privacyPolicy.id.toString(),
    slug: privacyPolicy.slug,
    title: privacyPolicy.title,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
