
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const flags = await prisma.appFeatureFlag.findMany({
    where: {
      featureKey: {
        in: ['vcard_digital_access', 'vcard_sound_access', 'notifications_settings_access']
      }
    }
  });
  console.log('Found flags:', JSON.stringify(flags, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.\$disconnect());
