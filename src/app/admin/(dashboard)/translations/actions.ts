"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function upsertLanguage(id: bigint | null, data: {
  displayName: string;
  languageCode: string;
  countryCode: string;
  flagUrl: string;
  isActive: boolean;
  isDefault: boolean;
}) {
  try {
    // If setting as default, unset others first
    if (data.isDefault) {
      await prisma.appTranslation.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    if (id) {
      await prisma.appTranslation.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.appTranslation.create({
        data: {
          ...data,
          translations: {} // Initialize with empty translations
        }
      });
    }
    revalidatePath("/admin/translations");
    return { success: true };
  } catch (error: any) {
    console.error("Language upsert error:", error);
    throw new Error(error.message || "Failed to save language.");
  }
}

export async function deleteLanguage(id: bigint) {
  try {
    const lang = await prisma.appTranslation.findUnique({ where: { id } });
    if (lang?.isDefault) {
      throw new Error("Cannot delete the default language.");
    }
    await prisma.appTranslation.delete({ where: { id } });
    revalidatePath("/admin/translations");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete language.");
  }
}

export async function toggleLanguageStatus(id: bigint, isActive: boolean) {
  try {
    await prisma.appTranslation.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath("/admin/translations");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to update status.");
  }
}

export async function setDefaultLanguage(id: bigint) {
  try {
    await prisma.$transaction([
      prisma.appTranslation.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      }),
      prisma.appTranslation.update({
        where: { id },
        data: { isDefault: true, isActive: true }
      })
    ]);
    revalidatePath("/admin/translations");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to set default language.");
  }
}

export async function importLanguages(data: any[]) {
    try {
        for (const item of data) {
            await prisma.appTranslation.upsert({
                where: { languageCode: item.languageCode },
                update: {
                    displayName: item.displayName,
                    countryCode: item.countryCode,
                    flagUrl: item.flagUrl,
                    isActive: item.isActive === 'true' || item.isActive === true,
                    isDefault: item.isDefault === 'true' || item.isDefault === true
                },
                create: {
                    displayName: item.displayName,
                    languageCode: item.languageCode,
                    countryCode: item.countryCode,
                    flagUrl: item.flagUrl,
                    isActive: item.isActive === 'true' || item.isActive === true,
                    isDefault: item.isDefault === 'true' || item.isDefault === true,
                    translations: {}
                }
            });
        }
        revalidatePath("/admin/translations");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Import failed.");
    }
}
