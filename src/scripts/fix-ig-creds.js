const pkg = require('pg');
const { Client } = pkg;

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_JhAiItvzM23Z@ep-plain-snow-amll0gmg-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function update() {
  try {
    await client.connect();
    const res = await client.query(
      'UPDATE platforms SET app_id = $1, app_secret = $2 WHERE name_key = $3',
      ['1275710720811339', '119be37282a98f5aae5e5e43bdad2721', 'instagram']
    );
    console.log('Update Successful:', res.rowCount, 'row(s) updated.');
  } catch (err) {
    console.error('Update Failed:', err);
  } finally {
    await client.end();
  }
}

update();
