-- Cleanup Script
-- 1. Truncate device_tokens
TRUNCATE TABLE device_tokens CASCADE;

-- 2. Delete data for users NOT in (1, 2)
-- Child tables of products/services
DELETE FROM product_categories WHERE product_id IN (SELECT id FROM products WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2)));
DELETE FROM product_sub_categories WHERE product_id IN (SELECT id FROM products WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2)));
DELETE FROM service_categories WHERE service_id IN (SELECT id FROM services WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2)));
DELETE FROM service_sub_categories WHERE service_id IN (SELECT id FROM services WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2)));

-- Child tables of businesses
DELETE FROM products WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2));
DELETE FROM services WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2));
DELETE FROM social_accounts WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2));
DELETE FROM business_categories WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2));

-- Child tables of users
DELETE FROM ai_generated_content WHERE user_id NOT IN (1, 2);
DELETE FROM ai_usage_logs WHERE user_id NOT IN (1, 2);
DELETE FROM user_subscriptions WHERE user_id NOT IN (1, 2);
DELETE FROM feedbacks WHERE user_id NOT IN (1, 2);
DELETE FROM user_blocks WHERE user_id NOT IN (1, 2) OR blocked_by NOT IN (1, 2);
DELETE FROM businesses WHERE user_id NOT IN (1, 2);
DELETE FROM media_files WHERE user_id NOT IN (1, 2);

-- Finally delete users
DELETE FROM users WHERE id NOT IN (1, 2);
