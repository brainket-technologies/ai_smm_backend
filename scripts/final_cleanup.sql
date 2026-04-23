-- Complete Database Cleanup for Neon
-- 1. Truncate device_tokens (as requested: "device table puri truncate kr do")
TRUNCATE TABLE device_tokens CASCADE;

-- 2. Delete related data for all users EXCEPT 1 and 2
-- Order: Grandchildren -> Children -> Parents

-- Grandchildren of Businesses (via Products/Services)
DELETE FROM product_categories WHERE product_id IN (SELECT id FROM products WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2)));
DELETE FROM product_sub_categories WHERE product_id IN (SELECT id FROM products WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2)));
DELETE FROM service_categories WHERE service_id IN (SELECT id FROM services WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2)));
DELETE FROM service_sub_categories WHERE service_id IN (SELECT id FROM services WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2)));

-- Children of Businesses
DELETE FROM products WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2));
DELETE FROM services WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2));
DELETE FROM social_accounts WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2));
DELETE FROM business_categories WHERE business_id IN (SELECT id FROM businesses WHERE user_id NOT IN (1, 2));

-- Children of Users
DELETE FROM ai_generated_content WHERE user_id NOT IN (1, 2);
DELETE FROM ai_usage_logs WHERE user_id NOT IN (1, 2);
DELETE FROM user_subscriptions WHERE user_id NOT IN (1, 2);
DELETE FROM feedbacks WHERE user_id NOT IN (1, 2);
DELETE FROM user_blocks WHERE user_id NOT IN (1, 2) OR blocked_by NOT IN (1, 2);
DELETE FROM businesses WHERE user_id NOT IN (1, 2);

-- Media Files (many tables reference this, so we handle it carefully)
-- We only delete media files specifically uploaded by these users
DELETE FROM media_files WHERE user_id NOT IN (1, 2);

-- 3. Finally delete users (except 1 and 2)
DELETE FROM users WHERE id NOT IN (1, 2);
