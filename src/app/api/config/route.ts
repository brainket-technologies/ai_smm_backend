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
    const dynamicAuth = {
      phone_otp_enabled: authProviders.find(p => p.provider === 'phone')?.isActive ?? false,
      email_otp_enabled: authProviders.find(p => p.provider === 'email')?.isActive ?? false,
      google_login_enabled: authProviders.find(p => p.provider === 'google')?.isActive ?? false,
      apple_login_enabled: authProviders.find(p => p.provider === 'apple')?.isActive ?? false,
      credentials: {} as Record<string, any>
    };
    
    authProviders.forEach(p => {
      if (p.config && typeof p.config === 'object' && Object.keys(p.config).length > 0) {
        dynamicAuth.credentials[p.provider] = p.config;
      }
    });

    // Ads Config Construction
    const adsProviders = externalConfigs.filter(c => c.category === 'ads');
    const dynamicAds: Record<string, any> = {};
    adsProviders.forEach(p => {
      dynamicAds[p.provider] = {
        enabled: p.isActive,
        ...((typeof p.config === 'object' && p.config !== null ? p.config : {}) as any)
      };
    });

    // OTP Config Construction
    const otpProviders = externalConfigs.filter(c => c.category === 'otp');
    const dynamicOtp: Record<string, any> = {};
    otpProviders.forEach(p => {
      dynamicOtp[p.provider] = {
        enabled: p.isActive,
        ...((typeof p.config === 'object' && p.config !== null ? p.config : {}) as any)
      };
    });

    // 7. Fetch Static Pages
    const staticPagesRecords = await prisma.staticPage.findMany({ where: { isActive: true } });
    const dynamicStaticPages = staticPagesRecords.map(page => ({
        id: page.slug,
        title: page.title,
        url: `${appConfig?.apiBaseUrl || "https://api.brandboostai.com/v1"}/pages/${page.slug}`
    }));

    // 8. Feature Config Construction (Using appConfig.featuresJson or DB feature blocks)
    let dynamicFeatures: Record<string, any> = {};
    if (appConfig?.featuresJson && typeof appConfig.featuresJson === 'object' && Object.keys(appConfig.featuresJson).length > 0) {
      dynamicFeatures = appConfig.featuresJson as any;
    } else if (Object.keys(features).length > 0) {
      Object.keys(features).forEach(module => {
        dynamicFeatures[module] = features[module];
      });
    }

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
        auth: dynamicAuth,
        ads_config: dynamicAds,
        otp_config: dynamicOtp,
        static_pages: dynamicStaticPages
      },
      features: dynamicFeatures,
      subscriptions: {
        free_trial_days: appConfig?.freeTrialDays || 7,
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
