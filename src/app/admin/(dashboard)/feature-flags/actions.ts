"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function upsertFeatureFlag(data: any) {
    try {
        const { id, moduleName, featureKey, isEnabled } = data;

        if (id) {
            // Update
            await prisma.appFeatureFlag.update({
                where: { id: BigInt(id) },
                data: {
                    moduleName,
                    featureKey,
                    isEnabled: isEnabled ?? true,
                }
            });
        } else {
            // Create
            await prisma.appFeatureFlag.create({
                data: {
                    moduleName,
                    featureKey,
                    isEnabled: isEnabled ?? true,
                }
            });
        }

        revalidatePath("/admin/feature-flags");
        return { success: true };
    } catch (error: any) {
        console.error("Feature Flag Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteFeatureFlag(id: string) {
    try {
        await prisma.appFeatureFlag.delete({
            where: { id: BigInt(id) }
        });
        revalidatePath("/admin/feature-flags");
        return { success: true };
    } catch (error: any) {
        console.error("Delete Feature Flag Error:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleFeatureAction(id: string, isEnabled: boolean) {
    try {
        await prisma.appFeatureFlag.update({
            where: { id: BigInt(id) },
            data: { isEnabled: !isEnabled }
        });
        revalidatePath("/admin/feature-flags");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteModuleAction(moduleName: string) {
    try {
        await prisma.appFeatureFlag.deleteMany({
            where: { moduleName }
        });
        revalidatePath("/admin/feature-flags");
        return { success: true };
    } catch (error: any) {
        console.error("Delete Module Error:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleModuleAction(moduleName: string, targetEnabled: boolean) {
    try {
        await prisma.appFeatureFlag.updateMany({
            where: { moduleName },
            data: { isEnabled: targetEnabled }
        });
        revalidatePath("/admin/feature-flags");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function importFeatureFlagsAction(flags: any[]) {
    try {
        for (const flag of flags) {
            await prisma.appFeatureFlag.upsert({
                where: {
                    moduleName_featureKey: {
                        moduleName: flag.moduleName,
                        featureKey: flag.featureKey
                    }
                },
                update: {
                    isEnabled: flag.isEnabled ?? true,
                },
                create: {
                    moduleName: flag.moduleName,
                    featureKey: flag.featureKey,
                    isEnabled: flag.isEnabled ?? true,
                }
            });
        }
        revalidatePath("/admin/feature-flags");
        return { success: true };
    } catch (error: any) {
        console.error("Import error:", error);
        return { success: false, error: error.message };
    }
}
