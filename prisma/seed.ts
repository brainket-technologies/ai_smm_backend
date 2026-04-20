// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const connectionString = process.env.DATABASE_URL || "postgresql://firozmohammad:@localhost:5432/ai_social?schema=public";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // --- HELPER FOR MEDIA ---
  const registerMediaInSeed = async (url: string, type: 'image' | 'video', category: string, relatedType: string) => {
    if (!url) return null;
    const media = await prisma.mediaFile.create({
      data: {
        fileUrl: url,
        fileType: type,
        mediaCategory: category,
        relatedType: relatedType,
        tags: { seeded: true }
      }
    });
    return media.id;
  };

  // 1. Create Roles
  // First, cleanup any other roles to ensure ONLY these two exist
  await prisma.role.deleteMany({
    where: {
      name: {
        notIn: ['Super Admin', 'User']
      }
    }
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: { name: 'Super Admin', isActive: true },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: { name: 'User', isActive: true },
  });

  console.log('Roles created/verified.');

  // 2. Create Super Admin User
  const adminPassword = await bcrypt.hash('12345', 10);
  const superAdmin = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {
      email: 'admin@ai.com',
      roleId: adminRole.id,
      password: adminPassword,
    },
    create: {
      phone: '9876543210',
      email: 'admin@ai.com',
      name: 'Super Admin',
      password: adminPassword,
      roleId: adminRole.id,
      isVerified: true,
    },
  });

  console.log('Super Admin user created:', superAdmin.email);

  // 3. Create Sample User & Business (Requested by User)
  const firozPassword = await bcrypt.hash('12345', 10);
  const sampleUser = await prisma.user.upsert({
    where: { email: 'firoz@test.com' },
    update: { roleId: userRole.id },
    create: {
      email: 'firoz@test.com',
      name: 'Firoz Test User',
      password: firozPassword,
      roleId: userRole.id,
      isVerified: true,
      phone: '1234567890'
    },
  });

  const sampleBusiness = await prisma.business.upsert({
    where: { id: 1001 },
    update: { owner: { connect: { id: sampleUser.id } } },
    create: {
      id: 1001,
      name: 'Firoz Tech Solutions',
      owner: { connect: { id: sampleUser.id } },
      description: 'AI powered social media management',
      email: 'info@firoztech.com'
    }
  });

  console.log('Sample User and Business created.');

  // 3. Create initial App Config
  const appConfigJson = {
    "app_name": "BrandBoost AI",
    "maintenance_mode": false,
    "maintenance_message": "We are currently performing scheduled maintenance to improve your experience. We will be back online shortly!",
    "developer_mode": false,
    "global_ai_enabled": true,
    "free_trial_days": 7,
    "api_base_url": "https://api.brandboostai.com/v1",
    "support_email": "support@brandboostai.com"
  };

  await prisma.appConfig.upsert({
    where: { id: BigInt(1) },
    update: {
      appName: appConfigJson.app_name,
      maintenanceMode: appConfigJson.maintenance_mode,
      maintenanceMessage: appConfigJson.maintenance_message,
      developerMode: appConfigJson.developer_mode,
      globalAiEnabled: appConfigJson.global_ai_enabled,
      freeTrialDays: appConfigJson.free_trial_days,
      apiBaseUrl: appConfigJson.api_base_url,
      supportEmail: appConfigJson.support_email,
    },
    create: {
      id: BigInt(1),
      appName: appConfigJson.app_name,
      maintenanceMode: appConfigJson.maintenance_mode,
      maintenanceMessage: appConfigJson.maintenance_message,
      developerMode: appConfigJson.developer_mode,
      globalAiEnabled: appConfigJson.global_ai_enabled,
      freeTrialDays: appConfigJson.free_trial_days,
      apiBaseUrl: appConfigJson.api_base_url,
      supportEmail: appConfigJson.support_email,
    },
  });

  console.log('App Config updated.');

  // 3.1 Platform Configs
  const platforms = [
    {
      platform: "android",
      appVersion: "1.0.0",
      appVersionCode: 1,
      forceUpdateVersion: "1.0.0",
      forceUpdateVersionCode: 1,
      storeUrl: "https://play.google.com/store/apps/details?id=com.brandboost.ai",
      updateDescription: "We've added new AI features and improved app stability!"
    },
    {
      platform: "ios",
      appVersion: "1.0.0",
      appVersionCode: 1,
      forceUpdateVersion: "1.0.0",
      forceUpdateVersionCode: 1,
      storeUrl: "https://apps.apple.com/app/brandboost-ai/id123456789",
      updateDescription: "New UI enhancements and bug fixes for a smoother experience."
    }
  ];

  for (const p of platforms) {
    await prisma.appPlatformConfig.upsert({
      where: { platform: p.platform },
      update: p,
      create: p
    });
  }

  console.log('Platform Configs updated.');

  // 3.2 Feature Flags (Flattened)
  const featureModules = {
    "dashboard": {
      "dash_analytics_cards": true,
      "dash_ai_actions": true,
      "dash_schedule_view": true,
      "dash_smart_suggestions": true,
      "dash_platform_selector": true,
      "dash_recent_activity": true,
      "dash_special_day_alert": true
    },
    "ai_studio": {
      "ai_chat_access": true,
      "ai_voice_input": true,
      "ai_vision_input": true,
      "ai_history_drawer": true,
      "ai_structured_replies": false
    },
    "marketing": {
      "post_create_access": true,
      "post_ai_generator_btn": true,
      "post_scheduling_logic": true,
      "post_ai_caption_gen": true,
      "post_ai_hashtag_gen": true,
      "post_cta_manager": true,
      "post_multi_platform_sync": true,
      "post_media_ai_library": true,
      "post_remove_watermark": true
    },
    "finance": {
      "ledger_customer_view": true,
      "ledger_supplier_view": true,
      "ledger_add_entry": true,
      "ledger_search_filter": true,
      "ledger_analytics_card": true,
      "ledger_reports_pro": true
    },
    "library": {
      "library_access": true,
      "library_category_filters": true,
      "library_ai_generated_view": true,
      "library_cloud_upload": true,
      "library_ai_generator_shortcut": true
    },
    "brand": {
      "biz_brand_kit": true,
      "biz_target_audience": true,
      "biz_social_connect": true
    },
    "engagement": {
      "inbox_access": true,
      "inbox_platform_filters": true,
      "inbox_auto_reply_ai": true,
      "inbox_leads_tracking": true
    },
    "planner": {
      "planner_access": true,
      "planner_view_toggle": true,
      "planner_festival_highlights": true,
      "planner_post_markers": true,
      "planner_reschedule_action": true,
      "planner_ai_shortcuts": true
    },
    "vcard": {
      "vcard_share_access": true,
      "vcard_designer_carousel": true,
      "vcard_whatsapp_direct": true,
      "vcard_premium_themes": true
    },
    "preferences": {
      "pref_profile_edit": true,
      "pref_account_mgmt": true,
      "pref_subscription_mgmt": true,
      "pref_notification_ctrl": true,
      "pref_business_profile": true,
      "pref_security_auth": true
    },
    "analytics": {
      "analytics_platform_metrics": true,
      "analytics_reach_trends": true,
      "analytics_ai_insights": true,
      "analytics_viral_analysis": true,
      "analytics_viral_v2_cards": true,
      "analytics_sticky_dashboard": true,
      "analytics_content_performance": true,
      "analytics_gmb_insights": true,
      "analytics_audience_demo": true,
      "analytics_export_report": true
    },
    "catalog": {
      "catalog_product_mgmt": true,
      "catalog_service_mgmt": true,
      "catalog_inventory_tracking": true,
      "catalog_search_filter": true
    },
    "keywords": {
      "keyword_search_access": true,
      "keyword_regional_lookup": true,
      "keyword_difficulty_score": true,
      "keyword_save_to_leads": true
    },
    "settings": {
      "settings_theme_switch": true,
      "settings_currency_switch": true,
      "settings_language_switch": true,
      "settings_legal_view": true,
      "settings_feedback_submit": true,
      "settings_account_delete": true,
      "settings_help_support": true
    },
    "notifications": {
      "notifications_view_access": true,
      "notifications_clear_action": true
    },
    "monetization": {
      "ads_free_experience": false,
      "ai_rewarded_ads": true
    }
  };

  const allFeatureKeys = Object.values(featureModules).flatMap(f => Object.keys(f));

  for (const [moduleName, features] of Object.entries(featureModules)) {
    for (const [featureKey, isEnabled] of Object.entries(features)) {
      await prisma.appFeatureFlag.upsert({
        where: { moduleName_featureKey: { moduleName, featureKey } },
        update: { isEnabled },
        create: { moduleName, featureKey, isEnabled }
      });
    }
  }

  console.log('Feature Flags updated.');

  // 3.3 Subscription Tiers & Permissions
  const subscriptionTiers = [
    {
      "id": "free",
      "name": "Free",
      "price_amount": 0,
      "price_period": "forever",
      "badge": "Basic",
      "highlight_features": [
        "2 Daily Posts",
        "5 AI Chats/day",
        "1 Platform Only",
        "Basic Insights View"
      ],
      "permissions": [
        "dash_analytics_cards",
        "post_create_access",
        "inbox_access",
        "planner_access",
        "library_access",
        "ledger_customer_view",
        "ledger_search_filter",
        "pref_profile_edit",
        "pref_business_profile",
        "pref_notification_ctrl",
        "catalog_search_filter",
        "settings_legal_view",
        "settings_feedback_submit",
        "settings_account_delete",
        "settings_help_support",
        "notifications_view_access",
        "biz_social_connect",
        "ai_rewarded_ads"
      ],
      "limits": {
        "unlimited": false,
        "daily_posts": 2,
        "daily_ai_chats": 5,
        "daily_ai_images": 0,
        "max_customers": 50,
        "max_products": 10,
        "max_services": 5,
        "max_keyword_searches": 5,
        "max_storage_mb": 50,
        "max_video_length_seconds": 15,
        "max_concurrent_devices": 1,
        "max_business_accounts": 1,
        "allowed_platforms": ["facebook"]
      }
    },
    {
      "id": "basic",
      "name": "Basic",
      "price_amount": 499,
      "price_period": "month",
      "badge": "Starter",
      "highlight_features": [
        "10 Daily Posts",
        "50 AI Chats/day",
        "2 Platforms",
        "Daily Reach Trends"
      ],
      "permissions": [
        "dash_analytics_cards",
        "dash_ai_actions",
        "ai_chat_access",
        "ai_voice_input",
        "post_create_access",
        "post_ai_generator_btn",
        "post_cta_manager",
        "inbox_access",
        "inbox_platform_filters",
        "planner_access",
        "planner_view_toggle",
        "library_access",
        "library_category_filters",
        "ledger_customer_view",
        "ledger_supplier_view",
        "ledger_search_filter",
        "vcard_share_access",
        "pref_profile_edit",
        "pref_business_profile",
        "pref_notification_ctrl",
        "pref_subscription_mgmt",
        "analytics_platform_metrics",
        "dash_recent_activity",
        "dash_platform_selector",
        "catalog_product_mgmt",
        "catalog_service_mgmt",
        "catalog_search_filter",
        "keyword_search_access",
        "settings_theme_switch",
        "settings_language_switch",
        "settings_legal_view",
        "settings_feedback_submit",
        "settings_account_delete",
        "settings_help_support",
        "notifications_view_access",
        "biz_social_connect",
        "ads_free_experience"
      ],
      "limits": {
        "unlimited": false,
        "daily_posts": 10,
        "daily_ai_chats": 50,
        "daily_ai_images": 10,
        "max_customers": 500,
        "max_products": 100,
        "max_services": 50,
        "max_keyword_searches": 50,
        "max_storage_mb": 500,
        "max_video_length_seconds": 60,
        "max_concurrent_devices": 2,
        "max_business_accounts": 3,
        "allowed_platforms": ["facebook", "instagram"]
      }
    },
    {
      "id": "pro",
      "name": "Pro",
      "price_amount": 1999,
      "price_period": "month",
      "badge": "Best Value",
      "highlight_features": [
        "50 Daily Posts",
        "AI Caption & Hashtag Gen",
        "Post Scheduling",
        "AI Viral Content Carousel & Advanced Stats"
      ],
      "permissions": ["all_basic"],
      "limits": {
        "unlimited": false,
        "daily_posts": 50,
        "daily_ai_chats": 200,
        "daily_ai_images": 50,
        "max_customers": 5000,
        "max_products": 1000,
        "max_services": 500,
        "max_keyword_searches": 200,
        "max_storage_mb": 5000,
        "max_video_length_seconds": 180,
        "max_concurrent_devices": 4,
        "max_business_accounts": 10,
        "allowed_platforms": ["facebook", "instagram", "linkedin", "gmb"]
      }
    },
    {
      "id": "premium",
      "name": "Premium",
      "price_amount": 9999,
      "price_period": "year",
      "badge": "50% Save",
      "highlight_features": [
        "Unlimited Posts",
        "Vision AI Input",
        "Full Audience Demographics & Sticky Insights",
        "Priority Support"
      ],
      "permissions": ["all"],
      "limits": {
        "unlimited": true,
        "daily_posts": -1,
        "daily_ai_chats": -1,
        "daily_ai_images": 200,
        "max_customers": -1,
        "max_products": -1,
        "max_services": -1,
        "max_keyword_searches": 1000,
        "max_storage_mb": 50000,
        "max_video_length_seconds": 600,
        "max_concurrent_devices": -1,
        "max_business_accounts": -1,
        "allowed_platforms": ["facebook", "instagram", "linkedin", "gmb", "whatsapp"]
      }
    }
  ];

  console.log('Seeding Subscription Tiers and Permissions...');
  for (const tierData of subscriptionTiers) {
    const sLimit = tierData.limits.max_business_accounts === -1 ? BigInt(999999) : BigInt(tierData.limits.max_business_accounts);
    const dLimit = tierData.limits.max_concurrent_devices === -1 ? BigInt(999999) : BigInt(tierData.limits.max_concurrent_devices);

    await prisma.subscriptionTier.upsert({
      where: { tierKey: tierData.id },
      update: {
        name: tierData.name,
        priceAmount: tierData.price_amount,
        pricePeriod: tierData.price_period,
        badge: tierData.badge,
        highlightFeatures: tierData.highlight_features,
        limits: tierData.limits as any,
        subscriptionLimit: sLimit,
        loginDeviceLimit: dLimit,
      },
      create: {
        tierKey: tierData.id,
        name: tierData.name,
        priceAmount: tierData.price_amount,
        pricePeriod: tierData.price_period,
        badge: tierData.badge,
        highlightFeatures: tierData.highlight_features,
        limits: tierData.limits as any,
        subscriptionLimit: sLimit,
        loginDeviceLimit: dLimit,
      }
    });

    // Expand Permissions
    let perms: string[] = [];
    if (tierData.permissions.includes("all")) {
      perms = [...allFeatureKeys];
    } else if (tierData.permissions.includes("all_basic")) {
      const basicPerms = subscriptionTiers.find(t => t.id === 'basic')?.permissions || [];
      const proSpecific = ["post_scheduling_logic", "post_ai_caption_gen", "post_ai_hashtag_gen", "post_multi_platform_sync", "ai_vision_input", "analytics_audience_demo"]; 
      perms = Array.from(new Set([...basicPerms, ...proSpecific]));
    } else {
      perms = tierData.permissions;
    }

    // Bulk create permissions for this tier
    await prisma.subscriptionPermission.createMany({
      data: perms.map(pKey => ({ tierKey: tierData.id, permissionKey: pKey })),
      skipDuplicates: true,
    });
    console.log(`- Permissions for tier ${tierData.name} initialized (${perms.length} items).`);
  }

  console.log('Subscription Tiers updated.');

  // 3.4 Create Platforms
  const platformList = [
    { name: 'Facebook', nameKey: 'facebook', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg', url: 'https://facebook.com', isActive: true },
    { name: 'Instagram', nameKey: 'instagram', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg', url: 'https://instagram.com', isActive: true },
    { name: 'LinkedIn', nameKey: 'linkedin', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png', url: 'https://linkedin.com', isActive: true },
    { name: 'Google Business', nameKey: 'gmb', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Google_Images_2015_logo.svg', url: 'https://business.google.com', isActive: true },
    { name: 'X (Twitter)', nameKey: 'twitter', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/X_logo_2023_original.svg', url: 'https://twitter.com', isActive: true },
    { name: 'WhatsApp', nameKey: 'whatsapp', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg', url: 'https://whatsapp.com', isActive: true },
    { name: 'TikTok', nameKey: 'tiktok', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Ionicons_logo-tiktok.svg', url: 'https://tiktok.com', isActive: true },
    { name: 'Pinterest', nameKey: 'pinterest', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png', url: 'https://pinterest.com', isActive: true },
  ];

  for (const plat of platformList) {
    const mediaId = await registerMediaInSeed(plat.logo, 'image', 'logo', 'platform');
    await prisma.platform.upsert({
      where: { name: plat.name },
      update: {
        nameKey: plat.nameKey,
        url: plat.url,
        isActive: plat.isActive,
        mediaId: mediaId
      },
      create: {
        name: plat.name,
        nameKey: plat.nameKey,
        url: plat.url,
        isActive: plat.isActive,
        mediaId: mediaId
      }
    });
  }

  console.log('Platforms initialized.');

  // 3.5 Create Payment Methods
  const paymentMethods = [
    {
      name: 'stripe',
      displayName: 'Stripe Checkout',
      type: 'gateway',
      mode: 'test',
      image: 'https://logo.clearbit.com/stripe.com',
      isActive: true,
      isDefault: true,
      config: {
        publishable_key: 'pk_test_stripe_123',
        secret_key: 'sk_test_stripe_123',
        webhook_secret: 'whsec_stripe_123'
      }
    },
    {
      name: 'razorpay',
      displayName: 'Razorpay',
      type: 'gateway',
      mode: 'test',
      image: 'https://logo.clearbit.com/razorpay.com',
      isActive: true,
      isDefault: false,
      config: {
        key_id: 'rzp_test_567',
        key_secret: 'rzp_secret_567'
      }
    },
    { name: 'paypal', displayName: 'PayPal', type: 'gateway', mode: 'test', image: 'https://logo.clearbit.com/paypal.com', isActive: false, isDefault: false },
    { name: 'flutterwave', displayName: 'Flutterwave', type: 'gateway', mode: 'test', image: 'https://logo.clearbit.com/flutterwave.com', isActive: true, isDefault: false },
    { name: 'paystack', displayName: 'Paystack', type: 'gateway', mode: 'test', image: 'https://logo.clearbit.com/paystack.com', isActive: true, isDefault: false },
    { name: 'cash', displayName: 'Manual Cash', type: 'manual', mode: 'live', image: '', isActive: true, isDefault: false },
  ];

  for (const pm of paymentMethods) {
    const mediaId = await registerMediaInSeed(pm.image, 'image', 'logo', 'payment_method');
    const { image, ...pmData } = pm;
    await prisma.paymentMethod.upsert({
      where: { name: pm.name },
      update: {
        ...pmData,
        mediaId: mediaId
      },
      create: {
        ...pmData,
        mediaId: mediaId,
        config: pm.config || {}
      }
    });
  }
  console.log('Payment Methods initialized.');

  // 3.5 Create Static Pages
  const staticPages = [
    {
      slug: 'about-us',
      title: 'About Us',
      content: '<h1>About BrandBoost AI</h1><p>BrandBoost AI is a state-of-the-art social media management platform designed to empower businesses and creators with artificial intelligence.</p>',
      isActive: true
    },
    {
      slug: 'contact-us',
      title: 'Contact Us',
      content: '<h1>Contact Us</h1><p>We are here to help you. Reach out to us at support@brandboostai.com for any queries or technical support.</p>',
      isActive: true
    },
    {
      slug: 'terms-and-conditions',
      title: 'Terms & Conditions',
      content: '<h1>Terms and Conditions</h1><p>Please read these terms carefully before using our software. By accessing BrandBoost AI, you agree to be bound by these terms of service.</p>',
      isActive: true
    },
    {
      slug: 'refund-policy',
      title: 'Refund Policy',
      content: '<h1>Refund Policy</h1><p>We strive for customer satisfaction. If you are not happy with your purchase, you can request a refund within 7 days of subscription.</p>',
      isActive: true
    }
  ];

  for (const page of staticPages) {
    await prisma.staticPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page
    });
  }

  console.log('Static Pages initialized.');

  // 4. Create Currencies
  const currenciesPath = path.join(__dirname, 'data', 'currencies.json');
  if (fs.existsSync(currenciesPath)) {
    const currenciesData = JSON.parse(fs.readFileSync(currenciesPath, 'utf8'));
    for (const curr of currenciesData) {
      await prisma.currency.upsert({
        where: { code: curr.code },
        update: { ...curr },
        create: { ...curr },
      });
    }
    console.log(`Currencies initialized from JSON (${currenciesData.length} entries).`);
  } else {
    // Fallback if file doesn't exist
    const currencies = [
      { name: 'Indian Rupee', code: 'INR', symbol: '₹', exchangeRate: 1.0, isDefault: true },
      { name: 'US Dollar', code: 'USD', symbol: '$', exchangeRate: 83.5, isDefault: false },
    ];
    for (const curr of currencies) {
      await prisma.currency.upsert({
        where: { code: curr.code },
        update: { ...curr },
        create: { ...curr },
      });
    }
    console.log('Currencies initialized from fallback.');
  }

  // 5. Create Themes
  const themes = [
    {
      name: "BrandBoost Green",
      primaryColor: "#1B2E28",
      secondaryColor: "#2ECC71",
      darkPrimaryColor: "#0F1F1A",
      darkSecondaryColor: "#27AE60",
      isDefault: true,
      isActive: true,
    },
    {
      name: "Ocean Blue",
      primaryColor: "#1E88E5",
      secondaryColor: "#42A5F5",
      darkPrimaryColor: "#1976D2",
      darkSecondaryColor: "#795548",
      isDefault: false,
      isActive: true,
    },
    {
      name: "Sunset Orange",
      primaryColor: "#FB8C00",
      secondaryColor: "#FFA726",
      darkPrimaryColor: "#F57C00",
      darkSecondaryColor: "#FF9800",
      isDefault: false,
      isActive: true,
    },
    {
      name: "Royal Purple",
      primaryColor: "#8E24AA",
      secondaryColor: "#AB47BC",
      darkPrimaryColor: "#7B1FA2",
      darkSecondaryColor: "#9C27B0",
      isDefault: false,
      isActive: true,
    },
    {
      name: "Nature Green",
      primaryColor: "#43A047",
      secondaryColor: "#66BB6A",
      darkPrimaryColor: "#388E3C",
      darkSecondaryColor: "#4CAF50",
      isDefault: false,
      isActive: true,
    },
    {
      name: "Teal Fresh",
      primaryColor: "#00897B",
      secondaryColor: "#26A69A",
      darkPrimaryColor: "#00796B",
      darkSecondaryColor: "#009688",
      isDefault: false,
      isActive: true,
    },
    {
      name: "Indigo Night",
      primaryColor: "#3949AB",
      secondaryColor: "#5C6BC0",
      darkPrimaryColor: "#303F9F",
      darkSecondaryColor: "#3F51B5",
      isDefault: false,
      isActive: true,
    },
    {
      name: "Pink Rose",
      primaryColor: "#D81B60",
      secondaryColor: "#EC407A",
      darkPrimaryColor: "#C2185B",
      darkSecondaryColor: "#E91E63",
      isDefault: false,
      isActive: true,
    },
    {
      name: "Fiery Orange",
      primaryColor: "#F4511E",
      secondaryColor: "#FF6E40",
      darkPrimaryColor: "#E64A19",
      darkSecondaryColor: "#FF5722",
      isDefault: false,
      isActive: true,
    },
    {
      name: "Coffee Brown",
      primaryColor: "#6D4C41",
      secondaryColor: "#8D6E63",
      darkPrimaryColor: "#5D4037",
      darkSecondaryColor: "#795548",
      isDefault: false,
      isActive: true,
    },
  ];

  for (const theme of themes) {
    // Generate a placeholder preview for themes if none exist (using generic picsum for seed)
    const mediaId = await registerMediaInSeed(`https://picsum.photos/seed/${theme.name}/400/300`, 'image', 'theme', 'app_theme');
    await prisma.appTheme.upsert({
      where: { id: BigInt(themes.indexOf(theme) + 1) },
      update: {
        ...theme,
        mediaId: mediaId
      },
      create: {
        id: BigInt(themes.indexOf(theme) + 1),
        ...theme,
        mediaId: mediaId
      },
    });
  }

  console.log('App Themes initialized.');

  // 6. Create Localization
  const translationsPath = path.join(__dirname, 'data', 'translations.json');
  if (fs.existsSync(translationsPath)) {
    const rawData = fs.readFileSync(translationsPath, 'utf8');
    const localizationData = JSON.parse(rawData);

    for (const lang of localizationData.languages) {
      const langCode = lang["language-code"];
      const translations = localizationData.translations[langCode] || {};

      const mediaId = await registerMediaInSeed(lang["image-url"], 'image', 'flag', 'app_translation');

      await prisma.appTranslation.upsert({
        where: { languageCode: langCode },
        update: {
          displayName: lang["display-name"],
          countryCode: lang["country-code"],
          isDefault: lang["is-default"],
          translations: translations,
          mediaId: mediaId
        },
        create: {
          displayName: lang["display-name"],
          languageCode: langCode,
          countryCode: lang["country-code"],
          isDefault: lang["is-default"],
          translations: translations,
          mediaId: mediaId
        },
      });
    }
    console.log('Localization initialized from JSON.');
  } else {
    console.warn('translations.json not found, skipping localization seeding.');
  }

  // --- CATEGORY SEGMENTATION SEEDING ---
  console.log('Seeding Typed Categories...');
  const categoryData = [
    {
      type: "business",
      data: [
        { name: "Retail & Commerce", subs: ["Supermarket", "Clothing Store", "Electronics Shop", "Bookstore", "Hardware", "Jewelry", "Furniture", "Pharmacy", "Pet Store", "Stationery"] },
        { name: "Healthcare", subs: ["Hospital", "Dental Clinic", "Pharmacy", "Chiropractor", "Dermatology", "Pediatrics", "Eye Care", "Psychiatry", "Veterinary", "Nutritionist"] },
        { name: "Information Technology", subs: ["Software Dev", "Cybersecurity", "Cloud Hosting", "IT Consulting", "Network Admin", "Data Analytics", "Managed Services", "Blockchain", "AI Research", "Web Design"] },
        { name: "Food & Beverage", subs: ["Restaurant", "Cafe", "Bakery", "Food Truck", "Catering", "Bar", "Brewery", "Pizza Shop", "Fine Dining", "Fast Food"] },
        { name: "Real Estate", subs: ["Residential Sales", "Commercial Leases", "Property Mgmt", "Appraisal", "Real Estate Law", "Architecture", "Landscaping", "Interior Design", "Title Company", "Mortgage Broker"] },
        { name: "Manufacturing", subs: ["Automotive", "Textiles", "Electronics", "Plastics", "Metal Fabrication", "Food Processing", "Chemicals", "Paper Mills", "Aerospace", "Machinery"] },
        { name: "Education", subs: ["K-12 School", "University", "Tutoring Center", "Language School", "Trade School", "Music Academy", "Dance Studio", "Driving School", "Culinary Institute", "Online Courses"] },
        { name: "Finance & Accounting", subs: ["Banking", "Investment Firm", "Accounting Firm", "Tax Prep", "Insurance Agency", "Wealth Mgmt", "Credit Union", "Venture Capital", "Payroll Services", "Auditing"] },
        { name: "Automotive", subs: ["Car Dealership", "Auto Repair", "Tire Shop", "Car Wash", "Towing", "Body Shop", "Motorcycle Sales", "Truck Rental", "Auto Parts", "Detailing"] },
        { name: "Entertainment", subs: ["Movie Theater", "Amusement Park", "Nightclub", "Bowling Alley", "Arcade", "Museum", "Art Gallery", "Concert Hall", "Escape Room", "Sports Arena"] }
      ]
    },
    {
      type: "product",
      data: [
        { name: "Consumer Electronics", subs: ["Smartphones", "Laptops", "Tablets", "Headphones", "Smartwatches", "TVs", "Cameras", "Gaming Consoles", "Drones", "Speakers"] },
        { name: "Fashion & Apparel", subs: ["Men's Clothing", "Women's Clothing", "Kids' Apparel", "Shoes", "Bags", "Jewelry", "Watches", "Sunglasses", "Activewear", "Sleepwear"] },
        { name: "Home & Garden", subs: ["Furniture", "Bedding", "Kitchenware", "Decor", "Lighting", "Gardening Tools", "Outdoor Furniture", "Rugs", "Storage", "Bath Accessories"] },
        { name: "Software & Digital", subs: ["Operating Systems", "Antivirus", "Design Tech", "Video Editing", "Office Suites", "Mobile Apps", "Plugins", "E-books", "Stock Assets", "SaaS Subscriptions"] },
        { name: "Groceries", subs: ["Fresh Produce", "Dairy & Eggs", "Meat & Seafood", "Pantry Staples", "Snacks", "Beverages", "Frozen Foods", "Bakery Items", "Organic", "Canned Goods"] },
        { name: "Beauty & Personal Care", subs: ["Skincare", "Makeup", "Haircare", "Fragrances", "Bath & Body", "Oral Care", "Men's Grooming", "Suntan", "Deodorants", "Nail Care"] },
        { name: "Toys & Games", subs: ["Action Figures", "Board Games", "Puzzles", "Educational", "Dolls", "Building Blocks", "Outdoor Play", "Arts & Crafts", "RC Vehicles", "Card Games"] },
        { name: "Books & Media", subs: ["Fiction", "Non-Fiction", "Audiobooks", "Textbooks", "Magazines", "Comics", "Vinyl Records", "Movies", "Sheet Music", "Journals"] },
        { name: "Sports & Outdoors", subs: ["Fitness Equipment", "Camping Gear", "Cycling", "Team Sports", "Fishing", "Water Sports", "Winter Sports", "Hunting", "Athletic Apparel", "Yoga Mats"] },
        { name: "Automotive Parts", subs: ["Tires", "Batteries", "Brake Pads", "Wiper Blades", "Oils & Fluids", "Filters", "Lights", "Spark Plugs", "Suspension", "Exhausts"] }
      ]
    },
    {
      type: "service",
      data: [
        { name: "Consulting", subs: ["Business Strategy", "Financial Advisory", "HR Consulting", "Risk Management", "Compliance", "IT Strategy", "Marketing Consulting", "Operations", "Sustainability", "Sales Coaching"] },
        { name: "Cleaning", subs: ["Residential Cleaning", "Commercial Janitorial", "Deep Cleaning", "Carpet Cleaning", "Window Washing", "Pool Cleaning", "Post-Construction", "Gutter Cleaning", "Pressure Washing", "Maid Service"] },
        { name: "Maintenance & Repair", subs: ["Plumbing", "Electrical", "HVAC", "Appliance Repair", "Roofing", "Pest Control", "Handyman", "Locksmith", "Painting", "Carpentry"] },
        { name: "Freelance & Creative", subs: ["Copywriting", "Graphic Design", "Video Editing", "Voiceover", "Illustration", "Translation", "Photography", "Animation", "Music Production", "Ghostwriting"] },
        { name: "Legal", subs: ["Corporate Law", "Family Law", "Criminal Defense", "Immigration", "Intellectual Property", "Personal Injury", "Real Estate Law", "Tax Law", "Bankruptcy", "Employment Law"] },
        { name: "Marketing & Strategy", subs: ["SEO Services", "Social Media Mgmt", "PPC Advertising", "Email Marketing", "PR", "Content Marketing", "Influencer Outreach", "Branding", "Market Research", "Affiliate Mgmt"] },
        { name: "Design & UX", subs: ["UI/UX Design", "Web Design", "Logo Creation", "Packaging Design", "Print Layout", "App Design", "Industrial Design", "Interior Design", "Wireframing", "Prototyping"] },
        { name: "Construction", subs: ["General Contracting", "Masonry", "Framing", "Drywall", "Concrete", "Excavation", "Flooring", "Siding", "Paving", "Demolition"] },
        { name: "Logistics & Delivery", subs: ["Courier Service", "Freight Shipping", "Moving Services", "Warehousing", "Last-Mile Delivery", "Food Delivery", "Vehicle Transport", "Supply Chain", "Customs Brokerage", "Inventory Mgmt"] },
        { name: "Health & Fitness", subs: ["Personal Training", "Yoga Instruction", "Pilates", "Martial Arts", "Nutrition Coaching", "Physical Therapy", "Massage Therapy", "Meditation", "Sports Coaching", "Diet Planning"] }
      ]
    }
  ];

  for (const group of categoryData) {
    console.log(`- Seeding ${group.type} categories...`);
    for (const cat of group.data) {
      // Upsert Category
      const createdCategory = await prisma.category.upsert({
        where: { name_type: { name: cat.name, type: group.type } },
        update: {},
        create: {
          name: cat.name,
          type: group.type,
        }
      });

      // Bulk create SubCategories
      await prisma.subCategory.createMany({
        data: cat.subs.map(sub => ({
          categoryId: createdCategory.id,
          name: sub,
          type: group.type
        })),
        skipDuplicates: true,
      });
    }
  }

  // --- SEED AUXILIARY TARGETING TABLES ---
  console.log('Seeding Auxiliary Targeting Tables...');

  const targetRegions = ["Worldwide", "North America", "South America", "Europe", "Asia Pacific", "Middle East", "Africa", "USA", "Canada", "UK", "India", "Australia", "Germany", "France", "Japan", "Brazil", "UAE", "Saudi Arabia", "Singapore", "South Africa", "Mexico", "China", "Italy", "Spain", "Russia"];
  const targetAges = ["Toddlers (1-3)", "Kids (4-12)", "Teens (13-17)", "Young Adults (18-24)", "Millennials (25-34)", "Gen X (35-44)", "Middle-Aged (45-54)", "Pre-retirees (55-64)", "Seniors (65+)", "65 Above", "All Ages", "25 Yr Male", "25 Yr Female", "All Males", "All Females", "Couples", "Expecting Parents", "New Parents", "18-24 Male", "18-24 Female", "25-34 Male", "25-34 Female", "35-44 Male", "35-44 Female"];
  const modelEthnicities = ["Asian", "Black/African Descent", "Caucasian/White", "Hispanic/Latino", "Middle Eastern", "Native American", "Mixed", "South Asian", "Any"];
  const ctaButtons = ["Shop Now", "Learn More", "Sign Up", "Subscribe", "Book Now", "Contact Us", "Download", "Try For Free", "Watch Video", "Request Demo", "Get Started", "Join Now", "Order Now", "Find Out More", "Claim Offer"];
  const audienceTypes = ["Students", "Professionals", "Parents", "Entrepreneurs", "Gamers", "Fitness Enthusiasts", "Shoppers", "Techies", "Travelers", "Foodies", "Retirees", "Investors", "Fashionistas", "Homeowners", "Pet Owners", "Customer", "Couple", "Client", "Guest", "Patient", "Member", "Student", "Passenger", "User", "Subscriber", "Visitor", "Buyer", "Donor", "Owner/Partner", "Other"];

  const seedAuxTable = async (modelDelegate: any, dataItems: string[], tableName: string) => {
    console.log(`- Seeding ${tableName} (${dataItems.length} items)...`);
    await modelDelegate.createMany({
      data: dataItems.map(name => ({ name, isActive: true })),
      skipDuplicates: true,
    });
  };

  await seedAuxTable(prisma.targetRegion, targetRegions, 'Target Regions');
  await seedAuxTable(prisma.targetAgeGroup, targetAges, 'Target Age Groups');
  await seedAuxTable(prisma.modelEthnicity, modelEthnicities, 'Model Ethnicities');
  await seedAuxTable(prisma.cTAButton, ctaButtons, 'CTA Buttons');
  await seedAuxTable(prisma.audienceType, audienceTypes, 'Audience Types');

  // --- SEED FEEDBACK ---
  console.log('Seeding Sample Feedbacks...');

  // Re-fetching sampleUser to ensure we have the ID in this scope if needed 
  // (though it was declared in main, this is safer if we rearranged code)
  const firozUser = await prisma.user.findUnique({ where: { email: 'firoz@test.com' } });

  const feedbackData = [
    {
      userId: firozUser?.id,
      subject: "Business Rating",
      message: "Firoz Tech Solutions is doing great work! Highly recommended.",
      rating: 5,
      status: "resolved"
    },
    {
      userId: firozUser?.id || superAdmin.id,
      subject: "General Feedback",
      message: "Categories page is loading a bit slow on my end.",
      rating: 3,
      status: "pending"
    },
  ];

  console.log('Seeding Sample Feedbacks...');
  for (const f of feedbackData) {
    const exists = await prisma.feedback.findFirst({ where: { message: f.message } });
    if (!exists) {
      await prisma.feedback.create({ data: f });
    }
  }

  console.log('Seeding AI Models...');
  const aiModels = [
    {
      modelKey: 'gpt-4o',
      provider: 'OpenAI',
      modelType: 'text-generation',
      contextWindow: 128000,
      maxTokens: 4096,
      inputCostPer1k: 0.005,
      outputCostPer1k: 0.015,
      config: { temperature: 0.7, top_p: 1.0 },
      isActive: true,
      apiKey: "sk-proj-xxxxxxxxxxxxxxxxxxxx"
    },
    {
      modelKey: 'claude-3-5-sonnet-20240620',
      provider: 'Anthropic',
      modelType: 'text-generation',
      contextWindow: 200000,
      maxTokens: 8192,
      inputCostPer1k: 0.003,
      outputCostPer1k: 0.015,
      config: { max_tokens: 4096 },
      isActive: true,
      apiKey: "sk-ant-at03-xxxxxxxxxxxxxxxxxxxx"
    },
    {
      modelKey: 'gemini-1.5-pro',
      provider: 'Google',
      modelType: 'text-generation',
      contextWindow: 1000000,
      maxTokens: 8192,
      inputCostPer1k: 0.0035,
      outputCostPer1k: 0.0105,
      config: { safety_settings: "BLOCK_NONE" },
      isActive: true,
      apiKey: "AIzaSyxxxxxxxxxxxxxxxxxxxx"
    },
    {
      modelKey: 'sora-v1',
      provider: 'OpenAI',
      modelType: 'video-generation',
      contextWindow: 0,
      maxTokens: 0,
      inputCostPer1k: 0.50,
      outputCostPer1k: 2.50,
      config: { duration: "60s", resolution: "1080p" },
      isActive: true,
      apiKey: "sk-proj-xxxxxxxxxxxxxxxxxxxx"
    },
    {
      modelKey: 'gpt-4o-mini',
      provider: 'OpenAI',
      modelType: 'caption-generation',
      contextWindow: 128000,
      maxTokens: 2048,
      inputCostPer1k: 0.00015,
      outputCostPer1k: 0.0006,
      config: { detail: "high" },
      isActive: true,
      apiKey: "sk-proj-xxxxxxxxxxxxxxxxxxxx"
    }
  ];

  for (const model of aiModels) {
    const exists = await prisma.aIModel.findUnique({ where: { modelKey: model.modelKey } });
    if (exists) {
      await prisma.aIModel.update({
        where: { modelKey: model.modelKey },
        data: model
      });
    } else {
      await prisma.aIModel.create({ data: model });
    }
  }

  console.log('Seeding AI Prompts...');
  const aiPrompts = [
    {
      promptKey: 'marketing_social_post',
      moduleName: 'Marketing',
      systemInstruction: 'You are an expert social media marketer. Create engaging, high-conversion posts that align with brand voice.',
      userPromptTemplate: 'Create a social media post for {businessName} about {topic}. Include high-traffic hashtags.',
      isActive: true,
      version: 1
    },
    {
      promptKey: 'product_description_optimizer',
      moduleName: 'Product',
      systemInstruction: 'You are a professional e-commerce copywriter. Focus on benefits, features, and SEO keywords.',
      userPromptTemplate: 'Optimize this product description for {productName}: {description}.',
      isActive: true,
      version: 1
    },
    {
      promptKey: 'support_email_drafter',
      moduleName: 'Support',
      systemInstruction: 'You are a helpful customer support representative. Be polite, empathetic, and solution-oriented.',
      userPromptTemplate: 'Draft a reply to this customer query: {query}. The specific business is {businessName}.',
      isActive: true,
      version: 1
    }
  ];

  for (const prompt of aiPrompts) {
    const exists = await prisma.aIPrompt.findUnique({ where: { promptKey: prompt.promptKey } });
    if (exists) {
      await prisma.aIPrompt.update({ where: { promptKey: prompt.promptKey }, data: prompt });
    } else {
      await prisma.aIPrompt.create({ data: prompt });
    }
  }

  console.log('Seeding External Service Configs...');
  const externalConfigs = [
    {
      category: 'otp',
      provider: 'msg91',
      config: {
        authKey: 'YOUR_MSG91_AUTH_KEY',
        templateId: 'YOUR_TEMPLATE_ID',
        senderId: 'YOUR_SENDER_ID'
      },
      isActive: false,
      isDefault: false
    },
    {
      category: 'otp',
      provider: 'firebase',
      config: {
        apiKey: 'AIzaSyA5SVlOwGfeSrfOprRry5a-1kkoHl_m_Fg',
        authDomain: 'fir-notes-20c44.firebaseapp.com',
        projectId: 'fir-notes-20c44'
      },
      isActive: true,
      isDefault: true
    },
    {
      category: 'mail',
      provider: 'smtp',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        user: 'brainkettech@gmail.com',
        pass: 'kuzwqngeywqwvig',
        from: 'Brainket Tech <brainkettech@gmail.com>'
      },
      isActive: true,
      isDefault: true
    },
    {
      category: 'storage',
      provider: 's3',
      config: {
        bucket: 'brandboost-ai',
        region: 'auto',
        endpoint: 'https://your-account-id.r2.cloudflarestorage.com',
        accessKeyId: 'YOUR_ACCESS_KEY',
        secretAccessKey: 'YOUR_SECRET_KEY',
        publicUrl: 'https://pub-your-id.r2.dev'
      },
      isActive: false,
      isDefault: false
    },
    {
      category: 'storage',
      provider: 'cloudinary',
      config: {
        cloudName: 'YOUR_CLOUD_NAME',
        apiKey: 'YOUR_API_KEY',
        apiSecret: 'YOUR_API_SECRET'
      },
      isActive: false,
      isDefault: false
    },
    {
      category: 'storage',
      provider: 'cloudflare',
      config: {
        accountId: '01d5e6ef06459ccd65c6cf090b257f3a',
        bucket: 'smm-app',
        accessKey: 'fc267b61e37006faec3c74467d5e4257',
        secretKey: '0db4c7e968759254c708a8d8a7dfbef4b4c095c64a5fada737ac15baef1ec0d2',
        publicUrl: 'https://pub-48874cf0b48c45fda1607415bcffe39d.r2.dev',
        endpoint: 'https://01d5e6ef06459ccd65c6cf090b257f3a.r2.cloudflarestorage.com',
      },
      isActive: true,
      isDefault: true
    },
    {
      category: 'storage',
      provider: 'firebase',
      config: {
        bucketUrl: 'gs://fir-notes-20c44.firebasestorage.app',
        json: `{
  "type": "service_account",
  "project_id": "fir-notes-20c44",
  "private_key_id": "4820252c67b5cf6255bc8d86b7dbc85fd2b85ac5",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0c2R0mK8DDX76\n0KwFZ4X1z3mfx4tEv0XwW5yJOs5/4D/vHnGisKD0YyLL8LJslmyXRCFSjTJjxCZU\nxiKLOBP1puuhTStQpIfX3pjRPsh5sHWLdLBM1LoMCYOD2sNUSgK0+tPfBPqxyPh+\nAO/ZzR8M3728c2BjyPqXIoc5ZUpMbRavhL92VU5BItlntgg5UYv2K2O40pLOSZX9\nGrQhzofXyBQkphfjaa+5+FRd9AJR1gIFJ5kF2giWHmGtdgkkrU1JaonyzZ5E7MGe\nkHqHntJFvrDOXY3022FBh1pII9kQmyiYzDE/3xntGZJ1/COMlJAIe77Vvc2d+Upp\nAXSLUAFlAgMBAAECggEAJGthq/Kg5+HSbfatsU2KiOj96BSS9CYSjIdA2aWHxeFR\npgYj8yzo30oe3MBQkn/tnL4AZ7PdpqsQ/W0bzbNcu+ibh+uWQWljjVr8xsaAGadW\nofXEG02X2xQUegkuARYK49H37vwHSNiB5pRz1CaFDMkfdyhmHN2UTeqHFjtuOmw2\n7QxX5OybbidxFb/7RpgOSLHAe+RbclY4YnGpVM+57v7HLvEKahdJEpvqV3Uqa+3h\nUgbXOQDv5JCcgaoupGvjXiFC0SuHk5djItu/Uc6oSkUBan/q+6kal8aTFhovdl3Q\ngqnXfSSNwo1RAuFrELr3gcFkb2ubNojnNrZSSitHZQKBgQDo6k+Vvz45BcZgWXTG\n112QG5klGelzbZxBLKM8gsH11IdJr7A46nsh3BMCW+rGGDChNvuQ0nMww0E2lWK1\nZCW9WPCDJesgjsCtVc/SS50xRsX83DjS1N6XiuyD7vK2QZfB3N7kEYKJPTySydPN\nuqFiw3m28RQsnXDz0fsPcvXZ8wKBgQDGVeo5WSxTwEUgfIjiprtk4BYpER+tCb5o\nQKm3K/yC3ReGH0FJunsuAbiN/8zt71uw+Q7hKoPWf3TO7Fwrxg37eMb2DOvr6bap\nYqakN6H6UVaADA1wNmD2DnN0MHwGwOYLCxRWFZtGcQ6S28fCEO2oADl6NCF6aCJY\nfn4e8gn1RwKBgCAaU5fXQTNI2XvkOJVDj/DR7PzRIn03aWcOSP2JJETG41LDtW1S\n3F/hXnlfw+9D3EgMNQZUC254Kx/j3TQVNqJvhM7+xfa51lLN1hQtOeBV2eotTGO6\n1WdbzZetsqRuTAV7dPlIdI6H8zZkPR5JD/914+vUNKylkrD4izso5DwDAoGBAJAv\njWO7rDoGoTqIzorXY4xmTDX2uOx3FPF9cOQ1GhGY4a0js7cB1uMPZTf2KukfBa2W\nonaXDdk2N5jmw+sexLN4jkv6ANk0wxJJIZRozVzJHPVhzbMyFTNMNirVxJS0T4jf\nuR0MACIptsqU9Jfk7qEf6KkqlNwEMFPdQZsFoq+pAoGATNWAWyXaUxpcDn8/c2xT\n6QQYBZNqgNK9d5AKe6lR721QFonMTiIGYbXLSRCHWzit6JIzFSFkKF8HGDmi3+Lz\nWzVYRKC/jqAbA35bqR2G9tfMOLNC8Y+jzUKlJJUTyEgmtGxZ7nvjQXCSCwoJbywz\nR1bPGePhLctyXYU+eZtsWd4=\nuniverse_domain: \"googleapis.com\"\n}`
      },
      isActive: false,
      isDefault: false
    },
    {
      category: 'storage',
      provider: 'local_storage',
      config: {
        uploadPath: 'public/uploads',
        publicPath: '/uploads'
      },
      isActive: false,
      isDefault: false
    },
    {
      category: 'notification',
      provider: 'firebase',
      config: {
        projectId: 'fir-notes-20c44',
        clientEmail: 'firebase-adminsdk-lkmsq@fir-notes-20c44.iam.gserviceaccount.com',
        privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0c2R0mK8DDX76\n0KwFZ4X1z3mfx4tEv0XwW5yJOs5/4D/vHnGisKD0YyLL8LJslmyXRCFSjTJjxCZU\nxiKLOBP1puuhTStQpIfX3pjRPsh5sHWLdLBM1LoMCYOD2sNUSgK0+tPfBPqxyPh+\nAO/ZzR8M3728c2BjyPqXIoc5ZUpMbRavhL92VU5BItlntgg5UYv2K2O40pLOSZX9\nGrQhzofXyBQkphfjaa+5+FRd9AJR1gIFJ5kF2giWHmGtdgkkrU1JaonyzZ5E7MGe\nkHqHntJFvrDOXY3022FBh1pII9kQmyiYzDE/3xntGZJ1/COMlJAIe77Vvc2d+Upp\nAXSLUAFlAgMBAAECggEAJGthq/Kg5+HSbfatsU2KiOj96BSS9CYSjIdA2aWHxeFR\npgYj8yzo30oe3MBQkn/tnL4AZ7PdpqsQ/W0bzbNcu+ibh+uWQWljjVr8xsaAGadW\nofXEG02X2xQUegkuARYK49H37vwHSNiB5pRz1CaFDMkfdyhmHN2UTeqHFjtuOmw2\n7QxX5OybbidxFb/7RpgOSLHAe+RbclY4YnGpVM+57v7HLvEKahdJEpvqV3Uqa+3h\nUgbXOQDv5JCcgaoupGvjXiFC0SuHk5djItu/Uc6oSkUBan/q+6kal8aTFhovdl3Q\ngqnXfSSNwo1RAuFrELr3gcFkb2ubNojnNrZSSitHZQKBgQDo6k+Vvz45BcZgWXTG\n112QG5klGelzbZxBLKM8gsH11IdJr7A46nsh3BMCW+rGGDChNvuQ0nMww0E2lWK1\nZCW9WPCDJesgjsCtVc/SS50xRsX83DjS1N6XiuyD7vK2QZfB3N7kEYKJPTySydPN\nuqFiw3m28RQsnXDz0fsPcvXZ8wKBgQDGVeo5WSxTwEUgfIjiprtk4BYpER+tCb5o\nQKm3K/yC3ReGH0FJunsuAbiN/8zt71uw+Q7hKoPWf3TO7Fwrxg37eMb2DOvr6bap\nYqakN6H6UVaADA1wNmD2DnN0MHwGwOYLCxRWFZtGcQ6S28fCEO2oADl6NCF6aCJY\nfn4e8gn1RwKBgCAaU5fXQTNI2XvkOJVDj/DR7PzRIn03aWcOSP2JJETG41LDtW1S\n3F/hXnlfw+9D3EgMNQZUC254Kx/j3TQVNqJvhM7+xfa51lLN1hQtOeBV2eotTGO6\n1WdbzZetsqRuTAV7dPlIdI6H8zZkPR5JD/914+vUNKylkrD4izso5DwDAoGBAJAv\njWO7rDoGoTqIzorXY4xmTDX2uOx3FPF9cOQ1GhGY4a0js7cB1uMPZTf2KukfBa2W\nonaXDdk2N5jmw+sexLN4jkv6ANk0wxJJIZRozVzJHPVhzbMyFTNMNirVxJS0T4jf\nuR0MACIptsqU9Jfk7qEf6KkqlNwEMFPdQZsFoq+pAoGATNWAWyXaUxpcDn8/c2xT\n6QQYBZNqgNK9d5AKe6lR721QFonMTiIGYbXLSRCHWzit6JIzFSFkKF8HGDmi3+Lz\nWzVYRKC/jqAbA35bqR2G9tfMOLNC8Y+jzUKlJJUTyEgmtGxZ7nvjQXCSCwoJbywz\nR1bPGePhLctyXYU+eZtsWd4=\n-----END PRIVATE KEY-----`
      },
      isActive: true,
      isDefault: true
    },
    {
      category: 'ads',
      provider: 'admob',
      config: {
        appId: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
        bannerUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
        interstitialUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
        rewardedUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
        nativeUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
        appOpenUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      },
      isActive: false,
      isDefault: true
    },
    {
      category: 'ads',
      provider: 'facebook',
      config: {
        appId: 'YOUR_FACEBOOK_APP_ID',
        bannerPlacementId: 'YOUR_BANNER_PLACEMENT_ID',
        interstitialPlacementId: 'YOUR_INTERSTITIAL_PLACEMENT_ID',
        nativePlacementId: 'YOUR_NATIVE_PLACEMENT_ID',
        rewardedPlacementId: 'YOUR_REWARDED_PLACEMENT_ID',
      },
      isActive: false,
      isDefault: false
    },
    {
      category: 'login',
      provider: 'otp_login',
      config: {},
      isActive: true,
      isDefault: true
    },
    {
      category: 'login',
      provider: 'password',
      config: {},
      isActive: true,
      isDefault: false
    },
    {
      category: 'login',
      provider: 'google',
      config: {
        clientId: '332307306449-0pb9b6ic5b9l2dq9te7le0v5quurq5vb.apps.googleusercontent.com',
        clientSecret: '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'
      },
      isActive: true,
      isDefault: false
    },
    {
      category: 'login',
      provider: 'apple',
      config: {
        clientId: 'YOUR_APPLE_CLIENT_ID',
        teamId: 'YOUR_APPLE_TEAM_ID',
        keyId: 'YOUR_APPLE_KEY_ID',
        privateKey: 'YOUR_APPLE_PRIVATE_KEY'
      },
      isActive: false,
      isDefault: false
    },
  ];

  for (const config of externalConfigs) {
    await prisma.externalServiceConfig.upsert({
      where: { category_provider: { category: config.category, provider: config.provider } },
      update: config,
      create: config,
    });
  }

  console.log('Seeding Payment Gateways...');
  const gatewayPaymentMethods = [
    {
      name: 'razorpay',
      displayName: 'Razorpay',
      type: 'gateway',
      mode: 'test',
      isActive: true,
      isDefault: true,
      config: {
        test: {
          keyId: 'rzp_test_YOUR_KEY',
          keySecret: 'YOUR_SECRET'
        },
        live: {
          keyId: '',
          keySecret: ''
        }
      }
    },
    {
      name: 'stripe',
      displayName: 'Stripe',
      type: 'gateway',
      mode: 'test',
      isActive: false,
      isDefault: false,
      config: {
        test: {
          publishableKey: 'pk_test_YOUR_KEY',
          secretKey: 'sk_test_YOUR_SECRET',
          webhookSecret: ''
        },
        live: {
          publishableKey: '',
          secretKey: '',
          webhookSecret: ''
        }
      }
    },
    {
      name: 'paypal',
      displayName: 'PayPal',
      type: 'gateway',
      mode: 'test',
      isActive: false,
      isDefault: false,
      config: {
        test: {
          clientId: 'YOUR_CLIENT_ID',
          secretKey: 'YOUR_SECRET'
        },
        live: {
          clientId: '',
          secretKey: ''
        }
      }
    }
  ];

  for (const method of gatewayPaymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: method.name },
      update: method,
      create: method,
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
