
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const platforms = [
    {
      name: 'Facebook',
      nameKey: 'facebook',
      appId: '731880461729854', // From user's URL
      isActive: true,
      scopes: 'pages_manage_metadata,business_management,pages_show_list,pages_manage_posts,pages_read_engagement,pages_read_user_content,email,read_insights,pages_manage_engagement,pages_messaging'
    },
    {
      name: 'Instagram',
      nameKey: 'instagram',
      appId: '693568212935084', // From user's URL
      isActive: true,
      scopes: 'instagram_business_basic,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_insights'
    },
    {
      name: 'Google Business',
      nameKey: 'gmb',
      appId: '982519183015-484j3rtb13uj5rgce4biijh8idfp96ta.apps.googleusercontent.com', // From user's URL
      isActive: true,
      scopes: 'https://www.googleapis.com/auth/business.manage'
    },
    {
      name: 'Threads',
      nameKey: 'threads',
      appId: '1380111775991047', // From user's URL
      isActive: true,
      scopes: 'threads_basic,threads_content_publish,threads_read_replies,threads_manage_replies,threads_manage_insights'
    }
  ];

  for (const p of platforms) {
    await prisma.platform.upsert({
      where: { nameKey: p.nameKey },
      update: {
        appId: p.appId,
        isActive: p.isActive,
        scopes: p.scopes
      },
      create: p
    });
    console.log(`✅ Platform ${p.name} configured.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
