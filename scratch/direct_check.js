
const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_JhAiItvzM23Z@ep-plain-snow-amll0gmg.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function check() {
    const client = new Client({ connectionString });
    await client.connect();
    
    console.log('--- Audience Types ---');
    const res = await client.query('SELECT name, COUNT(*) FROM audience_types GROUP BY name HAVING COUNT(*) > 0');
    console.table(res.rows);

    console.log('--- Target Regions ---');
    const res2 = await client.query('SELECT name, COUNT(*) FROM target_regions GROUP BY name HAVING COUNT(*) > 0');
    console.table(res2.rows);

    await client.end();
}

check().catch(console.error);
