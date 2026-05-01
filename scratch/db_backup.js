const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function backup() {
  console.log('Starting Database Backup using pg...');
  const pool = new Pool({ connectionString });

  try {
    // Get list of tables
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const tables = res.rows.map(row => row.table_name);
    console.log(`Found ${tables.length} tables.`);

    const backupData = {};

    for (const table of tables) {
      console.log(`Backing up table: ${table}...`);
      try {
        const dataRes = await pool.query(`SELECT * FROM "${table}"`);
        backupData[table] = dataRes.rows;
      } catch (err) {
        console.error(`Failed to backup ${table}:`, err.message);
      }
    }

    const backupFile = path.join(__dirname, '../../database_backup.json');
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`Backup completed successfully! Saved to: ${backupFile}`);
  } catch (error) {
    console.error('Backup failed:', error);
  } finally {
    await pool.end();
  }
}

backup();
