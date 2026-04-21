import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth-utils';

export async function GET(request: Request) {
  // Validate API Key
  const auth = validateApiKey(request);
  if (!auth.isValid) return auth.response;

  try {
    // 1. Fetch App Config (taking the first one)
    const appConfig = await prisma.appConfig.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    // 2. Fetch Platform Configs
    const platformConfigs = await prisma.appPlatformConfig.findMany();
    const android = platformConfigs.find(p => p.platform.toLowerCase() === 'android');
    const ios = platformConfigs.find(p => p.platform.toLowerCase() === 'ios');

    // 3. Fetch Feature Flags
    const featureFlags = await prisma.appFeatureFlag.findMany();
    const features: Record<string, any> = {};
    featureFlags.forEach(f => {
      if (!features[f.moduleName]) features[f.moduleName] = {};
      features[f.moduleName][f.featureKey] = f.isEnabled;
    });

    // 4. Fetch Tiers + Permissions together
    const tiers = await prisma.subscriptionTier.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' }
    });

    // 5. Fetch all tier permissions and group by tierKey
    const allPermissions = await prisma.subscriptionPermission.findMany();
    const permissionsByTier: Record<string, string[]> = {};
    allPermissions.forEach(p => {
        if (!permissionsByTier[p.tierKey]) permissionsByTier[p.tierKey] = [];
        permissionsByTier[p.tierKey].push(p.permissionKey);
    });

    const serializedTiers = tiers.map(t => ({
        id: t.tierKey,
        name: t.name,
        price_amount: Number(t.priceAmount),
        price_period: t.pricePeriod,
        badge: t.badge,
        highlight_features: t.highlightFeatures,
        permissions: permissionsByTier[t.tierKey] || [],
        limits: t.limits
    }));

    // Construct the data object exactly as requested, merging DB values if they exist
    const configData = {
      app_name: appConfig?.appName || "BrandBoost AI",
      maintenance_mode: appConfig?.maintenanceMode || false,
      maintenance_message: appConfig?.maintenanceMessage || "We are currently performing scheduled maintenance to improve your experience. We will be back online shortly!",
      developer_mode: appConfig?.developerMode || false,
      global_ai_enabled: appConfig?.globalAiEnabled ?? true,
      config: {
        android: {
          app_version: android?.appVersion || "1.0.0",
          app_version_code: android?.appVersionCode || 1,
          force_update_version: android?.forceUpdateVersion || "1.0.0",
          force_update_version_code: android?.forceUpdateVersionCode || 1,
          store_url: android?.storeUrl || "https://play.google.com/store/apps/details?id=com.brandboost.ai",
          update_description: android?.updateDescription || "We've added new AI features and improved app stability!"
        },
        ios: {
          app_version: ios?.appVersion || "1.0.0",
          app_version_code: ios?.appVersionCode || 1,
          force_update_version: ios?.forceUpdateVersion || "1.0.0",
          force_update_version_code: ios?.forceUpdateVersionCode || 1,
          store_url: ios?.storeUrl || "https://apps.apple.com/app/brandboost-ai/id123456789",
          update_description: ios?.updateDescription || "New UI enhancements and bug fixes for a smoother experience."
        },
        api_base_url: appConfig?.apiBaseUrl || "https://api.brandboostai.com/v1",
        support_email: appConfig?.supportEmail || "support@brandboostai.com",
        auth: {
          phone_otp_enabled: true,
          email_otp_enabled: true,
          google_login_enabled: true,
          apple_login_enabled: true,
          credentials: {
            google: {
              web_client_id: "332307306449-0pb9b6ic5b9l2dq9te7le0v5quurq5vb.apps.googleusercontent.com"
            },
            apple: {
              service_id: "YOUR_APPLE_CLIENT_ID",
              team_id: "YOUR_APPLE_TEAM_ID",
              key_id: "YOUR_APPLE_KEY_ID",
              private_key: "YOUR_APPLE_PRIVATE_KEY"
            }
          }
        },
        ads_config: {
          google_admob: {
            enabled: true,
            app_id: "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
            banner_unit_id: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
            interstitial_unit_id: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
            rewarded_unit_id: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
            native_unit_id: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
            app_open_unit_id: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
          },
          facebook_audience_network: {
            enabled: false,
            app_id: "YOUR_FACEBOOK_APP_ID",
            banner_placement_id: "YOUR_BANNER_PLACEMENT_ID",
          "interstitial_placement_id": "YOUR_INTERSTITIAL_PLACEMENT_ID",
            native_placement_id: "YOUR_NATIVE_PLACEMENT_ID",
            rewarded_placement_id: "YOUR_REWARDED_PLACEMENT_ID"
          }
        },
        otp_config: {
          firebase: {
            enabled: true,
            api_key: "AlzaSyA5SVlOwGfeSrfOpRrRry5a-1kkoHl_m_Fg",
            auth_domain: "fir-notes-20c44.firebaseapp.com",
            project_id: "fir-notes-20c44"
          },
          msg91: {
            enabled: false
          }
        },
        static_pages: [
          {
            id: "privacy-policy",
            title: "Privacy Policy",
            url: "https://ai-smm-backend.vercel.app/pages/privacy-policy"
          },
          {
            id: "terms-of-service",
            title: "Terms of Service",
            url: "https://ai-smm-backend.vercel.app/pages/terms-of-service"
          },
          {
            id: "about-us",
            title: "About Us",
            url: "https://ai-smm-backend.vercel.app/pages/about-us"
          }
        ]
      },
      features: Object.keys(features).length > 0 ? features : {
        dashboard: {
          dash_analytics_cards: true,
          dash_ai_actions: true,
          dash_schedule_view: true,
          dash_smart_suggestions: true,
          dash_platform_selector: true,
          dash_recent_activity: true,
          dash_special_day_alert: true
        },
        ai_studio: {
          ai_chat_access: true,
          ai_voice_input: true,
          ai_vision_input: true,
          ai_history_drawer: true,
          ai_structured_replies: false
        },
        marketing: {
          post_create_access: true,
          post_ai_generator_btn: true,
          post_scheduling_logic: true,
          post_ai_caption_gen: true,
          post_ai_hashtag_gen: true,
          post_cta_manager: true,
          post_multi_platform_sync: true,
          post_media_ai_library: true,
          post_remove_watermark: true
        },
        finance: {
          ledger_customer_view: true,
          ledger_supplier_view: true,
          ledger_add_entry: true,
          ledger_search_filter: true,
          ledger_analytics_card: true,
          ledger_reports_pro: true
        },
        library: {
          library_access: true,
          library_category_filters: true,
          library_ai_generated_view: true,
          library_cloud_upload: true,
          library_ai_generator_shortcut: true
        },
        brand: {
          biz_brand_kit: true,
          biz_target_audience: true,
          biz_social_connect: true
        },
        engagement: {
          inbox_access: true,
          inbox_platform_filters: true,
          inbox_auto_reply_ai: true,
          inbox_leads_tracking: true
        },
        planner: {
          planner_access: true,
          planner_view_toggle: true,
          planner_festival_highlights: true,
          planner_post_markers: true,
          planner_reschedule_action: true,
          planner_ai_shortcuts: true
        },
        vcard: {
          vcard_share_access: true,
          vcard_designer_carousel: true,
          vcard_whatsapp_direct: true,
          vcard_premium_themes: true
        },
        preferences: {
          pref_profile_edit: true,
          pref_account_mgmt: true,
          pref_subscription_mgmt: true,
          pref_notification_ctrl: true,
          pref_business_profile: true,
          pref_security_auth: true
        },
        analytics: {
          analytics_platform_metrics: true,
          analytics_reach_trends: true,
          analytics_ai_insights: true,
          analytics_viral_analysis: true,
          analytics_viral_v2_cards: true,
          analytics_sticky_dashboard: true,
          analytics_content_performance: true,
          analytics_gmb_insights: true,
          analytics_audience_demo: true,
          analytics_export_report: true
        },
        catalog: {
          catalog_product_mgmt: true,
          catalog_service_mgmt: true,
          catalog_inventory_tracking: true,
          catalog_search_filter: true
        },
        keywords: {
          keyword_search_access: true,
          keyword_regional_lookup: true,
          keyword_difficulty_score: true,
          keyword_save_to_leads: true
        },
        settings: {
          "settings_theme_switch": true,
          settings_currency_switch: true,
          settings_language_switch: true,
          settings_legal_view: true,
          settings_feedback_submit: true,
          settings_account_delete: true,
          settings_help_support: true
        },
        notifications: {
          notifications_view_access: true,
          notifications_clear_action: true
        },
        monetization: {
          "ads_free_experience": false,
          ai_rewarded_ads: true
        }
      },
      subscriptions: {
        free_trial_days: appConfig?.freeTrialDays || 7,
        tiers: serializedTiers.length > 0 ? serializedTiers : [
          {
            id: "free",
            name: "Free",
            price_amount: 0,
            price_period: "forever",
            badge: "Basic",
            highlight_features: [
              "2 Daily Posts",
              "5 AI Chats/day",
              "1 Platform Only",
              "Basic Insights View"
            ],
            permissions: [
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
            limits: {
              unlimited: false,
              daily_posts: 2,
              daily_ai_chats: 5,
              daily_ai_images: 0,
              max_customers: 50,
              max_products: 10,
              max_services: 5,
              max_keyword_searches: 5,
              max_storage_mb: 50,
              max_video_length_seconds: 15,
              max_concurrent_devices: 1,
              max_business_accounts: 1,
              allowed_platforms: [
                "facebook"
              ]
            }
          },
          {
            id: "basic",
            name: "Basic",
            price_amount: 499,
            price_period: "month",
            badge: "Starter",
            highlight_features: [
              "10 Daily Posts",
              "50 AI Chats/day",
              "2 Platforms",
              "Daily Reach Trends"
            ],
            permissions: [
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
            limits: {
              unlimited: false,
              daily_posts: 10,
              daily_ai_chats: 50,
              daily_ai_images: 10,
              "max_customers": 500,
              max_products: 100,
              max_services: 50,
              max_keyword_searches: 50,
              max_storage_mb: 500,
              max_video_length_seconds: 60,
              max_concurrent_devices: 2,
              max_business_accounts: 3,
              allowed_platforms: [
                "facebook",
                "instagram"
              ]
            }
          },
          {
            id: "pro",
            name: "Pro",
            price_amount: 1999,
            price_period: "month",
            badge: "Best Value",
            "highlight_features": [
              "50 Daily Posts",
              "AI Caption & Hashtag Gen",
              "Post Scheduling",
              "AI Viral Content Carousel & Advanced Stats"
            ],
            permissions: [
              "all_basic",
              "dash_schedule_view",
              "dash_smart_suggestions",
              "dash_special_day_alert",
              "post_scheduling_logic",
              "post_ai_caption_gen",
              "post_ai_hashtag_gen",
              "post_multi_platform_sync",
              "ai_vision_input",
              "inbox_leads_tracking",
              "planner_access",
              "planner_view_toggle",
              "planner_festival_highlights",
              "planner_post_markers",
              "library_access",
              "library_category_filters",
              "library_cloud_upload",
              "ledger_customer_view",
              "ledger_supplier_view",
              "ledger_add_entry",
              "ledger_analytics_card",
              "ledger_reports_pro",
              "vcard_share_access",
              "vcard_designer_carousel",
              "vcard_whatsapp_direct",
              "pref_profile_edit",
              "pref_account_mgmt",
              "pref_business_profile",
              "pref_notification_ctrl",
              "pref_subscription_mgmt",
              "analytics_platform_metrics",
              "analytics_reach_trends",
              "analytics_ai_insights",
              "analytics_gmb_insights",
              "analytics_audience_demo",
              "catalog_product_mgmt",
              "catalog_service_mgmt",
              "catalog_inventory_tracking",
              "catalog_search_filter",
              "keyword_search_access",
              "keyword_regional_lookup",
              "keyword_difficulty_score",
              "settings_theme_switch",
              "settings_language_switch",
              "settings_currency_switch",
              "settings_legal_view",
              "settings_feedback_submit",
              "settings_account_delete",
              "settings_help_support",
              "notifications_view_access",
              "notifications_clear_action",
              "post_remove_watermark",
              "biz_brand_kit",
              "ads_free_experience"
            ],
            limits: {
              unlimited: false,
              daily_posts: 50,
              "daily_ai_chats": 200,
              daily_ai_images: 50,
              max_customers: 5000,
              max_products: 1000,
              max_services: 500,
              max_keyword_searches: 200,
              max_storage_mb: 5000,
              max_video_length_seconds: 180,
              max_concurrent_devices: 5,
              max_business_accounts: 10,
              allowed_platforms: [
                "facebook",
                "instagram",
                "linkedin",
                "gmb"
              ]
            }
          },
          {
            id: "premium",
            name: "Premium",
            price_amount: 9999,
            price_period: "year",
            badge: "50% Save",
            highlight_features: [
              "Unlimited Posts",
              "Vision AI Input",
              "Full Audience Demographics & Sticky Insights",
              "Priority Support"
            ],
            permissions: [
              "all"
            ],
            limits: {
              unlimited: true,
              daily_posts: -1,
              daily_ai_chats: -1,
              daily_ai_images: 200,
              max_customers: -1,
              max_products: -1,
              max_services: -1,
              max_keyword_searches: 1000,
              max_storage_mb: 50000,
              max_video_length_seconds: 600,
              max_concurrent_devices: 10,
              max_business_accounts: -1,
              allowed_platforms: [
                "facebook",
                "instagram",
                "linkedin",
                "google_my_business"
              ]
            }
          }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      message: 'App config fetched successfully',
      data: configData,
    });

  } catch (error: any) {
    console.error('Fetch config error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
