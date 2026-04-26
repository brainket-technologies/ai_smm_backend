const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_JhAiItvzM23Z@ep-plain-snow-amll0gmg-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to Neon DB via pg direct.');

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
    console.log(`Updating ${plat.name}...`);
    await client.query(`
      INSERT INTO "platforms" ("name", "name_key", "app_id", "scopes", "is_active", "url")
      VALUES ($1, $2, $3, $4, true, '')
      ON CONFLICT ("name") DO UPDATE SET
        "name_key" = EXCLUDED."name_key",
        "app_id" = EXCLUDED."app_id",
        "scopes" = EXCLUDED."scopes"
    `, [plat.name, plat.nameKey, plat.appId, plat.scopes || null]);
  }

  console.log('Platforms updated successfully.');
  await client.end();
}

main().catch(console.error);
