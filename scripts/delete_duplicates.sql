
-- Delete duplicates from audience_types
DELETE FROM audience_types
WHERE id NOT IN (
    SELECT MIN(id)
    FROM audience_types
    GROUP BY name
);

-- Delete duplicates from target_regions
DELETE FROM target_regions
WHERE id NOT IN (
    SELECT MIN(id)
    FROM target_regions
    GROUP BY name
);

-- Delete duplicates from target_age_groups
DELETE FROM target_age_groups
WHERE id NOT IN (
    SELECT MIN(id)
    FROM target_age_groups
    GROUP BY name
);

-- Delete duplicates from model_ethnicities
DELETE FROM model_ethnicities
WHERE id NOT IN (
    SELECT MIN(id)
    FROM model_ethnicities
    GROUP BY name
);

-- Delete duplicates from business_types
DELETE FROM business_types
WHERE id NOT IN (
    SELECT MIN(id)
    FROM business_types
    GROUP BY name
);

-- Delete duplicates from cta_buttons
DELETE FROM cta_buttons
WHERE id NOT IN (
    SELECT MIN(id)
    FROM cta_buttons
    GROUP BY name
);
