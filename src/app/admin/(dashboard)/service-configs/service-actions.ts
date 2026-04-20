"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Fetch all external service configurations.
 * Explicitly maps every field to avoid BigInt serialization errors across the server/client boundary.
 */
export async function getExternalServiceConfigs() {
  try {
    const [serviceConfigs, paymentConfigs] = await Promise.all([
      prisma.externalServiceConfig.findMany({
        orderBy: [{ category: "asc" }, { provider: "asc" }],
      }),
      prisma.paymentMethod.findMany({
        where: { type: "gateway" },
        include: { media: { select: { fileUrl: true } } },
      }),
    ]);

    // Explicitly map — never spread raw Prisma objects (BigInt leaks through RSC serializer)
    const mappedServices = serviceConfigs.map((c) => ({
      id: c.id.toString(),
      category: c.category,
      provider: c.provider,
      config: (c.config ?? {}) as Record<string, any>,
      isActive: c.isActive,
      isDefault: c.isDefault,
      updatedAt: c.updatedAt.toISOString(),
      displayName: ((c.config as any)?.displayName as string) || "",
      mode: ((c.config as any)?.mode as string) || "test",
    }));

    const mappedPayments = paymentConfigs.map((p) => ({
      id: p.id.toString(),
      category: "payment",
      provider: p.name.toLowerCase(),
      config: (p.config ?? {}) as Record<string, any>,
      isActive: p.isActive ?? false,
      isDefault: p.isDefault ?? false,
      updatedAt: p.createdAt?.toISOString() ?? new Date().toISOString(),
      displayName: p.displayName ?? "",
      mode: p.mode ?? "test",
      image: p.media?.fileUrl ?? null,
    }));

    return { success: true as const, data: [...mappedServices, ...mappedPayments] };
  } catch (error: any) {
    console.error("getExternalServiceConfigs error:", error?.message);
    return { success: false as const, error: "Failed to fetch configurations", data: [] };
  }
}

/**
 * Create or update a service configuration.
 * Uses raw SQL for all writes to bypass Turbopack Prisma client @map field validation bug.
 */
export async function upsertExternalServiceConfig(data: any) {
  try {
    const { category, provider, config, isActive, mode, isDefault, displayName } = data;

    if (!category || !provider) {
      return { success: false as const, error: "Missing category or provider" };
    }

    const isActiveVal = isActive !== undefined ? Boolean(isActive) : true;
    const isDefaultVal = Boolean(isDefault);

    if (category === "payment") {
      const configStr = JSON.stringify(config || {});
      const displayNameStr = String(displayName || provider);
      const modeStr = String(mode || "test");

      if (isDefaultVal) {
        await prisma.$executeRaw`UPDATE payment_methods SET is_default = false WHERE type = 'gateway'`;
      }

      // Full raw SQL upsert — bypasses Turbopack Prisma @map field validation
      await prisma.$executeRawUnsafe(
        `INSERT INTO payment_methods (name, display_name, type, mode, is_active, is_default, config)
         VALUES ($1, $2, 'gateway', $3, $4, $5, $6::jsonb)
         ON CONFLICT (name)
         DO UPDATE SET
           display_name = EXCLUDED.display_name,
           mode         = EXCLUDED.mode,
           is_active    = EXCLUDED.is_active,
           is_default   = EXCLUDED.is_default,
           config       = EXCLUDED.config`,
        String(provider),
        displayNameStr,
        modeStr,
        isActiveVal,
        isDefaultVal,
        configStr
      );
    } else {
      const mergedConfig = {
        ...((config || {}) as object),
        displayName: String(displayName || ""),
        mode: String(mode || "test"),
      };
      const configStr = JSON.stringify(mergedConfig);
      const categoryStr = String(category);
      const providerStr = String(provider);

      if (isDefaultVal) {
        await prisma.$executeRaw`UPDATE external_service_configs SET is_default = false WHERE category = ${categoryStr}`;
      }

      // Full raw SQL upsert — bypasses Turbopack Prisma @map field validation
      await prisma.$executeRawUnsafe(
        `INSERT INTO external_service_configs (category, provider, config, is_active, is_default, updated_at)
         VALUES ($1, $2, $3::jsonb, $4, $5, NOW())
         ON CONFLICT (category, provider)
         DO UPDATE SET
           config     = EXCLUDED.config,
           is_active  = EXCLUDED.is_active,
           is_default = EXCLUDED.is_default,
           updated_at = NOW()`,
        categoryStr,
        providerStr,
        configStr,
        isActiveVal,
        isDefaultVal
      );
    }

    try { revalidatePath("/admin/service-configs"); } catch (_) {}
    return { success: true as const };
  } catch (error: any) {
    console.error("upsertExternalServiceConfig error:", error?.message);
    return { success: false as const, error: error?.message || "Failed to save configuration" };
  }
}

/**
 * Toggle active status of a service provider.
 */
export async function toggleExternalServiceStatus(
  id: string,
  category: string,
  currentStatus: boolean,
  exclusive = false
) {
  try {
    const nextStatus = !currentStatus;
    if (category === "payment") {
      await prisma.$executeRawUnsafe(
        `UPDATE payment_methods SET is_active = $1 WHERE id = $2`,
        nextStatus,
        parseInt(id)
      );
    } else {
      if (exclusive && nextStatus) {
        await prisma.$executeRawUnsafe(
          `UPDATE external_service_configs SET is_active = false WHERE category = $1 AND id != $2`,
          category,
          parseInt(id)
        );
      }
      await prisma.$executeRawUnsafe(
        `UPDATE external_service_configs SET is_active = $1, updated_at = NOW() WHERE id = $2`,
        nextStatus,
        parseInt(id)
      );
    }
    try { revalidatePath("/admin/service-configs"); } catch (_) {}
    return { success: true as const };
  } catch (error: any) {
    console.error("toggleExternalServiceStatus error:", error?.message);
    return { success: false as const, error: "Failed to update status" };
  }
}

/**
 * Delete a service configuration.
 */
export async function deleteExternalServiceConfig(id: string, category?: string) {
  try {
    if (category === "payment") {
      await prisma.$executeRawUnsafe(`DELETE FROM payment_methods WHERE id = $1`, parseInt(id));
    } else {
      await prisma.$executeRawUnsafe(`DELETE FROM external_service_configs WHERE id = $1`, parseInt(id));
    }
    try { revalidatePath("/admin/service-configs"); } catch (_) {}
    return { success: true as const };
  } catch (error: any) {
    console.error("deleteExternalServiceConfig error:", error?.message);
    return { success: false as const, error: "Failed to delete configuration" };
  }
}
