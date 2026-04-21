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

    // Construct the data object
    // If DB is empty, we return a fallback structure that matches app_config.json
    const configData = {
      app_name: appConfig?.appName || "BrandBoost AI",
      maintenance_mode: appConfig?.maintenanceMode || false,
      maintenance_message: appConfig?.maintenanceMessage || "We are currently performing scheduled maintenance to improve your experience. We will be back online shortly!",
      developer_mode: appConfig?.developerMode || false,
      global_ai_enabled: appConfig?.globalAiEnabled || true,
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
            }
          }
        },
        // For static pages, otp_config, and ads_config, we'll use defaults if not in DB
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
        dashboard: { dash_analytics_cards: true, dash_ai_actions: true },
        ai_studio: { ai_chat_access: true },
        marketing: { post_create_access: true }
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
            highlight_features: ["2 Daily Posts", "5 AI Chats/day"]
          }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      message: 'App settings fetched successfully',
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
