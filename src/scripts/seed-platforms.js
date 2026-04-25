
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_JhAiItvzM23Z@ep-plain-snow-amll0gmg-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

async function main() {
  const platforms = [
    {
      name: 'Facebook',
      nameKey: 'facebook',
      appId: '731880461729854',
      isActive: true,
      scopes: 'pages_manage_metadata,business_management,pages_show_list,pages_manage_posts,pages_read_engagement,pages_read_user_content,email,read_insights,pages_manage_engagement,pages_messaging'
    },
    {
      name: 'Instagram',
      nameKey: 'instagram',
      appId: '693568212935084',
      isActive: true,
      scopes: 'instagram_business_basic,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_insights'
    },
    {
      name: 'Google Business',
      nameKey: 'gmb',
      appId: '982519183015-484j3rtb13uj5rgce4biijh8idfp96ta.apps.googleusercontent.com',
      isActive: true,
      scopes: 'https://www.googleapis.com/auth/business.manage'
    },
    {
      name: 'Threads',
      nameKey: 'threads',
      appId: '1380111775991047',
      isActive: true,
      scopes: 'threads_basic,threads_content_publish,threads_read_replies,threads_manage_replies,threads_manage_insights'
    }
  ];

  for (const p of platforms) {
    try {
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
    } catch (err) {
      console.error(`❌ Error configuring ${p.name}:`, err.message);
    }
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
