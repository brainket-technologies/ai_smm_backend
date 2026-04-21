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
    const authProviders = externalConfigs.filter(c => c.category === 'login');
    const dynamicAuth: Record<string, any> = { 
      phone_otp_enabled: false,
      email_otp_enabled: false,
      google_login_enabled: false,
      apple_login_enabled: false,
      credentials: {} 
    };
    
    if (authProviders.length > 0) {
      dynamicAuth.phone_otp_enabled = authProviders.find(p => p.provider === 'otp_login')?.isActive ?? false;
      dynamicAuth.email_otp_enabled = authProviders.find(p => p.provider === 'email_otp')?.isActive ?? false;
      dynamicAuth.google_login_enabled = authProviders.find(p => p.provider === 'google')?.isActive ?? false;
      dynamicAuth.apple_login_enabled = authProviders.find(p => p.provider === 'apple')?.isActive ?? false;
      
      authProviders.forEach(p => {
        if (p.config && typeof p.config === 'object' && Object.keys(p.config).length > 0) {
          const cfg = p.config as any;
          if (p.provider === 'google') {
            dynamicAuth.credentials['google'] = { web_client_id: cfg.clientId || '' };
          } else if (p.provider === 'apple') {
            dynamicAuth.credentials['apple'] = {
              service_id: cfg.serviceId || '',
              team_id: cfg.teamId || '',
              key_id: cfg.keyId || '',
              private_key: cfg.privateKey || ''
            };
          }
          // Do not map otp_login/email_otp into credentials unless specifically required by flutter
        }
      });
    }

    // Ads Config Construction
    const adsProviders = externalConfigs.filter(c => c.category === 'ads');
    const dynamicAds: Record<string, any> = {};
    if (adsProviders.length > 0) {
      adsProviders.forEach(p => {
        const cfg = (typeof p.config === 'object' && p.config !== null ? p.config : {}) as any;
        const providerName = p.provider === 'admob' ? 'google_admob' 
                           : p.provider === 'facebook' ? 'facebook_audience_network' 
                           : p.provider;
        
        if (providerName === 'google_admob') {
          dynamicAds[providerName] = {
            enabled: p.isActive,
            app_id: cfg.appId || '',
            banner_unit_id: cfg.bannerUnitId || '',
            interstitial_unit_id: cfg.interstitialUnitId || '',
            rewarded_unit_id: cfg.rewardedUnitId || '',
            native_unit_id: cfg.nativeUnitId || '',
            app_open_unit_id: cfg.appOpenUnitId || ''
          };
        } else if (providerName === 'facebook_audience_network') {
          dynamicAds[providerName] = {
            enabled: p.isActive,
            app_id: cfg.appId || '',
            banner_placement_id: cfg.bannerPlacementId || '',
            interstitial_placement_id: cfg.interstitialPlacementId || '',
            native_placement_id: cfg.nativePlacementId || '',
            rewarded_placement_id: cfg.rewardedPlacementId || ''
          };
        } else {
          dynamicAds[providerName] = { enabled: p.isActive, ...cfg };
        }
      });
    }

    // OTP Config Construction
    const otpProviders = externalConfigs.filter(c => c.category === 'otp');
    const dynamicOtp: Record<string, any> = {};
    if (otpProviders.length > 0) {
      otpProviders.forEach(p => {
        const cfg = (typeof p.config === 'object' && p.config !== null ? p.config : {}) as any;
        if (p.provider === 'firebase') {
          dynamicOtp[p.provider] = {
            enabled: p.isActive,
            api_key: cfg.apiKey || '',
            auth_domain: cfg.authDomain || '',
            project_id: cfg.projectId || ''
          };
        } else {
          dynamicOtp[p.provider] = { enabled: p.isActive, ...cfg };
        }
      });
    }

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
