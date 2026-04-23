
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const counts = {
    audienceTypes: await prisma.audienceType.count(),
    targetRegions: await prisma.targetRegion.count(),
    targetGenders: await prisma.targetGender?.count() || 0,
    targetAgeGroups: await prisma.targetAgeGroup.count(),
    modelEthnicities: await prisma.modelEthnicity.count(),
  };
  console.log('Counts:', JSON.stringify(counts, null, 2));

  const duplicates = await prisma.audienceType.groupBy({
    by: ['name'],
    _count: {
      name: true,
    },
    having: {
      name: {
        _count: {
          gt: 1,
        },
      },
    },
  });
  console.log('Duplicate AudienceTypes:', JSON.stringify(duplicates, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
