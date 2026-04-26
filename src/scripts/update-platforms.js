const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating platforms directly...');
  const platformList = [
    { name: 'Facebook', nameKey: 'facebook', appId: '731880461729854' },
    { name: 'Instagram', nameKey: 'instagram', appId: '693568212935084', scopes: 'instagram_business_basic,instagram_business_content_publish,instagram_business_manage_comments,instagram_business_manage_insights,instagram_business_manage_messages' },
    { name: 'Threads', nameKey: 'threads', appId: '1380111775991047' },
    { name: 'LinkedIn', nameKey: 'linkedin', appId: '214437684' },
    { name: 'Google Business', nameKey: 'gmb', appId: '982519183015-484j3rtb13uj5rgce4biijh8idfp96ta.apps.googleusercontent.com' },
    { name: 'YouTube', nameKey: 'youtube', appId: '982519183015-484j3rtb13uj5rgce4biijh8idfp96ta.apps.googleusercontent.com' },
    { name: 'Pinterest', nameKey: 'pinterest', appId: '1440620' },
  ];

  for (const plat of platformList) {
    await prisma.platform.upsert({
      where: { name: plat.name },
      update: {
        nameKey: plat.nameKey,
        appId: plat.appId,
        scopes: (plat as any).scopes,
      },
      create: {
        name: plat.name,
        nameKey: plat.nameKey,
        appId: plat.appId,
        isActive: true,
        scopes: (plat as any).scopes,
      }
    });
  }
  console.log('Done!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
