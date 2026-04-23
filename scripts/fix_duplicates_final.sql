-- RUN THIS IN NEON SQL EDITOR
-- This script will fix the "3 times data" issue by cleaning the tables first.

-- 1. Clean and Seed Audience Types
TRUNCATE TABLE audience_types CASCADE;
INSERT INTO audience_types (name, is_active) VALUES
('Small Business', true),
('Corporate', true),
('Individual/Creator', true),
('Agency', true),
('Non-Profit', true);

-- 2. Clean and Seed Target Regions
TRUNCATE TABLE target_regions CASCADE;
INSERT INTO target_regions (name, is_active) VALUES
('Local (City)', true),
('Regional (State)', true),
('National', true),
('International', true);

-- 3. Clean and Seed Target Age Groups
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
