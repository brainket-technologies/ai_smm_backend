const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.appFeatureFlag.updateMany({
    where: {
      featureKey: {
        in: ['ads_free_experience', 'ai_structured_replies']
      }
    },
    data: {
      isEnabled: true
    }
  });
  console.log(`Updated ${result.count} features.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
