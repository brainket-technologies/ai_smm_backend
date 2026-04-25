"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getConfig() {
  try {
    const config = await prisma.appConfig.findFirst({
      where: { id: BigInt(1) }
    });
    
    const platforms = await prisma.appPlatformConfig.findMany();
    
    return { config, platforms };
  } catch (error) {
    console.error("Failed to fetch config:", error);
    return { config: null, platforms: [] };
  }
}

export async function updateConfig(formData: FormData) {
  // Update App Config
  const appName = formData.get("appName") as string;
  const maintenanceMode = formData.get("maintenanceMode") === "on";
  const maintenanceMessage = formData.get("maintenanceMessage") as string;
  const developerMode = formData.get("developerMode") === "on";
  const globalAiEnabled = formData.get("globalAiEnabled") === "on";
  const supportEmail = formData.get("supportEmail") as string;
  const apiBaseUrl = formData.get("apiBaseUrl") as string;
  const landingPageUrl = formData.get("landingPageUrl") as string;
  const adminPanelUrl = formData.get("adminPanelUrl") as string;
  const heroTitle = formData.get("heroTitle") as string;
  const heroSubtitle = formData.get("heroSubtitle") as string;
  const pricingTitle = formData.get("pricingTitle") as string;
  const freeTrialDays = parseInt(formData.get("freeTrialDays") as string) || 7;
  const primaryColor = formData.get("primaryColor") as string;
  
  // Social Media API Config
  const fbAppId = formData.get("fbAppId") as string;
  const fbAppSecret = formData.get("fbAppSecret") as string;
  const fbClientToken = formData.get("fbClientToken") as string;
  const googleClientId = formData.get("googleClientId") as string;
  const googleClientSecret = formData.get("googleClientSecret") as string;

  await prisma.appConfig.update({
    where: { id: BigInt(1) },
    data: {
      appName,
      maintenanceMode,
      maintenanceMessage,
      developerMode,
      globalAiEnabled,
      supportEmail,
      apiBaseUrl,
      landingPageUrl,
      adminPanelUrl,
      heroTitle,
      heroSubtitle,
      pricingTitle,
      freeTrialDays,
      primaryColor,
      fbAppId,
      fbAppSecret,
      fbClientToken,
      googleClientId,
      googleClientSecret
    }
  });

  // Update Platforms
  const platforms = ['android', 'ios'];
  for (const plat of platforms) {
    const appVersion = formData.get(`${plat}_appVersion`) as string;
    const appVersionCode = parseInt(formData.get(`${plat}_appVersionCode`) as string) || 1;
    const forceUpdateVersion = formData.get(`${plat}_forceUpdateVersion`) as string;
    const forceUpdateVersionCode = parseInt(formData.get(`${plat}_forceUpdateVersionCode`) as string) || 1;
    const storeUrl = formData.get(`${plat}_storeUrl`) as string;
    const updateDescription = formData.get(`${plat}_updateDescription`) as string;

    await prisma.appPlatformConfig.upsert({
      where: { platform: plat },
      update: {
        appVersion,
        appVersionCode,
        forceUpdateVersion,
        forceUpdateVersionCode,
        storeUrl,
        updateDescription,
      },
      create: {
        platform: plat,
        appVersion,
        appVersionCode,
        forceUpdateVersion,
        forceUpdateVersionCode,
        storeUrl,
        updateDescription,
      }
    });
  }

  revalidatePath("/admin/config");
}

export async function autoSetConfig() {
  const headersList = await headers();
  const host = headersList.get('host');
  const proto = headersList.get('x-forwarded-proto') || 'https';
  const origin = `${proto}://${host}`;
  
  await prisma.appConfig.update({
    where: { id: BigInt(1) },
    data: {
      apiBaseUrl: `${origin}/api/v1`,
      landingPageUrl: `${origin}/`,
      adminPanelUrl: `${origin}/admin`
    }
  });

  revalidatePath("/admin/config");
}

export async function initConfig() {
  await prisma.appConfig.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      id: BigInt(1),
      appName: "BrandBoost AI",
      maintenanceMode: false,
      globalAiEnabled: true,
      freeTrialDays: 7
    }
  });

  revalidatePath("/admin/config");
}
