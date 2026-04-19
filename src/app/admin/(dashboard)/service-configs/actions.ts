 "use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Fetch all external service configurations, grouped by category for the UI.
 */
export async function getExternalServiceConfigs() {
  try {
    const configs = await prisma.externalServiceConfig.findMany({
      orderBy: [
        { category: 'asc' },
        { provider: 'asc' }
      ]
    });
    
    return {
      success: true,
      data: configs.map(c => ({
        ...c,
        id: c.id.toString(),
        updatedAt: c.updatedAt.toISOString(),
      }))
    };
  } catch (error) {
    console.error("Error fetching external service configs:", error);
    return { success: false, error: "Failed to fetch configurations" };
  }
}

/**
 * Create or update an external service configuration.
 */
export async function upsertExternalServiceConfig(data: any) {
  try {
    const { id, category, provider, config, isActive } = data;
    
    const payload = {
      category,
      provider,
      config: config || {},
      isActive: isActive !== undefined ? isActive : true,
    };

    if (id) {
      await prisma.externalServiceConfig.update({
        where: { id: BigInt(id) },
        data: payload
      });
    } else {
      await prisma.externalServiceConfig.upsert({
        where: { 
          category_provider: {
            category,
            provider
          }
        },
        create: payload,
        update: payload,
      });
    }

    revalidatePath("/admin/service-configs");
    return { success: true };
  } catch (error: any) {
    console.error("Error upserting external service config:", error);
    return { success: false, error: "Failed to save configuration" };
  }
}

/**
 * Toggle the active status of a specific service provider.
 * Optionally deactivates all other providers in the same category if requested.
 */
export async function toggleExternalServiceStatus(id: string, category: string, currentStatus: boolean, exclusive: boolean = false) {
  try {
    const targetId = BigInt(id);
    const nextStatus = !currentStatus;

    if (exclusive && nextStatus) {
      // Deactivate all others in this category if this one is being activated
      await prisma.externalServiceConfig.updateMany({
        where: { 
          category,
          id: { not: targetId }
        },
        data: { isActive: false }
      });
    }

    await prisma.externalServiceConfig.update({
      where: { id: targetId },
      data: { isActive: nextStatus }
    });

    revalidatePath("/admin/service-configs");
    return { success: true };
  } catch (error) {
    console.error("Error toggling status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

/**
 * Delete a specific configuration if needed.
 */
export async function deleteExternalServiceConfig(id: string) {
  try {
    await prisma.externalServiceConfig.delete({
      where: { id: BigInt(id) }
    });
    revalidatePath("/admin/service-configs");
    return { success: true };
  } catch (error) {
    console.error("Error deleting configuration:", error);
    return { success: false, error: "Failed to delete configuration" };
  }
}
