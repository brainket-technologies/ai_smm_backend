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

    // 6. Fetch External Services (Auth, Ads, OTP)
    const externalConfigs = await prisma.externalServiceConfig.findMany();
    
    // Auth Config Construction
    const authProviders = externalConfigs.filter(c => c.category === 'auth');
    const defaultAuth = {
      phone_otp_enabled: true,
      email_otp_enabled: true,
      google_login_enabled: true,
      apple_login_enabled: true,
      credentials: {
        google: { web_client_id: "" },
        apple: { service_id: "", team_id: "", key_id: "", private_key: "" }
      }
    };
    
    const dynamicAuth = { ...defaultAuth, credentials: { ...defaultAuth.credentials } };
    if (authProviders.length > 0) {
      dynamicAuth.phone_otp_enabled = authProviders.find(p => p.provider === 'phone')?.isActive ?? defaultAuth.phone_otp_enabled;
      dynamicAuth.email_otp_enabled = authProviders.find(p => p.provider === 'email')?.isActive ?? defaultAuth.email_otp_enabled;
      dynamicAuth.google_login_enabled = authProviders.find(p => p.provider === 'google')?.isActive ?? defaultAuth.google_login_enabled;
      dynamicAuth.apple_login_enabled = authProviders.find(p => p.provider === 'apple')?.isActive ?? defaultAuth.apple_login_enabled;
      
      authProviders.forEach(p => {
        if (p.config && typeof p.config === 'object' && Object.keys(p.config).length > 0) {
          dynamicAuth.credentials[p.provider as keyof typeof dynamicAuth.credentials] = p.config as any;
        }
      });
    }

    // Ads Config Construction
    const adsProviders = externalConfigs.filter(c => c.category === 'ads');
    const defaultAds = {
      google_admob: {
        enabled: true,
        app_id: "",
        banner_unit_id: "",
        interstitial_unit_id: "",
        rewarded_unit_id: "",
        native_unit_id: "",
        app_open_unit_id: ""
      },
      facebook_audience_network: {
        enabled: false,
        app_id: "",
        banner_placement_id: "",
        interstitial_placement_id: "",
        native_placement_id: "",
        rewarded_placement_id: ""
      }
    };
    
    // Merge DB values with defaults for Ads
    const dynamicAds = { ...defaultAds } as Record<string, any>;
    if (adsProviders.length > 0) {
      adsProviders.forEach(p => {
        dynamicAds[p.provider] = {
          ...(dynamicAds[p.provider] || {}), // Preserve default nested keys
          enabled: p.isActive,
          ...((typeof p.config === 'object' && p.config !== null ? p.config : {}) as any)
        };
      });
    }

    // OTP Config Construction
    const otpProviders = externalConfigs.filter(c => c.category === 'otp');
    const defaultOtp = {
      firebase: {
        enabled: true,
        api_key: "",
        auth_domain: "",
        project_id: ""
      },
      msg91: {
        enabled: false
      }
    };

    // Merge DB values with defaults for OTP
    const dynamicOtp = { ...defaultOtp } as Record<string, any>;
    if (otpProviders.length > 0) {
      otpProviders.forEach(p => {
        dynamicOtp[p.provider] = {
          ...(dynamicOtp[p.provider] || {}), // Preserve default nested keys
          enabled: p.isActive,
          ...((typeof p.config === 'object' && p.config !== null ? p.config : {}) as any)
        };
      });
    }

    // 7. Fetch Static Pages
    const staticPagesRecords = await prisma.staticPage.findMany({ where: { isActive: true } });
    const defaultStaticPages = [
      { id: "privacy-policy", title: "Privacy Policy", url: "https://ai-smm-backend.vercel.app/pages/privacy-policy" },
      { id: "terms-of-service", title: "Terms of Service", url: "https://ai-smm-backend.vercel.app/pages/terms-of-service" },
      { id: "about-us", title: "About Us", url: "https://ai-smm-backend.vercel.app/pages/about-us" }
    ];
    
    const dynamicStaticPages = staticPagesRecords.length > 0 
      ? staticPagesRecords.map(page => ({
          id: page.slug,
          title: page.title,
          url: `${appConfig?.apiBaseUrl || "https://api.brandboostai.com/v1"}/pages/${page.slug}`
        }))
      : defaultStaticPages;

    // 8. Feature Config Construction (Using appConfig.featuresJson or DB feature blocks)
    const defaultFeatures = {
      dashboard: { dash_analytics_cards: true, dash_ai_actions: true, dash_schedule_view: true, dash_smart_suggestions: true, dash_platform_selector: true, dash_recent_activity: true, dash_special_day_alert: true },
      ai_studio: { ai_chat_access: true, ai_voice_input: true, ai_vision_input: true, ai_history_drawer: true, ai_structured_replies: false },
      marketing: { post_create_access: true, post_ai_generator_btn: true, post_scheduling_logic: true, post_ai_caption_gen: true, post_ai_hashtag_gen: true, post_cta_manager: true, post_multi_platform_sync: true, post_media_ai_library: true, post_remove_watermark: true },
      finance: { ledger_customer_view: true, ledger_supplier_view: true, ledger_add_entry: true, ledger_search_filter: true, ledger_analytics_card: true, ledger_reports_pro: true },
      library: { library_access: true, library_category_filters: true, library_ai_generated_view: true, library_cloud_upload: true, library_ai_generator_shortcut: true },
      brand: { biz_brand_kit: true, biz_target_audience: true, biz_social_connect: true },
      engagement: { inbox_access: true, inbox_platform_filters: true, inbox_auto_reply_ai: true, inbox_leads_tracking: true },
      planner: { planner_access: true, planner_view_toggle: true, planner_festival_highlights: true, planner_post_markers: true, planner_reschedule_action: true, planner_ai_shortcuts: true },
      vcard: { vcard_share_access: true, vcard_designer_carousel: true, vcard_whatsapp_direct: true, vcard_premium_themes: true },
      preferences: { pref_profile_edit: true, pref_account_mgmt: true, pref_subscription_mgmt: true, pref_notification_ctrl: true, pref_business_profile: true, pref_security_auth: true },
      analytics: { analytics_platform_metrics: true, analytics_reach_trends: true, analytics_ai_insights: true, analytics_viral_analysis: true, analytics_viral_v2_cards: true, analytics_sticky_dashboard: true, analytics_content_performance: true, analytics_gmb_insights: true, analytics_audience_demo: true, analytics_export_report: true },
      catalog: { catalog_product_mgmt: true, catalog_service_mgmt: true, catalog_inventory_tracking: true, catalog_search_filter: true },
      keywords: { keyword_search_access: true, keyword_regional_lookup: true, keyword_difficulty_score: true, keyword_save_to_leads: true },
      settings: { "settings_theme_switch": true, settings_currency_switch: true, settings_language_switch: true, settings_legal_view: true, settings_feedback_submit: true, settings_account_delete: true, settings_help_support: true },
      notifications: { notifications_view_access: true, notifications_clear_action: true },
      monetization: { "ads_free_experience": false, ai_rewarded_ads: true }
    };
    
    let dynamicFeatures = { ...defaultFeatures };
    if (appConfig?.featuresJson && typeof appConfig.featuresJson === 'object' && Object.keys(appConfig.featuresJson).length > 0) {
      dynamicFeatures = appConfig.featuresJson as any;
    } else if (Object.keys(features).length > 0) {
      Object.keys(features).forEach(module => {
        dynamicFeatures[module as keyof typeof dynamicFeatures] = {
          ...dynamicFeatures[module as keyof typeof dynamicFeatures],
          ...features[module]
        };
      });
    }

    // Construct the data object exactly as requested, merging DB values if they exist
    const configData = {
      app_name: appConfig?.appName ?? null,
      maintenance_mode: appConfig?.maintenanceMode ?? false,
      maintenance_message: appConfig?.maintenanceMessage ?? null,
      developer_mode: appConfig?.developerMode ?? false,
      global_ai_enabled: appConfig?.globalAiEnabled ?? true,
      config: {
        android: {
          app_version: android?.appVersion ?? null,
          app_version_code: android?.appVersionCode ?? null,
          force_update_version: android?.forceUpdateVersion ?? null,
          force_update_version_code: android?.forceUpdateVersionCode ?? null,
          store_url: android?.storeUrl ?? null,
          update_description: android?.updateDescription ?? null
        },
        ios: {
          app_version: ios?.appVersion ?? null,
          app_version_code: ios?.appVersionCode ?? null,
          force_update_version: ios?.forceUpdateVersion ?? null,
          force_update_version_code: ios?.forceUpdateVersionCode ?? null,
          store_url: ios?.storeUrl ?? null,
          update_description: ios?.updateDescription ?? null
        },
        api_base_url: appConfig?.apiBaseUrl ?? null,
        support_email: appConfig?.supportEmail ?? null,
        auth: dynamicAuth,
        ads_config: dynamicAds,
        otp_config: dynamicOtp,
        static_pages: dynamicStaticPages
      },
      features: dynamicFeatures,
      subscriptions: {
        free_trial_days: appConfig?.freeTrialDays ?? 7,
        tiers: serializedTiers
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
