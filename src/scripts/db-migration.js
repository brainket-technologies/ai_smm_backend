const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_JhAiItvzM23Z@ep-plain-snow-amll0gmg-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to Neon DB.');

  // 1. Add missing columns to social_accounts
  console.log('Updating social_accounts table...');
  try {
    await client.query('ALTER TABLE "social_accounts" ADD COLUMN IF NOT EXISTS "profile_picture" TEXT');
    await client.query('ALTER TABLE "social_accounts" ADD COLUMN IF NOT EXISTS "page_id" TEXT');
    console.log('social_accounts table updated.');
  } catch (e) {
    console.error('Error updating social_accounts:', e.message);
  }

  // 2. Ensure platforms table has scopes column (needed for Instagram Direct)
  console.log('Updating platforms table...');
  try {
    await client.query('ALTER TABLE "platforms" ADD COLUMN IF NOT EXISTS "scopes" TEXT');
    console.log('platforms table updated.');
  } catch (e) {
    console.error('Error updating platforms:', e.message);
  }

  console.log('Database migration complete.');
  await client.end();
}

main().catch(console.error);
