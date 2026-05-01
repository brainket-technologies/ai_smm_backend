import { prisma } from '../src/lib/prisma';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

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

    console.log('Successfully upserted Calendarific config:', JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  } catch (error: any) {
    console.error('Error upserting config:', error.message);
  } finally {
    // No explicit disconnect needed for the shared client usually, but good practice in standalone scripts
    // However, since it uses a pool, we might want to close it if we want the script to exit immediately
  }
}

main();
