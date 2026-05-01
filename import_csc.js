const axios = require('axios');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  keepAlive: true,
  connectionTimeoutMillis: 10000,
});

const DATA_URL = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/refs/heads/master/json/countries%2Bstates%2Bcities.json';

async function importData() {
  try {
    console.log('🚀 Starting Import Process...');
    console.log('📡 Fetching JSON data (this might take a moment)...');
    const response = await axios.get(DATA_URL);
    const data = response.data;
    console.log(`✅ Data fetched. Total countries: ${data.length}`);

    // Initial setup (tables)
    const setupClient = await pool.connect();
    try {
      const dbCheck = await setupClient.query('SELECT current_database(), current_schema()');
      console.log(`📡 Connected to Database: ${dbCheck.rows[0].current_database}, Schema: ${dbCheck.rows[0].current_schema}`);

      console.log('🏗️ Ensuring tables exist...');
      await setupClient.query(`
        CREATE TABLE IF NOT EXISTS countries (
            id SERIAL PRIMARY KEY,
            external_id BIGINT UNIQUE,
            name TEXT NOT NULL,
            iso2 VARCHAR(2) UNIQUE NOT NULL,
            iso3 VARCHAR(3),
            phonecode TEXT,
            capital TEXT,
            currency TEXT,
            latitude DECIMAL,
            longitude DECIMAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS states (
            id SERIAL PRIMARY KEY,
            external_id BIGINT UNIQUE,
            name TEXT NOT NULL,
            state_code TEXT NOT NULL,
            country_code VARCHAR(2) NOT NULL REFERENCES countries(iso2),
            latitude DECIMAL,
            longitude DECIMAL,
            UNIQUE(country_code, state_code)
        );

        CREATE TABLE IF NOT EXISTS cities (
            id SERIAL PRIMARY KEY,
            external_id BIGINT UNIQUE,
            name TEXT NOT NULL,
            city_code TEXT UNIQUE NOT NULL,
            state_code TEXT NOT NULL,
            country_code VARCHAR(2) NOT NULL,
            latitude DECIMAL,
            longitude DECIMAL,
            UNIQUE(country_code, state_code, name)
        );

        CREATE INDEX IF NOT EXISTS idx_cities_location ON cities(country_code, state_code);
        CREATE INDEX IF NOT EXISTS idx_states_country ON states(country_code);
      `);

      const tableList = await setupClient.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
      console.log('📊 Existing tables in public schema:', tableList.rows.map(r => r.table_name).join(', '));
    } finally {
      setupClient.release();
    }

    // Import loop
    for (const country of data) {
      process.stdout.write(`🌍 Importing ${country.name}... `);
      
      try {
        // Check if country already has cities (to see if we can skip it entirely)
        const countryCheck = await pool.query('SELECT 1 FROM cities WHERE country_code = $1 LIMIT 1', [country.iso2]);
        if (countryCheck.rowCount > 0) {
          process.stdout.write('Skipped (Already Imported)\n');
          continue;
        }

        // Upsert Country first
        const countryClient = await pool.connect();
        try {
          await countryClient.query(`
            INSERT INTO countries (external_id, name, iso2, iso3, phonecode, capital, currency, latitude, longitude)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (iso2) DO UPDATE SET
              name = EXCLUDED.name,
              external_id = EXCLUDED.external_id,
              updated_at = CURRENT_TIMESTAMP
          `, [
            country.id, country.name, country.iso2, country.iso3, 
            country.phone_code, country.capital, country.currency,
            country.latitude, country.longitude
          ]);
        } finally {
          countryClient.release();
        }

        const countryCode = country.iso2;

        // Import States one by one
        if (country.states) {
          for (const state of country.states) {
            // Check if state already has cities
            const stateCheck = await pool.query('SELECT 1 FROM cities WHERE country_code = $1 AND state_code = $2 LIMIT 1', [countryCode, state.state_code]);
            if (stateCheck.rowCount > 0) {
              continue; // Skip state if cities already exist
            }

            let stateClient;
            try {
              stateClient = await pool.connect();
              await stateClient.query('BEGIN');

              const stateCode = state.state_code || state.name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase().substring(0, 8);
              
              await stateClient.query(`
                INSERT INTO states (external_id, name, state_code, country_code, latitude, longitude)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (country_code, state_code) DO UPDATE SET
                  name = EXCLUDED.name,
                  external_id = EXCLUDED.external_id
              `, [
                state.id, state.name, stateCode, countryCode,
                state.latitude, state.longitude
              ]);

              // Import Cities in batches of 50
              const cities = state.cities || [];
              for (let i = 0; i < cities.length; i += 50) {
                const batch = cities.slice(i, i + 50);
                const values = [];
                const placeholders = [];
                
                batch.forEach((city, index) => {
                  const offset = index * 7;
                  const cleanCityName = city.name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
                  const cityCode = `${countryCode}_${stateCode}_${cleanCityName}`;
                  
                  values.push(
                    city.id, city.name, cityCode, stateCode, countryCode,
                    city.latitude, city.longitude
                  );
                  
                  placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`);
                });

                if (values.length > 0) {
                  await stateClient.query(`
                    INSERT INTO cities (external_id, name, city_code, state_code, country_code, latitude, longitude)
                    VALUES ${placeholders.join(', ')}
                    ON CONFLICT (country_code, state_code, name) DO NOTHING
                  `, values);
                }
                await new Promise(resolve => setTimeout(resolve, 30));
              }

              await stateClient.query('COMMIT');
            } catch (stateErr) {
              if (stateClient) await stateClient.query('ROLLBACK');
              console.error(`\n⚠️ Failed state ${state.name}:`, stateErr.message);
            } finally {
              if (stateClient) stateClient.release();
            }
          }
        }

        process.stdout.write('Done\n');
      } catch (countryErr) {
        console.error(`\n❌ Failed country ${country.name}:`, countryErr.message);
      }
    }

    console.log('\n✨ Import process finished!');
  } catch (err) {
    console.error('\n❌ Fatal error:', err);
  } finally {
    await pool.end();
  }
}

importData();
