import pkg from 'pg';
const { Client } = pkg;

async function updateDb() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_JhAiItvzM23Z@ep-plain-snow-amll0gmg-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
  });

  try {
    await client.connect();
    console.log("Connected to database...");
    
    const appId = process.env.GOOGLE_CLIENT_ID || '';
    const appSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    
    const result = await client.query(
      `UPDATE "platforms" SET "app_id" = $1, "app_secret" = $2 WHERE "name_key" = 'gmb'`,
      [appId, appSecret]
    );
    
    console.log(`Successfully updated ${result.rowCount} row(s) for GMB platform.`);
  } catch (err) {
    console.error("Error updating database:", err);
  } finally {
    await client.end();
  }
}

updateDb();
