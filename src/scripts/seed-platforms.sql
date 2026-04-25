
-- Seed Platforms
INSERT INTO "platforms" ("name", "name_key", "app_id", "is_active", "scopes")
VALUES 
('Facebook', 'facebook', '731880461729854', true, 'pages_manage_metadata,business_management,pages_show_list,pages_manage_posts,pages_read_engagement,pages_read_user_content,email,read_insights,pages_manage_engagement,pages_messaging'),
('Instagram', 'instagram', '693568212935084', true, 'instagram_business_basic,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_insights'),
('Google Business', 'gmb', '982519183015-484j3rtb13uj5rgce4biijh8idfp96ta.apps.googleusercontent.com', true, 'https://www.googleapis.com/auth/business.manage'),
('Threads', 'threads', '1380111775991047', true, 'threads_basic,threads_content_publish,threads_read_replies,threads_manage_replies,threads_manage_insights')
ON CONFLICT ("name_key") DO UPDATE SET
  "app_id" = EXCLUDED."app_id",
  "is_active" = EXCLUDED."is_active",
  "scopes" = EXCLUDED."scopes";
