-- Cleanup and Fresh Seed for Configuration Tables
-- This will remove duplicates and reset the tables with clean data

-- 1. Audience Types
TRUNCATE TABLE audience_types CASCADE;
INSERT INTO audience_types (name, is_active) VALUES
('Small Business', true),
('Corporate', true),
('Individual/Creator', true),
('Agency', true),
('Non-Profit', true);

-- 2. Target Regions
TRUNCATE TABLE target_regions CASCADE;
INSERT INTO target_regions (name, is_active) VALUES
('Local (City)', true),
('Regional (State)', true),
('National', true),
('International', true);

-- 3. Target Age Groups
TRUNCATE TABLE target_age_groups CASCADE;
INSERT INTO target_age_groups (name, is_active) VALUES
('13-17', true),
('18-24', true),
('25-34', true),
('35-44', true),
('45-54', true),
('55+', true),
('All Ages', true);

-- 4. Model Ethnicities
TRUNCATE TABLE model_ethnicities CASCADE;
INSERT INTO model_ethnicities (name, is_active) VALUES
('Asian', true),
('Black/African', true),
('Caucasian/White', true),
('Hispanic/Latino', true),
('Middle Eastern', true),
('South Asian', true),
('Mixed/Other', true);

-- 5. Target Genders (If you have a table for this, otherwise it might be a column in business)
-- Based on schema, TargetGender is a column in Business, but I also created an API for it.
-- If you created a table manually or if it's missing, you can add it here.
-- Assuming you want a standardized list for the API:
-- (Note: If you don't have a table for genders, the API I wrote just returns a list)
-- However, let's keep it simple.

-- 6. Categories (Business)
-- If categories are also duplicated:
-- TRUNCATE TABLE categories CASCADE;
-- INSERT INTO categories (name, type, is_active) VALUES ...
