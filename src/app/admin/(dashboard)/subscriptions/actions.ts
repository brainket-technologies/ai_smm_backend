"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function upsertTier(data: any) {
  const { id, tierKey, name, priceAmount, pricePeriod, badge, highlightFeatures, limits, isActive, permissions } = data;

  try {
    const tierId = id ? BigInt(id) : undefined;
    
    // 1. Upsert the Tier
    const tier = await prisma.subscriptionTier.upsert({
      where: { tierKey },
      update: {
        name,
        priceAmount,
        pricePeriod,
        badge,
        highlightFeatures,
        limits,
        isActive
      },
      create: {
        tierKey,
        name,
        priceAmount,
        pricePeriod,
        badge,
        highlightFeatures,
        limits,
        isActive
      }
    });

    // 2. Sync Permissions
    await prisma.subscriptionPermission.deleteMany({
      where: { tierKey }
    });

    if (permissions && permissions.length > 0) {
      await prisma.subscriptionPermission.createMany({
        data: permissions.map((pKey: string) => ({
          tierKey,
          permissionKey: pKey
        }))
      });
    }

    revalidatePath("/admin/subscriptions");
    return { success: true, tier: { ...tier, id: tier.id.toString() } };
  } catch (error: any) {
    console.error("Failed to upsert tier:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleTierStatus(id: string, isActive: boolean) {
  try {
    await prisma.subscriptionTier.update({
      where: { id: BigInt(id) },
      data: { isActive }
    });
    revalidatePath("/admin/subscriptions");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update tier status:", error);
    return { success: false, error: "Status update failed" };
  }
}

export async function deleteTier(tierKey: string) {
  try {
    await prisma.$transaction([
      prisma.subscriptionPermission.deleteMany({ where: { tierKey } }),
      prisma.subscriptionTier.delete({ where: { tierKey } })
    ]);
    
    revalidatePath("/admin/subscriptions");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete tier:", error);
    return { success: false, error: error.message };
  }
}
