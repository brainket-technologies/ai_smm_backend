"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPlatforms() {
  try {
    return await prisma.platform.findMany({
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("Failed to fetch platforms:", error);
    return [];
  }
}

export async function togglePlatformStatus(id: string, isActive: boolean) {
  try {
    await prisma.platform.update({
      where: { id: BigInt(id) },
      data: { isActive }
    });
    revalidatePath("/admin/platforms");
    return { success: true };
  } catch (error) {
    throw new Error("Failed to update status");
  }
}

export async function deletePlatform(id: string) {
  try {
    await prisma.platform.delete({
      where: { id: BigInt(id) }
    });
    revalidatePath("/admin/platforms");
    return { success: true };
  } catch (error) {
    throw new Error("Failed to delete platform");
  }
}

export async function upsertPlatform(id: string | null, data: {
  name: string;
  logo?: string;
  url?: string;
  nameKey?: string;
  isActive: boolean;
}) {
  try {
    if (id) {
      await prisma.platform.update({
        where: { id: BigInt(id) },
        data
      });
    } else {
      await prisma.platform.create({
        data
      });
    }
    revalidatePath("/admin/platforms");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to save platform");
  }
}

export async function importPlatforms(data: any[]) {
    try {
        for (const item of data) {
            await prisma.platform.upsert({
                where: { name: item.name },
                update: {
                    logo: item.logo,
                    url: item.url,
                    nameKey: item.nameKey,
                    isActive: item.isActive === 'true' || item.isActive === true
                },
                create: {
                    name: item.name,
                    logo: item.logo,
                    url: item.url,
                    nameKey: item.nameKey,
                    isActive: item.isActive === 'true' || item.isActive === true
                }
            });
        }
        revalidatePath("/admin/platforms");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Import failed.");
    }
}
