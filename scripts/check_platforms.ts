import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPlatforms() {
  const platforms = await prisma.platform.findMany();
  console.log('Platforms in DB:', platforms.map(p => p.name_key));
  
  const fb = platforms.find(p => p.name_key === 'facebook');
  const ig = platforms.find(p => p.name_key === 'instagram');
  const google = platforms.find(p => p.name_key === 'google');
  
  if (!fb || !ig || !google) {
    console.log('Missing some platforms. Creating them...');
    // Create missing platforms if needed (using name_key)
    // Note: This is just for verification
  }
}

checkPlatforms()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
