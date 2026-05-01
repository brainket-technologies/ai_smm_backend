import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const category = 'holiday';
  const provider = 'calendarific';
  const config = {
    apiKey: 'wXtouAZuojgVPUC7K8qCpsCXMBpkIa00',
    callCount: 0,
    displayName: 'Calendarific API',
    mode: 'live'
  };

  try {
    const result = await prisma.externalServiceConfig.upsert({
      where: {
        category_provider: {
          category,
          provider
        }
      },
      update: {
        config,
        isActive: true,
      },
      create: {
        category,
        provider,
        config,
        isActive: true,
        isDefault: true
      }
    });

    console.log('Successfully upserted Calendarific config:', result);
  } catch (error) {
    console.error('Error upserting config:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
