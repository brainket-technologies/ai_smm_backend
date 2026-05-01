-- Create countries table
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

-- Create states table
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

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    external_id BIGINT UNIQUE,
    name TEXT NOT NULL,
    city_code TEXT UNIQUE NOT NULL, -- IN_UP_LUCKNOW format
    state_code TEXT NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    latitude DECIMAL,
    longitude DECIMAL,
    UNIQUE(country_code, state_code, name)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_cities_location ON cities(country_code, state_code);
CREATE INDEX IF NOT EXISTS idx_states_country ON states(country_code);
